# Claude Code — Project Instructions

## First: Read the architecture file

Before making any changes, read `ARCHITECTURE.md`. It contains:
- Every file's purpose and key exports
- Data shapes for campaigns, agents, and flow nodes
- Design system tokens and component class names
- Docs deep-link patterns
- Assumptions (what's mocked vs real)
- PRD context and product decisions

This project is a **functional demo / prototype** — no build step, no framework (except React CDN in two files), no backend. All persistence is localStorage. Deployed via Vercel (see `vercel.json`).

**Prototype vs production:** `specs/` directory contains user story briefs for roadmap features visible in this prototype but NOT yet in production. See `ARCHITECTURE.md §12` for the full index and gap analysis.

---

## Quick file lookup

| I need to... | Go to |
|---|---|
| Change the icon sidebar (all list pages) | `_gb.js` → `sidebar()` function |
| Change shared styles | `_gb.css` |
| Change campaign data / seed flows | `_outbound-data.js` |
| Change outbound campaign list UI | `gallabox-outbound.html` |
| Change campaign canvas / node inspector | `outbound-builder.html` |
| Change analytics page | `outbound-analytics.html` |
| Change docs content | `gallabox-docs.html` |
| Change agent list | `gallabox-web-empty.html` |
| Change agent builder top nav / tabs | `GBWebWidget.html` → `GallaboxBuilder` function (~line 3509) |
| Change Instructions tab content | `_gb-instructions.html` (loaded as iframe) |
| Change Actions tab content | `_gb-actions.html` (loaded as iframe) |
| Change AI Settings tab content | `_gb-settings.html` (loaded as iframe) |
| Change Knowledge tab | `GBWebWidget.html` → `KnowledgePanel` (inline, small) |
| Change Web Widget appearance/handoff | `GBWebWidget.html` → `FormPanel` |
| Change Channel Settings / Infusion | `gallabox-web-channel-settings.html` (standalone page via secondary nav) |
| Change Visitor Analytics | `gallabox-web-visitor-analytics.html` (standalone page via secondary nav) |
| Change inbox components | `_inbox-components.js` |
| Change inbox demo data | `_inbox-data.js` |
| Change inbox icons | `_inbox-icons.js` |
| Change onboarding wizard | `gallabox-onboarding.html` |
| Change inbox shell / App | `gallabox-web-inbox.html` (77 lines) |
| Change landing page | `index.html` |
| Add/edit a user story spec | `specs/US-XXX-*.md` |

---

## Key patterns

### Adding a `?` help button
Copy this pattern:
```html
<a class="docs-help" href="gallabox-docs.html?page=<pageId>&anchor=<anchorId>" target="_blank" title="Short tooltip explaining the feature">?</a>
```

Add CSS to the page's `<style>` block if not already present:
```css
.docs-help{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:50%;background:var(--off);border:1.5px solid var(--border-d);color:var(--muted);font-size:10px;font-weight:800;text-decoration:none;flex-shrink:0;transition:all .14s;cursor:pointer;line-height:1}
.docs-help:hover{background:var(--blue-s);border-color:var(--blue);color:var(--blue)}
```

### Adding a new docs page
1. Add a nav button in the `<div class="sb">` section of `gallabox-docs.html`
2. Add a `<div class="page" id="page-<id>">` before the closing `</div>` of the `.main` div
3. The deep-link handler (`?page=<id>`) will automatically work

### Docs deep-link format
```
gallabox-docs.html?page=<pageId>              → navigate to page
gallabox-docs.html?page=<pageId>&anchor=<id>  → navigate + scroll to anchor
```

### Rate calculations (IMPORTANT)
- **Delivery rate** = Delivered ÷ Sent
- **Read rate** = Read ÷ Delivered (not ÷ Sent)
- **Reply rate** = Replied ÷ Delivered (not ÷ Sent)
- **Cold rate** = Cold ÷ Delivered (not ÷ Sent)

If `delivered = 0`, fall back to `sent` as denominator.

### Adding a node type to the builder
1. Add entry to `NM` (Node Metadata) in `_outbound-data.js`
2. Add to `OPTS_AFTER` adjacency rules in `_outbound-data.js`
3. Add to `PICKER_SECS` in `_outbound-data.js`
4. Add default cfg to `addNode()` defaults map in `outbound-builder.html`
5. Add `renderIns()` case for the node type (Content tab)
6. Optionally add cases to `renderTabLogic()`, `renderTabSchedule()`, `renderTabAudience()`
7. Add to the docs `page-ob-nodes` section in `gallabox-docs.html`

### Builder 4-tab system
Every node has: Content · Logic · Schedule · Audience tabs.
- `renderIns(n)` → Content tab
- `renderTabLogic(n)` → Logic tab  
- `renderTabSchedule(n)` → Schedule tab
- `renderTabAudience(n)` → Audience tab
All write to `#stage-config`. Show a `.helper` block for tabs with no content for that node type.

### Entry nodes (all use `segment-enroll` + `cfg.srcType`)
Adding a new entry source type:
1. Add card to the `entry-type-grid` in `renderIns` for `segment-enroll`
2. Add `srcType` case block in the source-specific config section
3. Add to `setSrcType()` type map if it needs special defaults
Do NOT create a new node type — all entry sources funnel through `segment-enroll`.

### Enrollment conditions (Logic tab of entry nodes)
- Use `addEnrollCond()` / `removeEnrollCond()` / `updateEnrollCond()` helpers
- Field list in `renderTabLogic` — add new fields to `ENROLL_FIELDS` array there
- Contacts that fail conditions → `exit-dropped` (not `exit-failure`)

### `exit-dropped` vs `exit-failure`
- `exit-failure` = contact was messaged but bounced/opted-out
- `exit-dropped` = contact never reached first message (enrollment condition failed)
- Dropped contacts tracked separately in analytics — do NOT use `exit-failure` for condition drops

---

## Agent builder architecture rules

`GBWebWidget.html` is a self-contained React 18 CDN app (~3680 lines). Key rules:
- **No JSX** — use `ce(ComponentOrTag, props, ...children)` everywhere. `ce = React.createElement`.
- **Tab components are standalone functions** defined BEFORE `GallaboxBuilder` in the file. Do not inline complex tab content directly in `GallaboxBuilder`.
- **White top nav** — the agent builder header is `#fff` with `border-bottom: 1px solid #E2E8F0`. Never change it back to dark. The dark nav only belongs on list-page contexts that use `_gb.js` sidebar.
- **No inline icon sidebar** — the agent builder has no 52px icon sidebar. Content is full-width. Navigation is via the ← back button to `gallabox-web-empty.html`.
- **Tab ordering** is fixed: Instructions → Actions → Knowledge → Web Widget → Settings → Analyze → Dashboard (SOON). Do not reorder.
- **Default tab for existing agents** is `'analyze'` — `useState(isNewAgent ? 'instructions' : 'analyze')`. New agents start on Instructions.
- **Channel Settings is NOT a widget tab** — it was moved to `gallabox-web-channel-settings.html`, accessible from secondary nav (Web > Channel Settings).
- **Roadmap tabs** (Dashboard) show a "SOON" badge and use `#94A3B8` text color so they're visually distinct from production-parity tabs.
- **Analyze tab** is production-parity (no SOON badge). It shows: 4 KPI tiles (Total/Ended/Dropped/Successful), sessions table (Contact Name, Contact No, Session ID, Timestamp, Status, Success Evaluation), post-session settings (data extraction fields, outcome evaluation, webhook). Row click opens `SessionOverlay` conversation popup.
- **SessionOverlay** is the conversation popup for the Analyze tab — inline in `GBWebWidget.html`, NOT imported from `_inbox-components.js`. Has "Jump to conversation" button linking to `gallabox-web-inbox.html`.
- **Iframe tabs**: Instructions, Actions, and Settings tab content lives in separate HTML files (`_gb-instructions.html`, `_gb-actions.html`, `_gb-settings.html`) loaded as iframes. Knowledge, Web Widget, Analyze, and Dashboard tabs are inline in `GBWebWidget.html`.
- **`cfg` is the widget config** (brand, colors, messaging, handoff). It does NOT include instructions/actions/knowledge — those have their own local state in each panel component.
- **`DFLT_CFG` extension:** When adding new cfg fields, add them to the `DFLT_CFG` object at ~line 2216.

## Inbox architecture rules

`gallabox-web-inbox.html` is a 77-line thin shell. ALL logic is in the 3 split files:
1. `_inbox-data.js` → tokens + demo data (load first)
2. `_inbox-icons.js` → SVG icon functions (needs `ce` from data file)
3. `_inbox-components.js` → all React components (needs both above)
4. `gallabox-web-inbox.html` → App function + `ReactDOM.createRoot().render()`

**Never put component code back in the HTML shell.** If a new component is needed, add it to `_inbox-components.js`.

---

## Growing the architecture tree

When you discover or create a file not yet listed in `ARCHITECTURE.md`:
1. Add it to the **File Map** (§3) with its route, purpose, and key exports
2. If it introduces new data shapes, add to **Data Architecture** (§4)
3. If it introduces new patterns, add to **Shared UI Patterns** (§8)
4. If it captures a product decision, add to **PRD Context** (§11)
5. If it's a roadmap feature spec, add to **Specs Index** (§12)

Keep `ARCHITECTURE.md` as the single source of truth for the entire codebase structure.

---

## New feature requests

Every new feature ask must be logged as a spec file in `specs/` before or alongside implementation:
1. Create `specs/US-XXX-[feature-name].md` with user stories, acceptance criteria, and trade-offs
2. Add the file to the §12 Specs Index in `ARCHITECTURE.md`
3. Reference the spec in the quick lookup table above if it affects file routing

Use the next available `US-NNN` number (check `specs/` for the highest existing number).

---

## Frontend contracts

These rules apply across all HTML pages in the prototype. Violating them causes visual regressions.

### Dropdowns
- Dropdowns inside `overflow:hidden` containers MUST use `position:fixed` with JS-computed `top/left` from `getBoundingClientRect()`. Never use `position:absolute` inside a clipped parent.
- Smart flip: if `triggerRect.bottom + menuHeight > window.innerHeight`, open upward; else open downward.
- Always close on outside click via `document.addEventListener('click', ...)`.

### Table row spacing
- Agent list rows: `padding:12px 14px` (not `height:52px`). Fixed height can collapse content in wrapped cells.
- Table footer: `position:sticky; bottom:0` with `background:#fff` so it stays visible above scrolled content.

### Text overflow in flex/grid cells
- Any flex or grid child that may contain long text MUST have `min-width:0` to allow shrinking.
- Text that must not overflow: add `overflow:hidden; text-overflow:ellipsis; white-space:nowrap`.
- Text that must wrap without breaking layout: add `overflow-wrap:break-word; word-break:break-word`.
- Grid cards (`.card`, `.insight-card`) inside CSS Grid: add `min-width:0; overflow:hidden`.

### One URL = one channel
- Each website URL maps to exactly one `channelId`. The channel dropdown in visitor analytics and channel settings shows web icon + URL as the identifier.
- Channels can all be deleted — there is no last-channel guard. The UI handles the zero-channel state gracefully.
- In `gallabox-web-empty.html`, the last agent also cannot be deleted for the same reason.

### Agent list empty state
- A "Reset" button (dashed border, muted color) lets devs clear `localStorage` to test the empty state without code changes. It is intentional product testing UX — do not remove.

### CSS variable contract
Only use variables defined in `_gb.css`. Do NOT use: `--n600`, `--n800`, `--muted`, `--blue`, `--blue-s`, `--border-d`. Substitutions:
- `--n800` → use `--n700`
- `--n600` → use `--n500`
- `--muted` → use `--n400`
- `--blue` → use `--gb`
- `--blue-s` → use `--gb-s`
- `--border-d` → use `--n200`

---

## What NOT to do

- Do not add a build system, bundler, or package.json dependencies
- Do not create new JS files unless strictly necessary — prefer inline `<script>` per page
- Do not use `_gb.css` for page-specific styles — use inline `<style>` blocks
- Do not remove the `?` help buttons or docs links — they are intentional product UX
- Do not change rate calculation denominators back to `sent` — see above
- Do not mock new data in a way that changes the production data shape (keep it spec-accurate)
- Do not add comments explaining what code does — only add comments for non-obvious WHY
- **Do not make the agent builder top nav dark** — it must be white (#fff). Dark top nav = list pages only.
- **Do not add an inline icon sidebar to `GBWebWidget.html`** — the agent builder is a full-width detail page, not a list page.
- **Do not put `Ref:XXXXX` or any session token in any customer-facing UI** — this is internal operational metadata only
- **Do not wire live LLM API calls into the HTML prototype** — LLM integration is spec-only (in `inbox-infusion.md` §9). The prototype stays mock/shareable.
- **Do not reorder agent builder tabs** without updating both `CLAUDE.md` and `ARCHITECTURE.md`
- **Do not use `position:absolute` for dropdowns inside `overflow:hidden` containers** — use `position:fixed` with JS positioning (see Frontend contracts above)
- **Do not use `height:Npx` for table rows** — use `padding` instead; fixed height collapses wrapped text
- **Do not add flex/grid children that can receive long text without `min-width:0`** — this causes overflow that breaks the layout

---

## Docs = PRD context

`gallabox-docs.html` is the product's user-facing docs AND the owner's PRD context file. When a feature is built or changed:
1. Update the relevant docs page to reflect the new behaviour
2. Add `?` links from the product UI to the new docs section
3. The goal: any question a user OR a product manager has should be answerable from the docs

The docs pages most likely to need updates when features change:
- New node type → `page-ob-nodes`
- New entry type → `page-ob-setup` + `page-ob-nodes`
- New analytics metric → `page-ob-analytics`
- New enrollment rule → `page-ob-setup`
- New web agent feature → relevant `page-create/deploy/widget/handoff`
