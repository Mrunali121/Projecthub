# ProjectHub: project management web app

A working project-management workspace: Kanban board, sprint planning, Gantt timeline, risk register, team roles, KPI dashboard and an AI meeting-notes tool. Plain HTML, CSS and JavaScript. No frameworks, no build step.


**Live app (sign in with "Use demo account"):** https://mrunali121.github.io/Projecthub/app.html

## Site pages
| Page | File |
|---|---|
| Home | `index.html` |
| Features | `features.html` |
| Product tour | `tour.html` |
| Live demo | `demo.html` |
| AI tools | `ai-tools.html` |
| Architecture | `architecture.html` |
| Product thinking | `product-thinking.html` |

## App files
`app.html`, `app.css`, `ph-data.js`, `ph-auth.js`, `ph-app.js`, `ph-kanban.js`, `ph-sprints.js`, `ph-gantt.js`, `ph-risks.js`, `ph-team.js`, `ph-dashboard.js`, `ph-ai-generator.js`. See [docs/architecture.md](docs/architecture.md).

## Honest notes
- Demo data is fictional. Data is stored in your browser (localStorage), not on a server.
- Sign-in is a mock. The "AI" is a rule-based text heuristic, not a language model.

## Rebuild the pages
`pip install markdown` then `python build_site.py`.
