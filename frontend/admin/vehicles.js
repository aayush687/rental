
const API_URL =
    "http://localhost:8080/api/vehicles";

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
const vehiclesTableBody =
    document.getElementById(
        "vehicles-table-body"
    );

const vehicleSearchInput =
    document.getElementById(
        "vehicle-search"
    );

const filterCategory =
    document.getElementById(
        "filter-category"
    );

const filterStatus =
    document.getElementById(
        "filter-status"
    );

const vehicleModalOverlay =
    document.getElementById(
        "vehicle-modal-overlay"
    );

const vehicleForm =
    document.getElementById(
        "vehicle-form"
    );

const vehicleModalTitle =
    document.getElementById(
        "vehicle-modal-title"
    );

const vehicleImageFile =
    document.getElementById(
        "vehicle-image-file"
    );

const vehicleImage =
    document.getElementById(
        "vehicle-image"
    );

const vehicleImagePreview =
    document.getElementById(
        "vehicle-image-preview"
    );

function readImageAsDataURL(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Could not read image."
                        )
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}

function showImagePreview(image) {

    if (!vehicleImagePreview) {
        return;
    }


    if (!image) {

        vehicleImagePreview.innerHTML =
            "";

        return;
    }


    vehicleImagePreview.innerHTML = `

        <div
            style="
                width:220px;
                border:1px solid #ddd;
                border-radius:8px;
                padding:6px;
                background:#fff;
            "
        >

            <img
                src="${image}"
                alt="Vehicle preview"
                style="
                    width:100%;
                    height:140px;
                    object-fit:cover;
                    border-radius:6px;
                    display:block;
                "
            >

        </div>

    `;

}

if (vehicleImageFile) {

    vehicleImageFile.addEventListener(
        "change",
        async function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );

                this.value = "";

                return;

            }


            try {

                const imageData =
                    await readImageAsDataURL(
                        file
                    );


                vehicleImage.value =
                    imageData;


                showImagePreview(
                    imageData
                );


            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "Unable to read the selected image."
                );

            }

        }
    );

}

async function getVehicles() {

    const response =
        await fetch(
            API_URL
        );


    if (!response.ok) {

        throw new Error(
            "Could not load vehicles."
        );

    }


    return await response.json();

}

function getImageSource(image) {

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


    return "../public/" +
        image.replace(
            /^\/+/,
            ""
        );

}

async function renderVehicles() {

    try {

        const vehicles =
            await getVehicles();


        const searchTerm =
            vehicleSearchInput.value
                .trim()
                .toLowerCase();


        const categoryFilter =
            filterCategory.value;


        const statusFilter =
            filterStatus.value;


        const filtered =
            vehicles.filter(
                function (vehicle) {

                    const name =
                        String(
                            vehicle.name || ""
                        ).toLowerCase();


                    const brand =
                        String(
                            vehicle.brand || ""
                        ).toLowerCase();


                    const matchesSearch =
                        !searchTerm ||
                        name.includes(
                            searchTerm
                        ) ||
                        brand.includes(
                            searchTerm
                        );


                    const matchesCategory =
                        categoryFilter ===
                            "all" ||
                        vehicle.category ===
                            categoryFilter;


                    const matchesStatus =
                        statusFilter ===
                            "all" ||
                        vehicle.status ===
                            statusFilter;


                    return (
                        matchesSearch &&
                        matchesCategory &&
                        matchesStatus
                    );

                }
            );


        vehiclesTableBody.innerHTML =
            "";


        if (
            filtered.length === 0
        ) {

            vehiclesTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="admin-empty"
                    >
                        No vehicles found.
                    </td>

                </tr>

            `;

            return;

        }


        filtered.forEach(
            function (vehicle) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const imageSource =
                    getImageSource(
                        vehicle.image
                    );


                row.innerHTML = `

                    <td>

                        <div
                            class="admin-vehicle-cell"
                        >

                            ${
                                imageSource
                                ?
                                `
                                    <img
                                        src="${imageSource}"
                                        class="admin-vehicle-thumb"
                                        alt="${escapeHTML(
                                            vehicle.name || ""
                                        )}"
                                    >
                                `
                                :
                                ""
                            }


                            <span>
                                ${escapeHTML(
                                    vehicle.name || ""
                                )}
                            </span>

                        </div>

                    </td>


                    <td>
                        ${escapeHTML(
                            vehicle.category || ""
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            vehicle.brand || "-"
                        )}
                    </td>


                    <td>

                        Rs.
                        ${Number(
                            vehicle.pricePerDay || 0
                        ).toLocaleString(
                            "en-IN"
                        )}

                    </td>


                    <td>
                        ${escapeHTML(
                            vehicle.transmission || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            String(
                                vehicle.seats || "-"
                            )
                        )}
                    </td>


                    <td>

                        <span
                            class="
                                admin-status
                                status-${escapeHTML(
                                    vehicle.status || ""
                                )}
                            "
                        >

                            ${formatVehicleStatus(
                                vehicle.status
                            )}

                        </span>

                    </td>


                    <td>

                        <div
                            class="admin-table-actions"
                        >

                            <button
                                class="admin-edit-btn"
                                onclick="
                                    openEditModal(
                                        ${vehicle.id}
                                    )
                                "
                            >
                                Edit
                            </button>


                            <button
                                class="admin-delete-btn"
                                onclick="
                                    deleteVehicle(
                                        ${vehicle.id}
                                    )
                                "
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                `;


                vehiclesTableBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            error
        );


        vehiclesTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="admin-empty"
                >
                    Cannot reach the server.
                </td>

            </tr>

        `;

    }

}

function formatVehicleStatus(status) {

    switch (
        String(
            status || ""
        ).toLowerCase()
    ) {

        case "available":

            return "Available";


        case "booked":

            return "Booked";


        case "maintenance":

            return "Maintenance";


        default:

            return status || "-";

    }

}

function openAddModal() {

    vehicleModalTitle.textContent =
        "Add Vehicle";


    vehicleForm.reset();


    document.getElementById(
        "vehicle-id"
    ).value =
        "";


    vehicleImage.value =
        "";


    vehicleImageFile.value =
        "";


    vehicleImagePreview.innerHTML =
        "";


    vehicleModalOverlay.classList.add(
        "show"
    );

}

async function openEditModal(id) {

    try {

        const response =
            await fetch(
                API_URL + "/" + id
            );


        if (!response.ok) {

            throw new Error(
                "Vehicle not found."
            );

        }


        const vehicle =
            await response.json();


        vehicleModalTitle.textContent =
            "Edit Vehicle";


        document.getElementById(
            "vehicle-id"
        ).value =
            vehicle.id;


        document.getElementById(
            "vehicle-name"
        ).value =
            vehicle.name || "";


        document.getElementById(
            "vehicle-category"
        ).value =
            vehicle.category || "Car";


        document.getElementById(
            "vehicle-brand"
        ).value =
            vehicle.brand || "";


        document.getElementById(
            "vehicle-price"
        ).value =
            vehicle.pricePerDay || "";


        document.getElementById(
            "vehicle-seats"
        ).value =
            vehicle.seats || "";


        document.getElementById(
            "vehicle-transmission"
        ).value =
            vehicle.transmission ||
            "Automatic";


        document.getElementById(
            "vehicle-status"
        ).value =
            vehicle.status ||
            "available";

        vehicleImage.value =
            vehicle.image || "";


        vehicleImageFile.value =
            "";


        if (vehicle.image) {

            showImagePreview(
                getImageSource(
                    vehicle.image
                )
            );

        } else {

            vehicleImagePreview.innerHTML =
                "";

        }


        vehicleModalOverlay.classList.add(
            "show"
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Could not load vehicle."
        );

    }

}

function closeVehicleModal() {

    vehicleModalOverlay.classList.remove(
        "show"
    );


    vehicleForm.reset();


    vehicleImage.value =
        "";


    vehicleImagePreview.innerHTML =
        "";

}

vehicleForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const id =
            document.getElementById(
                "vehicle-id"
            ).value;

        const imageValue =
            vehicleImage.value.trim();


        const vehicleData = {

            name:
                document.getElementById(
                    "vehicle-name"
                ).value.trim(),


            category:
                document.getElementById(
                    "vehicle-category"
                ).value,


            brand:
                document.getElementById(
                    "vehicle-brand"
                ).value.trim(),


            pricePerDay:
                Number(
                    document.getElementById(
                        "vehicle-price"
                    ).value
                ),


            seats:
                Number(
                    document.getElementById(
                        "vehicle-seats"
                    ).value
                ),


            transmission:
                document.getElementById(
                    "vehicle-transmission"
                ).value,


            status:
                document.getElementById(
                    "vehicle-status"
                ).value,


            image:
                imageValue,


            rating:
                8.0

        };


        try {

            let response;

            if (id) {

                response =
                    await fetch(
                        API_URL + "/" + id,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    vehicleData
                                )

                        }
                    );

            }

            else {

                vehicleData.dateAdded =
                    new Date()
                        .toISOString()
                        .slice(
                            0,
                            10
                        );


                response =
                    await fetch(
                        API_URL,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    vehicleData
                                )

                        }
                    );

            }


            if (!response.ok) {

                const errorText =
                    await response.text();


                console.error(
                    errorText
                );


                throw new Error(
                    "Failed to save vehicle."
                );

            }


            closeVehicleModal();


            await renderVehicles();


            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    id
                        ? "Vehicle updated."
                        : "Vehicle added."
                );

            } else {

                alert(
                    id
                        ? "Vehicle updated."
                        : "Vehicle added."
                );

            }


        } catch (error) {

            console.error(
                error
            );


            alert(
                "Cannot save vehicle. " +
                "Make sure the backend is running."
            );

        }

    }
);

async function deleteVehicle(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this vehicle?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response =
            await fetch(
                API_URL + "/" + id,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

        const responseText =
            await response.text();

        if (!response.ok) {

            let message =
                responseText;

            try {

                if (
                    responseText &&
                    responseText.trim()
                ) {

                    const data =
                        JSON.parse(
                            responseText
                        );

                    message =
                        data.message ||
                        data.error ||
                        responseText;
                }

            } catch (e) {
                // Backend returned plain text.
            }

            throw new Error(
                message ||
                `Could not delete vehicle. HTTP ${response.status}`
            );
        }

        await renderVehicles();

        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Vehicle deleted successfully."
            );

        } else {

            alert(
                "Vehicle deleted successfully."
            );
        }

    } catch (error) {

        console.error(
            "Delete vehicle error:",
            error
        );

        alert(
            error.message ||
            "Could not delete vehicle."
        );
    }
}

vehicleSearchInput.addEventListener(
    "input",
    renderVehicles
);


filterCategory.addEventListener(
    "change",
    renderVehicles
);


filterStatus.addEventListener(
    "change",
    renderVehicles
);

renderVehicles();