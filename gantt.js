/**
 * gantt.js
 * A simple CSS-grid-based Gantt chart: rows = epics, columns = weeks,
 * with a bar positioned by percentage across the visible date range.
 * No charting library — just date math and absolute positioning.
 */

const Gantt = {
  render(container) {
    const epics = Store.get("epics");
    const { rangeStart, rangeEnd, weeks } = this.computeRange(epics);
    const totalDays = (rangeEnd - rangeStart) / 86400000;
    const today = new Date("2026-08-15"); // fixed "today" so the demo is reproducible

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2>Gantt Timeline</h2>
          <p class="view-sub">Epic-level view, ${fmtDate(rangeStart)} – ${fmtDate(rangeEnd)}</p>
        </div>
      </div>
      <div class="gantt-wrap">
        <div class="gantt-header">
          <div class="gantt-label-col"></div>
          <div class="gantt-weeks">
            ${weeks.map((w) => `<div class="gantt-week-tick">${fmtDate(w)}</div>`).join("")}
          </div>
        </div>
        <div class="gantt-body">
          ${epics.map((epic) => this.renderRow(epic, rangeStart, totalDays)).join("")}
          ${this.renderTodayLine(rangeStart, totalDays, today)}
        </div>
      </div>
      <div class="gantt-legend">
        ${epics.map((e) => `<span class="legend-item"><span class="legend-dot" style="background:${e.color}"></span>${e.name}</span>`).join("")}
        <span class="legend-item"><span class="legend-today"></span>Today (demo-fixed: ${fmtDate(today)})</span>
      </div>
    `;
  },

  computeRange(epics) {
    const starts = epics.map((e) => new Date(e.startDate));
    const ends = epics.map((e) => new Date(e.endDate));
    const rangeStart = new Date(Math.min(...starts));
    const rangeEnd = new Date(Math.max(...ends));
    const weeks = [];
    let cursor = new Date(rangeStart);
    while (cursor <= rangeEnd) {
      weeks.push(new Date(cursor));
      cursor = new Date(cursor.getTime() + 7 * 86400000);
    }
    return { rangeStart, rangeEnd, weeks };
  },

  renderRow(epic, rangeStart, totalDays) {
    const start = new Date(epic.startDate);
    const end = new Date(epic.endDate);
    const offsetDays = (start - rangeStart) / 86400000;
    const durationDays = (end - start) / 86400000;
    const left = (offsetDays / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;
    return `
      <div class="gantt-row">
        <div class="gantt-label-col">
          <span class="gantt-epic-name">${escapeHtml(epic.name)}</span>
          <span class="gantt-epic-dates">${epic.startDate} → ${epic.endDate}</span>
        </div>
        <div class="gantt-track">
          <div class="gantt-bar" style="left:${left}%; width:${width}%; background:${epic.color}" title="${epic.name}"></div>
        </div>
      </div>
    `;
  },

  renderTodayLine(rangeStart, totalDays, today) {
    if (today < rangeStart) return "";
    const offsetDays = (today - rangeStart) / 86400000;
    const pct = offsetDays / totalDays;
    if (pct > 1) return "";
    // The today-line sits in .gantt-body, whose width = 200px label column +
    // the track. Epic bars are positioned as a % of the track alone, so the
    // line must use the same two-part calc — not a flat % of the full body
    // width — or it drifts right of where it should be as the container
    // gets wider.
    return `<div class="gantt-today-line" style="left:calc(200px + (100% - 200px) * ${pct.toFixed(4)})"></div>`;
  },
};

function fmtDate(d) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
