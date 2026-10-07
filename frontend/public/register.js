
const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const password = document.getElementById("password");
    let isValid = true;
    if (name.value.trim().length === 0) {
    document.getElementById("name-error").style.display = "block";
    isValid = false;
    } else {
    document.getElementById("name-error").style.display = "none";
    }
    if (!email.value.includes("@")) {
    document.getElementById("email-error").style.display = "block";
    isValid = false;
    } else {
    document.getElementById("email-error").style.display = "none";
    }
    if (!/^\d{7,15}$/.test(phone.value.trim())) {
    document.getElementById("phone-error").style.display = "block";
    isValid = false;
    } else {
    document.getElementById("phone-error").style.display = "none";
    }
    if (password.value.length < 8) {
    document.getElementById("password-error").style.display = "block";
    isValid = false;
    } else {
    document.getElementById("password-error").style.display = "none";
    }
    registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    // ...keep all your existing validation code as it is...

    if (!isValid) {
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                password: password.value
            })
        });

        if (!response.ok) {
            // backend sends a plain-text reason, e.g. "Email is already registered."
            showToast(await response.text());
            return;
        }

        showToast("Account created. Redirecting to login...");
        setTimeout(function () {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {
        showToast("Cannot reach the server. Is the backend running?");
    }
});
});
