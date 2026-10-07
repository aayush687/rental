package com.vehiclerental.model;

public class Maintenance {

    private int id;
    private int vehicleId;
    private String description;
    private String maintenanceDate;
    private String status;

    public Maintenance() {
    }

    public Maintenance(int id, int vehicleId, String description,
                    String maintenanceDate, String status) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.description = description;
        this.maintenanceDate = maintenanceDate;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(int vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(String maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}