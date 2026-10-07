(function () {

    const AUTH_API = "http://localhost:8080/api";

    // Send the session cookie with every request to the backend.
    const nativeFetch = window.fetch.bind(window);

    window.fetch = function (input, init) {
        return nativeFetch(input, Object.assign({ credentials: "include" }, init || {}));
    };

    // Ask the server who is logged in (once per page).
    let mePromise = null;

    function getCurrentUser() {
        if (!mePromise) {
            mePromise = nativeFetch(AUTH_API + "/auth/me", { credentials: "include" })
                .then(function (response) {
                    return response.ok ? response.json() : null;
                })
                .catch(function () {
                    return null;
                });
        }
        return mePromise;
    }

    async function requireRole(role) {
        const user = await getCurrentUser();

        if (!user || user.role !== role) {
            window.location.href = "../public/login.html";
            return null;
        }

        return user;
    }

    window.getCurrentUser = getCurrentUser;
    window.requireCustomerLogin = function () { return requireRole("customer"); };
    window.requireAdminLogin = function () { return requireRole("admin"); };

    // Protect whole folders automatically.
    const path = window.location.pathname;

    if (path.indexOf("/customer/") !== -1) {
        requireRole("customer");
    } else if (path.indexOf("/admin/") !== -1) {
        requireRole("admin");
    }

    // Any "Logout" link ends the session on the server.
    document.addEventListener("click", function (event) {
        const link = event.target.closest("a");

        if (link && link.textContent.trim() === "Logout") {
            nativeFetch(AUTH_API + "/auth/logout", {
                method: "POST",
                credentials: "include",
                keepalive: true
            });
        }
    });

})();