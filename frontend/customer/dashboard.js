
const API_BASE = "http://localhost:8080/api";

async function loadCustomerDashboard() {

    try {

        const bookingsResponse =
            await fetch(`${API_BASE}/bookings`);

        if (!bookingsResponse.ok) {
            throw new Error("Unable to load bookings.");
        }

        const allBookings =
            await bookingsResponse.json();

        // the server only sends this customer's own bookings
        const customerBookings = allBookings;

        const upcomingBookings =
            customerBookings.filter(function (booking) {

                return String(booking.status)
                    .toLowerCase() === "pending";

            });

        const activeBookings =
            customerBookings.filter(function (booking) {

                return String(booking.status)
                    .toLowerCase() === "confirmed";

            });

        const completedBookings =
            customerBookings.filter(function (booking) {

                return String(booking.status)
                    .toLowerCase() === "completed";

            });

        const cancelledBookings =
            customerBookings.filter(function (booking) {

                return String(booking.status)
                    .toLowerCase() === "cancelled";

            });

        document.getElementById(
            "upcoming-count"
        ).textContent =
            upcomingBookings.length;


        document.getElementById(
            "active-count"
        ).textContent =
            activeBookings.length;


        document.getElementById(
            "completed-count"
        ).textContent =
            completedBookings.length;


        document.getElementById(
            "cancelled-count"
        ).textContent =
            cancelledBookings.length;


        const recentBookingBox =
            document.getElementById(
                "recent-booking"
            );


        if (customerBookings.length === 0) {

            recentBookingBox.innerHTML = `
                <div class="empty-booking">

                    <h3>No bookings yet</h3>

                    <p>
                        You haven't made any vehicle
                        bookings yet.
                    </p>

                    <a
                        href="browse-vehicles.html"
                        class="btn"
                    >
                        Browse Vehicles
                    </a>

                </div>
            `;

        } else {

            // Latest booking first
            const recentBooking =
                [...customerBookings].sort(
                    function (a, b) {

                        return Number(b.id) -
                               Number(a.id);

                    }
                )[0];


            const status =
                String(
                    recentBooking.status || "pending"
                ).toLowerCase();


            recentBookingBox.innerHTML = `

                <div class="booking-main">

                    <div>

                        <span class="booking-number">
                            Booking #${escapeHTML(
                                recentBooking.id
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                recentBooking.vehicle ||
                                "Vehicle"
                            )}
                        </h3>

                    </div>

                    <span
                        class="status status-${escapeHTML(status)}"
                    >
                        ${formatStatus(status)}
                    </span>

                </div>


                <div class="booking-details">

                    <div>

                        <span class="booking-label">
                            Pick-up
                        </span>

                        <strong>
                            ${formatDate(
                                recentBooking.start
                            )}
                        </strong>

                    </div>


                    <div>

                        <span class="booking-label">
                            Return
                        </span>

                        <strong>
                            ${formatDate(
                                recentBooking.end
                            )}
                        </strong>

                    </div>


                    <div>

                        <span class="booking-label">
                            Total
                        </span>

                        <strong>
                            ${money(
                                recentBooking.total
                            )}
                        </strong>

                    </div>

                </div>


                <div class="booking-actions">

                    <a
                        href="booking-details.html?id=${encodeURIComponent(
                            recentBooking.id
                        )}"
                        class="btn btn-small"
                    >
                        View booking
                    </a>

                </div>
            `;
        }


        await loadAvailableVehicles();


    } catch (error) {

        console.error(
            "Customer dashboard error:",
            error
        );

        const recentBookingBox =
            document.getElementById(
                "recent-booking"
            );

        if (recentBookingBox) {

            recentBookingBox.innerHTML = `
                <div class="empty-booking">

                    <h3>Unable to load dashboard</h3>

                    <p>
                        Please make sure the backend
                        server is running.
                    </p>

                </div>
            `;
        }
    }
}

async function loadAvailableVehicles() {

    const vehicleContainer =
        document.getElementById(
            "customer-vehicles"
        );


    if (!vehicleContainer) {
        return;
    }


    try {

        const response =
            await fetch(`${API_BASE}/vehicles`);


        if (!response.ok) {

            throw new Error(
                "Unable to load vehicles."
            );
        }


        const vehicles =
            await response.json();


        // Only available vehicles
        const availableVehicles =
            vehicles.filter(function (vehicle) {

                return String(
                    vehicle.status || ""
                ).toLowerCase() === "available";

            }).slice(0, 3);


        vehicleContainer.innerHTML = "";


        if (availableVehicles.length === 0) {

            vehicleContainer.innerHTML = `
                <p>
                    No vehicles are currently
                    available.
                </p>
            `;

            return;
        }


        availableVehicles.forEach(
            function (vehicle) {

                vehicleContainer.innerHTML +=
                    customerVehicleCard(vehicle);

            }
        );


    } catch (error) {

        console.error(
            "Vehicle loading error:",
            error
        );


        vehicleContainer.innerHTML = `
            <p>
                Unable to load available vehicles.
            </p>
        `;
    }
}

function customerVehicleCard(vehicle) {

    const imagePath =
        vehicle.image
            ? "../public/" + vehicle.image
            : "";


    const transmission =
        vehicle.transmission ||
        "Automatic";


    const seats =
        vehicle.seats ||
        0;


    const rating =
        Number(vehicle.rating || 0);


    return `

        <div class="vehicle-card">

            <div class="vc-header">

                <div>

                    <span class="vc-name">
                        ${escapeHTML(
                            vehicle.name || "Vehicle"
                        )}
                    </span>

                    <span class="vc-subtitle">
                        or similar
                        ${escapeHTML(
                            vehicle.category || ""
                        )}
                    </span>

                </div>

            </div>


            <div class="vc-specs">

                <span>
                    ⚙️
                    ${escapeHTML(transmission)}
                </span>

                <span>
                    👤
                    ${escapeHTML(seats)}
                </span>

                <span>
                    ❄️ A/C
                </span>

            </div>


            <div class="vc-body">

                ${
                    typeof vehiclePictureHTML ===
                    "function"

                    ? vehiclePictureHTML(
                        {
                            ...vehicle,
                            image: imagePath
                        },
                        "vc-photo"
                    )

                    : `
                        <div class="vc-photo">
                            ${
                                imagePath
                                ? `
                                    <img
                                        src="${escapeHTML(
                                            imagePath
                                        )}"
                                        alt="${escapeHTML(
                                            vehicle.name ||
                                            "Vehicle"
                                        )}"
                                    >
                                  `
                                : `
                                    <div>
                                        No Image
                                    </div>
                                  `
                            }
                        </div>
                    `
                }


                <div class="vc-price-block">

                    <div class="vc-price">
                        ${money(
                            vehicle.pricePerDay || 0
                        )}
                    </div>

                    <div class="vc-price-sub">
                        per day
                    </div>

                </div>

            </div>


            <div class="vc-rating-row">

                <div class="vc-rating-score">
                    ${rating.toFixed(1)} ★
                </div>

                <div class="vc-rating-label">
                    ${ratingLabel(rating)}
                </div>

            </div>


            <button
                class="vc-book-btn"
                onclick="bookVehicle(${Number(
                    vehicle.id
                )})"
            >
                Book now
            </button>

        </div>
    `;
}

function bookVehicle(vehicleId) {

    window.location.href =
        "vehicle-details.html?id=" +
        encodeURIComponent(vehicleId);
}

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function formatStatus(status) {

    switch (
        String(status).toLowerCase()
    ) {

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

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCustomerDashboard();

    }
);