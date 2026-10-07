package com.vehiclerental.controller;

import com.vehiclerental.config.SessionUtil;
import com.vehiclerental.model.Admin;
import com.vehiclerental.model.Customer;
import com.vehiclerental.model.LoginRequest;
import com.vehiclerental.model.RegisterRequest;
import com.vehiclerental.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name is required.");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest()
                    .body("Password must be at least 6 characters.");
        }

        Customer customer = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getPassword()
        );

        if (customer == null) {
            return ResponseEntity.badRequest().body("Email is already registered.");
        }

        return ResponseEntity.ok(customer);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body,
                                   HttpServletRequest request) {

        Object user = authService.login(
                body.getEmail(),
                body.getPassword(),
                body.getRole()
        );

        if (user == null) {
            return ResponseEntity.status(401).body("Invalid email or password.");
        }

        String role = "admin".equalsIgnoreCase(body.getRole()) ? "admin" : "customer";

        int id = (user instanceof Admin admin)
                ? admin.getId()
                : ((Customer) user).getId();

        SessionUtil.login(request, id, role);

        return ResponseEntity.ok(authService.toUserMap(user, role));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {

        Integer id = SessionUtil.userId(request);
        String role = SessionUtil.role(request);

        if (id == null || role == null) {
            return ResponseEntity.status(401).body("Not logged in.");
        }

        Map<String, Object> user = authService.currentUser(id, role);

        if (user == null) {
            SessionUtil.logout(request);
            return ResponseEntity.status(401).body("Not logged in.");
        }

        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        SessionUtil.logout(request);
        return ResponseEntity.noContent().build();
    }
}