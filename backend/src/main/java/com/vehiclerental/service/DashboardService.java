package com.vehiclerental.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final JdbcTemplate jdbcTemplate;

    public DashboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getDashboardData() {

        // Automatically complete bookings whose return date has passed
        String expiredBookingsSql = """
                SELECT id, vehicle_id
                FROM bookings
                WHERE LOWER(status) = 'confirmed'
                AND end_date < CURDATE()
                """;

        jdbcTemplate.query(
                expiredBookingsSql,
                (rs, rowNum) -> {

                    long bookingId = rs.getLong("id");
                    int vehicleId = rs.getInt("vehicle_id");

                    // Change booking to completed
                    jdbcTemplate.update(
                            "UPDATE bookings SET status = 'completed' WHERE id = ?",
                            bookingId
                    );

                    // Move vehicle to maintenance
                    jdbcTemplate.update(
                            "UPDATE vehicle SET status = 'maintenance' WHERE id = ?",
                            vehicleId
                    );

                    return null;
                }
        );

        Map<String, Object> data = new HashMap<>();

        // Vehicle statistics
        Integer totalVehicles = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM vehicle",
                Integer.class
        );

        Integer availableVehicles = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM vehicle WHERE LOWER(status) = 'available'",
                Integer.class
        );

        // Customer statistics
        Integer totalCustomers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM customers",
                Integer.class
        );

        // Booking statistics
        Integer totalBookings = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM bookings",
                Integer.class
        );

        Integer pendingBookings = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM bookings WHERE LOWER(status) = 'pending'",
                Integer.class
        );

        Integer confirmedBookings = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM bookings WHERE LOWER(status) = 'confirmed'",
                Integer.class
        );

        Integer completedBookings = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM bookings WHERE LOWER(status) = 'completed'",
                Integer.class
        );

        // Payment statistics
        Double totalPayments = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM payment",
                Double.class
        );

        // Put values into response
        data.put("totalVehicles", totalVehicles);
        data.put("availableVehicles", availableVehicles);
        data.put("totalCustomers", totalCustomers);
        data.put("totalBookings", totalBookings);
        data.put("pendingBookings", pendingBookings);
        data.put("confirmedBookings", confirmedBookings);
        data.put("completedBookings", completedBookings);
        data.put("totalPayments", totalPayments);

        return data;
    }
}