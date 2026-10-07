package com.vehiclerental.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;

public final class SessionUtil {

    private static final String USER_ID = "userId";
    private static final String ROLE = "role";

    private SessionUtil() {
    }

    public static void login(HttpServletRequest request, int userId, String role) {
        HttpSession old = request.getSession(false);
        if (old != null) {
            old.invalidate();
        }
        HttpSession session = request.getSession(true);
        session.setAttribute(USER_ID, userId);
        session.setAttribute(ROLE, role);
    }

    public static void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    public static Integer userId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session == null ? null : (Integer) session.getAttribute(USER_ID);
    }

    public static String role(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session == null ? null : (String) session.getAttribute(ROLE);
    }

    public static boolean isAdmin(HttpServletRequest request) {
        return "admin".equals(role(request));
    }

    public static ResponseEntity<String> requireRole(HttpServletRequest request, String role) {
        if (role(request) == null) {
            return ResponseEntity.status(401).body("Please log in.");
        }
        if (!role.equals(role(request))) {
            return ResponseEntity.status(403).body("You are not allowed to do that.");
        }
        return null;
    }

    public static ResponseEntity<String> requireSelf(HttpServletRequest request, String role, int id) {
        ResponseEntity<String> denied = requireRole(request, role);
        if (denied != null) {
            return denied;
        }
        Integer me = userId(request);
        if (me == null || me != id) {
            return ResponseEntity.status(403).body("You can only change your own account.");
        }
        return null;
    }
}