-- Vehicle Rental Management System
CREATE DATABASE vehicle_rental;
USE vehicle_rental;

CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(100) NOT NULL
);

CREATE TABLE vehicle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DOUBLE NOT NULL,
    status VARCHAR(30) DEFAULT 'Available'
);

CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total DOUBLE NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending',
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(id)
);

CREATE TABLE payment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DOUBLE NOT NULL,
    payment_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending',
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE maintenance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    maintenance_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending',
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(id)
);

INSERT INTO admin (name, email, password)
VALUES ('Admin', 'admin@gmail.com', 'admin123');

INSERT INTO customers (name, email, phone, password)
VALUES
('John Doe', 'john@gmail.com', '9800000000', '123456'),
('Jane Smith', 'jane@gmail.com', '9811111111', '123456');

INSERT INTO vehicle (name, type, price, status)
VALUES
('Toyota Corolla', 'Car', 50, 'Available'),
('Honda Civic', 'Car', 60, 'Available'),
('Yamaha R15', 'Bike', 25, 'Available'),
('Toyota Hilux', 'SUV', 80, 'Available');

SHOW TABLES;
SELECT * FROM vehicle;