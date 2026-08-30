/**
 * team.js
 * Team members & roles: card grid with inline role editing and a
 * mock "invite" flow that just appends to the local users list.
 */

const ROLE_OPTIONS = ["Admin", "Product Manager", "Frontend Developer", "Backend Developer", "Designer", "QA Engineer"];

const Team = {
  render(container) {
    const users = Store.get("users");
    const currentUser = Store.currentUser();
    const canManage = currentUser.role === "Admin" || currentUser.role === "Product Manager";

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2>Team &amp; Roles</h2>
          <p class="view-sub">${users.length} members in ${Store.currentWorkspace().name}</p>
        </div>
        <button class="btn-primary" id="invite-btn">+ Invite Member</button>
      </div>
      <div class="team-grid">
        ${users.map((u) => this.renderCard(u, canManage)).join("")}
      </div>
      <div id="invite-modal-root"></div>
    `;

    document.getElementById("invite-btn").addEventListener("click", () => this.openInviteModal(container));

    if (canManage) {
      container.querySelectorAll(".role-select").forEach((sel) => {
        sel.addEventListener("change", () => {
          Store.updateUserRole(sel.dataset.id, sel.value);
          this.render(container);
        });
      });
    }
  },

  renderCard(user, canManage) {
    const taskCount = Store.get("tasks").filter((t) => t.assigneeId === user.id && t.status !== "done").length;
    return `
      <div class="team-card">
        <span class="avatar avatar-lg" style="background:${user.color}">${initials(user.name)}</span>
        <div class="team-card-name">${escapeHtml(user.name)}</div>
        <div class="team-card-email">${escapeHtml(user.email)}</div>
        ${
          canManage
            ? `<select class="role-select" data-id="${user.id}">
                ${ROLE_OPTIONS.map((r) => `<option value="${r}" ${user.role === r ? "selected" : ""}>${r}</option>`).join("")}
              </select>`
            : `<span class="badge role-badge">${user.role}</span>`
        }
        <div class="team-card-stat">${taskCount} open task${taskCount === 1 ? "" : "s"}</div>
      </div>
    `;
  },

  openInviteModal(container) {
    const root = document.getElementById("invite-modal-root");
    root.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <div class="modal-head">
            <h3>Invite Team Member</h3>
            <button class="modal-close" id="invite-modal-close">&times;</button>
          </div>
          <form id="invite-form" class="modal-body">
            <p class="modal-note">Demo mode: this adds a local member immediately, with no email actually sent.</p>
            <label>Name
              <input type="text" id="inv-name" required>
            </label>
            <label>Email
              <input type="email" id="inv-email" required>
            </label>
            <label>Role
              <select id="inv-role">
                ${ROLE_OPTIONS.map((r) => `<option value="${r}">${r}</option>`).join("")}
              </select>
            </label>
            <div class="modal-actions">
              <span></span>
              <button type="submit" class="btn-primary">Add Member</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById("invite-modal-close").onclick = () => (root.innerHTML = "");
    root.querySelector(".modal-backdrop").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) root.innerHTML = "";
    });

    document.getElementById("invite-form").onsubmit = (e) => {
      e.preventDefault();
      Store.addUser({
        name: document.getElementById("inv-name").value.trim(),
        email: document.getElementById("inv-email").value.trim(),
        role: document.getElementById("inv-role").value,
      });
      root.innerHTML = "";
      Team.render(container);
    };
  },
};
