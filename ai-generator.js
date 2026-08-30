/**
 * ai-generator.js
 * "AI" meeting summary + user story generator.
 *
 * IMPORTANT — how this actually works in the demo:
 * This runs a lightweight, rule-based text heuristic entirely in the
 * browser. It does NOT call any external AI service — there's no backend
 * in this static-site demo to hold an API key securely, and shipping a
 * secret key in client-side JS would expose it to anyone who opens dev
 * tools. The output is intentionally simple and imperfect, and the UI
 * says so plainly rather than pretending otherwise.
 *
 * SWAPPING IN A REAL LLM (production path):
 * Replace the body of generateSummary()/generateUserStories() with a
 * fetch() call to your own backend endpoint, which in turn calls an LLM
 * API server-side (this keeps the API key off the client). Sketch:
 *
 *   async function generateSummary(notes) {
 *     const res = await fetch("/api/ai/summarize", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ notes }),
 *     });
 *     return (await res.json()).summary;
 *   }
 *
 * ...where /api/ai/summarize is a small server route that calls the
 * Anthropic Messages API with a prompt built from `notes`, and returns
 * just the model's text back to the client.
 */

const AITools = {
  render(container) {
    container.innerHTML = `
      <div class="view-header">
        <div>
          <h2>AI Tools</h2>
          <p class="view-sub">Paste meeting notes to generate a summary and draft user stories.</p>
        </div>
      </div>

      <div class="demo-banner">
        <strong>Demo mode.</strong> This runs a rule-based heuristic in your browser —
        no external AI API is called. See the comment at the top of
        <code>js/ai-generator.js</code> for how to wire in a real LLM call via a
        backend endpoint.
      </div>

      <div class="ai-layout">
        <div class="ai-input-col">
          <label for="meeting-notes">Meeting notes / transcript</label>
          <textarea id="meeting-notes" rows="14" placeholder="Paste raw meeting notes here...">${SAMPLE_NOTES}</textarea>
          <button class="btn-primary" id="generate-btn">Generate Summary &amp; User Stories</button>
        </div>
        <div class="ai-output-col" id="ai-output">
          <p class="empty-note">Output will appear here.</p>
        </div>
      </div>
    `;

    document.getElementById("generate-btn").addEventListener("click", () => this.generate());
  },

  generate() {
    const notes = document.getElementById("meeting-notes").value.trim();
    const output = document.getElementById("ai-output");
    if (!notes) {
      output.innerHTML = `<p class="empty-note">Paste some meeting notes first.</p>`;
      return;
    }

    const summary = generateSummary(notes);
    const actionItems = extractActionItems(notes);
    const stories = generateUserStories(actionItems);

    output.innerHTML = `
      <div class="ai-section">
        <h3>Meeting Summary</h3>
        <ul>${summary.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      </div>
      <div class="ai-section">
        <h3>Action Items</h3>
        ${actionItems.length ? `<ul>${actionItems.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>` : `<p class="empty-note">No clear action items detected.</p>`}
      </div>
      <div class="ai-section">
        <h3>Draft User Stories</h3>
        ${
          stories.length
            ? stories
                .map(
                  (s) => `<div class="story-card">
                    <p><strong>As a</strong> ${escapeHtml(s.role)}, <strong>I want</strong> ${escapeHtml(s.want)} <strong>so that</strong> ${escapeHtml(s.benefit)}.</p>
                    <button class="btn-secondary btn-sm add-to-backlog" data-title="${escapeAttr(s.want)}">+ Add to Backlog</button>
                  </div>`
                )
                .join("")
            : `<p class="empty-note">No user stories generated from this text.</p>`
        }
      </div>
    `;

    output.querySelectorAll(".add-to-backlog").forEach((btn) => {
      btn.addEventListener("click", () => {
        Store.addTask({
          title: btn.dataset.title.charAt(0).toUpperCase() + btn.dataset.title.slice(1),
          status: "backlog",
          priority: "medium",
          points: 3,
          assigneeId: null,
          sprintId: null,
          epicId: null,
          tags: ["from-ai-tools"],
        });
        btn.textContent = "Added ✓";
        btn.disabled = true;
      });
    });
  },
};

const SAMPLE_NOTES = `Sprint 12 mid-sprint sync. Checkout drop-off is still the top priority.
We need to finish the one-page checkout merge before Friday. Priya will
own the frontend piece. Tom should look into why the saved payment method
isn't defaulting correctly for returning users. We also need to add a fee
transparency banner so users see the total earlier in the flow. QA found
that the checkout total flickers on page load, we must fix that before
QA can sign off. Let's also revisit the guest checkout flow next sprint
since it's currently blocked on the SDK version question. Lena will
prepare updated mockups for the fee banner by Wednesday.`;

function generateSummary(text) {
  const sentences = splitSentences(text);
  // Extractive "summary": keep the longer, more substantive sentences,
  // capped at 5 — a real LLM call would produce an actual abstractive
  // summary instead of this selection heuristic.
  return sentences
    .filter((s) => s.split(" ").length >= 6)
    .slice(0, 5)
    .map((s) => s.trim());
}

const ACTION_KEYWORDS = [
  "need to", "needs to", "should", "must", "will ", "let's", "let us",
  "going to", "have to", "has to", "own", "prepare", "look into", "fix",
];

function extractActionItems(text) {
  const sentences = splitSentences(text);
  return sentences.filter((s) => {
    const lower = s.toLowerCase();
    return ACTION_KEYWORDS.some((kw) => lower.includes(kw));
  });
}

function generateUserStories(actionItems) {
  return actionItems.slice(0, 6).map((sentence) => {
    const lower = sentence.toLowerCase();
    let role = "team member";
    if (lower.includes("qa")) role = "QA engineer";
    else if (lower.includes("design") || lower.includes("mockup")) role = "designer";
    else if (lower.includes("frontend") || lower.includes("checkout") || lower.includes("banner")) role = "frontend developer";
    else if (lower.includes("backend") || lower.includes("payment") || lower.includes("sdk") || lower.includes("api")) role = "backend developer";
    else if (lower.includes("user") || lower.includes("customer")) role = "product manager";

    // Look for a "so that"/"because" purpose clause first, so we can both
    // extract the benefit AND cut the "want" text before that clause —
    // otherwise the purpose ends up duplicated in both fields.
    let benefit = "the team can move this initiative forward";
    const purposeMatch = sentence.match(/\bso that\b(.+)/i) || sentence.match(/\bbecause\b(.+)/i);
    let wantSource = sentence;
    if (purposeMatch) {
      benefit = purposeMatch[1].trim().replace(/\.$/, "");
      wantSource = sentence.slice(0, purposeMatch.index);
    }

    // Very simple "want" extraction: strip a leading action keyword.
    // Proper nouns (names) are left capitalized as-is — this is a
    // heuristic, not real grammar parsing, and the UI says so plainly.
    let want = wantSource
      .replace(/^(we |I |let'?s |let us )?(need to|needs to|should|must|will|going to|have to|has to)\s*/i, "")
      .trim();

    return { role, want: want.replace(/[.,]$/, ""), benefit };
  });
}

function splitSentences(text) {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
