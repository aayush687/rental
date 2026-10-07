package com.vehiclerental.service;

import com.vehiclerental.model.Customer;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

private final JdbcTemplate jdbcTemplate;

public CustomerService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
}

public List<Customer> getAllCustomers() {

        String sql = "SELECT id, name, email, phone, password FROM customers";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new Customer(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getString("password")
                )
        );
}

public Customer findByEmail(String email) {

        String sql = "SELECT id, name, email, phone, password " +
                "FROM customers WHERE email = ?";

        List<Customer> customers = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new Customer(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getString("password")
                ),
                email
        );

        if (customers.isEmpty()) {
            return null;
        }

        return customers.get(0);
    }

    public Customer addCustomer(Customer customer) {

        String sql = "INSERT INTO customers (name, email, phone, password) " +
                    "VALUES (?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getPassword()
        );

        return findByEmail(customer.getEmail());
    }

    public Customer updateCustomer(int id, Customer customer) {

        String sql = "UPDATE customers SET name = ?, email = ?, phone = ? " +
                    "WHERE id = ?";

        jdbcTemplate.update(
                sql,
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                id
        );

        String findSql = "SELECT id, name, email, phone, password " +
                        "FROM customers WHERE id = ?";

        List<Customer> customers = jdbcTemplate.query(
                findSql,
                (rs, rowNum) -> new Customer(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getString("password")
                ),
                id
        );

                if (customers.isEmpty()) {
            return null;
        }

        return customers.get(0);
    }
    public boolean updatePassword(int id, String password) {
        return jdbcTemplate.update(
                "UPDATE customers SET password = ? WHERE id = ?",
                password, id
        ) > 0;
    }
    public Customer getCustomerById(int id) {

        String sql = "SELECT id, name, email, phone, password " +
                    "FROM customers WHERE id = ?";

        List<Customer> customers = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new Customer(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getString("password")
                ),
                id
        );

        if (customers.isEmpty()) {
            return null;
        }

        return customers.get(0);
    }

    @Transactional
    public boolean deleteCustomer(int id) {

        if (getCustomerById(id) == null) {
            return false;
        }

        // free any vehicle held by this customer's active bookings
        jdbcTemplate.update(
                "UPDATE vehicle SET status = 'Available' " +
                "WHERE status = 'Booked' AND id IN (" +
                "SELECT vehicle_id FROM bookings " +
                "WHERE customer_id = ? " +
                "AND LOWER(status) IN ('pending', 'confirmed'))",
                id
        );

        // delete in this order because of the foreign keys:
        // payments -> bookings -> customer
        jdbcTemplate.update(
                "DELETE FROM payment WHERE booking_id IN " +
                "(SELECT id FROM bookings WHERE customer_id = ?)",
                id
        );

        jdbcTemplate.update(
                "DELETE FROM bookings WHERE customer_id = ?",
                id
        );

        jdbcTemplate.update(
                "DELETE FROM customers WHERE id = ?",
                id
        );

        return true;
    }
}