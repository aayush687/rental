const ADMIN_API = "http://localhost:8080/api";

const adminProfileForm = document.getElementById("admin-profile-form");
const adminNameInput = document.getElementById("admin-name-input");
const adminEmailInput = document.getElementById("admin-email-input");
const adminPhoneInput = document.getElementById("admin-phone-input");
const adminPasswordInput = document.getElementById("admin-password-input");
const adminConfirmPasswordInput = document.getElementById("admin-confirm-password-input");
const adminProfileMessage = document.getElementById("admin-profile-message");
const adminNameLabel = document.querySelector(".admin-name");

let adminProfile = null;

function showAdminMessage(text, type) {
    adminProfileMessage.textContent = text;
    adminProfileMessage.className = "profile-message " + type;
}

function fillForm() {

    if (!adminProfile) {
        return;
    }

    adminNameInput.value = adminProfile.name || "";
    adminEmailInput.value = adminProfile.email || "";
    adminPhoneInput.value = adminProfile.phone || "";
    adminPasswordInput.value = "";
    adminConfirmPasswordInput.value = "";

    if (adminNameLabel) {
        adminNameLabel.textContent = adminProfile.name;
    }
}

function resetForm() {
    fillForm();
    adminProfileMessage.textContent = "";
    adminProfileMessage.className = "profile-message";
}

adminProfileForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!adminProfile) {
        showAdminMessage("Please log in again.", "error");
        return;
    }

    const newPassword = adminPasswordInput.value;
    const confirmPassword = adminConfirmPasswordInput.value;

    if (newPassword || confirmPassword) {

        if (newPassword !== confirmPassword) {
            showAdminMessage("Passwords do not match.", "error");
            return;
        }

        if (newPassword.length < 6) {
            showAdminMessage("Password must be at least 6 characters.", "error");
            return;
        }
    }

    try {

        const response = await fetch(
            ADMIN_API + "/admin/" + adminProfile.id,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: adminNameInput.value.trim(),
                    email: adminEmailInput.value.trim(),
                    phone: adminPhoneInput.value.trim()
                })
            }
        );

        if (!response.ok) {
            showAdminMessage((await response.text()) || "Could not update profile.", "error");
            return;
        }

        const updated = await response.json();

        adminProfile.name = updated.name;
        adminProfile.email = updated.email;
        adminProfile.phone = updated.phone;

        if (newPassword) {

            const passwordResponse = await fetch(
                ADMIN_API + "/admin/" + adminProfile.id + "/password",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: newPassword })
                }
            );

            if (!passwordResponse.ok) {
                showAdminMessage((await passwordResponse.text()) || "Could not change password.", "error");
                return;
            }
        }

    } catch (error) {
        showAdminMessage("Cannot reach the server. Is the backend running?", "error");
        return;
    }

    fillForm();
    showAdminMessage("Profile updated successfully.", "success");
});

async function loadAdminProfile() {
    adminProfile = await requireAdminLogin();
    fillForm();
}

loadAdminProfile();