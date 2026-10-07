package com.vehiclerental.controller;

import com.vehiclerental.model.Payment;
import com.vehiclerental.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<Payment> getPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPayment(@PathVariable int id) {

        Payment payment = paymentService.getPaymentById(id);

        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(payment);
    }

    @PostMapping
    public ResponseEntity<Payment> addPayment(@RequestBody Payment payment) {

        Payment newPayment = paymentService.addPayment(payment);

        return ResponseEntity.ok(newPayment);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Payment> updateStatus(
            @PathVariable int id,
            @RequestParam String status) {

        Payment payment = paymentService.updatePaymentStatus(id, status);

        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(payment);
    }
}