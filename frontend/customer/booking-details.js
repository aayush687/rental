const urlParams =
    new URLSearchParams(window.location.search);
const bookingId =
    urlParams.get("id");
const bookingCard =
    document.getElementById("booking-details-card");
const bookingError =
    document.getElementById("booking-error");

// Load the booking from the backend (no localStorage)
async function loadBooking() {
    try {
        const response =
            await fetch("http://localhost:8080/api/bookings/" + encodeURIComponent(bookingId));
        if (!response.ok) {
            throw new Error("Booking not found");
        }
        displayBooking(await response.json());
    } catch (error) {
        bookingCard.style.display = "none";
        bookingError.style.display = "block";
    }
}
loadBooking();

async function displayBooking(booking) {
    let vehicle = null;

    // Load the vehicle from the backend (no VEHICLES array)
    try {
        const vehicleResponse =
            await fetch("http://localhost:8080/api/vehicles/" + booking.vehicleId);
        if (vehicleResponse.ok) {
            vehicle = await vehicleResponse.json();
        }
    } catch (error) {
        vehicle = null;
    }
    document.getElementById(
        "booking-vehicle-name"
    ).textContent =
        booking.vehicle || "Vehicle";
    const vehicleImage =
        document.getElementById(
            "booking-vehicle-image"
        );
    if (vehicle && vehicle.image) {
        vehicleImage.src =
            "../public/" + vehicle.image;
        vehicleImage.alt =
            vehicle.name;
    } else {
        vehicleImage.style.display =
            "none";
    }
    if (vehicle) {
        document.getElementById(
            "booking-vehicle-price"
        ).textContent =
            "NPR " +
            Number(vehicle.pricePerDay).toLocaleString() +
            " / day";
    } else {
        document.getElementById(
            "booking-vehicle-price"
        ).textContent =
            "Vehicle information unavailable";
    }
    document.getElementById(
        "booking-id"
    ).textContent =
        booking.id;
    document.getElementById(
        "booking-location"
    ).textContent =
        booking.location || "Not specified";
    document.getElementById(
        "booking-start"
    ).textContent =
        formatDate(booking.start);
    document.getElementById(
        "booking-end"
    ).textContent =
        formatDate(booking.end);
    document.getElementById(
        "booking-total"
    ).textContent =
        "NPR " +
        Number(booking.total || 0).toLocaleString();
    const status =
        booking.status || "pending";
    const formattedStatus =
        formatStatus(status);
    document.getElementById(
        "booking-status"
    ).textContent =
        formattedStatus;
    document.getElementById(
        "booking-status-text"
    ).textContent =
        formattedStatus;
    // Add status class
    document.getElementById(
        "booking-status"
    ).className =
        "booking-status status-" + status;
    document.getElementById(
        "customer-name"
    ).textContent =
        booking.customer || "Not available";
    document.getElementById(
        "customer-email"
    ).textContent =
        booking.email || "Not available";
    document.getElementById(
        "customer-phone"
    ).textContent =
        booking.phone || "Not available";
    const specialRequest =
        document.getElementById(
            "booking-special-request"
        );
    if (
        booking.specialRequest &&
        booking.specialRequest.trim() !== ""
    ) {
        specialRequest.textContent =
            booking.specialRequest;
    } else {
        specialRequest.textContent =
            "No special request.";
    }
}

function formatDate(dateString) {

    if (!dateString) {
        return "Not specified";
    }
    const date =
        new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString;
    }
    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}

function formatStatus(status) {
    switch (status.toLowerCase()) {
        case "pending":
            return "Pending";
        case "confirmed":
            return "Confirmed";
        case "completed":
            return "Completed";
        case "cancelled":
            return "Cancelled";
        default:
            return status;
    }
}