const PROFILE_API = "http://localhost:8080/api";

async function loadProfile() {

    const customerProfile = await requireCustomerLogin();

    if (!customerProfile) {
        return;
    }

    setText(
        "profile-name",
        customerProfile.name || "Customer"
    );

    setText(
        "profile-full-name",
        customerProfile.name || "Not added"
    );

    setText(
        "profile-email",
        customerProfile.email || "Not added"
    );

    setText(
        "profile-phone",
        customerProfile.phone || "Not added"
    );

    let customerBookings = [];

    try {

        const response =
            await fetch(PROFILE_API + "/bookings");

        if (!response.ok) {
            throw new Error("Failed to load bookings.");
        }

        const allBookings =
            await response.json();


        customerBookings = allBookings.filter(
            function (booking) {

                return Number(booking.customerId)
                    === Number(customerProfile.id);
            }
        );


    } catch (error) {

        console.error(
            "Could not load bookings:",
            error
        );
    }


    const totalBookings =
        customerBookings.length;


    const pendingBookings =
        customerBookings.filter(
            function (booking) {

                return String(booking.status)
                    .toLowerCase() === "pending";
            }
        ).length;


    const confirmedBookings =
        customerBookings.filter(
            function (booking) {

                return String(booking.status)
                    .toLowerCase() === "confirmed";
            }
        ).length;


    const completedBookings =
        customerBookings.filter(
            function (booking) {

                return String(booking.status)
                    .toLowerCase() === "completed";
            }
        ).length;


    setText(
        "total-bookings",
        totalBookings
    );

    setText(
        "pending-bookings",
        pendingBookings
    );

    setText(
        "confirmed-bookings",
        confirmedBookings
    );

    setText(
        "completed-bookings",
        completedBookings
    );
}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent = value;
    }
}


loadProfile();