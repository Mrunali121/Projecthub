/**
 * auth.js
 * Mock authentication for the demo. There is no backend, so "login"
 * just validates that both fields are non-empty and starts a session
 * flag in localStorage. In a production build, replace login() with a
 * real API call and store a token instead of a boolean flag.
 */

const SESSION_KEY = "projecthub_session_v1";

const Auth = {
  isLoggedIn() {
    return localStorage.getItem(SESSION_KEY) === "1";
  },

  login(email, password) {
    if (!email || !password) {
      return { ok: false, error: "Enter both an email and a password." };
    }
    // Demo mode: any non-empty credentials succeed. If the email matches a
    // seeded user, that user becomes the "current user" for the session.
    const state = Store.load();
    const matched = state.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (matched) {
      state.currentUserId = matched.id;
      Store.save();
    }
    localStorage.setItem(SESSION_KEY, "1");
    return { ok: true };
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  fillDemoCredentials() {
    const emailInput = document.getElementById("login-email");
    const passInput = document.getElementById("login-password");
    if (emailInput && passInput) {
      emailInput.value = "mrunali@projecthub.io";
      passInput.value = "demo1234";
    }
  },
};
