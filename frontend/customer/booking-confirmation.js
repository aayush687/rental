
const urlParams = new URLSearchParams(window.location.search);

const bookingId = Number(urlParams.get("id"));

let booking = null;

const bookingIdElement =
    document.getElementById("booking-id");

const bookingStatus =
    document.getElementById("booking-status");

const confirmationVehicle =
    document.getElementById("confirmation-vehicle");

const pickupDate =
    document.getElementById("pickup-date");

const returnDate =
    document.getElementById("return-date");

const pickupLocation =
    document.getElementById("pickup-location");

const customerName =
    document.getElementById("customer-name");

const customerPhone =
    document.getElementById("customer-phone");

const customerEmail =
    document.getElementById("customer-email");

const specialRequest =
    document.getElementById("special-request");

const specialRequestContainer =
    document.getElementById("special-request-container");

const bookingTotal =
    document.getElementById("booking-total");

async function loadBooking() {

    try {

        const response =
            await fetch("http://localhost:8080/api/bookings/" + bookingId);

        if (!response.ok) {
            throw new Error("Booking not found");
        }

        booking = await response.json();

    } catch (error) {

        booking = null;

    }

    if (!booking) {

        document.querySelector(".confirmation-container").innerHTML = `

            <div class="booking-not-found">

                <h1>Booking Not Found</h1>

                <p>
                    We could not find the booking you are looking for.
                </p>

                <a href="browse-vehicles.html"
                   class="confirmation-primary-btn">
                    Browse Vehicles
                </a>

            </div>

        `;

    } else {

        displayBooking();

    }

}

loadBooking();

function displayBooking() {

    /* Booking ID */

    bookingIdElement.textContent =
        "Booking #" + booking.id;


    /* Status */

    bookingStatus.textContent =
        capitalize(booking.status || "pending");


    bookingStatus.className =
        "booking-status " +
        (booking.status || "pending");


    /* Dates */

    pickupDate.textContent =
        formatDisplayDate(booking.start);

    returnDate.textContent =
        formatDisplayDate(booking.end);


    /* Location */

    pickupLocation.textContent =
        booking.location || "Not specified";


    /* Customer */

    customerName.textContent =
        booking.customer || "Not specified";


    customerPhone.textContent =
        booking.phone || "Not specified";


    customerEmail.textContent =
        booking.email || "Not specified";


    /* Special Request */

    if (booking.specialRequest) {

        specialRequest.textContent =
            booking.specialRequest;

    } else {

        specialRequestContainer.style.display =
            "none";

    }


    /* Total */

    bookingTotal.textContent =
        formatMoney(booking.total);


    /* Vehicle */

    displayVehicle();

}

async function displayVehicle() {

    let vehicle = null;


    /* Load vehicle from the backend */

    try {

        const vehicleResponse =
            await fetch("http://localhost:8080/api/vehicles/" + booking.vehicleId);

        if (vehicleResponse.ok) {
            vehicle = await vehicleResponse.json();
        }

    } catch (error) {

        vehicle = null;

    }


    /* If vehicle exists */

    if (vehicle) {

        confirmationVehicle.innerHTML = `

            <img
                src="../public/${vehicle.image}"
                alt="${vehicle.name}"
                class="confirmation-vehicle-image"
            >

            <div class="confirmation-vehicle-info">

                <h3>
                    ${vehicle.name}
                </h3>

                <p>
                    ${vehicle.brand || ""}
                    ${vehicle.category ? " • " + vehicle.category : ""}
                </p>

                <span>
                    ${formatMoney(vehicle.pricePerDay)}/day
                </span>

            </div>

        `;

    }

    /* If vehicle data is not found */

    else {

        confirmationVehicle.innerHTML = `

            <div class="confirmation-vehicle-info">

                <h3>
                    ${booking.vehicle}
                </h3>

            </div>

        `;

    }

}

function formatDisplayDate(dateString) {

    if (!dateString) {
        return "---";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {

        year: "numeric",
        month: "long",
        day: "numeric"

    });

}

function formatMoney(amount) {

    if (typeof money === "function") {

        return money(amount);

    }

    return "Rs. " +
        Number(amount || 0).toLocaleString();

}

function capitalize(text) {

    if (!text) {
        return "";
    }

    return text.charAt(0).toUpperCase()
        + text.slice(1);

}