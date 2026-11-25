/**
 * kanban.js
 * Kanban board: Backlog -> In Progress -> QA -> Done, with HTML5
 * drag-and-drop between columns and a modal for adding/editing tasks.
 */

const KANBAN_COLUMNS = [
  { id: "backlog", label: "Backlog" },
  { id: "in_progress", label: "In Progress" },
  { id: "qa", label: "QA" },
  { id: "done", label: "Done" },
];

const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High" };

const Kanban = {
  render(container) {
    const tasks = Store.get("tasks");
    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2>Kanban Board</h2>
          <p class="view-sub">Drag cards between columns, or use the + button to add work.</p>
        </div>
      </div>
      <div class="kanban-board">
        ${KANBAN_COLUMNS.map((col) => this.renderColumn(col, tasks)).join("")}
      </div>
      <div id="task-modal-root"></div>
    `;

    this.wireDragAndDrop(container);
    container.querySelectorAll(".add-task-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.openTaskModal(container, { status: btn.dataset.status }));
    });
    container.querySelectorAll(".kanban-card").forEach((card) => {
      card.addEventListener("click", () => {
        const task = Store.get("tasks").find((t) => t.id === card.dataset.id);
        this.openTaskModal(container, task);
      });
    });
  },

  renderColumn(col, tasks) {
    const colTasks = tasks.filter((t) => t.status === col.id);
    const points = colTasks.reduce((sum, t) => sum + (t.points || 0), 0);
    return `
      <div class="kanban-col" data-col="${col.id}">
        <div class="kanban-col-head">
          <span class="kanban-col-title">${col.label}</span>
          <span class="kanban-col-count">${colTasks.length} · ${points} pts</span>
          <button class="add-task-btn" data-status="${col.id}" title="Add task">+</button>
        </div>
        <div class="kanban-col-body" data-dropzone="${col.id}">
          ${colTasks.map((t) => this.renderCard(t)).join("")}
        </div>
      </div>
    `;
  },

  renderCard(task) {
    const assignee = task.assigneeId ? Store.userById(task.assigneeId) : null;
    return `
      <div class="kanban-card" draggable="true" data-id="${task.id}">
        <div class="card-tags">
          ${(task.tags || []).map((tag) => `<span class="card-tag">${tag}</span>`).join("")}
        </div>
        <div class="card-title">${escapeHtml(task.title)}</div>
        <div class="card-footer">
          <span class="priority-dot priority-${task.priority}" title="${PRIORITY_LABEL[task.priority]} priority"></span>
          <span class="card-points">${task.points ?? 0} pts</span>
          ${
            assignee
              ? `<span class="avatar avatar-xs" style="background:${assignee.color}" title="${assignee.name}">${initials(assignee.name)}</span>`
              : `<span class="avatar avatar-xs avatar-empty" title="Unassigned">—</span>`
          }
        </div>
      </div>
    `;
  },

  wireDragAndDrop(container) {
    let draggedId = null;

    container.querySelectorAll(".kanban-card").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        draggedId = card.dataset.id;
        e.dataTransfer.effectAllowed = "move";
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
    });

    container.querySelectorAll("[data-dropzone]").forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("drop-hover");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("drop-hover"));
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("drop-hover");
        if (!draggedId) return;
        Store.updateTask(draggedId, { status: zone.dataset.dropzone });
        this.render(container);
      });
    });
  },

  openTaskModal(container, task) {
    const isNew = !task.id;
    const users = Store.get("users");
    const root = container.querySelector("#task-modal-root") || document.getElementById("task-modal-root");

    root.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <div class="modal-head">
            <h3>${isNew ? "Add Task" : "Edit Task"}</h3>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <form id="task-form" class="modal-body">
            <label>Title
              <input type="text" id="f-title" required value="${task.title ? escapeAttr(task.title) : ""}">
            </label>
            <div class="form-row">
              <label>Status
                <select id="f-status">
                  ${KANBAN_COLUMNS.map((c) => `<option value="${c.id}" ${task.status === c.id ? "selected" : ""}>${c.label}</option>`).join("")}
                </select>
              </label>
              <label>Priority
                <select id="f-priority">
                  ${["low", "medium", "high"].map((p) => `<option value="${p}" ${task.priority === p ? "selected" : ""}>${PRIORITY_LABEL[p]}</option>`).join("")}
                </select>
              </label>
            </div>
            <div class="form-row">
              <label>Assignee
                <select id="f-assignee">
                  <option value="">Unassigned</option>
                  ${users.map((u) => `<option value="${u.id}" ${task.assigneeId === u.id ? "selected" : ""}>${u.name}</option>`).join("")}
                </select>
              </label>
              <label>Story Points
                <input type="number" id="f-points" min="0" max="21" value="${task.points ?? 3}">
              </label>
            </div>
            <label>Tags (comma-separated)
              <input type="text" id="f-tags" value="${(task.tags || []).join(", ")}">
            </label>
            <div class="modal-actions">
              ${!isNew ? `<button type="button" class="btn-danger" id="f-delete">Delete</button>` : "<span></span>"}
              <button type="submit" class="btn-primary">${isNew ? "Add Task" : "Save Changes"}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById("modal-close").onclick = () => (root.innerHTML = "");
    root.querySelector(".modal-backdrop").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) root.innerHTML = "";
    });

    if (!isNew) {
      document.getElementById("f-delete").onclick = () => {
        if (confirm("Delete this task?")) {
          Store.deleteTask(task.id);
          root.innerHTML = "";
          Kanban.render(container);
        }
      };
    }

    document.getElementById("task-form").onsubmit = (e) => {
      e.preventDefault();
      const patch = {
        title: document.getElementById("f-title").value.trim(),
        status: document.getElementById("f-status").value,
        priority: document.getElementById("f-priority").value,
        assigneeId: document.getElementById("f-assignee").value || null,
        points: parseInt(document.getElementById("f-points").value, 10) || 0,
        tags: document
          .getElementById("f-tags")
          .value.split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (isNew) {
        Store.addTask(patch);
      } else {
        Store.updateTask(task.id, patch);
      }
      root.innerHTML = "";
      Kanban.render(container);
    };
  },
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}
