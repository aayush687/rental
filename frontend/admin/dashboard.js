
const API_BASE = "http://localhost:8080/api";

async function loadDashboardStatistics() {

    try {

        const response = await fetch(`${API_BASE}/dashboard`);

        if (!response.ok) {
            throw new Error("Failed to load dashboard statistics");
        }

        const data = await response.json();

        // Vehicle statistics
        document.getElementById("total-vehicles").textContent =
            data.totalVehicles ?? 0;

        document.getElementById("available-vehicles").textContent =
            data.availableVehicles ?? 0;

        // Booking statistics
        document.getElementById("total-bookings").textContent =
            data.totalBookings ?? 0;

        document.getElementById("pending-bookings").textContent =
            data.pendingBookings ?? 0;

        document.getElementById("confirmed-bookings").textContent =
            data.confirmedBookings ?? 0;

        document.getElementById("completed-bookings").textContent =
            data.completedBookings ?? 0;

    } catch (error) {

        console.error("Dashboard statistics error:", error);

    }
}

async function loadRecentBookings() {

    const tableBody = document.getElementById("recent-bookings");

    if (!tableBody) {
        return;
    }

    try {

        const response = await fetch(`${API_BASE}/bookings`);

        if (!response.ok) {
            throw new Error("Failed to load bookings");
        }

        const bookings = await response.json();

        // Clear existing rows
        tableBody.innerHTML = "";

        // Sort newest booking first
        bookings.sort((a, b) => b.id - a.id);

        // Show latest 5 bookings
        const recentBookings = bookings.slice(0, 5);

        if (recentBookings.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">
                        No bookings found
                    </td>
                </tr>
            `;

            return;
        }

        recentBookings.forEach(booking => {

            const row = document.createElement("tr");

row.innerHTML = `
    <td>#${booking.id}</td>
    <td>${escapeHTML(booking.customer || "Unknown")}</td>
    <td>${escapeHTML(booking.vehicle || "Unknown")}</td>
    <td>${formatDate(booking.start)}</td>
    <td>${formatDate(booking.end)}</td>
    <td>Rs. ${Number(booking.total || 0).toLocaleString()}</td>
    <td>
        <span class="status ${getStatusClass(booking.status)}">
            ${formatStatus(booking.status)}
        </span>
    </td>
`;

            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error("Recent bookings error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">
                    Unable to load bookings
                </td>
            </tr>
        `;
    }
}

function formatDate(date) {

    if (!date) {
        return "-";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-GB");
}


function formatStatus(status) {

    if (!status) {
        return "-";
    }

    return status.charAt(0).toUpperCase() +
           status.slice(1).toLowerCase();
}

function getStatusClass(status) {

    if (!status) {
        return "";
    }

    return status.toLowerCase();
}

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {

    loadDashboardStatistics();
    loadRecentBookings();

});