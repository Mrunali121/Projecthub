# Architecture — ProjectHub

## Module map

| File | Responsibility |
|---|---|
| `index.html` | Login screen markup + empty app-shell mount point |
| `css/styles.css` | All styling — one file, organized by feature section |
| `js/data.js` | Seed data (`SEED_STATE`) + `Store`, a tiny localStorage-backed data layer with getters, mutators, and derived queries (`tasksBySprint`, `currentUser`, etc.) |
| `js/auth.js` | Mock session handling — a `localStorage` flag, not a real token |
| `js/app.js` | Hash router (`ROUTES`), sidebar/topbar shell rendering, boot sequence |
| `js/kanban.js` | Kanban board: columns, cards, HTML5 drag-and-drop, add/edit/delete modal |
| `js/sprints.js` | Sprint planning: capacity bar, backlog ↔ sprint assignment, sprint lifecycle |
| `js/gantt.js` | Epic-level Gantt chart, computed from date ranges via plain date math |
| `js/risks.js` | Risk & issue register: Likelihood × Impact scoring, add/edit modal |
| `js/team.js` | Team roster: role management, mock invite flow |
| `js/dashboard.js` | KPI cards + two hand-built inline-SVG charts |
| `js/ai-generator.js` | Meeting-notes → summary/action-items/user-stories, rule-based (see README's honesty note) |

Every feature module follows the same shape: a `render(container)` method
that rebuilds its section's DOM from the current `Store` state, plus
whatever local UI state it needs (e.g. `Sprints.selectedSprintId`). There's
no virtual DOM — each render call does a full `innerHTML` rewrite of its
container, which is simple to reason about and fast enough at this data
scale (tens of tasks, not thousands).

## Why no framework

This is a deliberate choice, not a limitation:

- **Zero build step.** Clone it, open `index.html`, or run one `http.server`
  command — no `npm install`, no bundler config, no version drift between a
  README's instructions and reality six months later.
- **Zero runtime dependencies.** No React, no charting library, nothing
  pulled from a CDN that could disappear or introduce a supply-chain risk.
- **Legible end-to-end.** Every line of behavior in the app is first-party
  code in this repo — nothing is hidden behind a framework's abstractions,
  which makes the whole thing easier to audit in a portfolio context.

The trade-off is real: a framework would give structured state management,
component reuse, and better handling at larger scale. For a ~2,000-line
demo app, vanilla JS's simplicity wins; it wouldn't for a production SaaS
product with a real team behind it, which brings us to scope.

## Why localStorage, not a real backend

This is a static site meant to run on GitHub Pages with no server. All
state — tasks, risks, sprints, team roster — lives in the browser's
`localStorage`, seeded from `SEED_STATE` on first load. That means:

- Changes persist across page reloads (a real stateful feel).
- Changes are **per-browser, per-device** — there's no sync, no multi-user
  collaboration, and no real backend. Two people opening the live demo see
  two independent copies of the data.
- "Reset demo data" wipes `localStorage` and reloads from the seed.

A production version of ProjectHub would replace `Store` with API calls to
a real backend (Postgres + a REST or GraphQL API, most likely), and
`auth.js` with real session tokens. The `Store` object is deliberately the
*only* place that touches `localStorage` — every feature module calls
`Store.get(...)` / `Store.addTask(...)` / etc. rather than touching storage
directly, so swapping the implementation later is a one-file change, not a
rewrite.

## Scope boundaries (what this demo intentionally does not do)

- **No real multi-user collaboration.** The workspace switcher and team
  roster are real UI, but there's no actual second user seeing your
  changes live — that needs a real backend with websockets or polling.
- **No real authentication.** Any email/password combination logs you in;
  this is stated plainly on the login screen itself.
- **No real AI call.** See the README's "honest note on the AI feature" —
  the meeting-summary tool is a working rule-based heuristic, not an LLM
  call, and says so in the UI.
- **Fixed team capacity (28 points/sprint)** in the sprint planning view,
  rather than a computed capacity from real team availability data — a
  reasonable simplification for a demo, called out in `sprints.js`.

None of these are things I didn't know how to build — they're scope
decisions appropriate to what a portfolio demo needs to prove, versus what
a funded engineering team would build for production.
