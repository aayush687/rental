package com.vehiclerental.model;

public class Booking {

    private long id;
    private int customerId;
    private String customer;
    private String phone;
    private String email;
    private String vehicle;
    private int vehicleId;
    private String start;
    private String end;
    private String location;
    private String specialRequest;
    private double total;
    private String status;

    public Booking() {
    }

    public Booking(long id, String customer, String phone, String email,
                String vehicle, int vehicleId, String start, String end,
                String location, String specialRequest, double total,
                String status) {
        this.id = id;
        this.customer = customer;
        this.phone = phone;
        this.email = email;
        this.vehicle = vehicle;
        this.vehicleId = vehicleId;
        this.start = start;
        this.end = end;
        this.location = location;
        this.specialRequest = specialRequest;
        this.total = total;
        this.status = status;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }


    // CUSTOMER ID
    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }


    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVehicle() {
        return vehicle;
    }

    public void setVehicle(String vehicle) {
        this.vehicle = vehicle;
    }

    public int getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(int vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getStart() {
        return start;
    }

    public void setStart(String start) {
        this.start = start;
    }

    public String getEnd() {
        return end;
    }

    public void setEnd(String end) {
        this.end = end;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSpecialRequest() {
        return specialRequest;
    }

    public void setSpecialRequest(String specialRequest) {
        this.specialRequest = specialRequest;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}