/**
 * app.js
 * App shell, hash-based router, and shared render helpers.
 *
 * Routes map 1:1 to a render(container) function exported by each feature
 * module (Kanban, Sprints, Gantt, Risks, Team, Dashboard, AITools).
 */

const ROUTES = {
  "": () => Dashboard.render(viewEl()),
  "dashboard": () => Dashboard.render(viewEl()),
  "board": () => Kanban.render(viewEl()),
  "sprints": () => Sprints.render(viewEl()),
  "timeline": () => Gantt.render(viewEl()),
  "risks": () => Risks.render(viewEl()),
  "team": () => Team.render(viewEl()),
  "ai-tools": () => AITools.render(viewEl()),
};

const NAV_ITEMS = [
  { route: "dashboard", label: "Dashboard", icon: "grid" },
  { route: "board", label: "Kanban Board", icon: "columns" },
  { route: "sprints", label: "Sprint Planning", icon: "flag" },
  { route: "timeline", label: "Gantt Timeline", icon: "calendar" },
  { route: "risks", label: "Risks & Issues", icon: "alert" },
  { route: "team", label: "Team & Roles", icon: "users" },
  { route: "ai-tools", label: "AI Tools", icon: "spark" },
];

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  columns: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="4" height="13" rx="1"/>',
  flag: '<path d="M5 3v18"/><path d="M5 4h11l-3 4 3 4H5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9.5" r="2.5"/><path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3"/>',
  spark: '<path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.9 4.9l2.8 2.8"/><path d="M16.3 16.3l2.8 2.8"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.9 19.1l2.8-2.8"/><path d="M16.3 7.7l2.8-2.8"/>',
};

function svgIcon(name, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

function viewEl() {
  return document.getElementById("view-container");
}

function currentRoute() {
  return (location.hash || "#dashboard").replace(/^#\/?/, "");
}

function renderShell() {
  const user = Store.currentUser();
  const ws = Store.currentWorkspace();
  const shell = document.getElementById("app-shell");
  shell.innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">PH</span>
        <span class="brand-name">ProjectHub</span>
      </div>
      <button class="workspace-switch" id="workspace-switch">
        <span class="ws-label">${ws.name}</span>
        <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="ws-menu" id="ws-menu" hidden></div>
      <nav class="nav">
        ${NAV_ITEMS.map(
          (item) => `
          <a href="#${item.route}" class="nav-item" data-route="${item.route}">
            ${svgIcon(item.icon)}<span>${item.label}</span>
          </a>`
        ).join("")}
      </nav>
      <div class="sidebar-footer">
        <button class="reset-demo" id="reset-demo-btn">Reset demo data</button>
      </div>
    </aside>
    <div class="main-col">
      <header class="topbar">
        <div class="topbar-title" id="topbar-title">Dashboard</div>
        <div class="topbar-user">
          <span class="avatar" style="background:${user.color}">${initials(user.name)}</span>
          <div class="topbar-user-info">
            <span class="topbar-user-name">${user.name}</span>
            <span class="topbar-user-role">${user.role}</span>
          </div>
          <button class="logout-btn" id="logout-btn" title="Log out">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
          </button>
        </div>
      </header>
      <main class="view" id="view-container"></main>
    </div>
  `;

  document.getElementById("logout-btn").addEventListener("click", () => {
    Auth.logout();
    boot();
  });

  document.getElementById("reset-demo-btn").addEventListener("click", () => {
    if (confirm("Reset all demo data back to the seeded starting state?")) {
      Store.reset();
      route();
    }
  });

  const wsSwitch = document.getElementById("workspace-switch");
  const wsMenu = document.getElementById("ws-menu");
  wsMenu.innerHTML = Store.get("workspaces")
    .map((w) => `<button class="ws-menu-item" data-ws="${w.id}">${w.name}</button>`)
    .join("");
  wsSwitch.addEventListener("click", () => (wsMenu.hidden = !wsMenu.hidden));
  wsMenu.querySelectorAll(".ws-menu-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const state = Store.load();
      state.currentWorkspaceId = btn.dataset.ws;
      Store.save();
      wsMenu.hidden = true;
      renderShell();
      route();
    });
  });
}

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function route() {
  const r = currentRoute();
  const handler = ROUTES[r] || ROUTES[""];
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.route === r || (r === "" && el.dataset.route === "dashboard"));
  });
  const navItem = NAV_ITEMS.find((n) => n.route === r) || NAV_ITEMS[0];
  const title = document.getElementById("topbar-title");
  if (title) title.textContent = navItem.label;
  handler();
}

function boot() {
  const loginScreen = document.getElementById("login-screen");
  const appShell = document.getElementById("app-shell");

  if (!Auth.isLoggedIn()) {
    loginScreen.hidden = false;
    appShell.hidden = true;
    wireLoginForm();
    return;
  }

  loginScreen.hidden = true;
  appShell.hidden = false;
  renderShell();
  route();
}

function wireLoginForm() {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");
  const demoBtn = document.getElementById("demo-login-btn");

  form.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const result = Auth.login(email, password);
    if (!result.ok) {
      errorEl.textContent = result.error;
      errorEl.hidden = false;
      return;
    }
    boot();
  };

  demoBtn.onclick = () => {
    Auth.fillDemoCredentials();
    form.requestSubmit();
  };
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", boot);
