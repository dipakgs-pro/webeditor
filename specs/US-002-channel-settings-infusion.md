# US-002: Channel Settings — Chat Infusion

## Status
- Prototype: Built (GBWebWidget.html, component: ChannelSettingsPanel; inbox side in _inbox-components.js)
- Production: Not yet shipped
- Sprint target: Phase 2

## Problem statement
When a website visitor moves from the web widget to WhatsApp, the human agent taking over in Gallabox inbox has no idea what the visitor did on the site or what the AI already learned. Chat Infusion bridges that gap by injecting the web session context directly into the WhatsApp thread at the moment the contact is matched, so agents start every handoff conversation fully informed.

## User stories

### Story 1: Connect a WhatsApp channel (Layer A)
**As an** agent builder admin, **I want to** select which WhatsApp channel receives web session context from this agent, **so that** infusion entries appear in the correct inbox thread when a visitor is matched.

**Acceptance criteria:**
- [ ] A "Connected WhatsApp channel" dropdown lists all WhatsApp channels connected to the Gallabox account
- [ ] Each channel option shows the channel name, phone number, and a color indicator
- [ ] Only one channel can be selected at a time per web agent
- [ ] The dropdown is disabled (greyed out) when the "Show web context in inbox" master toggle is off
- [ ] Selection is persisted when the user clicks Save
- [ ] A "?" help link opens the docs page for Chat Infusion

### Story 2: Master toggle — show web context in inbox
**As an** agent builder admin, **I want to** enable or disable web context injection for this agent with a single toggle, **so that** I can turn the feature on or off without losing my other infusion settings.

**Acceptance criteria:**
- [ ] A "Show web context in inbox" toggle is the primary on/off control for the entire infusion feature
- [ ] When off, all sub-toggles (session started entry, session summary entry, AI summary, auto-resolve, ref code) are visually disabled but retain their last values
- [ ] When off, no context entries are written to any inbox thread
- [ ] The feature is labeled as "Free · No AI credits used" in the UI

### Story 3: Session started entry
**As a** Gallabox inbox agent, **I want to** see a "session created" chip in the WhatsApp thread at the moment a web visitor is matched to a contact, **so that** I know when this conversation originated on the website and can read the web context that follows.

**Acceptance criteria:**
- [ ] A "Session started entry" toggle controls whether the chip is injected
- [ ] The chip appears as a single line in the thread timeline (not as a message bubble)
- [ ] The chip is injected at match time — when the visitor opens WhatsApp, not when they submitted the web form
- [ ] The chip is labeled "Free · No AI credits" in the settings UI
- [ ] If the master toggle is off, this entry is never written regardless of this toggle's state

### Story 4: Session summary entry
**As a** Gallabox inbox agent, **I want to** see a context card in the WhatsApp thread when the web session ends, showing intent, fields captured, and lead score, **so that** I can start the conversation knowing what the visitor wants without asking them to repeat themselves.

**Acceptance criteria:**
- [ ] A "Session summary entry" toggle controls whether the context card is injected
- [ ] The card is injected when the session resolves (not during the session)
- [ ] The card displays structured fields only (no AI prose) when "Add AI-generated summary" is off
- [ ] The card displays intent type, captured fields, and lead score as structured data
- [ ] The card is labeled "Free · Structured fields only" in the settings UI
- [ ] If the master toggle or the session summary toggle is off, no card is written

### Story 5: AI-generated summary
**As a** Gallabox inbox agent, **I want to** see an AI-written natural-language summary alongside the structured fields in the context card, **so that** I can understand the visitor's situation without interpreting raw form values.

**Acceptance criteria:**
- [ ] "Add AI-generated summary" is a nested sub-toggle under "Session summary entry"
- [ ] The sub-toggle is disabled when "Session summary entry" is off
- [ ] When enabled, the context card includes: intent score, natural-language summary, and AI-extracted fields
- [ ] The cost is displayed as "1 AI credit / session" in the settings UI
- [ ] A credit information note explains: credits are charged once per successful summary; dropped sessions and anonymous (unmapped) sessions are never charged
- [ ] A link to the AI credits documentation is shown in the note

### Story 6: Auto-resolve web session
**As an** agent builder admin, **I want to** configure the web session to close automatically when a visitor moves to WhatsApp, **so that** the summary generates immediately and the inbox agent gets context without waiting for a manual close.

**Acceptance criteria:**
- [ ] An "Auto-resolve web session" toggle controls automatic closure
- [ ] When enabled, a "Resolve trigger" dropdown lets the admin choose: On WhatsApp handoff click, After 5 min inactivity, After 15 min inactivity, Manual only
- [ ] The resolve trigger dropdown is disabled when auto-resolve is off
- [ ] Selecting "On WhatsApp handoff click" triggers resolution at the moment the visitor taps the WA handoff button in the widget
- [ ] When the session resolves, summary generation starts immediately if the summary entry toggle is on

### Story 7: Fallback session matching (Ref code)
**As an** engineer or agent builder admin, **I want to** enable a short-lived session token that is appended to the WhatsApp handoff URL for fallback matching, **so that** web sessions can be matched to contacts even when cookie-based matching fails.

**Acceptance criteria:**
- [ ] A "Fallback session matching" toggle enables the ref code mechanism
- [ ] The token is an internal session identifier — it must NEVER be shown to customers or included in visible message text
- [ ] The token expires 30 minutes after the session starts; after expiry, the inbox shows "Ref · expired" for that session's fallback entry
- [ ] Cookie-based matching and phone number matching remain functional after token expiry
- [ ] The toggle is labeled "Free · Recommended · Token expires after 30 min" in the settings UI
- [ ] When disabled, cookie/phone matching still works; only the fallback path is removed

### Story 8: Save and persist settings
**As an** agent builder admin, **I want to** save all channel settings with a single Save button, **so that** my configuration persists across sessions.

**Acceptance criteria:**
- [ ] A "Save changes" button is present in the sticky header and at the bottom of the page
- [ ] On successful save, the button briefly shows "Saved" with a green background
- [ ] A "Cancel" button discards unsaved changes and reverts to the last saved state
- [ ] All toggle values, the selected WA channel, and the resolve trigger are persisted

## Key decisions & trade-offs
| Decision | Chosen approach | Alternative considered | Reason |
|---|---|---|---|
| Two-layer channel setting | Layer A (here, per-agent) sets the primary receiving channel; Layer B (per-channel in channel settings) is a separate opt-in | Single setting in one place | The same WA channel can receive context from multiple web agents; per-channel opt-in (Layer B) lets channel owners gate what they receive without touching agent config |
| Ref code visibility | Token is internal only, never surfaced to customers | Show token to customer as a "session code" | Token is a system identifier; showing it creates support confusion and potential abuse |
| Token expiry behavior | Show "Ref · expired" in inbox after 30 min; do not fail the match | Hard-fail the session match after expiry | Cookie/phone matching still works after expiry; expiry only affects the fallback path, not the primary match |
| AI credits gating | AI summary sub-toggle is disabled unless session summary entry toggle is on | Allow enabling AI summary independently | AI summary has no meaning without a summary entry to attach it to; enforcing the dependency prevents misconfiguration |
| Settings placement | Channel Settings is a separate tab from Web Widget | Embed within Web Widget tab | Infusion config is per-agent but affects a separate surface (inbox); separation makes ownership clearer |

## Prototype location
- File: GBWebWidget.html
- Component: ChannelSettingsPanel (function `ChannelSettingsPanel`)
- Inbox-side components: _inbox-components.js (CreateEntry chip, ResolveCard, GeneratingStub)
- Approximate line: 3232–3506

## Notes for engineering
- The Channel Settings tab is hidden when the builder opens in `?mode=new`. It is only available after the agent is first published.
- The connected WA channel selected here (Layer A) must be reflected in the Handoff channel selector in the Web Widget tab (US-005). These must reference the same underlying channel record — one should be the source of truth in the data model.
- The inbox demonstration of infusion entries (CreateEntry chip, ResolveCard) is implemented in `_inbox-components.js` and shown in `gallabox-web-inbox.html`. The production implementation lives in the Gallabox inbox codebase, not in this file.
- Session matching priority order: (1) phone number match, (2) cookie match, (3) ref code fallback. All three should be attempted before declaring a session anonymous.
- "Dropped sessions" (visitors who never completed handoff or form) must never consume AI credits even if auto-resolve fires due to inactivity.
