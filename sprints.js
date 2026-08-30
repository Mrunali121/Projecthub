/**
 * sprints.js
 * Sprint planning: pick a sprint, see its committed points vs. team
 * capacity, move backlog items in/out, start/complete sprints.
 */

const TEAM_CAPACITY_POINTS = 28; // assumed fixed team capacity per sprint for the demo

const Sprints = {
  selectedSprintId: null,

  render(container) {
    const sprints = Store.get("sprints");
    if (!this.selectedSprintId) {
      const active = sprints.find((s) => s.status === "active");
      this.selectedSprintId = active ? active.id : sprints[0].id;
    }
    const sprint = sprints.find((s) => s.id === this.selectedSprintId);
    const sprintTasks = Store.tasksBySprint(sprint.id);
    const committed = sprintTasks.reduce((sum, t) => sum + (t.points || 0), 0);
    const done = sprintTasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.points || 0), 0);
    const backlogTasks = Store.get("tasks").filter((t) => !t.sprintId);

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2>Sprint Planning</h2>
          <p class="view-sub">${sprint.startDate} → ${sprint.endDate} · Goal: ${escapeHtml(sprint.goal)}</p>
        </div>
        <div class="sprint-tabs">
          ${sprints
            .map(
              (s) => `<button class="sprint-tab ${s.id === sprint.id ? "active" : ""}" data-sprint="${s.id}">
                ${s.name} <span class="sprint-status-dot status-${s.status}"></span>
              </button>`
            )
            .join("")}
        </div>
      </div>

      <div class="sprint-summary">
        <div class="capacity-bar-wrap">
          <div class="capacity-labels">
            <span>Committed: <strong>${committed} pts</strong></span>
            <span>Team capacity: <strong>${TEAM_CAPACITY_POINTS} pts</strong></span>
          </div>
          <div class="capacity-bar">
            <div class="capacity-fill ${committed > TEAM_CAPACITY_POINTS ? "over" : ""}" style="width:${Math.min(100, (committed / TEAM_CAPACITY_POINTS) * 100)}%"></div>
          </div>
          ${committed > TEAM_CAPACITY_POINTS ? `<p class="capacity-warning">⚠ Over capacity by ${committed - TEAM_CAPACITY_POINTS} pts</p>` : ""}
        </div>
        <div class="sprint-actions">
          <span class="badge status-${sprint.status}">${sprint.status.replace("_", " ")}</span>
          ${sprint.status === "planned" ? `<button class="btn-primary btn-sm" id="start-sprint">Start Sprint</button>` : ""}
          ${sprint.status === "active" ? `<button class="btn-primary btn-sm" id="complete-sprint">Complete Sprint</button>` : ""}
        </div>
      </div>

      <div class="sprint-columns">
        <div class="sprint-col">
          <h3>Backlog (unassigned to a sprint)</h3>
          <div class="sprint-task-list" id="backlog-list">
            ${backlogTasks.length ? backlogTasks.map((t) => this.renderRow(t, "add")).join("") : `<p class="empty-note">No unassigned backlog items.</p>`}
          </div>
        </div>
        <div class="sprint-col">
          <h3>${sprint.name} (${sprintTasks.length} items, ${done}/${committed} pts done)</h3>
          <div class="sprint-task-list" id="sprint-list">
            ${sprintTasks.length ? sprintTasks.map((t) => this.renderRow(t, "remove")).join("") : `<p class="empty-note">No items in this sprint yet.</p>`}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll(".sprint-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        this.selectedSprintId = tab.dataset.sprint;
        this.render(container);
      });
    });

    container.querySelectorAll("[data-action='add']").forEach((btn) => {
      btn.addEventListener("click", () => {
        Store.updateTask(btn.dataset.id, { sprintId: sprint.id });
        this.render(container);
      });
    });
    container.querySelectorAll("[data-action='remove']").forEach((btn) => {
      btn.addEventListener("click", () => {
        Store.updateTask(btn.dataset.id, { sprintId: null });
        this.render(container);
      });
    });

    const startBtn = document.getElementById("start-sprint");
    if (startBtn) startBtn.addEventListener("click", () => {
      Store.updateSprintStatus(sprint.id, "active");
      this.render(container);
    });
    const completeBtn = document.getElementById("complete-sprint");
    if (completeBtn) completeBtn.addEventListener("click", () => {
      Store.updateSprintStatus(sprint.id, "completed");
      this.render(container);
    });
  },

  renderRow(task, action) {
    const assignee = task.assigneeId ? Store.userById(task.assigneeId) : null;
    return `
      <div class="sprint-row">
        <span class="priority-dot priority-${task.priority}"></span>
        <span class="sprint-row-title">${escapeHtml(task.title)}</span>
        <span class="card-points">${task.points ?? 0} pts</span>
        ${assignee ? `<span class="avatar avatar-xs" style="background:${assignee.color}">${initials(assignee.name)}</span>` : `<span class="avatar avatar-xs avatar-empty">—</span>`}
        <button class="row-action-btn" data-action="${action}" data-id="${task.id}">
          ${action === "add" ? "Add →" : "← Remove"}
        </button>
      </div>
    `;
  },
};
