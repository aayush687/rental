const API_BASE =
    "http://localhost:8080/api";


const urlParams =
    new URLSearchParams(
        window.location.search
    );


const vehicleId =
    Number(
        urlParams.get("id")
    );


let currentCustomer =
    null;


const selectedVehicle =
    document.getElementById(
        "selected-vehicle"
    );


const bookingSummary =
    document.getElementById(
        "booking-summary"
    );


const pickupDate =
    document.getElementById(
        "pickup-date"
    );


const returnDate =
    document.getElementById(
        "return-date"
    );


const pickupLocation =
    document.getElementById(
        "pickup-location"
    );


const specialRequest =
    document.getElementById(
        "special-request"
    );


const customerName =
    document.getElementById(
        "customer-name"
    );


const customerPhone =
    document.getElementById(
        "customer-phone"
    );


const customerEmail =
    document.getElementById(
        "customer-email"
    );


const bookingError =
    document.getElementById(
        "booking-error"
    );


const confirmButton =
    document.getElementById(
        "confirm-booking"
    );


let vehicle = null;


/*
 * =========================================
 * LOAD LOGGED-IN CUSTOMER
 * =========================================
 */

requireCustomerLogin().then(
    function (user) {

        if (!user) {
            return;
        }

        currentCustomer =
            user;

        /*
         * Automatically fill customer details.
         */
        customerName.value =
            user.name || "";

        customerPhone.value =
            user.phone || "";

        customerEmail.value =
            user.email || "";

    }
);


/*
 * =========================================
 * VEHICLE IMAGE
 * =========================================
 */

function getVehicleImageSource(image) {

    if (!image) {
        return "";
    }

    /*
     * Base64 image
     */
    if (
        image.startsWith(
            "data:image/"
        )
    ) {
        return image;
    }

    /*
     * Full URL
     */
    if (
        image.startsWith(
            "http://"
        ) ||
        image.startsWith(
            "https://"
        )
    ) {
        return image;
    }

    /*
     * Local image
     */
    return (
        "../public/" +
        image.replace(
            /^\/+/,
            ""
        )
    );
}


/*
 * =========================================
 * LOAD VEHICLE
 * =========================================
 */

async function loadVehicle() {

    try {

        const response =
            await fetch(
                `${API_BASE}/vehicles/${vehicleId}`
            );

        if (!response.ok) {

            throw new Error(
                "Vehicle not found."
            );
        }

        vehicle =
            await response.json();

        displaySelectedVehicle();

        displaySummary();

    } catch (error) {

        console.error(
            "Error loading vehicle:",
            error
        );

        selectedVehicle.innerHTML = `

            <div class="booking-not-found">

                <h3>
                    Vehicle not found
                </h3>

                <p>
                    Please return to the vehicle list
                    and select a vehicle.
                </p>

                <a
                    href="browse-vehicles.html"
                    class="btn"
                >
                    Browse Vehicles
                </a>

            </div>

        `;

        confirmButton.disabled =
            true;
    }
}


/*
 * =========================================
 * DISPLAY SELECTED VEHICLE
 * =========================================
 */

function displaySelectedVehicle() {

    const imageSource =
        getVehicleImageSource(
            vehicle.image
        );

    let imageHTML;

    if (imageSource) {

        imageHTML = `

            <img
                src="${imageSource}"
                alt="${escapeHTML(
                    vehicle.name ||
                    "Vehicle"
                )}"
                onerror="
                    this.style.display='none';
                    this.parentElement.innerHTML='🚗';
                "
            >

        `;

    } else {

        imageHTML =
            "🚗";
    }

    selectedVehicle.innerHTML = `

        <div class="selected-vehicle-image">

            ${imageHTML}

        </div>

        <div class="selected-vehicle-info">

            <span>

                ${escapeHTML(
                    vehicle.brand ||
                    ""
                )}

                •

                ${escapeHTML(
                    vehicle.category ||
                    ""
                )}

            </span>

            <h3>

                ${escapeHTML(
                    vehicle.name ||
                    "Vehicle"
                )}

            </h3>

            <strong>

                ${money(
                    vehicle.pricePerDay ||
                    0
                )}

                <small>
                    / day
                </small>

            </strong>

        </div>

    `;
}


/*
 * =========================================
 * TODAY
 * =========================================
 */

function getToday() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        `${year}-${month}-${day}`
    );
}


const today =
    getToday();


pickupDate.min =
    today;


returnDate.min =
    today;


/*
 * =========================================
 * CALCULATE DAYS
 * =========================================
 */

function calculateDays() {

    if (
        !pickupDate.value ||
        !returnDate.value
    ) {
        return 0;
    }

    const start =
        new Date(
            pickupDate.value
        );

    const end =
        new Date(
            returnDate.value
        );

    const difference =
        end - start;

    return (
        difference /
        (
            1000 *
            60 *
            60 *
            24
        )
    );
}


/*
 * =========================================
 * BOOKING SUMMARY
 * =========================================
 */

function displaySummary() {

    if (!vehicle) {
        return;
    }

    const days =
        calculateDays();

    const rentalDays =
        days > 0
            ? days
            : 0;

    const subtotal =
        rentalDays *
        Number(
            vehicle.pricePerDay ||
            0
        );

    bookingSummary.innerHTML = `

        <div class="summary-vehicle">

            <span>
                Vehicle
            </span>

            <strong>

                ${escapeHTML(
                    vehicle.name ||
                    "Vehicle"
                )}

            </strong>

        </div>

        <div class="summary-row">

            <span>
                Price per day
            </span>

            <span>

                ${money(
                    vehicle.pricePerDay ||
                    0
                )}

            </span>

        </div>

        <div class="summary-row">

            <span>
                Rental days
            </span>

            <span>
                ${rentalDays}
            </span>

        </div>

        <div class="summary-divider">
        </div>

        <div class="summary-total">

            <span>
                Total
            </span>

            <strong>

                ${money(
                    subtotal
                )}

            </strong>

        </div>

        <p class="summary-note">

            Final price is calculated again
            by the server when you confirm.

        </p>

    `;
}


/*
 * =========================================
 * VALIDATE DATES
 * =========================================
 */

function validateDates() {

    bookingError.textContent =
        "";

    if (!pickupDate.value) {

        bookingError.textContent =
            "Please select a pick-up date.";

        return false;
    }

    if (!returnDate.value) {

        bookingError.textContent =
            "Please select a return date.";

        return false;
    }

    const days =
        calculateDays();

    if (days <= 0) {

        bookingError.textContent =
            "Return date must be after the pick-up date.";

        return false;
    }

    return true;
}


/*
 * =========================================
 * DATE EVENTS
 * =========================================
 */

pickupDate.addEventListener(
    "change",
    function () {

        returnDate.min =
            pickupDate.value;

        if (
            returnDate.value &&
            returnDate.value <=
                pickupDate.value
        ) {

            returnDate.value =
                "";
        }

        displaySummary();
    }
);


returnDate.addEventListener(
    "change",
    function () {

        displaySummary();

    }
);


/*
 * =========================================
 * CONFIRM BOOKING
 * =========================================
 */

confirmButton.addEventListener(
    "click",
    async function () {

        bookingError.textContent =
            "";

        if (!validateDates()) {
            return;
        }

        if (!pickupLocation.value) {

            bookingError.textContent =
                "Please select a pick-up location.";

            return;
        }

        if (!currentCustomer) {

            bookingError.textContent =
                "Your login session has expired. Please log in again.";

            return;
        }

        if (
            !customerPhone.value.trim()
        ) {

            bookingError.textContent =
                "Please enter your phone number.";

            customerPhone.focus();

            return;
        }

        if (
            !customerEmail.value.trim()
        ) {

            bookingError.textContent =
                "Please enter your email.";

            customerEmail.focus();

            return;
        }

        const days =
            calculateDays();

        const total =
            days *
            Number(
                vehicle.pricePerDay ||
                0
            );

        confirmButton.disabled =
            true;

        confirmButton.textContent =
            "Creating Booking...";


        /*
         * Send booking to backend.
         *
         * customerId is included, but the backend
         * will overwrite it with the session user's
         * ID for customers.
         */
        const newBooking = {

            customerId:
                currentCustomer.id,

            customer:
                customerName.value.trim(),

            phone:
                customerPhone.value.trim(),

            email:
                customerEmail.value.trim(),

            vehicle:
                vehicle.name,

            vehicleId:
                vehicle.id,

            start:
                pickupDate.value,

            end:
                returnDate.value,

            location:
                pickupLocation.value,

            specialRequest:
                specialRequest.value.trim(),

            total:
                total,

            status:
                "pending"
        };


        try {

            const response =
                await fetch(
                    `${API_BASE}/bookings`,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        credentials:
                            "include",

                        body:
                            JSON.stringify(
                                newBooking
                            )

                    }
                );


            /*
             * IMPORTANT:
             *
             * Read text first.
             * Do not immediately call response.json().
             *
             * This prevents:
             * Unexpected end of JSON input
             */
            const responseText =
                await response.text();


            if (!response.ok) {

                let errorMessage =
                    responseText;

                /*
                 * Try to read JSON error.
                 */
                try {

                    if (
                        responseText.trim()
                    ) {

                        const errorData =
                            JSON.parse(
                                responseText
                            );

                        errorMessage =
                            errorData.message ||
                            errorData.error ||
                            responseText;
                    }

                } catch (jsonError) {

                    /*
                     * Backend returned plain text.
                     */
                    errorMessage =
                        responseText;
                }


                if (
                    !errorMessage ||
                    !errorMessage.trim()
                ) {

                    errorMessage =
                        `Booking failed. Server returned HTTP ${response.status}.`;
                }


                throw new Error(
                    errorMessage
                );
            }


            /*
             * Successful response must contain data.
             */
            if (
                !responseText ||
                !responseText.trim()
            ) {

                throw new Error(
                    "The server returned an empty response."
                );
            }


            let savedBooking;

            try {

                savedBooking =
                    JSON.parse(
                        responseText
                    );

            } catch (jsonError) {

                console.error(
                    "Invalid JSON returned by backend:",
                    responseText
                );

                throw new Error(
                    "The server returned an invalid booking response."
                );
            }


            if (
                !savedBooking ||
                !savedBooking.id
            ) {

                throw new Error(
                    "Booking was created but no booking ID was returned."
                );
            }


            /*
             * Booking successful.
             */
            window.location.href =
                "booking-confirmation.html?id=" +
                savedBooking.id;


        } catch (error) {

            console.error(
                "Booking error:",
                error
            );


            bookingError.textContent =
                error.message ||
                "Could not create booking.";


            confirmButton.disabled =
                false;

            confirmButton.textContent =
                "Confirm Booking";
        }

    }
);


/*
 * =========================================
 * ESCAPE HTML
 * =========================================
 */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/*
 * =========================================
 * LOAD
 * =========================================
 */

loadVehicle();