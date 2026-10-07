package com.vehiclerental.service;

import com.vehiclerental.model.Payment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final JdbcTemplate jdbcTemplate;

    public PaymentService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Payment> getAllPayments() {

        String sql = """
                SELECT id, booking_id, amount, payment_date, status
                FROM payment
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Payment payment = new Payment();

            payment.setId(rs.getInt("id"));
            payment.setBookingId(rs.getInt("booking_id"));
            payment.setAmount(rs.getDouble("amount"));
            payment.setPaymentDate(rs.getString("payment_date"));
            payment.setStatus(rs.getString("status"));

            return payment;
        });
    }

    public Payment getPaymentById(int id) {

        String sql = """
                SELECT id, booking_id, amount, payment_date, status
                FROM payment
                WHERE id = ?
                """;

        List<Payment> payments = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {

                    Payment payment = new Payment();

                    payment.setId(rs.getInt("id"));
                    payment.setBookingId(rs.getInt("booking_id"));
                    payment.setAmount(rs.getDouble("amount"));
                    payment.setPaymentDate(rs.getString("payment_date"));
                    payment.setStatus(rs.getString("status"));

                    return payment;
                },
                id
        );

        if (payments.isEmpty()) {
            return null;
        }

        return payments.get(0);
    }

    public Payment addPayment(Payment payment) {

        String sql = """
                INSERT INTO payment
                (booking_id, amount, payment_date, status)
                VALUES (?, ?, ?, ?)
                """;

        jdbcTemplate.update(
                sql,
                payment.getBookingId(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getStatus()
        );

        String findId = "SELECT LAST_INSERT_ID()";

        int newId = jdbcTemplate.queryForObject(findId, Integer.class);

        return getPaymentById(newId);
    }

    public Payment updatePaymentStatus(int id, String status) {

        Payment payment = getPaymentById(id);

        if (payment == null) {
            return null;
        }

        String sql = "UPDATE payment SET status = ? WHERE id = ?";

        jdbcTemplate.update(sql, status, id);

        return getPaymentById(id);
    }
}