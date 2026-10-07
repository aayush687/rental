package com.vehiclerental.controller;

import com.vehiclerental.config.SessionUtil;
import com.vehiclerental.model.Booking;
import com.vehiclerental.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<?> getBookings(HttpServletRequest request) {

        if (SessionUtil.role(request) == null) {
            return errorResponse(
                    401,
                    "Please log in before viewing bookings."
            );
        }

        try {
            List<Booking> all = bookingService.getAllBookings();

            if (SessionUtil.isAdmin(request)) {
                return ResponseEntity.ok(all);
            }

            Integer me = SessionUtil.userId(request);

            if (me == null) {
                return errorResponse(
                        401,
                        "Your login session has expired. Please log in again."
                );
            }

            return ResponseEntity.ok(
                    all.stream()
                            .filter(b -> b.getCustomerId() == me)
                            .toList()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return errorResponse(
                    500,
                    "Could not load bookings."
            );
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(
            @PathVariable long id,
            HttpServletRequest request) {

        if (SessionUtil.role(request) == null) {
            return errorResponse(
                    401,
                    "Please log in before viewing this booking."
            );
        }

        try {

            Booking booking =
                    bookingService.getBookingById(id);

            if (booking == null) {
                return errorResponse(
                        404,
                        "Booking not found."
                );
            }

            if (!SessionUtil.isAdmin(request)) {

                Integer me =
                        SessionUtil.userId(request);

                if (me == null ||
                        booking.getCustomerId() != me) {

                    return errorResponse(
                            403,
                            "This is not your booking."
                    );
                }
            }

            return ResponseEntity.ok(booking);

        } catch (Exception e) {

            e.printStackTrace();

            return errorResponse(
                    500,
                    "Could not load the booking."
            );
        }
    }

    @PostMapping
    public ResponseEntity<?> addBooking(
            @RequestBody Booking booking,
            HttpServletRequest request) {

        if (SessionUtil.role(request) == null) {
            return errorResponse(
                    401,
                    "Please log in before creating a booking."
            );
        }

        try {

            /*
             * Customers are never allowed to choose
             * another customer's ID from the frontend.
             */
            if (!SessionUtil.isAdmin(request)) {

                Integer customerId =
                        SessionUtil.userId(request);

                if (customerId == null) {
                    return errorResponse(
                            401,
                            "Your login session has expired. Please log in again."
                    );
                }

                booking.setCustomerId(customerId);
            }

            /*
             * Admin booking is also allowed, but a valid
             * customer ID must be supplied.
             */
            if (booking.getCustomerId() <= 0) {
                return errorResponse(
                        400,
                        "A valid customer is required."
                );
            }

            Booking saved =
                    bookingService.addBooking(booking);

            return ResponseEntity
                    .status(201)
                    .body(saved);

        } catch (IllegalArgumentException e) {

            return errorResponse(
                    400,
                    e.getMessage()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return errorResponse(
                    500,
                    "Could not create booking. " +
                    "Please check the backend console for details."
            );
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable long id,
            @RequestParam String status,
            HttpServletRequest request) {

        if (SessionUtil.role(request) == null) {
            return errorResponse(
                    401,
                    "Please log in."
            );
        }

        try {

            if (!SessionUtil.isAdmin(request)) {

                Booking existing =
                        bookingService.getBookingById(id);

                if (existing == null) {
                    return errorResponse(
                            404,
                            "Booking not found."
                    );
                }

                Integer me =
                        SessionUtil.userId(request);

                if (me == null ||
                        existing.getCustomerId() != me ||
                        !"cancelled".equalsIgnoreCase(status)) {

                    return errorResponse(
                            403,
                            "You are not allowed to do that."
                    );
                }
            }

            Booking booking =
                    bookingService.updateStatus(
                            id,
                            status
                    );

            if (booking == null) {
                return errorResponse(
                        404,
                        "Booking not found."
                );
            }

            return ResponseEntity.ok(booking);

        } catch (IllegalArgumentException e) {

            return errorResponse(
                    400,
                    e.getMessage()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return errorResponse(
                    500,
                    "Could not update booking status."
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable long id,
            HttpServletRequest request) {

        if (!SessionUtil.isAdmin(request)) {

            if (SessionUtil.role(request) == null) {
                return errorResponse(
                        401,
                        "Please log in."
                );
            }

            return errorResponse(
                    403,
                    "Only an administrator can delete bookings."
            );
        }

        try {

            if (!bookingService.deleteBooking(id)) {
                return errorResponse(
                        404,
                        "Booking not found."
                );
            }

            Map<String, String> response =
                    new LinkedHashMap<>();

            response.put(
                    "message",
                    "Booking deleted successfully."
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return errorResponse(
                    500,
                    "Could not delete booking."
            );
        }
    }

    private ResponseEntity<Map<String, String>> errorResponse(
            int status,
            String message) {

        Map<String, String> error =
                new LinkedHashMap<>();

        error.put(
                "error",
                message == null
                        ? "Unknown error."
                        : message
        );

        error.put(
                "message",
                message == null
                        ? "Unknown error."
                        : message
        );

        return ResponseEntity
                .status(status)
                .body(error);
    }
}