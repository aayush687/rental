let vehicles = [];


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


const vehicleList =
    document.getElementById(
        "vehicle-list"
    );


const vehicleCount =
    document.getElementById(
        "vehicle-count"
    );


const searchCategory =
    document.getElementById(
        "search-category"
    );


const searchBrand =
    document.getElementById(
        "search-brand"
    );


const searchTransmission =
    document.getElementById(
        "search-transmission"
    );


const searchStatus =
    document.getElementById(
        "search-status"
    );


const searchBtn =
    document.getElementById(
        "search-btn"
    );

function getVehicleImageSource(image) {

    if (!image) {

        return "";

    }


    /*
       Uploaded Base64 image
    */

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

    return (
        "../public/" +
        image.replace(
            /^\/+/,
            ""
        )
    );

}

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

async function getVehicles() {

    try {

        const response =
            await fetch(
                "http://localhost:8080/api/vehicles"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load vehicles"
            );

        }


        vehicles =
            await response.json();


        return vehicles;


    } catch (error) {

        console.error(
            "Error loading vehicles:",
            error
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Unable to load vehicles."
            );

        }


        return [];

    }

}

function loadBrands(
    vehicleData
) {

    searchBrand.innerHTML =
        `
            <option value="all">
                All Brands
            </option>
        `;


    const brands = [];


    vehicleData.forEach(
        function (vehicle) {

            if (
                vehicle.brand &&
                !brands.includes(
                    vehicle.brand
                )
            ) {

                brands.push(
                    vehicle.brand
                );

            }

        }
    );


    brands.sort();


    brands.forEach(
        function (brand) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                brand;


            option.textContent =
                brand;


            searchBrand.appendChild(
                option
            );

        }
    );

}

function customerVehicleImage(
    vehicle
) {

    const imageSource =
        getVehicleImageSource(
            vehicle.image
        );


    /*
       No image
    */

    if (!imageSource) {

        return `

            <div
                class="browse-vehicle-icon"
            >
                🚗
            </div>

        `;

    }


    /*
       Real image
    */

    return `

        <div
            class="browse-vehicle-image"
        >

            <img
                src="${imageSource}"
                alt="${escapeHTML(
                    vehicle.name ||
                    "Vehicle"
                )}"
                class="browse-vehicle-photo"
                onerror="
                    this.parentElement.innerHTML =
                    '<div class=&quot;browse-vehicle-icon&quot;>🚗</div>'
                "
            >

        </div>

    `;

}

function vehicleCardHTML(
    vehicle
) {

    const canBook =
        String(
            vehicle.status || ""
        ).toLowerCase() ===
        "available";


    let statusText =
        "";


    if (
        String(
            vehicle.status || ""
        ).toLowerCase() ===
        "available"
    ) {

        statusText =
            "Available";

    } else if (
        String(
            vehicle.status || ""
        ).toLowerCase() ===
        "booked"
    ) {

        statusText =
            "Currently booked";

    } else if (
        String(
            vehicle.status || ""
        ).toLowerCase() ===
        "maintenance"
    ) {

        statusText =
            "Under maintenance";

    } else {

        statusText =
            vehicle.status ||
            "Unknown";

    }


    const rating =
        Number(
            vehicle.rating || 0
        ).toFixed(1);


    const seats =
        vehicle.seats ||
        0;


    const transmission =
        vehicle.transmission ||
        "N/A";


    return `

        <div
            class="vehicle-card"
        >


            <!-- VEHICLE PHOTO -->

            ${customerVehicleImage(
                vehicle
            )}


            <!-- NAME -->

            <h3>

                ${escapeHTML(
                    vehicle.name ||
                    "Vehicle"
                )}

            </h3>


            <!-- BRAND + CATEGORY -->

            <p
                class="vehicle-subtitle"
            >

                ${escapeHTML(
                    vehicle.brand ||
                    "Unknown"
                )}

                •

                ${escapeHTML(
                    vehicle.category ||
                    "Unknown"
                )}

            </p>


            <!-- SPECIFICATIONS -->

            <div
                class="vehicle-specs"
            >

                <span>
                    ⚙️
                    ${escapeHTML(
                        transmission
                    )}
                </span>

                <span>
                    👤
                    ${escapeHTML(
                        String(seats)
                    )}
                    seats
                </span>

                <span>
                    ⭐
                    ${rating}
                </span>

            </div>


            <!-- PRICE -->

            <div class="price">

                ${money(
                    vehicle.pricePerDay ||
                    0
                )}

                <span
                    class="price-small"
                >
                    / day
                </span>

            </div>


            <!-- STATUS -->

            <div
                class="vehicle-status"
            >

                <span
                    class="
                        status
                        status-${escapeHTML(
                            vehicle.status ||
                            "unknown"
                        )}
                    "
                >

                    ${escapeHTML(
                        statusText
                    )}

                </span>

            </div>


            <!-- BUTTONS -->

            <div
                class="vehicle-actions"
            >

                <button
                    class="
                        btn
                        btn-secondary
                    "
                    onclick="
                        viewVehicle(
                            ${Number(
                                vehicle.id
                            )}
                        )
                    "
                >
                    View Details
                </button>


                <button
                    class="btn"
                    onclick="
                        bookVehicle(
                            ${Number(
                                vehicle.id
                            )}
                        )
                    "
                    ${
                        canBook
                            ? ""
                            : "disabled"
                    }
                >

                    ${
                        canBook
                            ? "Book Now"
                            : "Unavailable"
                    }

                </button>

            </div>

        </div>

    `;

}

function renderVehicles(
    vehicleData
) {

    vehicleList.innerHTML =
        "";


    vehicleCount.textContent =
        vehicleData.length +
        (
            vehicleData.length === 1
                ? " vehicle"
                : " vehicles"
        );


    if (
        vehicleData.length === 0
    ) {

        vehicleList.innerHTML = `

            <div
                class="no-results"
            >

                <div
                    class="no-results-icon"
                >
                    🚗
                </div>

                <h3>
                    No vehicles found
                </h3>

                <p>
                    Try changing your search filters.
                </p>

            </div>

        `;

        return;

    }


    vehicleData.forEach(
        function (vehicle) {

            vehicleList.innerHTML +=
                vehicleCardHTML(
                    vehicle
                );

        }
    );

}

async function searchVehicles() {

    const category =
        searchCategory.value;


    const brand =
        searchBrand.value;


    const transmission =
        searchTransmission.value;


    const status =
        searchStatus.value;


    const allVehicles =
        await getVehicles();


    const filteredVehicles =
        allVehicles.filter(
            function (vehicle) {

                if (
                    category !== "all" &&
                    vehicle.category !==
                        category
                ) {

                    return false;

                }


                if (
                    brand !== "all" &&
                    vehicle.brand !==
                        brand
                ) {

                    return false;

                }


                if (
                    transmission !==
                        "all" &&
                    vehicle.transmission !==
                        transmission
                ) {

                    return false;

                }


                if (
                    status !== "all" &&
                    String(
                        vehicle.status ||
                        ""
                    ).toLowerCase() !==
                        String(
                            status
                        ).toLowerCase()
                ) {

                    return false;

                }


                return true;

            }
        );


    renderVehicles(
        filteredVehicles
    );

}

function viewVehicle(
    vehicleId
) {

    const vehicle =
        vehicles.find(
            function (vehicle) {

                return (
                    vehicle.id ===
                    Number(
                        vehicleId
                    )
                );

            }
        );


    if (!vehicle) {

        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Vehicle not found."
            );

        }

        return;

    }


    window.location.href =
        "vehicle-details.html?id=" +
        encodeURIComponent(
            vehicleId
        );

}

function bookVehicle(
    vehicleId
) {

    const vehicle =
        vehicles.find(
            function (vehicle) {

                return (
                    vehicle.id ===
                    Number(
                        vehicleId
                    )
                );

            }
        );


    if (!vehicle) {

        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Vehicle not found."
            );

        }

        return;

    }


    if (
        String(
            vehicle.status || ""
        ).toLowerCase() !==
        "available"
    ) {

        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "This vehicle is currently unavailable."
            );

        }

        return;

    }


    window.location.href =
        "booking.html?id=" +
        encodeURIComponent(
            vehicleId
        );

}

searchBtn.addEventListener(
    "click",
    searchVehicles
);

async function initializeVehicles() {

    const allVehicles =
        await getVehicles();


    loadBrands(
        allVehicles
    );


    renderVehicles(
        allVehicles
    );

}


initializeVehicles();