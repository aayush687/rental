package com.vehiclerental.service;

import com.vehiclerental.model.Maintenance;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceService {

    private final JdbcTemplate jdbcTemplate;

    public MaintenanceService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Maintenance> getAllMaintenance() {

        String sql = """
                SELECT id, vehicle_id, description, maintenance_date, status
                FROM maintenance
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Maintenance maintenance = new Maintenance();

            maintenance.setId(rs.getInt("id"));
            maintenance.setVehicleId(rs.getInt("vehicle_id"));
            maintenance.setDescription(rs.getString("description"));
            maintenance.setMaintenanceDate(rs.getString("maintenance_date"));
            maintenance.setStatus(rs.getString("status"));

            return maintenance;
        });
    }

    public Maintenance getMaintenanceById(int id) {

        String sql = """
                SELECT id, vehicle_id, description, maintenance_date, status
                FROM maintenance
                WHERE id = ?
                """;

        List<Maintenance> records = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {

                    Maintenance maintenance = new Maintenance();

                    maintenance.setId(rs.getInt("id"));
                    maintenance.setVehicleId(rs.getInt("vehicle_id"));
                    maintenance.setDescription(rs.getString("description"));
                    maintenance.setMaintenanceDate(rs.getString("maintenance_date"));
                    maintenance.setStatus(rs.getString("status"));

                    return maintenance;
                },
                id
        );

        if (records.isEmpty()) {
            return null;
        }

        return records.get(0);
    }

    public Maintenance addMaintenance(Maintenance maintenance) {

        String sql = """
                INSERT INTO maintenance
                (vehicle_id, description, maintenance_date, status)
                VALUES (?, ?, ?, ?)
                """;

        jdbcTemplate.update(
                sql,
                maintenance.getVehicleId(),
                maintenance.getDescription(),
                maintenance.getMaintenanceDate(),
                maintenance.getStatus()
        );

        String findId = "SELECT LAST_INSERT_ID()";

        int newId = jdbcTemplate.queryForObject(findId, Integer.class);

        return getMaintenanceById(newId);
    }

    public Maintenance updateMaintenanceStatus(int id, String status) {

        Maintenance maintenance = getMaintenanceById(id);

        if (maintenance == null) {
            return null;
        }

        String sql = "UPDATE maintenance SET status = ? WHERE id = ?";

        jdbcTemplate.update(sql, status, id);

        // When maintenance is completed,
        // make the vehicle available again
        if (status.equalsIgnoreCase("completed")) {

            String vehicleSql =
                    "UPDATE vehicle SET status = 'Available' WHERE id = ?";

            jdbcTemplate.update(
                    vehicleSql,
                    maintenance.getVehicleId()
            );
        }

        return getMaintenanceById(id);
    }
}