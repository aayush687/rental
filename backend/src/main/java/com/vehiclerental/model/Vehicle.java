package com.vehiclerental.model;

public class Vehicle {

    private int id;
    private String name;
    private String category;
    private String brand;
    private double pricePerDay;
    private String status;
    private String image;
    private String dateAdded;
    private String transmission;
    private int seats;
    private double rating;

    public Vehicle() {
    }

    public Vehicle(int id, String name, String category, String brand,
                double pricePerDay, String status, String image,
                String dateAdded, String transmission, int seats,
                double rating) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.brand = brand;
        this.pricePerDay = pricePerDay;
        this.status = status;
        this.image = image;
        this.dateAdded = dateAdded;
        this.transmission = transmission;
        this.seats = seats;
        this.rating = rating;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public double getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(double pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(String dateAdded) {
        this.dateAdded = dateAdded;
    }

    public String getTransmission() {
        return transmission;
    }

    public void setTransmission(String transmission) {
        this.transmission = transmission;
    }

    public int getSeats() {
        return seats;
    }

    public void setSeats(int seats) {
        this.seats = seats;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }
}
