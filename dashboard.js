/**
 * dashboard.js
 * KPI cards + two small SVG charts (tasks by status, velocity trend).
 * Charts are hand-built SVG rather than a charting library, so the
 * whole app has zero runtime dependencies and works fully offline.
 */

const Dashboard = {
  render(container) {
    const tasks = Store.get("tasks");
    const risks = Store.get("risks");
    const sprints = Store.get("sprints");
    const velocityHistory = Store.get("velocityHistory");
    const activeSprint = sprints.find((s) => s.status === "active");

    const openTasks = tasks.filter((t) => t.status !== "done").length;
    const openRisks = risks.filter((r) => r.status === "open").length;

    let sprintProgressPct = 0;
    if (activeSprint) {
      const sTasks = Store.tasksBySprint(activeSprint.id);
      const committed = sTasks.reduce((s, t) => s + (t.points || 0), 0);
      const done = sTasks.filter((t) => t.status === "done").reduce((s, t) => s + (t.points || 0), 0);
      sprintProgressPct = committed ? Math.round((done / committed) * 100) : 0;
    }

    const avgVelocity = Math.round(
      velocityHistory.reduce((s, v) => s + v.points, 0) / velocityHistory.length
    );

    const statusCounts = KANBAN_COLUMNS.map((c) => ({
      label: c.label,
      count: tasks.filter((t) => t.status === c.id).length,
    }));

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2>Dashboard</h2>
          <p class="view-sub">${Store.currentWorkspace().name} · ${activeSprint ? activeSprint.name + " in progress" : "No active sprint"}</p>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Open Tasks</span>
          <span class="kpi-value">${openTasks}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Active Sprint Progress</span>
          <span class="kpi-value">${sprintProgressPct}%</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Avg. Velocity (last 4 sprints)</span>
          <span class="kpi-value">${avgVelocity} pts</span>
        </div>
        <div class="kpi-card ${openRisks > 3 ? "kpi-warning" : ""}">
          <span class="kpi-label">Open Risks &amp; Issues</span>
          <span class="kpi-value">${openRisks}</span>
        </div>
      </div>

      <div class="chart-grid">
        <div class="chart-card">
          <h3>Tasks by Status</h3>
          ${this.barChart(statusCounts)}
        </div>
        <div class="chart-card">
          <h3>Velocity Trend</h3>
          ${this.lineChart(velocityHistory)}
        </div>
      </div>
    `;
  },

  barChart(data) {
    const w = 460, h = 220, padL = 36, padB = 30, padT = 10;
    const chartW = w - padL - 16;
    const chartH = h - padB - padT;
    const max = Math.max(...data.map((d) => d.count), 1);
    const barW = chartW / data.length - 20;
    const colors = ["#5B6472", "#E2963A", "#14213D", "#0E8F7E"];

    const bars = data
      .map((d, i) => {
        const barH = (d.count / max) * chartH;
        const x = padL + i * (chartW / data.length) + 10;
        const y = padT + (chartH - barH);
        return `
          <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="${colors[i % colors.length]}"/>
          <text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" class="chart-val">${d.count}</text>
          <text x="${x + barW / 2}" y="${h - 10}" text-anchor="middle" class="chart-axis-label">${d.label}</text>
        `;
      })
      .join("");

    return `<svg viewBox="0 0 ${w} ${h}" class="mini-chart">
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h - padB}" stroke="#D4D9D6"/>
      <line x1="${padL}" y1="${h - padB}" x2="${w - 16}" y2="${h - padB}" stroke="#D4D9D6"/>
      ${bars}
    </svg>`;
  },

  lineChart(data) {
    const w = 460, h = 220, padL = 36, padB = 30, padT = 20;
    const chartW = w - padL - 16;
    const chartH = h - padB - padT;
    const max = Math.max(...data.map((d) => d.points)) * 1.15;
    const stepX = chartW / (data.length - 1);

    const points = data.map((d, i) => {
      const x = padL + i * stepX;
      const y = padT + chartH - (d.points / max) * chartH;
      return { x, y, ...d };
    });

    const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const dots = points
      .map(
        (p) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#0E8F7E"/>
        <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" class="chart-val">${p.points}</text>
        <text x="${p.x}" y="${h - 10}" text-anchor="middle" class="chart-axis-label">${p.sprint.replace("Sprint ", "S")}</text>`
      )
      .join("");

    return `<svg viewBox="0 0 ${w} ${h}" class="mini-chart">
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h - padB}" stroke="#D4D9D6"/>
      <line x1="${padL}" y1="${h - padB}" x2="${w - 16}" y2="${h - padB}" stroke="#D4D9D6"/>
      <path d="${path}" fill="none" stroke="#0E8F7E" stroke-width="2.5"/>
      ${dots}
    </svg>`;
  },
};
