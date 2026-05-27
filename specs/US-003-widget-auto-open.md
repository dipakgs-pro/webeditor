# US-003: Widget Auto-Open

## Status
- Prototype: Built (GBWebWidget.html, component: EntryPointSection within FormPanel)
- Production: Not yet shipped
- Sprint target: Phase 2

## Problem statement
Visitors on high-intent pages (pricing, product detail, contact) often leave without ever clicking the chat launcher. Agent operators want the widget to open proactively after a configurable delay so that engaged visitors are nudged into a conversation without requiring them to notice and click the launcher.

## User stories

### Story 1: Enable auto-open
**As an** agent builder admin, **I want to** toggle automatic widget opening on or off, **so that** I can proactively surface the chat widget to visitors on high-intent pages without requiring them to find and click the launcher.

**Acceptance criteria:**
- [ ] An "Auto-open widget" toggle appears in the Entry Point section of the Web Widget tab
- [ ] When off, the widget opens only when a visitor clicks the nudge or launcher (default behavior)
- [ ] When on, the delay and nudge sub-options become visible and configurable
- [ ] The section highlights (blue tint border) when auto-open is enabled to make the active state obvious
- [ ] A tooltip explains: "Opens the widget automatically after the delay you set. Good for high-intent pages. Visitors can close it — it will not reopen in the same session."

### Story 2: Configure open delay
**As an** agent builder admin, **I want to** set how many seconds after page load the widget auto-opens, **so that** I can give visitors time to read content before the widget appears and avoid feeling intrusive.

**Acceptance criteria:**
- [ ] Delay options are presented as pill buttons: 5s, 10s, 15s, 30s, 1 min, 2 min, 3 min, 5 min
- [ ] Default delay is 30 seconds
- [ ] The selected delay pill is highlighted in brand blue; unselected pills use a light blue background
- [ ] The auto-open description line updates to reflect the chosen delay (e.g., "Opens after 30s on pages where the widget is installed")
- [ ] Delay is only configurable when auto-open is enabled

### Story 3: Show nudge before auto-open
**As an** agent builder admin, **I want to** choose whether the nudge bubble appears first before the widget opens, **so that** I can give visitors a gentler entry point that they can dismiss before seeing the full widget.

**Acceptance criteria:**
- [ ] A "Show nudge before opening" checkbox is shown below the delay selector when auto-open is on
- [ ] When checked: the nudge bubble appears first, then the widget opens at the configured delay
- [ ] When unchecked: the widget opens directly at the configured delay with no nudge step
- [ ] Checkbox is only shown when auto-open is enabled
- [ ] Default state is checked (nudge shown before open)

### Story 4: Analytics split for auto-open
**As an** agent operator, **I want** the Dashboard to track auto-opened widget sessions separately from user-clicked opens, **so that** I can evaluate whether auto-open is driving genuine engagement or inflating open counts.

**Acceptance criteria:**
- [ ] Widget Opened KPI tile sub-line shows "User: N (X%) · Auto: N (X%)"
- [ ] The Open Source donut chart in the Dashboard shows user-clicked vs auto-opened as two slices
- [ ] An informational note in the Open Source card displays the current auto-open configuration (e.g., "Auto-open configured: 30s delay on all pages")
- [ ] When auto-open is disabled on the agent, the Open Source card shows 100% user-clicked

### Story 5: Nudge display rules (conditional trigger)
**As an** agent builder admin, **I want to** define page-specific conditions for when the nudge is shown, **so that** I can show targeted nudge text on product pages without changing the nudge text shown elsewhere.

**Acceptance criteria:**
- [ ] An expandable "Display rules" section is available under the Nudge section (separate from auto-open)
- [ ] Admin can add up to 3 rules, each with: URL pattern (contains / starts with), minimum time spent on page (seconds), and custom nudge text for that rule
- [ ] Rules are evaluated in order; first matching rule wins
- [ ] If no rule matches, the default nudge text from the Nudge section is used
- [ ] An "Add rule" button is disabled when 3 rules already exist
- [ ] Each rule has a remove (×) button

## Key decisions & trade-offs
| Decision | Chosen approach | Alternative considered | Reason |
|---|---|---|---|
| Delay options | Fixed pill buttons (8 preset values) | Free-text number input | Presets prevent operators from setting sub-5s delays that feel spammy; covers the practical range |
| Same-session suppression | Widget does not reopen after visitor closes it within the same session | Allow reopening after another delay | Reopening is widely considered intrusive UX; explicitly stated in the tooltip |
| Nudge rules placement | Under the Nudge section, separate from the auto-open toggle | Merged with auto-open sub-options | Nudge rules govern display conditions for the nudge bubble itself, which exists independently of auto-open |
| Auto-open tab placement | Under Entry Point ("Appearance") in the prototype | Separate "Behavior" section | May be refactored to a dedicated Behavior section in production if widget settings grow; prototype places it with other launcher settings for simplicity |
| Returning visitor suppression | Not yet implemented in prototype | Suppress auto-open for returning visitors via cookie | Deferred to a later sprint; noted as a gap — cookie-based suppression is the planned approach |

## Prototype location
- File: GBWebWidget.html
- Component: EntryPointSection (function `EntryPointSection`)
- Nudge rules: NudgeSection (function `NudgeSection`)
- Approximate line: EntryPointSection ~1230–1355; NudgeSection ~1361–1430

## Notes for engineering
- The auto-open state (`autoOpen`, `autoOpenDelay`, `autoOpenShowNudge`) is part of the agent config object (`cfg`) and must be persisted alongside other widget settings.
- Returning visitor suppression (suppress auto-open if visitor has previously interacted) is a known gap in the prototype. The planned implementation is a short-lived cookie written at first widget interaction; if the cookie is present on load, auto-open is skipped. This should be a separate toggle when built.
- Silent tracking (US-003 is distinct from silent tracking in US-005): auto-open does not affect whether session data is silently tracked; it only controls the widget's visual trigger behavior.
- The "analytics will split widget opens into auto-opened vs user-clicked" warning shown in the prototype when auto-open is enabled is informational only — it documents the analytics side effect for the admin, not a data schema change.
- Nudge display rules (Story 5) use URL pattern matching on the client side. The matching is done in the embed script, not server-side, so rule evaluation happens at page load time.
