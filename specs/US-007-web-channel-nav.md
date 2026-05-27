# US-007: Channel Settings as Standalone Nav Page

## Status
- Prototype: Built (`gallabox-web-channel-settings.html`, accessible via Web sidebar nav)
- Previous location: Tab inside `GBWebWidget.html` (tab id: `channel-settings`)
- Production: Not yet shipped
- Sprint target: Phase 2

## Problem statement
Channel Settings (Chat Infusion configuration, contact matching, auto-resolve) was buried inside an individual agent builder as one of several tabs. This was confusing for two reasons:

1. **Model mismatch** — each web agent IS a web channel. Channel-level settings (which WA number receives context, infusion toggles, token expiry) belong to the channel, not to a single agent configuration. When an account has multiple web agents feeding the same WA channel, users couldn't find channel settings without entering one specific agent.
2. **Pricing confusion** — production charges per active channel (per embed). Burying Channel Settings inside the agent builder obscured this model. Users saw "Settings" and "Channel Settings" as both being per-agent, when only "Channel Settings" has billing implications.

Moving Channel Settings to the global Web nav ("Web > Channel Settings") makes the channel model visible and navigable from the main sidebar without entering any specific agent.

## User stories

### Story 1: Channel Settings accessible from the Web nav
**As an** admin, **I want to** access Channel Settings from the main Web navigation without entering a specific agent, **so that** I can configure infusion behavior for my web channel regardless of which agent is currently selected.

**Acceptance criteria:**
- [ ] A "Channel Settings" entry is present in the Web section of the global sidebar navigation
- [ ] Clicking it navigates to `gallabox-web-channel-settings.html`
- [ ] The page uses the standard section bar pattern (white background, `section-title` + action buttons)
- [ ] The page renders within the `gb-main` content area, to the right of the icon sidebar — consistent with all other list/settings pages
- [ ] The page is reachable from any Web sub-page without going through an agent builder

### Story 2: New users understand the web agent = web channel model
**As a** new user, **I want to** understand that my web agent is a web channel with its own settings, **so that** I understand why channel settings appear as a separate navigation item and what pricing I'm signing up for when I activate the widget.

**Acceptance criteria:**
- [ ] The Channel Settings page header makes clear it configures the web channel (not just an individual agent)
- [ ] The "Connected WhatsApp channel" dropdown ties the web channel to a specific WA number, making the channel relationship visible
- [ ] Documentation links (the `?` help icon) open the Chat Infusion docs page so users can learn the model without contacting support
- [ ] No "SOON" badge is shown on Channel Settings in the sidebar; it is treated as a production-parity page

### Story 3: Agent creator uses Channel URL as the primary channel identifier
**As an** agent creator, **I want to** the Channel URL (the embed script's `data-agent` attribute) to be the primary identifier for my web channel, **so that** I don't need to manage a separate "channel" concept disconnected from the agent I just built.

**Acceptance criteria:**
- [ ] The Channel Settings page does not require the user to "create a channel" separately from creating an agent
- [ ] The connected WA channel selected in Channel Settings is the same record referenced in the Handoff Channel Selector (US-005) — one source of truth
- [ ] Removing or archiving an agent also removes its channel record — there is no orphaned channel configuration

## Key decisions & trade-offs
| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Nav placement | Web section > Channel Settings | Inside each agent builder as a tab | One WA channel can receive context from multiple web agents; per-agent placement implies 1:1 channel-to-agent mapping which is wrong |
| Page structure | Standalone HTML page (`gallabox-web-channel-settings.html`) | React component inside GBWebWidget.html | Standalone page can be navigated to directly and maintains the same architectural pattern as all other list/settings pages |
| Settings scope | Page shows settings for the active/default channel | Separate page per channel with a channel picker | In MVP, most accounts have one web channel; adding a picker complicates v1 without adding value for the majority case |
| Tab removal from agent builder | `channel-settings` tab removed from `allTabs` | Keep tab + link to standalone page | Having both creates confusion about which is canonical; standalone page is the single source of truth |

## Prototype location
- Standalone page: `gallabox-web-channel-settings.html`
- Previous location: `GBWebWidget.html`, tab id `channel-settings`, component `ChannelSettingsPanel` (~line 3233–3506)
- Sidebar entry: managed by `GB.sidebar('web')` in `_gb.js`
- The `ChannelSettingsPanel` React component remains in `GBWebWidget.html` for reference but is no longer rendered by any active tab

## Notes for engineering
- `gallabox-web-channel-settings.html` uses vanilla JS (no React), matching the pattern of all other list/settings pages that use `_gb.js` + `_gb.css`.
- The page persists state to `localStorage` key `gb_channel_settings` — the same key used by the old `ChannelSettingsPanel` — so settings survive a navigation away and back.
- The `_gb.js` sidebar `GB.sidebar('web')` function must include a "Channel Settings" link pointing to `gallabox-web-channel-settings.html` to make this page accessible. Verify the sidebar renders this entry correctly.
- The "Connected WhatsApp channel" on this page and the "Channel" dropdown in `ContinuationSection` (US-005) must reference the same data record. In production, both should read from and write to the same `handoffChannel` field on the agent/channel config. The prototype stores them separately in localStorage for simplicity.
