
const API_URL = "http://localhost:8080/api/customers";

const customersTableBody =
    document.getElementById("customers-table-body");

const customerSearchInput =
    document.getElementById("customer-search");

let allCustomers = [];

let allBookings = [];

function getBookings() {

    return allBookings;

}


async function loadCustomers() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Server error");
        }

        allCustomers = await response.json();

        // bookings are used for the booking counts and totals
        const bookingsResponse =
            await fetch("http://localhost:8080/api/bookings");

        allBookings = bookingsResponse.ok
            ? await bookingsResponse.json()
            : [];

    } catch (error) {

        customersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-empty">
                    Could not load customers. Is the backend running?
                </td>
            </tr>
        `;

        return;

    }

    renderCustomers();

}

function getCustomerStats(customer) {

    const customerBookings =
        getBookings().filter(function (booking) {

            if (booking.customerId) {
                return booking.customerId === customer.id;
            }

            // fallback if a booking has no customerId
            return booking.email &&
                booking.email === customer.email;

        });

    let totalSpent = 0;

    customerBookings.forEach(function (booking) {
        totalSpent += Number(booking.total || 0);
    });

    return {
        totalBookings: customerBookings.length,
        totalSpent: totalSpent
    };

}

function renderCustomers() {

    const searchTerm =
        customerSearchInput.value
            .trim()
            .toLowerCase();

    const rows =
        allCustomers
            .map(function (customer) {

                const stats = getCustomerStats(customer);

                return {
                    id: customer.id,
                    name: customer.name || "Unknown",
                    email: customer.email || "-",
                    phone: customer.phone || "-",
                    totalBookings: stats.totalBookings,
                    totalSpent: stats.totalSpent
                };

            })
            .filter(function (customer) {

                return (
                    !searchTerm ||
                    customer.name.toLowerCase().includes(searchTerm) ||
                    customer.email.toLowerCase().includes(searchTerm)
                );

            })
            .sort(function (a, b) {

                return b.totalBookings - a.totalBookings;

            });

    customersTableBody.innerHTML = "";


    if (rows.length === 0) {

        customersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-empty">
                    No customers found.
                </td>
            </tr>
        `;

        return;

    }


    rows.forEach(function (customer) {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                <div class="admin-customer-name">

                    <div class="admin-customer-avatar">
                        ${escapeHTML(getInitials(customer.name))}
                    </div>

                    <span>${escapeHTML(customer.name)}</span>

                </div>
            </td>

            <td>${escapeHTML(customer.email)}</td>

            <td>${escapeHTML(customer.phone)}</td>

            <td>${customer.totalBookings}</td>

            <td>Rs. ${customer.totalSpent.toLocaleString("en-IN")}</td>

            <td>
                <div class="admin-table-actions">

                    <button
                        class="admin-delete-btn"
                        onclick="deleteCustomer(${customer.id})">
                        Delete
                    </button>

                </div>
            </td>

        `;

        customersTableBody.appendChild(row);

    });

}

async function deleteCustomer(id) {

    const customer =
        allCustomers.find(function (item) {
            return item.id === id;
        });

    if (!customer) {
        return;
    }

    const confirmDelete =
        confirm(
            "Delete " + customer.name + "?\n\n" +
            "This also deletes all of their bookings " +
            "and payments. This cannot be undone."
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            API_URL + "/" + id,
            { method: "DELETE" }
        );

        if (!response.ok) {
            showToast("Could not delete the customer.");
            return;
        }

    } catch (error) {

        showToast("Cannot reach the server. Is the backend running?");
        return;

    }

    showToast("Customer deleted.");

    loadCustomers();

}

function getInitials(name) {

    const parts =
        String(name)
            .trim()
            .split(" ");

    if (parts.length >= 2) {

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();

    }

    return name.substring(0, 2).toUpperCase();

}

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

customerSearchInput.addEventListener("input", renderCustomers);


loadCustomers();