
const API_BASE = "http://localhost:8080/api";


const bookingsList =
    document.getElementById("bookings-list");

const emptyBookings =
    document.getElementById("empty-bookings");

let bookings = [];

async function loadMyBookings() {

    try {

        const response =
            await fetch(`${API_BASE}/bookings`);


        if (!response.ok) {

            throw new Error(
                "Unable to load bookings."
            );

        }


        const allBookings =
            await response.json();


        // the server only sends this customer's own bookings
        bookings = allBookings;


        displayBookings();


    } catch (error) {

        console.error(
            "Error loading bookings:",
            error
        );


        if (bookingsList) {

            bookingsList.innerHTML = `

                <div class="empty-booking">

                    <h3>
                        Unable to load bookings
                    </h3>

                    <p>
                        Please make sure the backend
                        server is running.
                    </p>

                </div>

            `;

        }

    }

}

function displayBookings() {

    if (!bookingsList) {
        return;
    }


    // No bookings
    if (bookings.length === 0) {

        bookingsList.innerHTML = "";

        if (emptyBookings) {
            emptyBookings.style.display = "block";
        }

        return;
    }


    if (emptyBookings) {
        emptyBookings.style.display = "none";
    }


    // Latest booking first
    const sortedBookings =
        [...bookings].sort(
            function (a, b) {

                return Number(b.id) -
                    Number(a.id);

            }
        );


    bookingsList.innerHTML = "";


    sortedBookings.forEach(
        function (booking) {

            bookingsList.innerHTML +=
                createBookingCard(booking);

        }
    );

}

function createBookingCard(booking) {

    const status =
        String(
            booking.status || "pending"
        ).toLowerCase();


    return `

        <div class="booking-card">

            <div class="booking-card-header">

                <div>

                    <span class="booking-number">
                        Booking #${escapeHTML(
                            booking.id
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            booking.vehicle ||
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


            <div class="booking-card-details">

                <div>

                    <span class="booking-label">
                        Pick-up
                    </span>

                    <strong>
                        ${formatDate(
                            booking.start
                        )}
                    </strong>

                </div>


                <div>

                    <span class="booking-label">
                        Return
                    </span>

                    <strong>
                        ${formatDate(
                            booking.end
                        )}
                    </strong>

                </div>


                <div>

                    <span class="booking-label">
                        Total
                    </span>

                    <strong>
                        ${money(
                            booking.total || 0
                        )}
                    </strong>

                </div>

            </div>


            <div class="booking-card-actions">

                <button
                    class="btn btn-small"
                    onclick="viewBooking(${Number(
                        booking.id
                    )})"
                >
                    View booking
                </button>


                ${
                    status === "pending" ||
                    status === "confirmed"

                    ? `

                        <button
                            class="btn btn-small"
                            onclick="cancelBooking(${Number(
                                booking.id
                            )})"
                        >
                            Cancel booking
                        </button>

                      `

                    : ""

                }

            </div>

        </div>

    `;

}

function viewBooking(id) {

    window.location.href =
        "booking-details.html?id=" +
        encodeURIComponent(id);

}

async function cancelBooking(id) {

    const booking =
        bookings.find(function (item) {

            return Number(item.id) ===
                Number(id);

        });


    if (!booking) {

        alert("Booking not found.");

        return;

    }


    const status =
        String(
            booking.status || ""
        ).toLowerCase();


    // Do not allow cancelling completed/cancelled bookings
    if (
        status === "completed" ||
        status === "cancelled"
    ) {

        alert(
            "This booking cannot be cancelled."
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/bookings/${id}/status?status=cancelled`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to cancel booking."
            );

        }


        const updatedBooking =
            await response.json();


        // Update local page data
        bookings =
            bookings.map(function (item) {

                if (
                    Number(item.id) ===
                    Number(id)
                ) {

                    return updatedBooking;

                }

                return item;

            });


        displayBookings();


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Booking cancelled successfully."
            );

        }


    } catch (error) {

        console.error(
            "Cancellation error:",
            error
        );


        alert(
            "Unable to cancel booking."
        );

    }

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

        loadMyBookings();

    }
);