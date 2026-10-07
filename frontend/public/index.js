const API_BASE = "http://localhost:8080/api";

const featuredBox =
    document.getElementById("featured-vehicle");

const vehicleList =
    document.getElementById("vehicle-list");

const searchCategory =
    document.getElementById("search-category");

const searchBtn =
    document.getElementById("search-btn");

let vehicles = [];


// =========================================
// VEHICLE IMAGE
// =========================================

function getVehicleImageSource(image) {

    if (!image) {
        return "";
    }

    image = String(image).trim();

    if (!image) {
        return "";
    }

    // Base64 image
    if (image.startsWith("data:image/")) {
        return image;
    }

    // Full URL
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    // Local image path
    return image.replace(/^\/+/, "");
}


// =========================================
// VEHICLE IMAGE HTML
// =========================================

function vehicleImageHTML(vehicle, className) {

    const imageSource =
        getVehicleImageSource(
            vehicle && vehicle.image
        );

    if (imageSource) {

        return `
            <div class="${className} vehicle-photo-wrap">

                <img
                    src="${escapeHTML(imageSource)}"
                    alt="${escapeHTML(
                        (vehicle && vehicle.name)
                        || "Vehicle"
                    )}"
                    class="vehicle-photo-img"
                    loading="lazy"
                >

            </div>
        `;
    }

    return `
        <div class="${className} vehicle-no-image">
            🚗
        </div>
    `;
}


// =========================================
// LOAD VEHICLES FROM MYSQL
// =========================================

async function loadVehicles() {

    try {

        const response =
            await fetch(
                `${API_BASE}/vehicles`
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load vehicles."
            );
        }

        vehicles =
            await response.json();

        console.log(
            "Vehicles from MySQL:",
            vehicles
        );

        renderFeaturedVehicle();

        renderVehicles("all");

    }
    catch (error) {

        console.error(
            "Vehicle loading error:",
            error
        );

        if (featuredBox) {

            featuredBox.innerHTML = `
                <p>
                    Unable to load vehicles.
                </p>
            `;
        }

        if (vehicleList) {

            vehicleList.innerHTML = `
                <p>
                    Unable to load vehicles.
                    Please make sure the backend
                    server is running.
                </p>
            `;
        }
    }
}


// =========================================
// FEATURED / LATEST VEHICLE
// =========================================

function renderFeaturedVehicle() {

    if (!featuredBox) {
        return;
    }

    if (vehicles.length === 0) {

        featuredBox.innerHTML = `
            <p>
                No vehicles available.
            </p>
        `;

        return;
    }


    // Highest ID = latest added vehicle
    const latest =
        [...vehicles].sort(
            function (a, b) {

                return Number(b.id)
                    -
                    Number(a.id);

            }
        )[0];


    featuredBox.innerHTML = `

        ${vehicleImageHTML(
            latest,
            "featured-photo"
        )}

        <div class="featured-info">

            <div class="featured-tag">
                Just added
            </div>

            <h3>
                ${escapeHTML(
                    latest.name ||
                    "Vehicle"
                )}
            </h3>

            <div
                class="status status-${escapeHTML(
                    String(
                        latest.status ||
                        "available"
                    ).toLowerCase()
                )}"
            >
                ${escapeHTML(
                    latest.status ||
                    "Available"
                )}
            </div>

            <p>

                ${escapeHTML(
                    latest.category ||
                    "Vehicle"
                )}

                ${
                    latest.brand
                        ? " • " +
                          escapeHTML(
                              latest.brand
                          )
                        : ""
                }

            </p>

            <div class="price">

                ${money(
                    latest.pricePerDay ||
                    0
                )}

                / day

            </div>

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
            "available"
        ).toLowerCase();


    const canBook =
        status === "available";


    const availabilityText =
        canBook
            ? "Free cancellation"
            : "Currently " + status;


    const rating =
        Number(
            vehicle.rating || 0
        );


    return `

        <div class="vehicle-card">

            <div class="vc-header">

                <div>

                    <span class="vc-name">

                        ${escapeHTML(
                            vehicle.name ||
                            "Vehicle"
                        )}

                    </span>

                    <span class="vc-subtitle">

                        or similar

                        ${escapeHTML(
                            vehicle.category ||
                            "Vehicle"
                        )}

                    </span>

                </div>

            </div>


            <div class="vc-specs">

                <span>

                    ⚙️

                    ${escapeHTML(
                        vehicle.transmission ||
                        "Standard"
                    )}

                </span>

                <span>

                    👤

                    ${Number(
                        vehicle.seats || 0
                    )}

                    seats

                </span>

                <span>

                    ❄️ A/C

                </span>

            </div>


            <div class="vc-body">

                ${vehicleImageHTML(
                    vehicle,
                    "vc-photo"
                )}


                <div class="vc-price-block">

                    <div class="vc-price">

                        ${money(
                            vehicle.pricePerDay ||
                            0
                        )}

                    </div>

                    <div class="vc-price-sub">

                        per day

                    </div>

                    <div
                        class="vc-availability ${
                            canBook
                                ? ""
                                : "vc-unavailable"
                        }"
                    >

                        ${escapeHTML(
                            availabilityText
                        )}

                    </div>

                </div>

            </div>


            <div class="vc-rating-row">

                <div class="vc-rating-score">

                    ${rating.toFixed(1)} ★

                </div>


                <div class="vc-rating-label">

                    ${ratingLabel(
                        rating
                    )}

                </div>

            </div>


            <button
                class="vc-book-btn"
                ${
                    canBook
                        ? ""
                        : "disabled"
                }
                onclick="handleBook(${Number(
                    vehicle.id
                )})"
            >

                ${
                    canBook
                        ? "Book now"
                        : "Not available"
                }

            </button>

        </div>
    `;
}


// =========================================
// RENDER VEHICLES
// =========================================

function renderVehicles(category) {

    let filteredVehicles;


    if (
        category === "all" ||
        !category
    ) {

        filteredVehicles =
            vehicles;

    }
    else {

        filteredVehicles =
            vehicles.filter(
                function (vehicle) {

                    return String(
                        vehicle.category ||
                        ""
                    ).toLowerCase()
                    ===
                    String(
                        category
                    ).toLowerCase();

                }
            );
    }


    if (!vehicleList) {
        return;
    }


    vehicleList.innerHTML = "";


    if (
        filteredVehicles.length === 0
    ) {

        vehicleList.innerHTML =
            "<p>No vehicles match your search.</p>";

        return;
    }


    filteredVehicles.forEach(
        function (vehicle) {

            vehicleList.innerHTML +=
                vehicleCardHTML(
                    vehicle
                );

        }
    );
}


// =========================================
// BOOK VEHICLE
// =========================================

function handleBook(vehicleId) {

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
        else {

            alert(
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
// SEARCH
// =========================================

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        function () {

            const category =
                searchCategory
                    ? searchCategory.value
                    : "all";


            renderVehicles(
                category
            );

        }
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
// RATING LABEL
// =========================================

function ratingLabel(rating) {

    rating =
        Number(
            rating || 0
        );


    if (rating >= 9) {
        return "Exceptional";
    }

    if (rating >= 8) {
        return "Excellent";
    }

    if (rating >= 7) {
        return "Very good";
    }

    if (rating >= 6) {
        return "Good";
    }

    return "New";
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
// START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadVehicles();

    }
);