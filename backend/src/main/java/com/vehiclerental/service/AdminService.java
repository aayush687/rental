package com.vehiclerental.service;

import com.vehiclerental.model.Admin;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private static final String COLUMNS = "id, name, email, phone, password";

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Admin> mapper = (rs, rowNum) -> new Admin(
            rs.getInt("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("phone"),
            rs.getString("password")
    );

    public AdminService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Admin findByEmail(String email) {
        List<Admin> admins = jdbcTemplate.query(
                "SELECT " + COLUMNS + " FROM admin WHERE email = ?",
                mapper, email);
        return admins.isEmpty() ? null : admins.get(0);
    }

    public Admin findById(int id) {
        List<Admin> admins = jdbcTemplate.query(
                "SELECT " + COLUMNS + " FROM admin WHERE id = ?",
                mapper, id);
        return admins.isEmpty() ? null : admins.get(0);
    }

    public Admin updateProfile(int id, String name, String email, String phone) {
        jdbcTemplate.update(
                "UPDATE admin SET name = ?, email = ?, phone = ? WHERE id = ?",
                name, email, phone, id);
        return findById(id);
    }

    public boolean updatePassword(int id, String password) {
        return jdbcTemplate.update(
                "UPDATE admin SET password = ? WHERE id = ?",
                password, id) > 0;
    }
}