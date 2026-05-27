# Project: Web Agent

## Overview
The Web Agent initiative delivers an AI-powered chat widget that brands embed on their websites to qualify visitors, capture leads, and hand them off to WhatsApp with full conversation context. Each web agent is also a web channel — it owns the embed script, appearance settings, and infusion pipeline that routes structured session data into the Gallabox inbox the moment a visitor opens WhatsApp.

## Goals (Q2-Q3 2026)
- Ship a production-quality agent builder covering Instructions, Actions, Knowledge, Web Widget, and Settings tabs
- Enable teams to embed and go-live in under 30 minutes via the developer email publish flow
- Deliver Chat Infusion so inbox agents receive full session context on every identified handoff
- Provide a Dashboard tab giving agent operators session counts, lead rates, and funnel data without leaving Gallabox
- Establish per-channel configuration (infusion toggles, contact matching, auto-resolve) as a first-class surface in the Web nav
- Reach 50 active web agents in production by end of Q3 2026

## Prototype reference
- Prototype: `GBWebWidget.html` (agent builder), `gallabox-web-empty.html` (agent list)
- Standalone tab pages: `_gb-instructions.html`, `_gb-actions.html`, `_gb-settings.html`
- Channel settings page: `gallabox-web-channel-settings.html`
- Inbox side: `gallabox-web-inbox.html`, `_inbox-components.js`

## Feature inventory (prototype vs production)

### In production ✅
- Instructions tab (Role, Goal, Instructions)
- Actions tab (API Call, Code Execution)
- Knowledge tab (KB multi-select)
- Settings tab (AI model, temperature)
- Web Widget tab (appearance, messaging, capture contact, handoff)

### In prototype, not yet in production ❌
- [US-001](US-001-agent-dashboard.md) — Agent Dashboard (session KPIs, funnel, daily chart, session log)
- [US-002](US-002-channel-settings-infusion.md) — Chat Infusion / Channel Settings (web context injection into inbox)
- [US-003](US-003-widget-auto-open.md) — Widget auto-open (delay, exit-intent, scroll triggers)
- [US-004](US-004-web-agent-analytics.md) — Web agent analytics metrics (open source, device, country breakdowns)
- [US-005](US-005-handoff-channel-selector.md) — Handoff channel selector + pre-fill message variables
- [US-006](US-006-publish-email-modal.md) — Publish → send developer email with embed script
- [US-007](US-007-web-channel-nav.md) — Channel Settings as standalone nav page (moved out of agent builder)

## Key architectural decisions
- **No build step** — the prototype is plain HTML + React CDN; production must replicate feature parity before introducing a framework
- **Web agent = web channel** — the agent record IS the channel; there is no separate "channel" object to create; pricing follows per-agent embed activation (see ARCHITECTURE.md §11)
- **iframe tabs for Instructions, Actions, Settings** — standalone pages (`_gb-*.html`) loaded as iframes inside the agent builder so each tab can be worked on independently without touching the 3700-line `GBWebWidget.html`
- **Channel Settings at nav level** — moved to `gallabox-web-channel-settings.html` accessible from Web > Channel Settings so infusion config is reachable without entering a specific agent (see US-007)
- **Infusion is free; AI summary costs 1 credit/session** — never charge dropped or anonymous sessions (see US-002 §5)
- **Ref code is internal only** — session token must never appear in customer-facing text; it appends silently to the `wa.me` handoff URL (see US-002 §7)

## Trade-offs
| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Channel Settings placement | Standalone nav page (`gallabox-web-channel-settings.html`) | Tab inside agent builder | Makes per-channel config reachable without entering a specific agent; reflects that one WA channel can receive context from multiple web agents |
| Publish flow | Modal with developer email | Inline script copy only | Reduces friction for non-technical founders who hand off embed work to a developer |
| Tab rendering | iframes for Instructions, Actions, Settings | All inline in GBWebWidget.html | Keeps the main file maintainable; each tab can be worked on in isolation |
| Agent list page | Vanilla JS with `_gb.js` sidebar | React | List pages share the dark nav + sidebar pattern; React is only justified for complex interactive surfaces |

## Open questions
- Should one web agent be able to connect to multiple WA channels (e.g., one per locale), or is 1:1 always enforced?
- What is the production token mechanism for ref-code fallback matching — query param, custom WA template button, or deep link metadata?
- Do Analytics tab date ranges need to support custom date pickers beyond 7D/14D/30D presets for enterprise plans?
- How does the embed script handle CSP-restricted sites — does Gallabox provide a CSP nonce integration path?

## Spec files
| Spec | Description |
|---|---|
| [US-001](US-001-agent-dashboard.md) | Session KPI tiles, daily chart, funnel, country/device, session log |
| [US-002](US-002-channel-settings-infusion.md) | Chat Infusion — inject web context into WhatsApp thread |
| [US-003](US-003-widget-auto-open.md) | Widget auto-open triggers (delay, exit-intent, scroll) |
| [US-004](US-004-web-agent-analytics.md) | Extended analytics — open source, device, country, CTA vs handoff splits |
| [US-005](US-005-handoff-channel-selector.md) | Handoff channel selector + pre-fill variables + silent tracking |
| [US-006](US-006-publish-email-modal.md) | Publish modal — send embed script + install guide to developer via email |
| [US-007](US-007-web-channel-nav.md) | Channel Settings as standalone nav surface (Web > Channel Settings) |
