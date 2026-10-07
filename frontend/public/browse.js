let vehicles = [];

const vehicleList =
    document.getElementById("vehicle-list");

const vehicleCount =
    document.getElementById("vehicle-count");

const searchCategory =
    document.getElementById("search-category");

const searchBrand =
    document.getElementById("search-brand");

const searchTransmission =
    document.getElementById("search-transmission");

const searchStatus =
    document.getElementById("search-status");

const searchBtn =
    document.getElementById("search-btn");


// =========================================
// GET VEHICLES FROM SPRING BOOT
// =========================================

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

        console.log(
            "Vehicles:",
            vehicles
        );

        return vehicles;

    }
    catch (error) {

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


// =========================================
// LOAD BRANDS
// =========================================

function loadBrands(vehicleData) {

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


    searchBrand.innerHTML =
        '<option value="all">All Brands</option>';


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


// =========================================
// VEHICLE IMAGE SOURCE
// =========================================

function getVehicleImageSource(image) {

    if (!image) {
        return "";
    }

    image =
        String(image).trim();


    if (!image) {
        return "";
    }


    // Base64 image
    if (
        image.startsWith(
            "data:image/"
        )
    ) {

        return image;
    }


    // Full image URL
    if (
        image.startsWith(
            "http://"
        )
        ||
        image.startsWith(
            "https://"
        )
    ) {

        return image;
    }


    // Local image path
    return image.replace(
        /^\/+/,
        ""
    );
}


// =========================================
// VEHICLE PHOTO
// =========================================

function vehiclePictureHTML(vehicle) {

    const imageSource =
        getVehicleImageSource(
            vehicle &&
            vehicle.image
        );


    if (imageSource) {

        return `
            <div class="public-browse-vehicle-image">

                <img
                    src="${escapeHTML(
                        imageSource
                    )}"
                    alt="${escapeHTML(
                        (vehicle &&
                         vehicle.name)
                        ||
                        "Vehicle"
                    )}"
                    loading="lazy"
                >

            </div>
        `;
    }


    // No image
    return `
        <div
            class="
                public-browse-vehicle-image
                public-browse-no-image
            "
        >
            🚗
        </div>
    `;
}


// =========================================
// VEHICLE CARD
// =========================================

function vehicleCardHTML(vehicle) {

    const status =
        String(
            vehicle.status ||
            ""
        ).toLowerCase();


    const canBook =
        status === "available";


    let statusText = "";


    if (
        status === "available"
    ) {

        statusText =
            "Available";

    }
    else if (
        status === "booked"
    ) {

        statusText =
            "Currently booked";

    }
    else if (
        status === "maintenance"
    ) {

        statusText =
            "Under maintenance";

    }
    else {

        statusText =
            vehicle.status ||
            "Unknown";
    }


    const rating =
        Number(
            vehicle.rating ||
            0
        ).toFixed(1);


    const seats =
        vehicle.seats ||
        0;


    const transmission =
        vehicle.transmission ||
        "N/A";


    return `

        <div class="vehicle-card">


            <!-- VEHICLE PHOTO -->

            ${vehiclePictureHTML(
                vehicle
            )}


            <!-- VEHICLE NAME -->

            <h3>

                ${escapeHTML(
                    vehicle.name ||
                    "Vehicle"
                )}

            </h3>


            <!-- BRAND / CATEGORY -->

            <p class="vehicle-subtitle">

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

            <div class="vehicle-specs">

                <span>

                    ⚙️

                    ${escapeHTML(
                        transmission
                    )}

                </span>


                <span>

                    👤

                    ${seats} seats

                </span>


                <span>

                    ⭐

                    ${rating}

                </span>

            </div>


            <!-- PRICE -->

            <div class="price">

                ${money(
                    vehicle.pricePerDay
                )}

                <span class="price-small">
                    / day
                </span>

            </div>


            <!-- STATUS -->

            <div class="vehicle-status">

                <span
                    class="status status-${escapeHTML(
                        status
                    )}"
                >

                    ${escapeHTML(
                        statusText
                    )}

                </span>

            </div>


            <!-- BUTTONS -->

            <div class="vehicle-actions">


                <button
                    class="btn btn-secondary"
                    onclick="viewVehicle(${Number(
                        vehicle.id
                    )})"
                >

                    View Details

                </button>


                <button
                    class="btn"
                    onclick="bookVehicle(${Number(
                        vehicle.id
                    )})"
                    ${canBook
                        ? ""
                        : "disabled"}
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


// =========================================
// RENDER VEHICLES
// =========================================

function renderVehicles(vehicleData) {

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

            <div class="no-results">

                <div class="no-results-icon">
                    🚗
                </div>

                <h3>
                    No vehicles found
                </h3>

                <p>
                    Try changing your
                    search filters.
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


// =========================================
// SEARCH VEHICLES
// =========================================

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
                    category !== "all"
                    &&
                    vehicle.category !==
                    category
                ) {

                    return false;
                }


                if (
                    brand !== "all"
                    &&
                    vehicle.brand !==
                    brand
                ) {

                    return false;
                }


                if (
                    transmission !== "all"
                    &&
                    vehicle.transmission !==
                    transmission
                ) {

                    return false;
                }


                if (
                    status !== "all"
                    &&
                    String(
                        vehicle.status ||
                        ""
                    ).toLowerCase()
                    !==
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


// =========================================
// VIEW VEHICLE
// =========================================

function viewVehicle(vehicleId) {

    const vehicle =
        vehicles.find(
            function (vehicle) {

                return Number(
                    vehicle.id
                )
                ===
                Number(
                    vehicleId
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
        "../customer/vehicle-details.html?id=" +
        vehicleId;
}


// =========================================
// BOOK VEHICLE
// =========================================

function bookVehicle(vehicleId) {

    const vehicle =
        vehicles.find(
            function (vehicle) {

                return Number(
                    vehicle.id
                )
                ===
                Number(
                    vehicleId
                );

            }
        );


    if (!vehicle) {
        return;
    }


    const status =
        String(
            vehicle.status ||
            ""
        ).toLowerCase();


    if (
        status !== "available"
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
        "login.html?vehicle=" +
        encodeURIComponent(
            vehicleId
        );
}


// =========================================
// SEARCH BUTTON
// =========================================

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchVehicles
    );
}


// =========================================
// MONEY
// =========================================

function money(value) {

    return "Rs. " +
        Number(
            value || 0
        ).toLocaleString();
}


// =========================================
// ESCAPE HTML
// =========================================

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


// =========================================
// INITIALIZE
// =========================================

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