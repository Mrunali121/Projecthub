/**
 * data.js
 * Seed data + a tiny localStorage-backed store for ProjectHub.
 *
 * This is a client-only demo: there is no backend. All state lives in the
 * browser's localStorage under the key below, seeded on first load. This
 * keeps the demo fully self-contained and deployable as a static site
 * (GitHub Pages) with no server, while still behaving like a real stateful
 * app across page reloads.
 */

const STORAGE_KEY = "projecthub_state_v1";

const SEED_STATE = {
  currentUserId: "u1",
  currentWorkspaceId: "w1",

  workspaces: [
    { id: "w1", name: "Nimbus Product Team" },
    { id: "w2", name: "Atlas Mobile Team" },
  ],

  users: [
    { id: "u1", name: "Mrunali Rajgor", email: "mrunali@projecthub.io", role: "Admin", color: "#0E8F7E" },
    { id: "u2", name: "Jonas Weber", email: "jonas@projecthub.io", role: "Product Manager", color: "#E2963A" },
    { id: "u3", name: "Priya Nair", email: "priya@projecthub.io", role: "Frontend Developer", color: "#5B6472" },
    { id: "u4", name: "Tom Fischer", email: "tom@projecthub.io", role: "Backend Developer", color: "#14213D" },
    { id: "u5", name: "Lena Schmidt", email: "lena@projecthub.io", role: "Designer", color: "#B5711F" },
    { id: "u6", name: "Omar Haddad", email: "omar@projecthub.io", role: "QA Engineer", color: "#0B7A6C" },
  ],

  epics: [
    { id: "e1", name: "Onboarding Redesign", startDate: "2026-08-03", endDate: "2026-08-21", color: "#0E8F7E" },
    { id: "e2", name: "Checkout Simplification", startDate: "2026-08-10", endDate: "2026-09-04", color: "#E2963A" },
    { id: "e3", name: "Reporting Dashboard", startDate: "2026-08-24", endDate: "2026-09-18", color: "#5B6472" },
    { id: "e4", name: "Mobile Push Notifications", startDate: "2026-09-07", endDate: "2026-09-25", color: "#14213D" },
  ],

  sprints: [
    { id: "s11", name: "Sprint 11", startDate: "2026-07-20", endDate: "2026-08-02", status: "completed", goal: "Ship onboarding tutorial redesign", velocity: 24 },
    { id: "s12", name: "Sprint 12", startDate: "2026-08-03", endDate: "2026-08-16", status: "active", goal: "Simplify checkout to reduce drop-off", velocity: null },
    { id: "s13", name: "Sprint 13", startDate: "2026-08-17", endDate: "2026-08-30", status: "planned", goal: "Reporting dashboard v1", velocity: null },
  ],

  tasks: [
    { id: "t1", title: "Design onboarding tutorial screens", status: "done", assigneeId: "u5", priority: "high", points: 5, sprintId: "s11", epicId: "e1", tags: ["design"] },
    { id: "t2", title: "Implement onboarding carousel", status: "done", assigneeId: "u3", priority: "high", points: 8, sprintId: "s11", epicId: "e1", tags: ["frontend"] },
    { id: "t3", title: "Add skip/resume onboarding state", status: "done", assigneeId: "u4", priority: "medium", points: 3, sprintId: "s11", epicId: "e1", tags: ["backend"] },
    { id: "t4", title: "One-page checkout: address + payment merge", status: "in_progress", assigneeId: "u3", priority: "high", points: 8, sprintId: "s12", epicId: "e2", tags: ["frontend", "checkout"] },
    { id: "t5", title: "Default saved payment method on checkout", status: "in_progress", assigneeId: "u4", priority: "high", points: 5, sprintId: "s12", epicId: "e2", tags: ["backend", "checkout"] },
    { id: "t6", title: "Guest checkout flow", status: "qa", assigneeId: "u6", priority: "medium", points: 5, sprintId: "s12", epicId: "e2", tags: ["checkout"] },
    { id: "t7", title: "Checkout fee transparency banner", status: "backlog", assigneeId: "u5", priority: "medium", points: 2, sprintId: "s12", epicId: "e2", tags: ["design", "checkout"] },
    { id: "t8", title: "Cart edit within checkout flow", status: "backlog", assigneeId: null, priority: "medium", points: 5, sprintId: null, epicId: "e2", tags: ["checkout"] },
    { id: "t9", title: "Reporting dashboard: KPI cards", status: "backlog", assigneeId: "u3", priority: "high", points: 5, sprintId: "s13", epicId: "e3", tags: ["frontend"] },
    { id: "t10", title: "Reporting API: aggregate endpoints", status: "backlog", assigneeId: "u4", priority: "high", points: 8, sprintId: "s13", epicId: "e3", tags: ["backend"] },
    { id: "t11", title: "Export report as CSV/PDF", status: "backlog", assigneeId: null, priority: "low", points: 3, sprintId: null, epicId: "e3", tags: ["backend"] },
    { id: "t12", title: "Push notification opt-in flow", status: "backlog", assigneeId: null, priority: "medium", points: 3, sprintId: null, epicId: "e4", tags: ["mobile"] },
    { id: "t13", title: "Fix: checkout total flickers on load", status: "in_progress", assigneeId: "u3", priority: "high", points: 2, sprintId: "s12", epicId: "e2", tags: ["bug", "frontend"] },
    { id: "t14", title: "QA regression pass: checkout flow", status: "qa", assigneeId: "u6", priority: "high", points: 3, sprintId: "s12", epicId: "e2", tags: ["qa"] },
  ],

  risks: [
    { id: "r1", type: "risk", title: "Third-party payment SDK version bump may break saved-card flow", category: "Technical", likelihood: 3, impact: 4, status: "open", owner: "u4" },
    { id: "r2", type: "risk", title: "GDPR review of new address-autofill data flow not yet booked", category: "Compliance", likelihood: 2, impact: 4, status: "open", owner: "u2" },
    { id: "r3", type: "issue", title: "Guest checkout sessions not clearing cart on logout", category: "Technical", likelihood: 4, impact: 3, status: "open", owner: "u3" },
    { id: "r4", type: "risk", title: "QA capacity tight in Sprint 13 due to overlapping releases", category: "Resourcing", likelihood: 3, impact: 3, status: "mitigated", owner: "u6" },
    { id: "r5", type: "issue", title: "Reporting API spike revealed slow query on large workspaces", category: "Performance", likelihood: 3, impact: 3, status: "open", owner: "u4" },
    { id: "r6", type: "risk", title: "Design system tokens diverging between web and mobile", category: "Design", likelihood: 2, impact: 2, status: "closed", owner: "u5" },
  ],

  velocityHistory: [
    { sprint: "Sprint 8", points: 19 },
    { sprint: "Sprint 9", points: 22 },
    { sprint: "Sprint 10", points: 21 },
    { sprint: "Sprint 11", points: 24 },
  ],
};

const Store = {
  _state: null,

  load() {
    if (this._state) return this._state;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this._state = raw ? JSON.parse(raw) : structuredClone(SEED_STATE);
    } catch (e) {
      this._state = structuredClone(SEED_STATE);
    }
    return this._state;
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
  },

  reset() {
    this._state = structuredClone(SEED_STATE);
    this.save();
    return this._state;
  },

  get(path) {
    const s = this.load();
    return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), s);
  },

  currentUser() {
    const s = this.load();
    return s.users.find((u) => u.id === s.currentUserId);
  },

  currentWorkspace() {
    const s = this.load();
    return s.workspaces.find((w) => w.id === s.currentWorkspaceId);
  },

  userById(id) {
    return this.load().users.find((u) => u.id === id) || null;
  },

  tasksBySprint(sprintId) {
    return this.load().tasks.filter((t) => t.sprintId === sprintId);
  },

  addTask(task) {
    const s = this.load();
    const id = "t" + (Math.max(0, ...s.tasks.map((t) => parseInt(t.id.slice(1), 10) || 0)) + 1);
    s.tasks.push({ id, tags: [], ...task });
    this.save();
    return id;
  },

  updateTask(id, patch) {
    const s = this.load();
    const t = s.tasks.find((x) => x.id === id);
    if (t) Object.assign(t, patch);
    this.save();
  },

  deleteTask(id) {
    const s = this.load();
    s.tasks = s.tasks.filter((t) => t.id !== id);
    this.save();
  },

  addRisk(risk) {
    const s = this.load();
    const id = "r" + (Math.max(0, ...s.risks.map((r) => parseInt(r.id.slice(1), 10) || 0)) + 1);
    s.risks.push({ id, ...risk });
    this.save();
    return id;
  },

  updateRisk(id, patch) {
    const s = this.load();
    const r = s.risks.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
    this.save();
  },

  addUser(user) {
    const s = this.load();
    const id = "u" + (Math.max(0, ...s.users.map((u) => parseInt(u.id.slice(1), 10) || 0)) + 1);
    const palette = ["#0E8F7E", "#E2963A", "#5B6472", "#14213D", "#B5711F", "#0B7A6C"];
    const color = palette[s.users.length % palette.length];
    s.users.push({ id, color, ...user });
    this.save();
    return id;
  },

  updateUserRole(id, role) {
    const s = this.load();
    const u = s.users.find((x) => x.id === id);
    if (u) u.role = role;
    this.save();
  },

  updateSprintStatus(id, status) {
    const s = this.load();
    const sp = s.sprints.find((x) => x.id === id);
    if (sp) sp.status = status;
    this.save();
  },
};
