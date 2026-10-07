package com.vehiclerental.service;

import com.vehiclerental.model.Vehicle;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    private final JdbcTemplate jdbcTemplate;

    public VehicleService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /*
     * =========================================
     * GET ALL VEHICLES
     * =========================================
     */

    public List<Vehicle> getAllVehicles() {

        String sql = """
                SELECT id,
                       name,
                       type,
                       price,
                       status,
                       brand,
                       image,
                       date_added,
                       transmission,
                       seats,
                       rating
                FROM vehicle
                ORDER BY id DESC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapVehicle(rs)
        );
    }

    /*
     * =========================================
     * GET VEHICLE BY ID
     * =========================================
     */

    public Vehicle getVehicleById(int id) {

        String sql = """
                SELECT id,
                       name,
                       type,
                       price,
                       status,
                       brand,
                       image,
                       date_added,
                       transmission,
                       seats,
                       rating
                FROM vehicle
                WHERE id = ?
                """;

        List<Vehicle> vehicles =
                jdbcTemplate.query(
                        sql,
                        (rs, rowNum) ->
                                mapVehicle(rs),
                        id
                );

        if (vehicles.isEmpty()) {
            return null;
        }

        return vehicles.get(0);
    }

    /*
     * =========================================
     * ADD VEHICLE
     * =========================================
     */

    public Vehicle addVehicle(Vehicle vehicle) {

        if (vehicle.getStatus() == null ||
                vehicle.getStatus().trim().isEmpty()) {

            vehicle.setStatus("available");
        }

        if (vehicle.getDateAdded() == null ||
                vehicle.getDateAdded().trim().isEmpty()) {

            vehicle.setDateAdded(
                    java.time.LocalDate.now().toString()
            );
        }

        String sql = """
                INSERT INTO vehicle
                (
                    name,
                    type,
                    price,
                    status,
                    brand,
                    image,
                    date_added,
                    transmission,
                    seats,
                    rating
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        jdbcTemplate.update(
                sql,
                vehicle.getName(),
                vehicle.getCategory(),
                vehicle.getPricePerDay(),
                vehicle.getStatus(),
                vehicle.getBrand(),
                vehicle.getImage(),
                vehicle.getDateAdded(),
                vehicle.getTransmission(),
                vehicle.getSeats(),
                vehicle.getRating()
        );

        Long id =
                jdbcTemplate.queryForObject(
                        "SELECT LAST_INSERT_ID()",
                        Long.class
                );

        if (id == null) {
            throw new IllegalStateException(
                    "Vehicle was added but its ID could not be found."
            );
        }

        return getVehicleById(
                id.intValue()
        );
    }

    /*
     * =========================================
     * UPDATE VEHICLE
     * =========================================
     */

    public Vehicle updateVehicle(
            int id,
            Vehicle newVehicle) {

        String sql = """
                UPDATE vehicle
                SET name = ?,
                    type = ?,
                    price = ?,
                    status = ?,
                    brand = ?,
                    image = ?,
                    transmission = ?,
                    seats = ?,
                    rating = ?
                WHERE id = ?
                """;

        int rows =
                jdbcTemplate.update(
                        sql,
                        newVehicle.getName(),
                        newVehicle.getCategory(),
                        newVehicle.getPricePerDay(),
                        newVehicle.getStatus(),
                        newVehicle.getBrand(),
                        newVehicle.getImage(),
                        newVehicle.getTransmission(),
                        newVehicle.getSeats(),
                        newVehicle.getRating(),
                        id
                );

        if (rows == 0) {
            return null;
        }

        return getVehicleById(id);
    }

    /*
     * =========================================
     * DELETE VEHICLE
     * =========================================
     *
     * A vehicle cannot be deleted if it has:
     *
     * - bookings
     * - maintenance records
     *
     * This protects your historical data.
     */

    public boolean deleteVehicle(int id) {

        Vehicle vehicle =
                getVehicleById(id);

        if (vehicle == null) {
            return false;
        }

        Integer bookingCount =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM bookings
                        WHERE vehicle_id = ?
                        """,
                        Integer.class,
                        id
                );

        if (bookingCount != null &&
                bookingCount > 0) {

            throw new IllegalStateException(
                    "This vehicle cannot be deleted because " +
                    "it has booking records. " +
                    "Keep the vehicle and change its status instead."
            );
        }

        Integer maintenanceCount =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM maintenance
                        WHERE vehicle_id = ?
                        """,
                        Integer.class,
                        id
                );

        if (maintenanceCount != null &&
                maintenanceCount > 0) {

            throw new IllegalStateException(
                    "This vehicle cannot be deleted because " +
                    "it has maintenance records."
            );
        }

        int rows =
                jdbcTemplate.update(
                        """
                        DELETE FROM vehicle
                        WHERE id = ?
                        """,
                        id
                );

        return rows > 0;
    }

    /*
     * =========================================
     * MAP VEHICLE
     * =========================================
     */

    private Vehicle mapVehicle(
            java.sql.ResultSet rs)
            throws java.sql.SQLException {

        Vehicle vehicle =
                new Vehicle();

        vehicle.setId(
                rs.getInt("id")
        );

        vehicle.setName(
                rs.getString("name")
        );

        vehicle.setCategory(
                rs.getString("type")
        );

        vehicle.setPricePerDay(
                rs.getDouble("price")
        );

        vehicle.setStatus(
                rs.getString("status")
        );

        vehicle.setBrand(
                rs.getString("brand")
        );

        vehicle.setImage(
                rs.getString("image")
        );

        if (rs.getDate("date_added") != null) {

            vehicle.setDateAdded(
                    rs.getDate("date_added")
                            .toString()
            );
        }

        vehicle.setTransmission(
                rs.getString("transmission")
        );

        vehicle.setSeats(
                rs.getInt("seats")
        );

        vehicle.setRating(
                rs.getDouble("rating")
        );

        return vehicle;
    }
}