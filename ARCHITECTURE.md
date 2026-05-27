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
- **Exception:** `gallabox-web-inbox.html` uses a **mini React 18 runtime** loaded via CDN script tag (UMD), no JSX, createElement API only. The inbox file is split into `_inbox-data.js` (tokens + data) → `_inbox-icons.js` (SVG icons) → `_inbox-components.js` (React components) → thin HTML shell (App + render, 77 lines)

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
| `GBWebWidget.html` | `/widget` | Full agent builder. **White top nav** (matches production). **No inline sidebar** — content full-width. Seven tabs ordered: Instructions / Actions / Knowledge / Web Widget / Settings (production-parity) + Dashboard / Channel Settings (roadmap — labeled "SOON"). New tab components: `InstructionsPanel` (Role, Goal, Instructions editors), `ActionsPanel` (Create New Action modal: API Call / Code Execution), `KnowledgePanel` (KB multi-select, up to 3), `AISettingsPanel` (AI Provider locked, AI Model dropdown, LLM Temperature slider). Channel Settings tab (`ChannelSettingsPanel`) hosts infusion config. Uses React 18 CDN. `DFLT_CFG` extended with `role`, `goal`, `agentInstructions`. |
| `gallabox-web-channel-settings.html` | `/web/settings` | Channel Settings — standalone page (Web secondary nav). Web context infusion settings, WhatsApp channel connector, auto-open, nudge rules. |
| `gallabox-web-visitor-analytics.html` | `/web/visitor-analytics` | Visitor Analytics — standalone page (Web secondary nav). Engagement funnel (visitor→chat), traffic source + attribution model, device/geo breakdown, top pages, visitor journey table, data-gap recommendations. Channel dropdown = website URL from onboarding. Mock data inline. |
| `inbox-infusion.md` | — | Research + architecture doc for the two-event (create + resolve) chat infusion system. Covers contact mapping methods, 30-day window, tiered credit model, channel settings design, and phased build plan. |
| `specs/` | — | **User story specs** for roadmap features not yet in production. Each file is a standalone brief for sprint planning. See §12 for index. |

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
| `gallabox-web-inbox.html` | `/inbox` | **Thin shell (77 lines).** Loads four external scripts then runs App + render. All components, data, and icons are in the split JS files below. |
| `_inbox-data.js` | — | Token colors, React shorthands (`useState`, `ce`, etc.), and all demo data: `SESSIONS_INIT`, `SESSION_DONE`, `SESSION_NEW_LIVE`, `CONTACT`, `WA_MSGS`, `WEB_MSGS`, `CONVS`, `VIEWS_DATA`. Sessions include `refExpired: true` for sessions older than 30 min (demo data for s2 Apr 30, s3 Apr 22). |
| `_inbox-icons.js` | — | All SVG icon functions (`WaI`, `GlobeI`, `ClockI`, `MsgI`, etc.). Requires `ce` from `_inbox-data.js`. |
| `_inbox-components.js` | — | All React components except `App`: `StatusPill`, `WebSessionCard`, `WebSessionGroup`, `WebChatOverlay`, `ConvRow`, `ConvList`, `ViewContactPanel`, `RightPanel`, `CreateEntry`, `GeneratingStub`, `LeadSummary`, `ResolveCard`, `ContextCard`, `ChatArea`, `LeftSidebar`, `DemoBar`. Key notes: `ContextCard` renders all sessions oldest-first (chronological thread order); `ResolveCard` expanded shows source URL + resolve details only (no create-section duplication); `CreateEntry` shows "Ref · expired" when `sess.infusion.refExpired === true`. |

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

### Inbox Session Object Shape

Used in `gallabox-web-inbox.html` to drive `CreateEntry` + `ResolveCard` rendering.

```js
{
  id: 's1',
  refCode: '100041',              // sequential integer; human-readable for voice handoff
  status: 'Live' | 'Resolved' | 'Dropped',
  sourceUrl: 'pricing.gallabox.com/villas',
  startedAt: '7:27 AM',
  endedAt:   '7:34 AM',
  msgCount:  10,
  durationMin: 7,
  sessionId: '69f2b713…',
  contactMapping: {
    status: 'mapped',             // mapped | anonymous | pending | failed
    contactId: 'c-8821',
    method: 'cookie',             // cookie | phone_capture | business_inject | wa_ref | ip_fallback | manual
    mappedAt: '7:27 AM',
    retroactive: false
  },
  infusion: {
    createInjectedAt: '7:27 AM',
    resolveInjectedAt: '7:34 AM',
    targetThreadId: 'wa-thread-9921',
    method: 'auto_resolve',       // auto_resolve | wa_ref | manual | queued
    withinWindow: true,           // session age < 30 days at injection time
    refExpired: false             // true when fallback token (Ref:XXXXX) has expired (>30 min TTL)
                                  // cookie/phone matching still works; only real-time token lookup unavailable
                                  // CreateEntry chip shows "Ref · expired" when true
  },
  fields: {                       // populated on resolve
    intentType: 'Villa Purchase',
    budget: '50L – 1 Crore',
    location: 'Chennai',
    timeline: 'Within 3 months',
    leadScore: 8,
    summary: 'Ganesh is actively looking for a villa in Chennai…'
  },
  rawLog: [                       // available for LLM context extraction
    { id:'w1', who:'in',  text:'villas',               time:'7:27 AM' },
    { id:'w2', who:'bot', text:'What is your budget?', time:'7:27 AM' },
    // …
  ]
}
```

### Channel Object Shape (Inbox — `webContextEnabled`)

Inbox channels include a `webContextEnabled` flag for Layer B cross-channel injection control:

```js
{
  id: 'wa1',
  name: 'Maya - Dialog360',
  phone: '+91 98765 43210',
  webContextEnabled: true    // Layer B: whether this channel shows web context for contacts
}
```

When `webContextEnabled = false`, `CreateEntry` and `ResolveCard` are hidden for all threads on this channel, replaced by a greyed note directing to Channel Settings.

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
| Inbox AI summary (resolve card) | Mock `SESSION_DONE.fields` object — `generateSummary()` utility is specced in `inbox-infusion.md` Section 9 but not wired in prototype. Engineering wires it during story run. Supports LM Studio (`localhost:1234`, Qwen 9B) + Ollama (`localhost:11434`, Gemma 4B) + mock fallback. |
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

### Inbox Infusion (Chat Infusion System)
- **Two-event model:** `session.create` (single-line chip at contact mapping moment) + `session.resolve` (compact expandable card when summary ready). Both immutable, append-only.
- **Append-only:** No indexing cost. Two writes per session, ever. Thread scroll replaces "Previous sessions" accordion.
- **30-day window:** Checked once at injection time (rolling from session start). No background cleanup jobs.
- **Tiered credit model:** Basic resolve = free (bot-captured fields). AI summary = 1 credit per resolved session. No charge for dropped, failed, or anonymous sessions.
- **`refCode` format:** Sequential integer (e.g., `100041`) — human-readable, voice-friendly.
- **Cross-channel (two-layer model):** Layer A = web agent's primary infusion channel (configured in Channel Settings). Layer B = per-channel opt-in `webContextEnabled` flag on each WA/Instagram/Voice channel. Events generated once at contact level; distribution is a flag check with zero additional cost.
- **`generateSummary()` spec:** Documented in `inbox-infusion.md` Section 9. Engineering accesses during story run. Prototype stays on mock data (shareable without local LLM server).

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

### Agent Builder Navigation (production parity)
- **White top nav** — GBWebWidget.html uses a white (#fff) header bar (not dark). Production screenshots confirm agent builder has a white header.
- **No inline sidebar in agent builder** — The builder is a full-width drill-down context. Global navigation is via the ← back button to the agent list, which uses the `_gb.js` sidebar.
- **Tab ordering** — Production order: Instructions → Actions → Knowledge → Web Widget → Settings. Roadmap tabs (Dashboard, Channel Settings) appear after with a "SOON" badge so engineers can see the design intent without confusion.
- **Default tab** — Opens to "Instructions" (not analytics/widget) to match production on-load behavior.

---

## 12. Specs Index (Roadmap Features)

Features built in this prototype but **not yet in production**. Each file in `specs/` is a user story brief for sprint planning.

| File | Feature | Status |
|---|---|---|
| `specs/US-001-agent-dashboard.md` | Agent Dashboard tab (session metrics, chat log, trends) | Prototype only |
| `specs/US-002-channel-settings-infusion.md` | Chat Infusion / Channel Settings tab (web → WA context injection) | Prototype only |
| `specs/US-003-widget-auto-open.md` | Auto-open, nudge rules, silent tracking | Prototype only |
| `specs/US-004-web-agent-analytics.md` | Metric definitions for web agent events (session, lead, CTA, handoff) | Prototype only |
| `specs/US-005-handoff-channel-selector.md` | Handoff UX: channel selector, display style, pre-fill, CTA vs handoff separation | Prototype only |
| `specs/US-006-publish-email-modal.md` | Publish / email-share modal for the outbound builder | Prototype only |
| `specs/US-007-web-channel-nav.md` | Web secondary nav (Channel Settings, Visitor Analytics) | Prototype only |
| `specs/US-008-visitor-analytics.md` | Visitor Analytics page — funnel, attribution, device/geo, missing tracking events | Prototype only |
| `specs/US-009-visitor-analytics-funnel.md` | Visitor Analytics conversion uplifts funnel — 6-step funnel, cycling uplift panel, per-step recommendations | Prototype only |

**Prototype vs production gap — currently in prototype, missing in production:**
1. Dashboard tab (read-only analytics inside agent builder)
2. Channel Settings tab (Chat Infusion — web context → WhatsApp inbox)
3. Auto-open widget behavior (delay, scroll depth, exit intent)
4. Returning visitor detection (cookie-based suppression)
5. Silent tracking (collect web session without showing widget)
6. Nudge display rules (conditional nudge triggers)
7. `?` help links in UI (docs deep-links from agent builder tabs)

**Already in production (prototype matches):**
- Instructions tab (Role, Goal, Instructions editors)
- Actions tab (API Call, Code Execution modal)
- Knowledge tab (Knowledge Base multi-select, up to 3 KBs)
- Settings tab (AI Provider locked, AI Model dropdown, LLM Temperature slider)
- Web Widget tab (Appearance, Messaging, Capture Contact, Handoff, Branding)
- Basic handoff (Channel selector, Display style, Prompt text, Pre-fill message)

**Coming in a future phase (architecture defined, not yet in prototype):**
- Global settings panel accessible from inbox + agent builder (shared contact data, channel config)
- Per-channel "Receive web context" toggle (Layer B cross-channel injection) in each channel's own settings page
