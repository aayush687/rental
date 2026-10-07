const EDIT_API = "http://localhost:8080/api";

const editProfileForm = document.getElementById("edit-profile-form");
const editName = document.getElementById("edit-name");
const editEmail = document.getElementById("edit-email");
const editPhone = document.getElementById("edit-phone");
const editPassword = document.getElementById("edit-password");
const editConfirmPassword = document.getElementById("edit-confirm-password");
const profileMessage = document.getElementById("profile-message");

let customerProfile = null;

async function loadProfile() {

    customerProfile = await requireCustomerLogin();

    if (!customerProfile) {
        return;
    }

    editName.value = customerProfile.name || "";
    editEmail.value = customerProfile.email || "";
    editPhone.value = customerProfile.phone || "";
}

loadProfile();


editProfileForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!customerProfile) {
        showMessage("Please log in again.", "error");
        return;
    }

    const name = editName.value.trim();
    const email = editEmail.value.trim();
    const phone = editPhone.value.trim();
    const password = editPassword.value;
    const confirmPassword = editConfirmPassword.value;

    if (name === "") {
        showMessage("Please enter your full name.", "error");
        editName.focus();
        return;
    }

    if (email === "") {
        showMessage("Please enter your email address.", "error");
        editEmail.focus();
        return;
    }

    if (password !== "" || confirmPassword !== "") {
        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", "error");
            editConfirmPassword.focus();
            return;
        }
        if (password.length < 6) {
            showMessage("Password must be at least 6 characters.", "error");
            editPassword.focus();
            return;
        }
    }

    try {

        const response = await fetch(
            EDIT_API + "/customers/" + customerProfile.id,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, email: email, phone: phone })
            }
        );

        if (!response.ok) {
            showMessage(await response.text() || "Could not update profile.", "error");
            return;
        }

        if (password !== "") {

            const passwordResponse = await fetch(
                EDIT_API + "/customers/" + customerProfile.id + "/password",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: password })
                }
            );

            if (!passwordResponse.ok) {
                showMessage(await passwordResponse.text() || "Could not change password.", "error");
                return;
            }
        }

    } catch (error) {
        showMessage("Cannot reach the server. Is the backend running?", "error");
        return;
    }

    showMessage("Profile updated successfully!", "success");

    setTimeout(function () {
        window.location.href = "my-profile.html";
    }, 1000);
});

function showMessage(message, type) {
    profileMessage.textContent = message;
    profileMessage.className = "profile-message " + type;
}