# Gallabox Prototype — Architecture Reference

**Version:** v5 | **Phase:** Functional Demo / Prototype  
**Last updated:** May 2026  
**Purpose:** Living reference for product architecture, design decisions, assumptions, and PRD context. Use this file to write Linear specs and orient any new Claude session.

> This is a **functional demo builder** — high-fidelity enough to demo every flow end-to-end, but all data is mocked in localStorage. No backend, no APIs, no authentication. Architecture for production is the next phase.

---

## 1. What This Product Is

Gallabox is a **WhatsApp-first customer engagement platform**. The prototype demonstrates three integrated modules:

| Module | What it does |
|---|---|
| **Web Agent** | Embed an AI chat widget on any website. Qualifies visitors, captures leads, hands off to WhatsApp with full context. |
| **Outbound Campaigns** | Send templated WhatsApp messages to contact segments at scale. Supports one-time broadcasts and multi-step automated sequences with conditions, waits, A/B tests. |
| **Conversations Inbox** | Unified inbox for all WhatsApp conversations originating from Web Agent sessions and campaign replies. |

The **Docs system** (`gallabox-docs.html`) is a self-contained product guide that doubles as PRD context — every user-facing feature is documented with why/what/how.

---

## 2. Technology Stack

- **Pure HTML + vanilla JS** — no framework, no build step, no bundler
- **CSS custom properties** — single design token system in `_gb.css`
- **localStorage** — all data persistence (campaigns, flows, agents)
- **Google Fonts** — Sora (headings) + DM Sans (body) via CDN
- **Inline SVG icons** — no icon library dependency
- **Exception:** `gallabox-web-inbox.html` uses a **mini React 18 runtime** loaded via CDN script tag (UMD), no JSX, createElement API only

---

## 3. File Map

Every file in the repo root. Add new files here as they are created.

### Shared / Infrastructure

| File | Purpose | Key exports |
|---|---|---|
| `_gb.css` | Global design system: CSS tokens, base component classes | See §5 |
| `_gb.js` | Shared runtime: icon sidebar, toggle init, node picker popup, localStorage helpers | `GB.sidebar(activeId)`, `GB.ls`, `GB.initToggles()`, `GB.showPP()`, `GB.NODE_META`, `GB.NODE_OPTS` |
| `_outbound-data.js` | Outbound data layer: seed campaigns, seed flows, analytics mock data, shared helpers | `CAMPS`, `loadC()`, `saveC()`, `SEED_FLOWS`, `ANA`, `loadFlow()`, `saveFlow()`, `fmt()`, `nt()`, `ni()`, `pct()` |
| `vercel.json` | Vercel routing (clean URLs) + cache headers | — |
| `README.md` | URL routing table, file list, localStorage reset instructions | — |
| `ARCHITECTURE.md` | **This file.** Living architecture reference. | — |
| `CLAUDE.md` | Instructions for Claude Code sessions in this repo | — |

### Public-facing

| File | Route | Purpose |
|---|---|---|
| `index.html` | `/` | Landing page (product story, feature sections, CTA to `/app`) |
| `gallabox-web-lp.html` | `/lp` | Same LP, alternate alias |

### Web Agent Module

| File | Route | Purpose |
|---|---|---|
| `gallabox-web-empty.html` | `/app`, `/web` | Web Agents list — shows agent cards or empty state. Persists agent data in `gb_agents` localStorage key. Entry point for this module. |
| `gallabox-onboarding.html` | (linked from `/app`) | 4-step agent creation wizard: industry → use case → name/URL → review. Writes to `gb_agents`. |
| `GBWebWidget.html` | `/widget` | Full agent builder. Three-panel layout: left config tabs (Instructions / Actions / Knowledge / Web Widget / Settings), centre preview, right Lead Context. Uses React 18 CDN. Does NOT use `GB.sidebar()` — has its own editor chrome. |

### Outbound Campaigns Module

| File | Route | Purpose |
|---|---|---|
| `gallabox-outbound.html` | `/outbound` | Campaign list home + Rules & Priority screen. Two `<div class="screen">` panels toggled with `S(name)`. Campaign data from `_outbound-data.js`. |
| `outbound-builder.html` | `/outbound/builder?id=N` | Campaign canvas editor. Left node palette, centre scrollable flow, right inspector panel. Flow persisted per campaign ID (`gb_flow_N`). |
| `outbound-analytics.html` | `/outbound/analytics?id=N` | Campaign analytics. Three sub-tabs: Overview (KPI strip + funnel + A/B card), Contacts table, Flow Nodes. Analytics data from `ANA` mock in `_outbound-data.js`. |

### Docs

| File | Route | Purpose |
|---|---|---|
| `gallabox-docs.html` | `/docs` | Self-contained product guide + Outbound MCP API spec. Single-page JS app with sidebar nav. Doubles as PRD context repo. |

### Other

| File | Route | Purpose |
|---|---|---|
| `gallabox-web-inbox.html` | `/inbox` | WhatsApp conversations inbox + Lead Context panel. React 18 CDN. Shows web sessions alongside conversation threads. |

---

## 4. Data Architecture

### localStorage Keys

| Key | Written by | Read by | Contents |
|---|---|---|---|
| `gb_agents` | `gallabox-web-empty.html`, `gallabox-onboarding.html` | `gallabox-web-empty.html` | Array of agent objects `{id, name, industry, useCase, url, color, status, sessions, contacts, cta}` |
| `gb_outbound_v5` | `_outbound-data.js` (`saveC`) | All outbound pages | Array of campaign objects (see below) |
| `gb_flow_<id>` | `outbound-builder.html` | `outbound-builder.html`, `outbound-analytics.html` | Array of node objects for campaign ID `<id>` |

### Campaign Object Shape

```js
{
  id: Number,              // timestamp at creation
  name: String,
  obj: 'engagement' | 'conversion' | 'awareness' | 'reengagement',
  type: 'broadcast' | 'sequence',
  status: 'draft' | 'active' | 'paused',
  priority: 1..5,          // 1 = highest
  dnd: Boolean,            // respect 9am–9pm IST
  enrollOnce: Boolean,
  reentry: 'never' | '30d' | 'always',
  enrolled: Number,
  sent: Number,
  delivered: Number,
  read: Number,
  replied: Number,
  cold: Number,
  bounced: Number,
}
```

### Flow Node Object Shape

```js
{
  id: String,              // 'n1', 'n2', ... or Date.now() string
  type: NodeType,          // see Node Types below
  parentId: String|null,   // null for root entry node
  branch: 'yes'|'no'|null, // for condition node children
  cfg: Object,             // type-specific config (see §7)
}
```

### Node Types (outbound-builder.html)

Entry: `segment-enroll` (handles all sources via `cfg.srcType`), `api-trigger`, `web-returning`  
Experiment: `ab-test`  
Message: `send-wa`  
Condition: `condition`  
Wait: `wait-delay`  
Actions: `tag-contact`, `update-field`, `update-stage`, `assign-inbox`, `assign-team`, `assign-owner`, `assign-pipeline`, `add-success-seg`, `add-cold-seg`  
Exit: `exit-success`, `exit-cold`, `exit-failure`, `exit-dropped`

**Entry node source types** (`cfg.srcType`): `segment` | `csv` | `api` | `webhook` | `web`  
All entry sources share one node type — `segment-enroll`. Selecting a source type from the picker creates a `segment-enroll` node with the appropriate `srcType` preset.

**`exit-dropped`**: Contact did not meet enrollment conditions. Tracked separately in analytics under "Dropped" (distinct from "Failed"). Requires `cfg.drop_reason`.

### Analytics Mock Data

`ANA` in `_outbound-data.js` is a plain object keyed by campaign ID. Each entry has: `{enrolled, sent, delivered, read, replied, cold, bounced, ab}`. The `ab` key holds A/B test data when applicable. **This data is fully static** — it does not update when campaigns are edited.

---

## 5. Design System (`_gb.css`)

### CSS Token Reference

```css
/* Brand */
--gb: #1B58E3       /* Gallabox blue */
--gb-d: #1441C4     /* Blue dark (hover) */
--gb-s: #EFF4FF     /* Blue surface (backgrounds) */
--gb-b: #BFDBFE     /* Blue border */

/* Semantic */
--ok: #16A34A       /* Success green */
--ok-s: #F0FDF4     /* Green surface */
--warn: #D97706     /* Warning amber */
--warn-s: #FFFBEB   /* Amber surface */
--err: #DC2626      /* Error red */
--err-s: #FEF2F2    /* Red surface */

/* Neutrals */
--n50 through --n900   /* Slate scale */
--white: #FFFFFF
--off: #F8FAFC         /* Off-white background */
--border: #E2E8F0      /* Standard border */
--ink: #0F172A         /* Body text */
--muted: #64748B       /* Secondary text */

/* Typography */
--fh: 'Sora', sans-serif   /* Headings — 600/700/800 */
--fb: 'DM Sans', sans-serif /* Body */
```

### Key Component Classes

| Class | Description |
|---|---|
| `.btn .btn-p/s/g/d` | Primary / secondary / ghost / danger buttons |
| `.btn-sm .btn-icon` | Size modifiers |
| `.chip .chip-ok/warn/gray` | Status chips with dot indicator |
| `.tog .tok` | Toggle switch (`.on` class activates) |
| `.gb-main` | Main content wrapper (with icon sidebar) |
| `.gb-isb` | Icon sidebar container |
| `.sbi` | Sidebar icon button; `.sbi-on` = active; `.sbi-util` = utility (docs/LP) |
| `.gb-isb-sep` | Hairline separator in icon sidebar |
| `.gb-empty` | Empty state container |
| `.docs-help` | Circular `?` help button linking to docs (defined inline per page — see §8) |

---

## 6. Navigation Patterns

### Icon Sidebar (Module Nav)

Injected by `GB.sidebar(activeId)` into `<div id="gb-sb">`. Active items get `.sbi-on`. The sidebar has:
1. Module nav: Home, Conversations, Outbound, Web Agents
2. Separator (`.gb-isb-sep`)
3. Utility links: Docs, Landing Page (`.sbi-util`)

**Exception:** `GBWebWidget.html` does NOT use `GB.sidebar()` — it has its own full-chrome editor layout.

### Screen Switching (same-page)

`gallabox-outbound.html` uses:
```js
function S(name) { /* show screen-<name>, hide others */ }
```
Screens: `screen-campaigns`, `screen-controls`

### Docs Deep-link Pattern

```
gallabox-docs.html?page=<pageId>&anchor=<anchorId>
```

The docs JS handler reads `?page` and `?anchor` URL params on load, calls `show(pageId)` to activate the page, then `scrollIntoView` for the anchor. Page IDs match `id="page-<X>"` div IDs and nav button `onclick="show('<X>',this)"` attributes.

### Outbound Builder URL Param

```
outbound-builder.html?id=<campaignId>
outbound-analytics.html?id=<campaignId>
```

Both pages call `urlParam('id')` on load to fetch the campaign from `CAMPS`.

---

## 7. Module Deep-dives

### Web Agent Module

**Flow:** Landing page → `/app` (agent list or empty) → Onboarding wizard → Widget builder → (back to list)

**Agent creation wizard (`gallabox-onboarding.html`):**
- 4 steps: Industry → Use case → Name/URL → Review
- State stored in module-level `S` object
- On finish: writes to `gb_agents` localStorage, redirects to `GBWebWidget.html`

**Widget builder (`GBWebWidget.html`):**
- React 18 via CDN (no JSX, `React.createElement` only)
- Three panels: Left (tabbed config), Centre (phone preview), Right (Lead Context preview)
- Left tabs: Instructions, Actions, Knowledge, Web Widget, Settings
- Does NOT call `GB.sidebar()` — has its own sidebar-free layout
- Has a "Web Widget" tab that shows the chat widget configuration (position, color, nudge, lead form, etc.)

**Key design decision:** Lead Context is always shown — it's the key value prop (web visit data attached to the WhatsApp conversation).

### Outbound Campaigns Module

**Flow:** `/outbound` (list) → Builder (canvas) → Analytics

**Data layer (`_outbound-data.js`):**
- Shared by all three outbound pages via `<script src="_outbound-data.js">`
- `CAMPS` array is the source of truth for campaign metadata
- `SEED_FLOWS` provides pre-built sample flows for seed campaigns
- `ANA` is static analytics mock data

**Builder (`outbound-builder.html`):**
- Left panel (272px): vertical step list with branch lanes. `renderStepList()` + `stepSubtree()`.
- Center + Right: `editor-area` using CSS Grid. Tab bar across top, then `editor-stage` splits into `stage-config` (1fr) + `stage-preview` (328px sticky).
- **4-tab system per node**: Content · Logic · Schedule · Audience. `switchTab(tab)` dispatches to `renderIns(n)` / `renderTabLogic(n)` / `renderTabSchedule(n)` / `renderTabAudience(n)`.
- WA preview renders inside `stage-preview` (always visible when a message/ab-test node is selected).
- Entry nodes use modular source type cards (Content tab) — not a single mixed config screen.

**Node cfg shapes:**

```js
// segment-enroll (all entry sources via srcType)
{
  srcType: 'segment'|'csv'|'api'|'webhook'|'web',
  segments: String[],
  api_events: [{event, source}],
  web_sources: [{page, freq}],
  webhook_secret: String,
  reentry: 'never'|'30d'|'always',
  enroll_conditions: [{field, op, val}],  // Logic tab
  enroll_logic: 'AND'|'OR',
  fail_action: 'drop'|'skip',
  suppress_active: Boolean,
  suppress_segment: String,
  tag_filter: String, tag_exclude: String,
}

// ab-test
{
  template_a, template_b,
  test_pct: 5|10|15|20,
  objective: 'reply_rate'|'read_rate'|'click_rate'|'conversion',
  control_group: Boolean, control_pct: Number,
  window_minutes: 10..1440,
  metric: 'replied'|'read',
  auto_winner: Boolean,
  winner: 'a'|'b'|null,
  status: 'pending'|'running'|'evaluating'|'rollout'|'complete',
  retry: 0|1|2,                       // Logic tab
  fallback_template: String,
  dnd: Boolean, dnd_from, dnd_to, timezone, throttle,  // Schedule tab
}

// send-wa
{
  msgType: 'broadcast'|'sequence',
  template: String,
  dnd: Boolean,
  retry: 0|1|2,
  fallback_template: String,          // Logic tab
  reply_action: 'continue'|'pause'|'tag',
  reply_tag: String,
  dnd_from, dnd_to, timezone, throttle, // Schedule tab
}

// condition
{ logic: 'OR'|'AND', conditions: [{group, field, op, val}], timeout_hours: Number }

// wait-delay
{ amount: Number, unit: 'minutes'|'hours'|'days', skip_weekends: Boolean, skip_holidays: Boolean }

// exit-dropped
{ label: String, drop_reason: 'no_whatsapp'|'condition_failed'|'opted_out'|'duplicate'|'custom', drop_reason_text: String }

// exit-success / exit-cold / exit-failure
{ label: String }
```

**Enrollment conditions** (Logic tab of entry nodes):
- Each condition: `{field: 'whatsapp_exists'|'phone_exists'|'email_exists'|'tag'|'contact_field'|'segment'|'country', op: 'exists'|'not_exists', val: String}`
- Contacts that fail → exit via `exit-dropped` (not counted as failed in analytics)

**Drop vs Failed distinction:**
- `exit-failure` = bounced/opted-out after message send attempt
- `exit-dropped` = never messaged; failed enrollment conditions before first send

**Analytics (`outbound-analytics.html`):**
- Three sub-tabs: Overview, Contacts, Flow Nodes
- Rates use **delivered** as denominator (not sent) for read/reply/cold rates
- Delivery rate uses **sent** as denominator
- A/B result card shown only when campaign has `ab_test` data in `ANA`

### Docs Module

**Page IDs and their docs section:**

| Page ID | Content |
|---|---|
| `intro` | What is a Web Agent? |
| `create` | Create your first agent |
| `deploy` | Deploy to your website |
| `test` | Test your agent |
| `inbox` | Where to see web chats |
| `widget` | Widget settings explained |
| `handoff` | WhatsApp handoff |
| `ob-why` | Why use Outbound Campaigns? |
| `ob-setup` | Create & configure a campaign |
| `outbound` | Use cases & examples (webinar, discount, A/B) |
| `ob-nodes` | Node types — complete guide |
| `ob-analytics` | Reading campaign analytics |
| `mcp` | Outbound MCP API specification |
| `glossary` | Glossary |

---

## 8. Shared UI Patterns

### Outbound Builder — Refresh Design Language

The builder uses a set of CSS classes (defined inline in `outbound-builder.html`) from the Refresh v6 design system. Use these consistently when adding new config UI.

| Class | Description |
|---|---|
| `.editor-section` | White card block inside `stage-config`. Has `.editor-section-head` + `.editor-section-body`. |
| `.editor-section-head` | Title row with optional chip/badge. Contains `.editor-section-title`. |
| `.helper` | Blue hint block (info). Use `.helper-warn` for amber warning variant. |
| `.helper-icon` | Emoji icon prefix inside `.helper`. |
| `.adv` + `.adv-trigger` + `.adv-body` | Progressive disclosure. Add `open` class to expand. |
| `.var-pill` | Monospace purple variable token `{{name}}`. |
| `.vchip.ok/warn/err/mcp` | Small validation chips. `mcp` = dark MCP-connected indicator. |
| `.entry-type-grid` + `.entry-type-card` | 2-col grid of source type cards for entry nodes. `.on` = selected. |
| `.econd-builder` + `.econd-row` | Enrollment condition builder container + row. |
| `.econd-logic` | Segmented ALL/ANY toggle inside condition builder. |
| `.econd-add` | Full-width "Add condition" button at bottom of builder. |
| `.drop-toggle` + `.drop-opt` | Drop vs Skip 2-option toggle for fail_action. `.on` = selected. |
| `.node-stats` + `.node-stat` | 4-col live metric grid inside Content tab. |

### 4-Tab Editor Pattern

Every node in the builder has 4 tabs. Switch via `switchTab(tab)` which calls:

| Tab | Function | Content |
|---|---|---|
| Content | `renderIns(n)` | Primary config: source, template, conditions |
| Logic | `renderTabLogic(n)` | Retry, fallback, enrollment conditions, reply handling |
| Schedule | `renderTabSchedule(n)` | DND window, timezone, throttle, skip weekends |
| Audience | `renderTabAudience(n)` | Suppression, tag filters, re-entry rule |

Not all tabs have content for every node type — empty-state `.helper` is shown for irrelevant tabs.

### Docs Help Button (`.docs-help`)

A circular `?` button used throughout the product to link to the relevant docs section. **Defined inline in each page's `<style>` block** (not in `_gb.css`) because it's only needed on product pages, not LP/index.

```html
<a class="docs-help" href="gallabox-docs.html?page=ob-nodes&anchor=node-ab-test" target="_blank" title="Tooltip text">?</a>
```

CSS pattern (copy to each page that uses it):
```css
.docs-help{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:50%;background:var(--off);border:1.5px solid var(--border-d);color:var(--muted);font-size:10px;font-weight:800;text-decoration:none;flex-shrink:0;transition:all .14s;cursor:pointer;line-height:1}
.docs-help:hover{background:var(--blue-s);border-color:var(--blue);color:var(--blue)}
```

### Node Inspector Docs Link (`#ins-docs-link`)

In `outbound-builder.html`, the inspector header has an `<a id="ins-docs-link">` whose `href` is updated by `renderIns()` based on the `_docsAnchors` map:

```js
var _da = {
  'segment-enroll': 'page=ob-setup',
  'csv-upload':     'page=ob-setup',
  'api-trigger':    'page=ob-setup',
  'web-returning':  'page=ob-setup',
  'ab-test':        'page=ob-nodes&anchor=node-ab-test',
  'send-wa':        'page=ob-nodes&anchor=node-send-wa',
  'condition':      'page=ob-nodes&anchor=node-condition',
  'wait-delay':     'page=ob-nodes&anchor=node-wait',
  'tag-contact':    'page=ob-nodes&anchor=node-tag-contact',
  'notify-agent':   'page=ob-nodes&anchor=node-assign-owner',
};
```

### Campaign Card Rates (Outbound Home)

Read rate and reply rate on campaign list rows use `delivered` as denominator, falling back to `sent` if `delivered = 0`. Aggregate stat cards use same logic. The formula links on stat cards open `gallabox-docs.html?page=ob-analytics`.

---

## 9. Assumptions & Constraints

### What Is Mocked / Fake

| Feature | Reality in prototype |
|---|---|
| WhatsApp message delivery | Completely fake — no API calls made |
| AI responses in widget | Static mock responses in GBWebWidget.html |
| Lead capture / form submission | UI only — data stored locally |
| Analytics data | Static `ANA` object in `_outbound-data.js` |
| Template library | Hardcoded array `TEMPLATES` in outbound-builder.html |
| Contact segments | Hardcoded array `SEGMENTS` in outbound-builder.html |
| Inbox conversations | Static mock conversation data in gallabox-web-inbox.html |
| User authentication | None |
| Multi-user / team features | None |
| Pixel tracking | UI only — no actual tracking script |

### What Is Real / Functional

| Feature | Works in prototype |
|---|---|
| Campaign CRUD | Create, edit, duplicate, delete (localStorage) |
| Flow canvas | Add/remove/reorder nodes, wire branches |
| Node configuration | All inspector panels are functional forms |
| Onboarding wizard | Full 4-step flow with state management |
| Docs deep-linking | `?page=X&anchor=Y` URL params work |
| Priority reordering | Drag arrows reorder campaigns |
| Filter / search | Campaign list filter pills + search input |
| A/B test UI | Full configuration UI + result card display |
| Agent list | Add/delete agents, persist to localStorage |

---

## 10. Next Phase — Production Architecture Notes

> These are reminders for when the prototype transitions to a real product. Not tasks for the prototype phase.

1. **Backend API** — Replace localStorage with REST API calls. Campaign CRUD maps cleanly to standard resource endpoints. Flow nodes should be stored server-side with versioning.

2. **WhatsApp Business API** — Message sending requires a BSP (Meta-approved Business Solution Provider) integration. Templates must be pre-approved via Meta Business Suite before use.

3. **React / component framework** — The inbox page already uses React CDN. A production build should migrate all pages to a proper React app with shared state (Zustand or similar).

4. **Analytics pipeline** — Real analytics requires a message webhook (WhatsApp delivery/read/reply events) piped into a time-series store. The current `ANA` mock captures the right data shape.

5. **Authentication** — All pages are publicly accessible. Production requires auth at the route level.

6. **Pixel tracking** — The "Web Returning Visitor" entry type requires a first-party tracking pixel. Production needs a JS snippet served from the Gallabox CDN that identifies returning known contacts.

7. **MCP API** — The `mcp` docs page specifies a full MCP (Model Context Protocol) API surface for outbound campaigns. This is the AI agent interface for programmatic campaign management.

---

## 11. PRD Context — Key Product Decisions

These decisions were made during the prototype phase and should inform Linear specs.

### Web Agent
- **Lead capture timing:** "After 1 reply" is the recommended default — captures warm leads without being intrusive
- **Lead Context is always passed** to the WhatsApp handoff message — this is the core value prop
- **Widget position and color** are configurable per agent; defaults are bottom-right, Gallabox blue
- **AI qualification** happens in the widget before handoff — the agent collects name, use case, budget intent

### Outbound Campaigns
- **Objective sets the primary metric** displayed in analytics (engagement → read/reply; conversion → reply/click; awareness → delivery; re-engagement → any response)
- **Priority 1 = highest priority** — counterintuitive but aligned with "queue position" mental model
- **DND defaults ON** for all campaigns — protects WhatsApp number quality rating
- **Enroll once defaults ON** — prevents accidental duplicate sends
- **A/B test always placed after entry node** — before any branching, to ensure clean audience split
- **A/B test winner on tie: Variant A wins** — deterministic tiebreaker, no ambiguity
- **Pause keeps in-flight contacts at their current node** — does not cancel or exit them
- **Cold ≠ Failed** — delivered-but-not-read is a re-engagement opportunity, not a loss
- **Rate denominators:** Read rate, Reply rate, Cold rate all use **delivered** as denominator (not sent). Delivery rate uses **sent**.
- **Multi-source entry uses OR logic** — a contact matching any one source is enrolled (not AND)
- **Re-entry "Always" should only be used with API Trigger** — segment-based "Always" risks double-enrollment within minutes

### Docs System
- **Docs = PRD context repo** — every user-facing feature has a docs section with Why/What/How
- **Deep-link pattern** (`?page=X&anchor=Y`) enables the product to link directly to relevant docs from `?` buttons
- **`?` buttons are inline** in every screen where a user might have a question — they don't replace in-product explanations but augment them
