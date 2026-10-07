package com.vehiclerental.service;

import com.vehiclerental.model.Booking;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private final JdbcTemplate jdbcTemplate;

    public BookingService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /*
     * =========================================
     * AUTOMATICALLY COMPLETE EXPIRED BOOKINGS
     * =========================================
     */

    @Scheduled(fixedRate = 60000)
    public void automaticallyCompleteExpiredBookings() {

        String findExpiredBookings = """
                SELECT id, vehicle_id
                FROM bookings
                WHERE LOWER(status) = 'confirmed'
                AND end_date <= CURDATE()
                """;

        List<ExpiredBooking> expiredBookings =
                jdbcTemplate.query(
                        findExpiredBookings,
                        (rs, rowNum) ->
                                new ExpiredBooking(
                                        rs.getLong("id"),
                                        rs.getInt("vehicle_id")
                                )
                );

        for (ExpiredBooking booking :
                expiredBookings) {

            jdbcTemplate.update(
                    """
                    UPDATE bookings
                    SET status = 'completed'
                    WHERE id = ?
                    AND LOWER(status) = 'confirmed'
                    """,
                    booking.id()
            );

            /*
             * Do not force maintenance if the vehicle
             * has another future confirmed booking.
             */
            Integer futureBookings =
                    jdbcTemplate.queryForObject(
                            """
                            SELECT COUNT(*)
                            FROM bookings
                            WHERE vehicle_id = ?
                            AND LOWER(status) = 'confirmed'
                            AND end_date > CURDATE()
                            """,
                            Integer.class,
                            booking.vehicleId()
                    );

            if (futureBookings == null ||
                    futureBookings == 0) {

                jdbcTemplate.update(
                        """
                        UPDATE vehicle
                        SET status = 'available'
                        WHERE id = ?
                        """,
                        booking.vehicleId()
                );
            }
        }

        if (!expiredBookings.isEmpty()) {

            System.out.println(
                    expiredBookings.size()
                            + " expired booking(s) automatically completed."
            );
        }
    }

    private record ExpiredBooking(
            long id,
            int vehicleId
    ) {
    }

    /*
     * =========================================
     * GET ALL BOOKINGS
     * =========================================
     */

    public List<Booking> getAllBookings() {

        automaticallyCompleteExpiredBookings();

        String sql = """
                SELECT b.id,
                       b.customer_id,
                       c.name AS customer_name,
                       c.phone,
                       c.email,
                       v.name AS vehicle_name,
                       b.vehicle_id,
                       b.start_date,
                       b.end_date,
                       b.total,
                       b.status
                FROM bookings b
                JOIN customers c
                    ON b.customer_id = c.id
                JOIN vehicle v
                    ON b.vehicle_id = v.id
                ORDER BY b.id DESC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapBooking(rs)
        );
    }

    /*
     * =========================================
     * GET BOOKING BY ID
     * =========================================
     */

    public Booking getBookingById(long id) {

        automaticallyCompleteExpiredBookings();

        String sql = """
                SELECT b.id,
                       b.customer_id,
                       c.name AS customer_name,
                       c.phone,
                       c.email,
                       v.name AS vehicle_name,
                       b.vehicle_id,
                       b.start_date,
                       b.end_date,
                       b.total,
                       b.status
                FROM bookings b
                JOIN customers c
                    ON b.customer_id = c.id
                JOIN vehicle v
                    ON b.vehicle_id = v.id
                WHERE b.id = ?
                """;

        List<Booking> bookings =
                jdbcTemplate.query(
                        sql,
                        (rs, rowNum) ->
                                mapBooking(rs),
                        id
                );

        if (bookings.isEmpty()) {
            return null;
        }

        return bookings.get(0);
    }

    /*
     * =========================================
     * ADD BOOKING
     * =========================================
     */

    public Booking addBooking(Booking booking) {

        if (booking == null) {
            throw new IllegalArgumentException(
                    "Booking data is required."
            );
        }

        /*
         * Validate customer.
         */
        if (booking.getCustomerId() <= 0) {
            throw new IllegalArgumentException(
                    "Valid customer information is required."
            );
        }

        Integer customerCount =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM customers
                        WHERE id = ?
                        """,
                        Integer.class,
                        booking.getCustomerId()
                );

        if (customerCount == null ||
                customerCount == 0) {

            throw new IllegalArgumentException(
                    "Customer account was not found."
            );
        }

        /*
         * Validate vehicle.
         */
        if (booking.getVehicleId() <= 0) {
            throw new IllegalArgumentException(
                    "Please select a valid vehicle."
            );
        }

        List<VehicleAvailability> vehicles =
                jdbcTemplate.query(
                        """
                        SELECT id, name, status
                        FROM vehicle
                        WHERE id = ?
                        """,
                        (rs, rowNum) ->
                                new VehicleAvailability(
                                        rs.getInt("id"),
                                        rs.getString("name"),
                                        rs.getString("status")
                                ),
                        booking.getVehicleId()
                );

        if (vehicles.isEmpty()) {
            throw new IllegalArgumentException(
                    "The selected vehicle does not exist."
            );
        }

        VehicleAvailability selectedVehicle =
                vehicles.get(0);

        /*
         * Vehicle under maintenance cannot be booked.
         */
        if ("maintenance".equalsIgnoreCase(
                selectedVehicle.status())) {

            throw new IllegalArgumentException(
                    "This vehicle is currently under maintenance."
            );
        }

        /*
         * Validate dates.
         */
        if (booking.getStart() == null ||
                booking.getStart().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Pick-up date is required."
            );
        }

        if (booking.getEnd() == null ||
                booking.getEnd().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Return date is required."
            );
        }

        LocalDate startDate;
        LocalDate endDate;

        try {

            startDate =
                    LocalDate.parse(
                            booking.getStart()
                    );

            endDate =
                    LocalDate.parse(
                            booking.getEnd()
                    );

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Invalid booking dates."
            );
        }

        if (!endDate.isAfter(startDate)) {

            throw new IllegalArgumentException(
                    "Return date must be after the pick-up date."
            );
        }

        if (startDate.isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Pick-up date cannot be in the past."
            );
        }

        /*
         * Check overlapping bookings.
         *
         * Two bookings overlap when:
         *
         * existing.start < new.end
         * AND
         * existing.end > new.start
         */
        Integer overlappingBookings =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM bookings
                        WHERE vehicle_id = ?
                        AND LOWER(status) IN
                            ('pending', 'confirmed')
                        AND start_date < ?
                        AND end_date > ?
                        """,
                        Integer.class,
                        booking.getVehicleId(),
                        endDate,
                        startDate
                );

        if (overlappingBookings != null &&
                overlappingBookings > 0) {

            throw new IllegalArgumentException(
                    "This vehicle is already booked " +
                    "for the selected dates."
            );
        }

        /*
         * Calculate total on the backend.
         *
         * Do not trust the total sent by JavaScript.
         */
        Double price =
                jdbcTemplate.queryForObject(
                        """
                        SELECT price
                        FROM vehicle
                        WHERE id = ?
                        """,
                        Double.class,
                        booking.getVehicleId()
                );

        if (price == null) {
            throw new IllegalArgumentException(
                    "Vehicle price could not be found."
            );
        }

        long days =
                java.time.temporal.ChronoUnit.DAYS
                        .between(
                                startDate,
                                endDate
                        );

        double total =
                days * price;

        booking.setTotal(total);

        /*
         * Always create a new booking as pending.
         */
        booking.setStatus("pending");

        /*
         * Insert booking.
         */
        String sql = """
                INSERT INTO bookings
                (
                    customer_id,
                    vehicle_id,
                    start_date,
                    end_date,
                    total,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        jdbcTemplate.update(
                sql,
                booking.getCustomerId(),
                booking.getVehicleId(),
                booking.getStart(),
                booking.getEnd(),
                booking.getTotal(),
                booking.getStatus()
        );

        Long newId =
                jdbcTemplate.queryForObject(
                        "SELECT LAST_INSERT_ID()",
                        Long.class
                );

        if (newId == null) {
            throw new IllegalArgumentException(
                    "Booking was created but its ID could not be retrieved."
            );
        }

        return getBookingById(newId);
    }

    /*
     * =========================================
     * UPDATE BOOKING STATUS
     * =========================================
     */

    public Booking updateStatus(
            long id,
            String status) {

        Booking booking =
                getBookingById(id);

        if (booking == null) {
            return null;
        }

        if (status == null ||
                status.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Booking status is required."
            );
        }

        String newStatus =
                status.trim().toLowerCase();

        List<String> allowedStatuses =
                List.of(
                        "pending",
                        "confirmed",
                        "completed",
                        "cancelled"
                );

        if (!allowedStatuses.contains(newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid booking status."
            );
        }

        /*
         * If confirming, make sure the dates
         * have not become unavailable.
         */
        if ("confirmed".equals(newStatus)) {

            Integer overlapping =
                    jdbcTemplate.queryForObject(
                            """
                            SELECT COUNT(*)
                            FROM bookings
                            WHERE vehicle_id = ?
                            AND id <> ?
                            AND LOWER(status) = 'confirmed'
                            AND start_date < ?
                            AND end_date > ?
                            """,
                            Integer.class,
                            booking.getVehicleId(),
                            id,
                            booking.getEnd(),
                            booking.getStart()
                    );

            if (overlapping != null &&
                    overlapping > 0) {

                throw new IllegalArgumentException(
                        "This vehicle has another confirmed " +
                        "booking for these dates."
                );
            }
        }

        jdbcTemplate.update(
                """
                UPDATE bookings
                SET status = ?
                WHERE id = ?
                """,
                newStatus,
                id
        );

        /*
         * Confirmed -> booked
         */
        if ("confirmed".equals(newStatus)) {

            jdbcTemplate.update(
                    """
                    UPDATE vehicle
                    SET status = 'booked'
                    WHERE id = ?
                    """,
                    booking.getVehicleId()
            );
        }

        /*
         * Completed -> available
         */
        else if ("completed".equals(newStatus)) {

            jdbcTemplate.update(
                    """
                    UPDATE vehicle
                    SET status = 'available'
                    WHERE id = ?
                    """,
                    booking.getVehicleId()
            );
        }

        /*
         * Cancelled -> available
         */
        else if ("cancelled".equals(newStatus)) {

            jdbcTemplate.update(
                    """
                    UPDATE vehicle
                    SET status = 'available'
                    WHERE id = ?
                    """,
                    booking.getVehicleId()
            );
        }

        return getBookingById(id);
    }

    /*
     * =========================================
     * DELETE BOOKING
     * =========================================
     */

    public boolean deleteBooking(long id) {

        Booking booking =
                getBookingById(id);

        if (booking == null) {
            return false;
        }

        int rows =
                jdbcTemplate.update(
                        "DELETE FROM bookings WHERE id = ?",
                        id
                );

        if (rows > 0 &&
                "confirmed".equalsIgnoreCase(
                        booking.getStatus())) {

            jdbcTemplate.update(
                    """
                    UPDATE vehicle
                    SET status = 'available'
                    WHERE id = ?
                    """,
                    booking.getVehicleId()
            );
        }

        return rows > 0;
    }

    /*
     * =========================================
     * MAP DATABASE RESULT TO BOOKING
     * =========================================
     */

    private Booking mapBooking(
            java.sql.ResultSet rs)
            throws java.sql.SQLException {

        Booking booking =
                new Booking();

        booking.setId(
                rs.getLong("id")
        );

        booking.setCustomerId(
                rs.getInt("customer_id")
        );

        booking.setCustomer(
                rs.getString("customer_name")
        );

        booking.setPhone(
                rs.getString("phone")
        );

        booking.setEmail(
                rs.getString("email")
        );

        booking.setVehicle(
                rs.getString("vehicle_name")
        );

        booking.setVehicleId(
                rs.getInt("vehicle_id")
        );

        booking.setStart(
                rs.getString("start_date")
        );

        booking.setEnd(
                rs.getString("end_date")
        );

        booking.setTotal(
                rs.getDouble("total")
        );

        booking.setStatus(
                rs.getString("status")
        );

        return booking;
    }

    private record VehicleAvailability(
            int id,
            String name,
            String status
    ) {
    }
}