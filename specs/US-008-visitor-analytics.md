# US-008: Visitor Analytics Page

## Status
- Prototype: Built (`gallabox-web-visitor-analytics.html`)
- Production: Not yet shipped
- Route: Web → Visitor Analytics (secondary nav)

## Problem statement

The existing Dashboard tab (US-001) only shows sessions where a chat was started. Operators have no visibility into visitors who loaded the page but never interacted — the "silent majority" that represents most of the funnel leakage. Without this data:
- Operators can't justify enabling auto-open (no baseline for "how many visitors see but don't open?")
- Marketing can't evaluate paid campaigns on chat conversion quality, only volume
- There's no signal for which pages are highest-intent for proactive triggers

Visitor Analytics is a separate page (not the agent builder dashboard) that covers ALL visitors, not just those who chatted.

## Key definitions

| Term | Definition | Data source |
|---|---|---|
| **Visitor** | A browser session where the Gallabox widget script loaded. One per `localVisitorId` per channel. | `visitors` collection, `createdAt` |
| **New visitor** | First-ever session for this `localVisitorId` on this channel | `createdAt` matches `attribution.firstTouch.capturedAt` |
| **Return visitor** | `localVisitorId` with at least one prior session on this channel | `touchHistory.length > 1` across time |
| **Widget Visible** | Session where the widget bubble entered the browser viewport | Requires `widget_visible` tracking event (currently missing — see §Missing Events) |
| **Widget Opened** | Session where the widget was opened (any trigger type) | Requires `open_type` on widget open (currently missing) |
| **Chat Session** | Session where the visitor sent at least one message | Join against `chat_sessions` collection |
| **Contact Captured** | Chat session where visitor completed the lead form or was matched to an existing contact | `chat_sessions.contactId` present |
| **Landing URL** | The `page.landing` URL from the visitor's **first-ever session** — NOT the current session's landing URL | `attribution.firstTouch.pageUrl` on the oldest session for this `localVisitorId` |

> **Critical:** Landing URL for ad attribution must come from `firstTouch`, not the current session. A paid-ad visitor who returns directly on day 3 should still be attributed to the original ad campaign.

## User stories

### Story 1: Engagement funnel
**As a** web widget operator, **I want** to see a step-by-step funnel from "visitor loaded page" to "contact captured", **so that** I can identify which step loses the most visitors and prioritise where to intervene.

**Acceptance criteria:**
- [ ] Funnel shows 5 steps: Visitors → Widget Visible → Widget Opened → Chat Started → Contact Captured
- [ ] Each step shows absolute count + % of total visitors
- [ ] Each gap between steps shows number lost and % of previous step
- [ ] Steps 2–3 (Widget Visible / Widget Opened) degrade gracefully to estimated values until tracking events are added

### Story 2: Auto-open signal
**As a** web widget operator, **I want** to see data that tells me whether to enable auto-open, **so that** I make a data-driven decision instead of guessing.

**Acceptance criteria:**
- [ ] The page surfaces a recommendation card when: (a) Widget Visible → Opened drop > 50%, OR (b) Mobile chat rate < 50% of desktop chat rate
- [ ] Recommendation shows 3–4 supporting data points from the current data
- [ ] Recommendation links directly to Channel Settings auto-open configuration
- [ ] After `open_type` event is added, recommendation shows auto-open vs manual-open conversion split instead of estimates

### Story 3: Traffic source breakdown
**As a** marketing lead, **I want** to see visitor volume and chat conversion rate broken down by acquisition channel (direct, paid ads, organic, referral, social), **so that** I can evaluate which channels bring the highest-quality visitors.

**Acceptance criteria:**
- [ ] Channel classification follows `attribution.lastNonDirectTouch.touchType` for last-touch; `attribution.firstTouch.touchType` for first-touch
- [ ] Chat rate per channel = chat sessions from that channel ÷ total visitors from that channel
- [ ] Top paid campaign shown separately, using `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` from `touchHistory` ads entries
- [ ] Attribution model is switchable: First Touch / Last Non-Direct / Linear (linear splits session credit equally across all `touchHistory` entries)

### Story 4: Device and geography breakdown
**As a** web widget operator, **I want** to see how visitors are distributed by device type, OS, browser, country, and city, **so that** I can configure the right widget experience for my primary audience.

**Acceptance criteria:**
- [ ] Device type from `device.type` (desktop/mobile/tablet)
- [ ] OS from `device.os`, browser from `device.browser`
- [ ] Chat rate shown per device type
- [ ] Country/region/city from `geo.*` fields
- [ ] Donut chart shows device split; country list shows top 5 + others

### Story 5: Top pages by chat rate
**As a** web widget operator, **I want** to see which pages on my site have the highest chat conversion rate, **so that** I can prioritise proactive message triggers and auto-open rules on the highest-intent pages.

**Acceptance criteria:**
- [ ] Source URL from `page.current` at chat start time (requires `chat_start` event with page context)
- [ ] Rate = chat sessions on page ÷ total visitors to that page
- [ ] Minimum 20 visitors per page to appear in list (suppress low-traffic noise)
- [ ] Tip shown when top page has > 1.5× homepage rate

### Story 6: Visitor journey table
**As a** web widget operator, **I want** to browse recent visitor records showing their multi-touch journey, **so that** I can spot unusual patterns and verify attribution data quality.

**Acceptance criteria:**
- [ ] Table shows: visitor ID (anonymised), first seen timestamp, touch journey (coloured pips by channel), last source, device/OS, location, chat started yes/no
- [ ] Touch pips use colour coding: blue=ads, grey=direct, green=organic, purple=referral, amber=social
- [ ] "View all" links to a full paginated list (future)
- [ ] Table is read-only; clicking a row does nothing in prototype (production: open visitor profile)

### Story 7: Channel dropdown (website URL filter)
**As a** web widget operator with multiple websites, **I want** to select which website's data I'm viewing, **so that** I see channel-specific analytics rather than aggregate data.

**Acceptance criteria:**
- [ ] Channel dropdown shows website URLs provisioned during onboarding (from `channelId` filter)
- [ ] Selected channel name is shown with a green online indicator
- [ ] Switching channel reloads all analytics for that channel's visitor data
- [ ] Default: most recently active channel

## Missing events (blocks full accuracy)

These events are not yet fired by the widget script. Until they are added, the affected funnel steps show estimates.

| Event | When to fire | Fields needed | What it unlocks |
|---|---|---|---|
| `widget_visible` | Widget bubble enters viewport (IntersectionObserver) | `agent_id`, `scroll_pct`, `time_on_page_s` | True impression rate; above-vs-below-fold split |
| `widget_open` | Any widget open (click, auto-open, or proactive message click) | `open_type: 'click|auto|proactive'`, `trigger_rule_id` | Auto-open vs manual conversion split; proactive message effectiveness |
| `chat_start` context | At first message sent | `scroll_pct`, `dwell_s`, `page_url`, `visitor_touch_count` | Optimal auto-open timing; high-intent page sections; bounce signal |

## Data model notes

All analytics derive from the `visitors` collection document shape:

```js
{
  localVisitorId: String,   // unique visitor across sessions on same channel
  channelId: ObjectId,      // maps to web channel (website URL)
  accountId: ObjectId,
  createdAt: Date,          // first ever session for this visitor
  updatedAt: Date,          // last activity
  attribution: {
    touchHistory: [{ touchType, capturedAt, pageUrl, pageTitle, pageReferrer,
                     utm_source?, utm_medium?, utm_campaign?, utm_term? }],
    firstTouch: { ... },           // first-ever touch — use for landing URL ad attribution
    lastTouch: { ... },            // most recent touch of any type
    lastNonDirectTouch: { ... }    // last paid/earned touch — use for campaign ROI attribution
  },
  device: { type, os, browser, browserVersion, viewport },
  geo: { country, countryCode, region, city, timezone },
  page: { current, landing, referrer, title }
}
```

Chat session relationship: Visitor Analytics joins `visitors` with `chat_sessions` on `localVisitorId + channelId`. Chat sessions are NOT embedded in the visitor document.

## Key decisions

| Decision | Chosen | Alternative considered | Reason |
|---|---|---|---|
| Separate page vs Dashboard tab | Separate `/web/visitor-analytics` page | Add a tab in agent builder | Dashboard is per-agent; Visitor Analytics is channel-wide (crosses agents) |
| Landing URL definition | `firstTouch.pageUrl` from earliest session | Current session `page.landing` | A return visitor who came via direct should not lose ad attribution from their original visit |
| Channel selector shows website URLs | Yes — URL from onboarding | WhatsApp channel dropdown | Visitor data is keyed to web channel (site), not WhatsApp number |
| Widget Visible = page load until event added | Estimated from page load | Block metric entirely | Graceful degradation is better than a missing funnel step; note the estimate clearly |
| Attribution models available | First Touch, Last Non-Direct, Linear | Last Touch (including direct) | Last Touch including direct is useless (most sessions end with direct); Last Non-Direct is the meaningful campaign model |

## Prototype notes

- File: `gallabox-web-visitor-analytics.html`
- Mock data: inline `var ATTR`, `var VISITORS` in `<script>` block
- Funnel numbers: 2,841 visitors → 2,614 visible → 891 opened → 312 chat → 248 contact
- Accessible via Web → Visitor Analytics in `_gb.js` secondary nav
- Auto-open recommendation card links to `gallabox-web-channel-settings.html`
- "Widget Visible" step is an estimate until `widget_visible` event is tracked in production
