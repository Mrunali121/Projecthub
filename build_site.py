"""
Builds the ProjectHub marketing/portfolio site (index, features, tour, demo, ai-tools,
architecture, product-thinking). The working app itself is app.html + ph-*.js + app.css.

    python build_site.py        (needs: pip install markdown)

Every file sits in the repo root, so GitHub Pages serves it however the repo was uploaded.
"""
import html
import re
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent
REPO = "https://github.com/Mrunali121/projecthub"
LIVE = "https://mrunali121.github.io/Projecthub/"
LINES = sum(len(p.read_text(encoding="utf-8").splitlines()) for p in list(ROOT.glob("ph-*.js")) + [ROOT / "app.css", ROOT / "app.html"])

NAV = [("index", "Home", "🏠"), ("features", "Features", "✨"), ("tour", "Product tour", "🖼️"), ("demo", "Live demo", "▶️"),
       ("ai-tools", "AI tools", "🤖"), ("architecture", "Architecture", "🧱"), ("product-thinking", "Product thinking", "🧭")]


def shell(slug, title, body, hero=False, lead="", kicker=""):
    nav = "".join(f'<a href="{s}.html"' + (' aria-current="page"' if s == slug else "") + f'><span aria-hidden="true">{ic}</span>{lb}</a>' for s, lb, ic in NAV)
    i = [n[0] for n in NAV].index(slug)
    prev, nxt = (NAV[i - 1] if i else None), (NAV[i + 1] if i < len(NAV) - 1 else None)
    pager = ('<div class="pager">' + (f'<a href="{prev[0]}.html">&larr; {prev[1]}</a>' if prev else "<span></span>")
             + (f'<a href="{nxt[0]}.html">{nxt[1]} &rarr;</a>' if nxt else f'<a href="app.html">Open the app &rarr;</a>') + "</div>")
    head = "" if hero else (f'<header class="pagehead"><div class="kicker">{kicker}</div><h1>{title}</h1>' + (f"<p>{lead}</p>" if lead else "") + "</header>")
    content = body if hero else f'<div class="page">{body}{pager}</div>'
    doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{'ProjectHub: AI Project Management Platform' if slug == 'index' else title + ' | ProjectHub'}</title>
<meta name="description" content="ProjectHub is a working project management app (Kanban, sprints, Gantt, risks, team roles, KPI dashboard, AI meeting summary). Built with plain HTML, CSS and JavaScript.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="site.css">
</head>
<body>
<div class="shell">
<aside class="side">
  <a class="logo" href="index.html"><i>PH</i>ProjectHub</a>
  <nav aria-label="Site pages">{nav}</nav>
  <a class="launch" href="app.html">Launch live demo &rarr;</a>
  <div class="meta">Portfolio project by Mrunali Rajgor.<br>Demo data only. Everything runs in your browser.</div>
</aside>
<div class="main">
{head}{content}
<footer><span>ProjectHub is a self-directed portfolio project. The company and data are illustrative.</span>
<span><a href="{REPO}" target="_blank" rel="noopener">GitHub</a> · <a href="https://mrunali121.github.io/" target="_blank" rel="noopener">Portfolio &amp; CV</a></span></footer>
</div>
</div>
</body>
</html>
"""
    (ROOT / f"{slug}.html").write_text(doc, encoding="utf-8")


VIEWS = [
    ("dashboard", "Dashboard", "📊", "KPI cards and two hand-built SVG charts.",
     ["Open tasks, active-sprint progress, average velocity and open risk count at a glance.", "Tasks-by-status bar chart and a four-sprint velocity trend.", "Charts are plain inline SVG: no charting library."]),
    ("kanban", "Kanban board", "🗂️", "Backlog → In Progress → QA → Done with drag and drop.",
     ["Drag cards between columns (HTML5 drag-and-drop).", "Add, edit and delete tasks in a modal.", "Cards show priority, points, assignee and tags."]),
    ("sprints", "Sprint planning", "🏁", "Commit work to a sprint against team capacity.",
     ["Move backlog items in and out of the sprint.", "Capacity bar: committed points versus a team capacity of 28 points.", "Start and complete sprint lifecycle."]),
    ("gantt", "Gantt timeline", "📅", "Epic-level roadmap computed from real date ranges.",
     ["Bars positioned with plain date maths.", "No charting library; just HTML and CSS.", "Shows overlap between epics at a glance."]),
    ("risks", "Risks & issues", "⚠️", "Likelihood × Impact scoring with status tracking.",
     ["Score each risk and see the highest first.", "Open, mitigated and closed statuses.", "Add and edit through a modal."]),
    ("team", "Team & roles", "👥", "Roster with role management and a mock invite flow.",
     ["Admins and PMs can reassign roles.", "Invite flow shows how onboarding would look.", "Roles feed the assignee choices elsewhere."]),
    ("ai", "AI tools", "🤖", "Paste meeting notes → summary, action items, draft user stories.",
     ["One click turns notes into a summary, action items and user stories.", "Add a generated story straight to the backlog.", "Rule-based and labelled as such. See the AI tools page."]),
]
ROUTE = {"dashboard": "dashboard", "kanban": "board", "sprints": "sprints", "gantt": "timeline", "risks": "risks", "team": "team", "ai": "ai-tools"}

# ---------------- home ----------------
cards = "".join(f'<a class="card" href="tour.html#{k}"><div class="ico">{ic}</div><h3>{t}</h3><p>{d}</p><span class="go">See it &rarr;</span></a>' for k, t, ic, d, _ in VIEWS)
home = f"""
<section class="hero">
  <span class="kicker">Portfolio project · working web app</span>
  <h1>A project management platform you can <em>actually use</em></h1>
  <p class="lead">ProjectHub puts a Kanban board, sprint planning, a Gantt timeline, a risk register, team roles, a KPI dashboard and an AI meeting-notes tool in one workspace. Sign in with the demo account and try it.</p>
  <div class="cta"><a class="btn coral" href="app.html">Launch live demo &rarr;</a><a class="btn line" href="tour.html">Take the product tour</a></div>
  <div class="frame"><div class="bar"><b></b><b></b><b></b><span>mrunali121.github.io/Projecthub</span></div><img src="shot-dashboard.png" alt="ProjectHub dashboard with KPI cards, tasks-by-status chart and velocity trend"></div>
</section>
<div class="strip"><div><b>7</b><span>app views, one workspace</span></div><div><b>0</b><span>frameworks or libraries</span></div><div><b>{LINES:,}</b><span>lines of hand-written code</span></div><div><b>100%</b><span>runs in your browser</span></div></div>
<div class="page">
  <h2>What's inside</h2><p class="section-sub">Click any feature to see it on the product tour.</p>
  <div class="grid">{cards}</div>
  <h2>Why I built it</h2>
  <p>Most PM portfolio projects are documents: PRDs, backlogs, roadmaps. They matter, but they don't show whether the person behind them understands how the product itself has to behave. ProjectHub makes the artifacts from my other case studies tangible, as a real tool you can click through.</p>
  <div class="grid">
    <a class="card coral" href="product-thinking.html"><div class="ico">🧭</div><h3>Product thinking</h3><p>The decisions and trade-offs behind it, and what a production version would change.</p><span class="go">Read &rarr;</span></a>
    <a class="card coral" href="architecture.html"><div class="ico">🧱</div><h3>Architecture</h3><p>Module map, why no framework, why localStorage.</p><span class="go">Read &rarr;</span></a>
    <a class="card coral" href="demo.html"><div class="ico">▶️</div><h3>Live demo</h3><p>The full app, embedded, with sign-in instructions.</p><span class="go">Try it &rarr;</span></a>
  </div>
</div>
"""
shell("index", "ProjectHub", home, hero=True)

# ---------------- features ----------------
rows = "".join(f'<tr><td><a href="tour.html#{k}"><strong>{t}</strong></a></td><td>{d}</td></tr>' for k, t, ic, d, _ in VIEWS)
rows = '<tr><td><strong>Login &amp; team workspace</strong></td><td>Mock sign-in (client-only demo) with a workspace switcher.</td></tr>' + rows
body = ('<h2>Feature overview</h2><table><thead><tr><th>Feature</th><th>What it does</th></tr></thead><tbody>' + rows + '</tbody></table>'
        '<h2>Built for real use</h2><div class="grid">'
        '<div class="card"><h3>Stateful</h3><p>Changes persist across reloads (browser localStorage), so it feels like a real tool.</p></div>'
        '<div class="card"><h3>Resettable</h3><p>"Reset demo data" in the sidebar returns it to the seeded state at any time.</p></div>'
        '<div class="card"><h3>Responsive</h3><p>Hand-written CSS, readable on laptop and phone widths.</p></div></div>'
        '<div class="note ok"><strong>No account needed.</strong> Any email and password signs you in, or use the "Use demo account" button. Your changes stay in your own browser.</div>')
shell("features", "Features", body, lead="Everything in the workspace, in one place.", kicker="What it does")

# ---------------- tour ----------------
tour = ""
for k, t, ic, d, bullets in VIEWS:
    tour += (f'<section class="tour" id="{k}"><div><span class="tag">{ic} {t}</span><h2>{d}</h2><ul>' + "".join(f"<li>{b}</li>" for b in bullets)
             + f'</ul><a class="btn violet" href="app.html#{ROUTE[k]}">Open in the app &rarr;</a></div>'
             f'<a class="shot" href="shot-{k}.png" target="_blank" rel="noopener"><img src="shot-{k}.png" alt="{t} screen of ProjectHub" loading="lazy"></a></section>')
shell("tour", "Product tour", '<p class="section-sub">Click a screenshot to open it full size. "Open in the app" jumps to that view (sign in with the demo account first).</p>' + tour,
      lead="Seven views, each with a screenshot from the live app.", kicker="See it")

# ---------------- demo ----------------
body = ('<ol class="steps"><li>Click <strong>Use demo account</strong> in the box below, or sign in with any email and password.</li>'
        '<li>Use the left menu to move between views. Drag cards on the Kanban board.</li>'
        '<li>Try the <strong>AI Tools</strong> view with your own meeting notes.</li>'
        '<li>Click <strong>Reset demo data</strong> in the sidebar to start over.</li></ol>'
        '<div class="demo"><iframe src="app.html" title="ProjectHub live demo" loading="lazy"></iframe></div>'
        '<p><a class="btn coral" href="app.html">Open the demo full screen &rarr;</a></p>'
        '<div class="note ok">The demo has no backend. Your changes are saved only in this browser, and nobody else can see them.</div>')
shell("demo", "Live demo", body, lead="The whole app, running right here.", kicker="Try it")

# ---------------- ai tools ----------------
body = ('<div class="grid"><div class="card"><h3>1 · Paste notes</h3><p>Raw meeting notes or a transcript.</p></div><div class="card"><h3>2 · Generate</h3><p>One click builds a summary, action items and draft user stories.</p></div><div class="card"><h3>3 · Add to backlog</h3><p>Send a draft story straight to the board.</p></div></div>'
        '<h2>What it looks like</h2><a class="shot" href="shot-ai.png" target="_blank" rel="noopener"><img src="shot-ai.png" alt="AI tools screen with meeting notes and generated summary, action items and user stories" loading="lazy"></a>'
        '<h2>An honest note on the "AI"</h2>'
        '<div class="note"><strong>It is not a language model.</strong> The generator is a rule-based text heuristic that runs entirely in your browser. No external AI is called. The page itself says so ("Demo mode").</div>'
        '<p>This is a static site with no backend, so there is nowhere safe to keep an API key: a real LLM integration needs a server-side proxy so the key never reaches the browser. I chose to build a heuristic that is honest about its limits rather than fake a live AI response with hard-coded output.</p>'
        '<h2>How a real LLM would plug in</h2><p>The call would go to your own backend endpoint, which holds the key and calls the model. The front end only needs this shape (the same idea is commented in <code>ph-ai-generator.js</code>):</p>'
        '<pre><code>const res = await fetch("/api/ai/summarize", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ notes })\n});\nconst { summary, actionItems, stories } = await res.json();</code></pre>'
        '<p>For a version with a real model and checks on its output, see the <a href="https://mrunali121.github.io/ai-portfolio-control-tower/">AI Project Portfolio Control Tower</a> project.</p>')
shell("ai-tools", "AI tools", body, lead="Meeting notes in, summary and user stories out.", kicker="Feature deep dive")

# ---------------- architecture ----------------
md = (ROOT / "docs" / "architecture.md").read_text(encoding="utf-8")
md = re.sub(r"^# .*\n", "", md.lstrip(), count=1)
md = md.replace("`css/styles.css`", "`app.css`").replace("`js/", "`ph-").replace("| `index.html` |", "| `app.html` |").replace("open `index.html`", "open `app.html`")
md = re.sub(r"`(data|auth|app|kanban|sprints|gantt|risks|team|dashboard|ai-generator)\.js`", r"`ph-\1.js`", md)
md = md.replace("`ph-ph-", "`ph-")
(ROOT / "docs" / "architecture.md").write_text("# Architecture - ProjectHub\n\n" + md, encoding="utf-8")
html_md = markdown.markdown(md, extensions=["tables", "fenced_code", "sane_lists"])
body = ('<div class="note ok">All app files sit in the repo root with a <code>ph-</code> prefix so the site works on GitHub Pages however the files are uploaded.</div>' + html_md)
shell("architecture", "Architecture", body, lead="How the app is put together, and the scope decisions behind it.", kicker="Under the hood")

# ---------------- product thinking ----------------
body = ('<h2>Why this exists</h2><p>A PM portfolio is usually documents. This project asks a different question: <em>does the person understand how the product has to behave?</em> What a Kanban board needs to feel responsive, what a sprint-planning screen must show in a real stand-up, and what makes a risk register get looked at instead of ignored.</p>'
        '<h2>Decisions and trade-offs</h2><table><thead><tr><th>Decision</th><th>Why</th><th>Trade-off</th></tr></thead><tbody>'
        '<tr><td>No framework, no build step</td><td>Anyone can read the whole app file by file; deploys as a static site with zero config.</td><td>No component reuse or structured state management; wouldn\'t scale to a large team product.</td></tr>'
        '<tr><td>localStorage instead of a backend</td><td>Runs on GitHub Pages with no server. One <code>Store</code> object is the only code touching storage, so swapping in an API is a one-file change.</td><td>Data is per browser: no sync and no multi-user collaboration.</td></tr>'
        '<tr><td>Mock authentication</td><td>Lets a reviewer in instantly, and the login screen says plainly that it is a demo.</td><td>Not a real security model.</td></tr>'
        '<tr><td>Rule-based "AI"</td><td>Honest and working; no API key exposed in a static site.</td><td>Much simpler than a language model, and says so in the UI.</td></tr>'
        '<tr><td>Fixed sprint capacity (28 points)</td><td>Keeps the planning screen understandable.</td><td>A real tool would compute capacity from availability data.</td></tr>'
        '<tr><td>Hand-built SVG charts and Gantt</td><td>No dependency that could disappear; shows the fundamentals.</td><td>More code than using a library.</td></tr></tbody></table>'
        '<h2>What a production version would change</h2><ul>'
        '<li>Replace <code>Store</code> with calls to a real backend (for example Postgres with a REST or GraphQL API).</li>'
        '<li>Replace mock auth with real sessions.</li>'
        '<li>Add real-time collaboration (websockets or polling) so teammates see each other\'s changes.</li>'
        '<li>Route the AI tool through a server-side proxy to a language model, with output checks.</li>'
        '<li>Compute sprint capacity from team availability.</li></ul>'
        '<div class="note"><strong>These were scope decisions, not gaps in knowledge.</strong> They match what a portfolio demo needs to prove, versus what a funded engineering team would build for production.</div>')
shell("product-thinking", "Product thinking", body, lead="The decisions behind the demo, and what changes at production scale.", kicker="Why it is built this way")
print("Built", len(NAV), "pages;", LINES, "lines of app code")
