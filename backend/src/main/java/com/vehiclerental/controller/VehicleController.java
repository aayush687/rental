package com.vehiclerental.controller;

import com.vehiclerental.model.Vehicle;
import com.vehiclerental.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<?> getVehicles() {

        try {

            return ResponseEntity.ok(
                    vehicleService.getAllVehicles()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return error(
                    500,
                    "Could not load vehicles."
            );
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicle(
            @PathVariable int id) {

        try {

            Vehicle vehicle =
                    vehicleService.getVehicleById(id);

            if (vehicle == null) {

                return error(
                        404,
                        "Vehicle not found."
                );
            }

            return ResponseEntity.ok(vehicle);

        } catch (Exception e) {

            e.printStackTrace();

            return error(
                    500,
                    "Could not load vehicle."
            );
        }
    }

    @PostMapping
    public ResponseEntity<?> addVehicle(
            @RequestBody Vehicle vehicle) {

        try {

            Vehicle saved =
                    vehicleService.addVehicle(
                            vehicle
                    );

            return ResponseEntity
                    .status(201)
                    .body(saved);

        } catch (Exception e) {

            e.printStackTrace();

            return error(
                    500,
                    "Could not add vehicle."
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(
            @PathVariable int id,
            @RequestBody Vehicle vehicle) {

        try {

            Vehicle updated =
                    vehicleService.updateVehicle(
                            id,
                            vehicle
                    );

            if (updated == null) {

                return error(
                        404,
                        "Vehicle not found."
                );
            }

            return ResponseEntity.ok(updated);

        } catch (Exception e) {

            e.printStackTrace();

            return error(
                    500,
                    "Could not update vehicle."
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(
            @PathVariable int id) {

        try {

            boolean deleted =
                    vehicleService.deleteVehicle(id);

            if (!deleted) {

                return error(
                        404,
                        "Vehicle not found."
                );
            }

            Map<String, String> response =
                    new LinkedHashMap<>();

            response.put(
                    "message",
                    "Vehicle deleted successfully."
            );

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {

            return error(
                    409,
                    e.getMessage()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return error(
                    500,
                    "Could not delete vehicle."
            );
        }
    }

    private ResponseEntity<Map<String, String>> error(
            int status,
            String message) {

        Map<String, String> response =
                new LinkedHashMap<>();

        response.put(
                "error",
                message
        );

        response.put(
                "message",
                message
        );

        return ResponseEntity
                .status(status)
                .body(response);
    }
}