package com.vehiclerental.controller;

import com.vehiclerental.config.SessionUtil;
import com.vehiclerental.model.Admin;
import com.vehiclerental.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable int id,
                                           @RequestBody Admin body,
                                           HttpServletRequest request) {

        ResponseEntity<String> denied = SessionUtil.requireSelf(request, "admin", id);
        if (denied != null) {
            return denied;
        }

        if (body.getName() == null || body.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name is required.");
        }

        if (body.getEmail() == null || body.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }

        try {
            Admin updated = adminService.updateProfile(
                    id,
                    body.getName().trim(),
                    body.getEmail().trim(),
                    body.getPhone() == null ? "" : body.getPhone().trim()
            );

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

        ResponseEntity<String> denied = SessionUtil.requireSelf(request, "admin", id);
        if (denied != null) {
            return denied;
        }

        String password = body.get("password");

        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest()
                    .body("Password must be at least 6 characters.");
        }

        if (!adminService.updatePassword(id, password)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}