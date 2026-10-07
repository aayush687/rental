# Vehicle Rental Backend

Simple Java backend for the Vehicle Rental System.

## Technology

- Java 17
- Spring Boot
- Maven
- REST API

This first version stores data in simple Java ArrayLists.
The database will be connected later using the project's actual
database design.

## Run

Open a terminal in the backend folder and run:

    mvn spring-boot:run

The server starts at:

    http://localhost:8080

## Main API endpoints

Vehicles:
- GET    /api/vehicles
- GET    /api/vehicles/{id}
- POST   /api/vehicles
- PUT    /api/vehicles/{id}
- DELETE /api/vehicles/{id}

Bookings:
- GET    /api/bookings
- GET    /api/bookings/{id}
- POST   /api/bookings
- PUT    /api/bookings/{id}/status?status=confirmed
- DELETE /api/bookings/{id}

Customers:
- GET /api/customers
- GET /api/customers/{id}
- PUT /api/customers/{id}

Authentication:
- POST /api/auth/register
- POST /api/auth/login

Dashboard:
- GET /api/dashboard/stats
