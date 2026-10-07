
const API_BASE = "http://localhost:8080/api";

const bookingsTableBody =
    document.getElementById("bookings-table-body");

const bookingSearchInput =
    document.getElementById("booking-search");

const bookingFilterStatus =
    document.getElementById("booking-filter-status");

let bookings = [];

async function loadBookings() {

    try {

        const response =
            await fetch(`${API_BASE}/bookings`);

        if (!response.ok) {
            throw new Error("Failed to load bookings.");
        }

        bookings = await response.json();

        renderBookings();

    } catch (error) {

        console.error("Error loading bookings:", error);

        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="admin-empty">
                    Unable to load bookings.
                </td>
            </tr>
        `;
    }
}

function renderBookings() {

    const searchTerm =
        bookingSearchInput.value
            .trim()
            .toLowerCase();

    const statusFilter =
        bookingFilterStatus.value;


    const filtered =
        bookings.filter(function (booking) {

            const customer =
                (booking.customer || "").toLowerCase();

            const vehicle =
                (booking.vehicle || "").toLowerCase();

            const matchesSearch =
                !searchTerm ||
                customer.includes(searchTerm) ||
                vehicle.includes(searchTerm);

            const status =
                String(booking.status || "pending")
                    .toLowerCase();

            const matchesStatus =
                statusFilter === "all" ||
                status === statusFilter;

            return matchesSearch && matchesStatus;

        });


    bookingsTableBody.innerHTML = "";


    if (filtered.length === 0) {

        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="admin-empty">
                    No bookings found.
                </td>
            </tr>
        `;

        return;
    }


    const sorted =
        [...filtered].sort(function (a, b) {

            return Number(b.id) - Number(a.id);

        });


    sorted.forEach(function (booking) {

        const row =
            document.createElement("tr");


        const status =
            String(booking.status || "pending")
                .toLowerCase();


        row.innerHTML = `

            <td>#${escapeHTML(booking.id)}</td>

            <td>
                ${escapeHTML(
                    booking.customer || "Unknown"
                )}
            </td>

            <td>
                ${escapeHTML(
                    booking.vehicle || "Unknown"
                )}
            </td>

            <td>
                ${formatDate(booking.start)}
            </td>

            <td>
                ${formatDate(booking.end)}
            </td>

            <td>
                Rs.
                ${Number(
                    booking.total || 0
                ).toLocaleString("en-IN")}
            </td>

            <td>
                <span class="admin-status status-${escapeHTML(status)}">
                    ${formatStatus(status)}
                </span>
            </td>

            <td>

                <div class="admin-table-actions">

                    <select
                        class="admin-status-select"
                        onchange="updateBookingStatus(${booking.id}, this.value)"
                    >

                        <option
                            value="pending"
                            ${status === "pending" ? "selected" : ""}
                        >
                            Pending
                        </option>

                        <option
                            value="confirmed"
                            ${status === "confirmed" ? "selected" : ""}
                        >
                            Confirmed
                        </option>

                        <option
                            value="completed"
                            ${status === "completed" ? "selected" : ""}
                        >
                            Completed
                        </option>

                        <option
                            value="cancelled"
                            ${status === "cancelled" ? "selected" : ""}
                        >
                            Cancelled
                        </option>

                    </select>


                    <button
                        class="admin-delete-btn"
                        onclick="deleteBooking(${booking.id})"
                    >
                        Delete
                    </button>

                </div>

            </td>
        `;


        bookingsTableBody.appendChild(row);

    });

}

async function updateBookingStatus(id, newStatus) {

    try {

        const response =
            await fetch(
                `${API_BASE}/bookings/${id}/status?status=${encodeURIComponent(newStatus)}`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to update booking status."
            );

        }


        const updatedBooking =
            await response.json();


        /* Replace the old booking with
           the booking returned from MySQL */

        bookings =
            bookings.map(function (booking) {

                if (
                    Number(booking.id) ===
                    Number(id)
                ) {

                    return updatedBooking;

                }

                return booking;

            });


        renderBookings();


        if (typeof showToast === "function") {

            showToast(
                "Booking status updated successfully."
            );

        }


        console.log(
            "Booking updated:",
            updatedBooking
        );


    } catch (error) {

        console.error(
            "Error updating booking:",
            error
        );


        alert(
            "Unable to update booking status."
        );


        /* Reload original data */

        await loadBookings();

    }

}

async function deleteBooking(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this booking?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/bookings/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete booking."
            );

        }


        /* Remove from current list */

        bookings =
            bookings.filter(function (booking) {

                return Number(booking.id) !==
                    Number(id);

            });


        renderBookings();


        if (typeof showToast === "function") {

            showToast(
                "Booking deleted successfully."
            );

        }


    } catch (error) {

        console.error(
            "Error deleting booking:",
            error
        );


        alert(
            "Unable to delete booking."
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
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
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

bookingSearchInput.addEventListener(
    "input",
    renderBookings
);


bookingFilterStatus.addEventListener(
    "change",
    renderBookings
);

loadBookings();