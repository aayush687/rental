package com.vehiclerental.controller;

import com.vehiclerental.config.SessionUtil;
import com.vehiclerental.model.Customer;
import com.vehiclerental.service.CustomerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // ---- admin only ----

    @GetMapping
    public ResponseEntity<?> getCustomers(HttpServletRequest request) {

        ResponseEntity<String> denied = SessionUtil.requireRole(request, "admin");
        if (denied != null) {
            return denied;
        }

        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomer(@PathVariable int id,
                                         HttpServletRequest request) {

        ResponseEntity<String> denied = SessionUtil.requireRole(request, "admin");
        if (denied != null) {
            return denied;
        }

        Customer customer = customerService.getCustomerById(id);

        if (customer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(customer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable int id,
                                            HttpServletRequest request) {

        ResponseEntity<String> denied = SessionUtil.requireRole(request, "admin");
        if (denied != null) {
            return denied;
        }

        if (!customerService.deleteCustomer(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    // ---- customer editing their own account ----

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable int id,
                                            @RequestBody Customer customer,
                                            HttpServletRequest request) {

        ResponseEntity<String> denied = SessionUtil.requireSelf(request, "customer", id);
        if (denied != null) {
            return denied;
        }

        if (customer.getName() == null || customer.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name is required.");
        }

        if (customer.getEmail() == null || customer.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }

        customer.setName(customer.getName().trim());
        customer.setEmail(customer.getEmail().trim());
        customer.setPhone(customer.getPhone() == null ? "" : customer.getPhone().trim());

        try {
            Customer updated = customerService.updateCustomer(id, customer);

            if (updated == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(updated);

        } catch (DuplicateKeyException e) {
            return ResponseEntity.badRequest().body("That email is already used.");
        }
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable int id,
                                            @RequestBody Map<String, String> body,
                                            HttpServletRequest request) {

        ResponseEntity<String> denied = SessionUtil.requireSelf(request, "customer", id);
        if (denied != null) {
            return denied;
        }

        String password = body.get("password");

        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest()
                    .body("Password must be at least 6 characters.");
        }

        if (!customerService.updatePassword(id, password)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}