# Gallabox Web Prototype — v5

Static HTML. No build step. Push to repo root, Vercel deploys.

---

## URLs

| Route | File | Purpose |
|---|---|---|
| `/` | `index.html` | Landing page (product story) |
| `/lp` | `gallabox-web-lp.html` | Same LP — alias |
| `/app` | `gallabox-web-empty.html` | Web Agents home |
| `/web` | `gallabox-web-empty.html` | Alias |
| `/inbox` | `gallabox-web-inbox.html` | Inbox + Lead Context |
| `/docs` | `gallabox-docs.html` | Guide + MCP API spec |
| `/widget` | `GBWebWidget.html` | Agent builder |
| `/outbound` | `gallabox-outbound.html` | Outbound OS |
| `/outbound/builder` | `outbound-builder.html?id=N` | Campaign canvas |
| `/outbound/analytics` | `outbound-analytics.html?id=N` | Campaign analytics |

---

## All files (15 — all in repo root)

```
index.html                  Landing page = root
vercel.json                 Routing + cache headers
README.md                   This file
_gb.css                     Shared design system
_gb.js                      Shared icon sidebar
_outbound-data.js           Outbound campaign data layer
gallabox-web-lp.html        LP alias
gallabox-web-empty.html     Web Agents list
gallabox-onboarding.html    4-step agent wizard
GBWebWidget.html            Web Agent builder (React)
gallabox-web-inbox.html     Inbox + Lead Context
gallabox-docs.html          Docs + Outbound MCP spec
gallabox-outbound.html      Outbound OS home
outbound-builder.html       Campaign canvas
outbound-analytics.html     Campaign analytics
```

---

## User flows

```
/ (LP)
└── Try the product → /app (gallabox-web-empty.html)
    ├── New Agent → gallabox-onboarding.html → GBWebWidget.html
    └── Outbound → gallabox-outbound.html
        ├── New Campaign → outbound-builder.html?id=N
        │   └── Analytics → outbound-analytics.html?id=N
        └── Rules → screen-controls (same page)

Nav (icon sidebar, all pages):
  Inbox → gallabox-web-inbox.html
  Outbound → gallabox-outbound.html
  Web Agents → gallabox-web-empty.html
```

---

## Deploy

```bash
# First time
npm i -g vercel && vercel --prod

# Updates
git add -A && git commit -m "message" && git push
```

Vercel settings: Framework = Other, Build Command = empty, Output Directory = `.`

---

## localStorage

| Key | Content |
|---|---|
| `gb_outbound_v5` | Campaign array |
| `gb_flow_N` | Per-campaign flow for campaign ID N |

Reset: DevTools → Application → Local Storage → delete keys.
