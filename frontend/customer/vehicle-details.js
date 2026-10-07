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


const detailsContainer =
    document.getElementById(
        "vehicle-details"
    );


function escapeHTML(value) {

    return String(
        value
    )

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


function money(amount) {

    return (
        "NPR " +
        Number(
            amount
        ).toLocaleString(
            "en-NP"
        )
    );

}

function getVehicleImageSource(
    image
) {

    if (!image) {

        return "";

    }


    if (
        image.startsWith(
            "data:image/"
        )
    ) {

        return image;

    }


    /*
       Full URL
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
       Local image path
    */

    return (
        "../public/" +
        image.replace(
            /^\/+/,
            ""
        )
    );

}


function vehicleImageHTML(
    vehicle
) {

    const imageSource =
        getVehicleImageSource(
            vehicle.image
        );


    if (!imageSource) {

        return `

            <div
                class="vehicle-image-placeholder"
            >
                🚗
            </div>

        `;

    }


    return `

        <img
            src="${imageSource}"
            class="vehicle-details-image"
            alt="${escapeHTML(
                vehicle.name ||
                "Vehicle"
            )}"
            onerror="
                this.outerHTML =
                '<div class=&quot;vehicle-image-placeholder&quot;>🚗</div>'
            "
        >

    `;

}


async function loadVehicle() {

    try {

        const response =
            await fetch(
                `${API_BASE}/vehicles/${vehicleId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load vehicle."
            );

        }


        const vehicle =
            await response.json();


        if (!vehicle) {

            showVehicleNotFound();

            return;

        }


        displayVehicle(
            vehicle
        );


    } catch (error) {

        console.error(
            "Error loading vehicle:",
            error
        );


        detailsContainer.innerHTML = `

            <div
                class="vehicle-not-found"
            >

                <h2>
                    Unable to load vehicle
                </h2>

                <p>
                    Please make sure the backend
                    server is running.
                </p>

                <a
                    href="browse-vehicles.html"
                    class="btn"
                >
                    Browse Vehicles
                </a>

            </div>

        `;

    }

}

function showVehicleNotFound() {

    detailsContainer.innerHTML = `

        <div
            class="vehicle-not-found"
        >

            <h2>
                Vehicle not found
            </h2>

            <p>
                The vehicle you are looking for
                does not exist.
            </p>

            <a
                href="browse-vehicles.html"
                class="btn"
            >
                Browse Vehicles
            </a>

        </div>

    `;

}

function displayVehicle(
    vehicle
) {

    let availabilityText =
        "";


    const normalizedStatus =
        String(
            vehicle.status || ""
        ).toLowerCase();


    if (
        normalizedStatus ===
        "available"
    ) {

        availabilityText =
            "Available";

    } else if (
        normalizedStatus ===
        "booked"
    ) {

        availabilityText =
            "Currently Booked";

    } else if (
        normalizedStatus ===
        "maintenance"
    ) {

        availabilityText =
            "Under Maintenance";

    } else {

        availabilityText =
            vehicle.status ||
            "Unavailable";

    }


    let bookButton =
        "";


    if (
        normalizedStatus ===
        "available"
    ) {

        bookButton = `

            <button
                class="btn vehicle-book-button"
                onclick="
                    bookVehicle(
                        ${Number(
                            vehicle.id
                        )}
                    )
                "
            >
                Book Now
            </button>

        `;

    } else {

        bookButton = `

            <button
                class="btn vehicle-book-button"
                disabled
            >
                Not Available
            </button>

        `;

    }


    detailsContainer.innerHTML = `

        <div
            class="vehicle-details-card"
        >


            <!-- =================================
                 VEHICLE PHOTO
            ================================== -->

            <div
                class="
                    vehicle-details-image-container
                "
            >

                ${vehicleImageHTML(
                    vehicle
                )}

            </div>


            <!-- =================================
                 INFORMATION
            ================================== -->

            <div
                class="
                    vehicle-details-information
                "
            >


                <div
                    class="
                        vehicle-details-heading
                    "
                >

                    <div>

                        <p
                            class="
                                vehicle-details-category
                            "
                        >

                            ${escapeHTML(
                                vehicle.brand ||
                                ""
                            )}

                            •

                            ${escapeHTML(
                                vehicle.category ||
                                ""
                            )}

                        </p>


                        <h1>

                            ${escapeHTML(
                                vehicle.name ||
                                "Vehicle"
                            )}

                        </h1>

                    </div>


                    <span
                        class="
                            status
                            status-${escapeHTML(
                                normalizedStatus ||
                                "unavailable"
                            )}
                        "
                    >

                        ${escapeHTML(
                            availabilityText
                        )}

                    </span>

                </div>


                <!-- RATING -->

                <div
                    class="
                        vehicle-details-rating
                    "
                >

                    <strong>

                        ${Number(
                            vehicle.rating ||
                            0
                        ).toFixed(1)}

                    </strong>

                    <span>
                        ★
                    </span>

                    <span>
                        Customer rating
                    </span>

                </div>


                <!-- PRICE -->

                <div
                    class="
                        vehicle-details-price
                    "
                >

                    <strong>

                        ${money(
                            vehicle.pricePerDay ||
                            0
                        )}

                    </strong>

                    <span>
                        / day
                    </span>

                </div>


                <!-- SPECIFICATIONS -->

                <div
                    class="
                        vehicle-details-specs
                    "
                >

                    <div
                        class="detail-spec"
                    >

                        <span
                            class="
                                detail-spec-label
                            "
                        >
                            Transmission
                        </span>

                        <strong>

                            ${escapeHTML(
                                vehicle.transmission ||
                                "N/A"
                            )}

                        </strong>

                    </div>


                    <div
                        class="detail-spec"
                    >

                        <span
                            class="
                                detail-spec-label
                            "
                        >
                            Seats
                        </span>

                        <strong>

                            ${escapeHTML(
                                String(
                                    vehicle.seats ||
                                    0
                                )
                            )}

                        </strong>

                    </div>


                    <div
                        class="detail-spec"
                    >

                        <span
                            class="
                                detail-spec-label
                            "
                        >
                            Category
                        </span>

                        <strong>

                            ${escapeHTML(
                                vehicle.category ||
                                "-"
                            )}

                        </strong>

                    </div>


                    <div
                        class="detail-spec"
                    >

                        <span
                            class="
                                detail-spec-label
                            "
                        >
                            Brand
                        </span>

                        <strong>

                            ${escapeHTML(
                                vehicle.brand ||
                                "-"
                            )}

                        </strong>

                    </div>

                </div>


                <!-- DESCRIPTION -->

                <div
                    class="
                        vehicle-description
                    "
                >

                    <h2>
                        About this vehicle
                    </h2>

                    <p>

                        Enjoy a comfortable and reliable
                        journey with the

                        ${escapeHTML(
                            vehicle.name ||
                            "vehicle"
                        )}.

                        This

                        ${escapeHTML(
                            (
                                vehicle.category ||
                                "vehicle"
                            ).toLowerCase()
                        )}

                        is available for rental through
                        Rento.

                    </p>

                </div>


                <!-- BOOK -->

                <div
                    class="
                        vehicle-details-actions
                    "
                >

                    ${bookButton}

                </div>


            </div>

        </div>

    `;

}

function bookVehicle(
    vehicleId
) {

    window.location.href =
        "booking.html?id=" +
        encodeURIComponent(
            vehicleId
        );

}

loadVehicle();