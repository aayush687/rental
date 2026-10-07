package com.vehiclerental.controller;

import com.vehiclerental.model.Maintenance;
import com.vehiclerental.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public List<Maintenance> getMaintenance() {
        return maintenanceService.getAllMaintenance();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(
            @PathVariable int id) {

        Maintenance maintenance = maintenanceService.getMaintenanceById(id);

        if (maintenance == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(maintenance);
    }

    @PostMapping
    public ResponseEntity<Maintenance> addMaintenance(
            @RequestBody Maintenance maintenance) {

        Maintenance newMaintenance =
                maintenanceService.addMaintenance(maintenance);

        return ResponseEntity.ok(newMaintenance);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Maintenance> updateStatus(
            @PathVariable int id,
            @RequestParam String status) {

        Maintenance maintenance =
                maintenanceService.updateMaintenanceStatus(id, status);

        if (maintenance == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(maintenance);
    }
}