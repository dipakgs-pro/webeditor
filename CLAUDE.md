# Claude Code — Project Instructions

## First: Read the architecture file

Before making any changes, read `ARCHITECTURE.md`. It contains:
- Every file's purpose and key exports
- Data shapes for campaigns, agents, and flow nodes
- Design system tokens and component class names
- Docs deep-link patterns
- Assumptions (what's mocked vs real)
- PRD context and product decisions

This project is a **functional demo / prototype** — no build step, no framework (except React CDN in two files), no backend. All persistence is localStorage.

---

## Quick file lookup

| I need to... | Go to |
|---|---|
| Change the icon sidebar | `_gb.js` → `sidebar()` function |
| Change shared styles | `_gb.css` |
| Change campaign data / seed flows | `_outbound-data.js` |
| Change outbound campaign list UI | `gallabox-outbound.html` |
| Change campaign canvas / node inspector | `outbound-builder.html` |
| Change analytics page | `outbound-analytics.html` |
| Change docs content | `gallabox-docs.html` |
| Change agent list | `gallabox-web-empty.html` |
| Change agent builder | `GBWebWidget.html` |
| Change onboarding wizard | `gallabox-onboarding.html` |
| Change inbox | `gallabox-web-inbox.html` |
| Change landing page | `index.html` |

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

## Growing the architecture tree

When you discover or create a file not yet listed in `ARCHITECTURE.md`:
1. Add it to the **File Map** (§3) with its route, purpose, and key exports
2. If it introduces new data shapes, add to **Data Architecture** (§4)
3. If it introduces new patterns, add to **Shared UI Patterns** (§8)
4. If it captures a product decision, add to **PRD Context** (§11)

Keep `ARCHITECTURE.md` as the single source of truth for the entire codebase structure.

---

## What NOT to do

- Do not add a build system, bundler, or package.json dependencies
- Do not create new JS files unless strictly necessary — prefer inline `<script>` per page
- Do not use `_gb.css` for page-specific styles — use inline `<style>` blocks
- Do not remove the `?` help buttons or docs links — they are intentional product UX
- Do not change rate calculation denominators back to `sent` — see above
- Do not mock new data in a way that changes the production data shape (keep it spec-accurate)
- Do not add comments explaining what code does — only add comments for non-obvious WHY

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
