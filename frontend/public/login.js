const loginForm = document.getElementById("login-form");
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("password");

// Opening the login page ends any old session on the server.
const freshStart = fetch("http://localhost:8080/api/auth/logout", { method: "POST" })
    .catch(function () {});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("email");
    const password = passwordInput;
    const role = document.getElementById("role").value;
    let isValid = true;
    if (!email.value.includes("@")) {
    document.getElementById("email-error").style.display = "block";
    isValid = false;
    } else {
    document.getElementById("email-error").style.display = "none";
    }
    if (password.value.length === 0) {
    document.getElementById("password-error").style.display = "block";
    isValid = false;
    } else {
    document.getElementById("password-error").style.display = "none";
    }
    if (!isValid) {
    return;
    }
    // the dropdown value is "staff" but the backend expects "admin"
    const roleName = role === "staff" ? "admin" : "customer";

    try {
        await freshStart;
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.value.trim(),
                password: password.value,
                role: roleName
            })
        });

        if (!response.ok) {
            showToast(await response.text());
            return;
        }

        // the server has now remembered the login (session cookie)
        await response.json();

        if (roleName === "admin") {
            window.location.href = "../admin/dashboard.html";
        } else {
            window.location.href = "../customer/dashboard.html";
        }

    } catch (error) {
        showToast("Cannot reach the server. Is the backend running?");
    }
});