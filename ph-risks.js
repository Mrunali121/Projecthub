/**
 * risks.js
 * Risk & Issue tracker: a scored table (Likelihood x Impact) with an
 * add/edit modal, following the same L/I scoring pattern used across
 * the rest of this portfolio's PM case studies.
 */

const Risks = {
  render(container) {
    const risks = Store.get("risks").slice().sort((a, b) => (b.likelihood * b.impact) - (a.likelihood * a.impact));

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2>Risks &amp; Issues</h2>
          <p class="view-sub">Scored by Likelihood × Impact (1–4 scale each, max 16).</p>
        </div>
        <button class="btn-primary" id="add-risk-btn">+ Add Risk / Issue</button>
      </div>
      <table class="risk-table">
        <thead>
          <tr>
            <th>Type</th><th>Title</th><th>Category</th><th>Score</th><th>Status</th><th>Owner</th>
          </tr>
        </thead>
        <tbody>
          ${risks.map((r) => this.renderRow(r)).join("")}
        </tbody>
      </table>
      <div id="risk-modal-root"></div>
    `;

    document.getElementById("add-risk-btn").addEventListener("click", () => this.openModal(container, {}));
    container.querySelectorAll(".risk-row").forEach((row) => {
      row.addEventListener("click", () => {
        const risk = Store.get("risks").find((r) => r.id === row.dataset.id);
        this.openModal(container, risk);
      });
    });
  },

  renderRow(risk) {
    const score = risk.likelihood * risk.impact;
    const owner = Store.userById(risk.owner);
    const scoreClass = score >= 9 ? "score-high" : score >= 4 ? "score-med" : "score-low";
    return `
      <tr class="risk-row" data-id="${risk.id}">
        <td><span class="type-badge type-${risk.type}">${risk.type}</span></td>
        <td class="risk-title-cell">${escapeHtml(risk.title)}</td>
        <td>${risk.category}</td>
        <td><span class="score-pill ${scoreClass}">${score}</span></td>
        <td><span class="badge status-${risk.status}">${risk.status}</span></td>
        <td>${owner ? `<span class="avatar avatar-xs" style="background:${owner.color}">${initials(owner.name)}</span>` : "—"}</td>
      </tr>
    `;
  },

  openModal(container, risk) {
    const isNew = !risk.id;
    const users = Store.get("users");
    const root = document.getElementById("risk-modal-root");
    root.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <div class="modal-head">
            <h3>${isNew ? "Add Risk / Issue" : "Edit Entry"}</h3>
            <button class="modal-close" id="risk-modal-close">&times;</button>
          </div>
          <form id="risk-form" class="modal-body">
            <label>Title
              <input type="text" id="r-title" required value="${risk.title ? escapeAttr(risk.title) : ""}">
            </label>
            <div class="form-row">
              <label>Type
                <select id="r-type">
                  <option value="risk" ${risk.type === "risk" ? "selected" : ""}>Risk (potential)</option>
                  <option value="issue" ${risk.type === "issue" ? "selected" : ""}>Issue (materialized)</option>
                </select>
              </label>
              <label>Category
                <input type="text" id="r-category" value="${risk.category ? escapeAttr(risk.category) : "Technical"}">
              </label>
            </div>
            <div class="form-row">
              <label>Likelihood (1–4)
                <input type="number" id="r-likelihood" min="1" max="4" value="${risk.likelihood ?? 2}">
              </label>
              <label>Impact (1–4)
                <input type="number" id="r-impact" min="1" max="4" value="${risk.impact ?? 2}">
              </label>
            </div>
            <div class="form-row">
              <label>Status
                <select id="r-status">
                  ${["open", "mitigated", "closed"].map((s) => `<option value="${s}" ${risk.status === s ? "selected" : ""}>${s}</option>`).join("")}
                </select>
              </label>
              <label>Owner
                <select id="r-owner">
                  <option value="">Unassigned</option>
                  ${users.map((u) => `<option value="${u.id}" ${risk.owner === u.id ? "selected" : ""}>${u.name}</option>`).join("")}
                </select>
              </label>
            </div>
            <div class="modal-actions">
              <span></span>
              <button type="submit" class="btn-primary">${isNew ? "Add" : "Save Changes"}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById("risk-modal-close").onclick = () => (root.innerHTML = "");
    root.querySelector(".modal-backdrop").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) root.innerHTML = "";
    });

    document.getElementById("risk-form").onsubmit = (e) => {
      e.preventDefault();
      const patch = {
        title: document.getElementById("r-title").value.trim(),
        type: document.getElementById("r-type").value,
        category: document.getElementById("r-category").value.trim(),
        likelihood: parseInt(document.getElementById("r-likelihood").value, 10),
        impact: parseInt(document.getElementById("r-impact").value, 10),
        status: document.getElementById("r-status").value,
        owner: document.getElementById("r-owner").value || null,
      };
      if (isNew) {
        Store.addRisk(patch);
      } else {
        Store.updateRisk(risk.id, patch);
      }
      root.innerHTML = "";
      Risks.render(container);
    };
  },
};
