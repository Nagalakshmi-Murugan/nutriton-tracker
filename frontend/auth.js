const AUTH_API = "http://localhost:3000/api";

// ── tab switching ─────────────────────────────────────────
const tabLogin      = document.getElementById("tabLogin");
const tabRegister   = document.getElementById("tabRegister");
const loginForm     = document.getElementById("loginForm");
const registerForm  = document.getElementById("registerForm");

tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.style.display    = "flex";
    registerForm.style.display = "none";
});

tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.style.display = "flex";
    loginForm.style.display    = "none";
});

// ── if already logged in, skip straight to the app ──────────
(async function redirectIfLoggedIn() {
    try {
        const res = await fetch(`${AUTH_API}/me`, { credentials: "include" });
        if (res.ok) window.location.href = "index.html";
    } catch (err) {
        // Backend not reachable yet — just stay on the login page.
    }
})();

// ── login ─────────────────────────────────────────────────
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("loginError");
    errorEl.textContent = "";

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch(`${AUTH_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            errorEl.textContent = await res.text();
            return;
        }
        window.location.href = "index.html";
    } catch (err) {
        errorEl.textContent = "Could not reach the server. Is it running on port 3000?";
    }
});

// ── register ──────────────────────────────────────────────
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("registerError");
    errorEl.textContent = "";

    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirm  = document.getElementById("registerConfirm").value;

    if (password !== confirm) {
        errorEl.textContent = "Passwords do not match";
        return;
    }

    try {
        const res = await fetch(`${AUTH_API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            errorEl.textContent = await res.text();
            return;
        }
        window.location.href = "index.html";
    } catch (err) {
        errorEl.textContent = "Could not reach the server. Is it running on port 3000?";
    }
});