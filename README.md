# ProjectHub — AI Project Management Platform

![ProjectHub preview](assets/preview.svg)

A working, deployable project management platform demo — the kind of tool a
real product/engineering team would use daily. Built to demonstrate both
**product thinking** (what a PM tool actually needs) and **hands-on
delivery** (a real, interactive app, not a mockup) in one portfolio piece.

**[→ Live demo](https://YOUR-USERNAME.github.io/projecthub/)** · Sign in with any email/password, or use the "Use demo account" button. Part of a [broader PM/product portfolio](https://YOUR-USERNAME.github.io/) alongside case studies covering Agile delivery, hybrid SaaS governance, and product prioritization.

## Why this exists

Most PM portfolio projects are documentation — PRDs, backlogs, roadmaps.
Those matter, but they don't show whether the person behind them
understands how the *product itself* has to behave: what a Kanban board
needs to feel responsive, what a sprint planning screen needs to show to be
useful in a real standup, what makes a risk register actually get looked at
instead of ignored. This project is the artifact-based case studies in this
portfolio, made tangible as a real product.

## Features

| Feature | What it does |
|---|---|
| **Login & team workspace** | Mock auth (client-only demo — see [Architecture](docs/architecture.md)), with a workspace switcher |
| **Kanban board** | Backlog → In Progress → QA → Done, drag-and-drop cards, add/edit/delete tasks |
| **Sprint planning** | Move backlog items in/out of a sprint, capacity bar against team velocity, start/complete sprint |
| **Gantt timeline** | Epic-level roadmap view, computed from real date ranges — no charting library |
| **Risk & issue tracker** | Likelihood × Impact scoring, open/mitigated/closed status, add/edit modal |
| **Team members & roles** | Role management (Admin/PM can reassign roles), mock invite flow |
| **KPI dashboard** | Open tasks, sprint progress, velocity trend, open risk count — with hand-built SVG charts |
| **AI meeting summary / user story generator** | Paste meeting notes → get a summary, action items, and draft user stories — see honesty note below |

## An honest note on the "AI" feature

The AI meeting summary and user story generator is **real, working, and
interactive** — but it's a rule-based text heuristic running entirely in
your browser, not a call to an actual language model. This is a static
site with no backend, so there's nowhere to safely hold an API key: a real
LLM integration needs a server-side proxy so the key never reaches the
client. The UI says this plainly (see the demo banner on the AI Tools
page), and [`js/ai-generator.js`](js/ai-generator.js) has a commented
example showing exactly how to wire in a real API call once a backend
exists. Building a heuristic that's honest about its limits felt more
useful for a portfolio than faking a live AI call with hardcoded output.

## Tech stack

Deliberately dependency-free: vanilla HTML/CSS/JavaScript, no build step,
no framework. This was a conscious choice — it means the entire app can be
read and understood file-by-file, it deploys as a static site with zero
config, and it demonstrates the fundamentals directly rather than through a
framework's abstractions.

- **Frontend:** Vanilla JS (ES6+), hash-based routing, HTML5 Drag-and-Drop API
- **Styling:** Hand-written CSS, no framework
- **State:** `localStorage`, seeded from mock data on first load (see [`js/data.js`](js/data.js))
- **Charts:** Hand-built inline SVG (no Chart.js or similar)
- **Fonts:** Space Grotesk, Inter, IBM Plex Mono (Google Fonts)

See [`docs/architecture.md`](docs/architecture.md) for the module breakdown
and the deliberate scope boundaries of this demo.

## Running locally

No build step, no dependencies to install:

```bash
git clone https://github.com/YOUR-USERNAME/projecthub.git
cd projecthub
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` directly in a browser — everything runs client-side.

## Project structure

```
projecthub/
├── index.html              Login screen + app shell
├── css/
│   └── styles.css          All styling
├── js/
│   ├── data.js              Seed data + localStorage-backed store
│   ├── auth.js               Mock authentication
│   ├── app.js                 Router + shell rendering
│   ├── kanban.js               Kanban board + drag-and-drop
│   ├── sprints.js               Sprint planning
│   ├── gantt.js                  Gantt timeline
│   ├── risks.js                   Risk & issue tracker
│   ├── team.js                     Team members & roles
│   ├── dashboard.js                 KPIs + SVG charts
│   └── ai-generator.js               Meeting summary / user story generator
└── docs/
    └── architecture.md      Module map + scope decisions
```

## Reset the demo

Click "Reset demo data" in the sidebar at any time to wipe your local
changes and return to the original seeded state.

---
*This is a self-directed portfolio project. Company and product are
illustrative — the point is to demonstrate both product judgment and the
ability to actually build the thing.*
