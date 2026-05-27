# US-009 — Visitor Analytics: Conversion Uplifts Funnel

## User Story
As a Gallabox web agent owner, I want to see a structured funnel from visitor to contact captured — and get actionable recommendations for each drop-off step — so I can improve conversion without guessing which lever to pull.

## Context
The Engagement Funnel shows 5 steps: Visitors → Widget Opened → Chat Started → WA Handoff → Contact Captured. Each step has a drop-off gap. The Conversion Uplifts panel surfaces one actionable recommendation at a time, cycling through 4 areas.

## Funnel Steps
| Step | Typical % | Key drop cause |
|------|-----------|---------------|
| Visitors | 100% | — |
| Widget Opened | ~31% | No nudge / no auto-open |
| Chat Started | ~11% | Poor welcome message / no starters |
| WA Handoff | ~9.9% | Button copy, agent header not optimised |
| Contact Captured | ~8.7% | No contact capture journey / force off |

> **Widget Visible removed**: tracking whether the widget entered the viewport was estimated from page load — visitors on long pages who never scrolled to the widget were still counted as "seeing" it. This made the step misleading rather than actionable. Removed from funnel.

## Uplift Areas
1. **Visitors → Widget Opened (−69%· highest priority)**: Enable nudge, Customize nudge, Auto-open
2. **Widget Opened → Chat Started (−65%)**: Welcome message, Conversation starters  
3. **Chat Started → WA Handoff (−10%)**: Handoff button copy, Conversation starter, Agent header
4. **WA Handoff → Contact Captured (−11%)**: Contact capture journey, Force capture (business-requirement opt-in)

## Acceptance Criteria
- [ ] Funnel shows 5 steps (no Widget Visible) with correct drop percentages
- [ ] Each gap line shows −N% and a warn/ok badge based on severity
- [ ] WA Handoff step appears between Chat Started and Contact Captured
- [ ] Cycling uplift panel shows 1 uplift area at a time with prev/next controls
- [ ] Each uplift action links to the relevant settings page
- [ ] "Force capture" is clearly labelled as a business-requirement toggle (not default-on)
- [ ] Full-screen empty state shown when no web channels are configured in `gb_channels`
- [ ] Channel dropdown reads from `gb_channels` localStorage (shared with Channel Settings)
- [ ] Uplift panel is positioned INSIDE the funnel card, below Contact Captured step
- [ ] All funnel bars use a single brand color (no multi-color spectrum)

## Engineering Events (2 missing)

### open_type — manual click vs auto-open vs proactive message
Without knowing how the widget was opened, the "opened → chat" rate can't be split by trigger type. This split is the **core input for deciding whether to enable auto-open and for A/B testing trigger rules**.

> **Implementation note (auto-open + nudge):** `open_type` is prerequisite data before enabling auto-open or testing nudge variants. Auto-open improves the Visitors → Widget Opened drop, but only if the `auto`-triggered open rate converts at parity with `click`. If auto-open sessions convert at much lower rates, it means the timing rule is wrong — fire too early and you interrupt intent. `open_type` gives you the split to make this call with data instead of instinct.

```
GB.track('widget_open', { open_type: 'click|auto|proactive', trigger_rule_id })
```
**Unlocks:** auto-open vs manual conversion rate · proactive message effectiveness · data-driven auto-open on/off decision

### session_context — dwell time at first message sent
When a visitor sends their first message, capture how long they spent on the page before engaging. This directly informs the optimal auto-open delay — fire too early and you interrupt; fire too late and they've already left.

> **Scroll depth excluded**: scroll depth adds engineering complexity (continuous event tracking + sampling) for marginal gain in this funnel. Dwell time alone is sufficient to calibrate auto-open delay.

```
GB.track('chat_start', { dwell_s, page_url, visitor_touch_count })
```
**Unlocks:** optimal dwell time for auto-open · bounce signal (chat at <5s means auto-open triggered too early)

## Design Decisions
- **Cycling vs all-at-once**: showing one uplift at a time reduces cognitive load vs a 4-section card. User can navigate with ‹ › controls.
- **Auto-open moved out of featured position**: the old "Auto-open Recommendation" insight card was too prominent. It's now one of 3 actions under the Visitors → Widget Opened uplift.
- **Force capture is NOT default-on**: enabling it removes user choice. It must be a deliberate business decision. The uplift surfaces it without recommending it universally.
- **Monochrome funnel bars**: using a single brand color (no green/purple/teal spectrum) keeps the page scannable and avoids the implication that each step is categorically different.
- **Future widget customization features**: the cycling uplifts panel is the designated landing area for new per-step optimizations (nudge customization, proactive messages, etc.).

## Files
- `gallabox-web-visitor-analytics.html` — main page
- `gallabox-web-channel-settings.html` — linked for auto-open, force capture
- `gallabox-web-empty.html` — linked for widget/agent settings
- Shared localStorage key: `gb_channels` (also used by channel settings)
