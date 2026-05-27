# US-005: Handoff Channel Selector

## Status
- Prototype: Built (GBWebWidget.html, component: ContinuationSection within FormPanel)
- Production: Partially shipped (handoff display style exists; channel selector and pre-fill variables are not yet in production)
- Sprint target: Phase 2

## Problem statement
Visitors who click the WhatsApp button in the web widget are routed to a WhatsApp number. In production, that number must be the same channel configured for Chat Infusion (US-002) — otherwise the inbox agent receiving the WhatsApp message won't see the web session context. Currently there is no way to configure which WA number the handoff goes to, and the CTA button (external redirect) is conflated with the WA handoff control.

## User stories

### Story 1: Select a WhatsApp channel for handoff
**As an** agent builder admin, **I want to** choose which WhatsApp channel visitors are routed to when they click the WhatsApp continuation button, **so that** handoff conversations land in the inbox my team is monitoring.

**Acceptance criteria:**
- [ ] A "Channel" field appears in the WhatsApp Continuation section when handoff is enabled
- [ ] The field shows the currently selected channel name; clicking it opens a dropdown of available WA channels
- [ ] Each channel option shows: channel name, phone number, and a color/WA icon indicator
- [ ] Only one channel can be selected
- [ ] If no channel is selected, the widget disables the WA handoff button in the preview and shows a validation warning in the builder
- [ ] The selected channel is reflected in the Channel Settings tab (US-002) as the "Connected WhatsApp channel" — these two settings must reference the same underlying channel record

### Story 2: Enable / disable WhatsApp handoff
**As an** agent builder admin, **I want to** turn the WhatsApp handoff on or off with a single toggle, **so that** I can launch the widget without a WA entry point if my team isn't ready to handle handoffs.

**Acceptance criteria:**
- [ ] An "Enable WhatsApp handoff" toggle in the WhatsApp Continuation section controls whether the WA button appears in the widget
- [ ] When off, no WA button appears in the widget preview in any entry point style
- [ ] When off, the channel selector, entry point style, and pre-fill message controls are hidden
- [ ] Default state is off for a new agent
- [ ] The toggle section highlights (blue tint) when handoff is enabled

### Story 3: Entry point style
**As an** agent builder admin, **I want to** choose where the WhatsApp button appears inside the widget (header icon, above starters, or compose bar button), **so that** I can match the handoff prominence to my visitors' intent level.

**Acceptance criteria:**
- [ ] Three entry point styles are available: Header, Above starters, Button
- [ ] "Header" — a pulsing WA icon appears in the widget header throughout the conversation; best for B2B/SaaS
- [ ] "Above starters" — a WhatsApp card appears above quick replies; best for real estate, clinics, D2C
- [ ] "Button" — a compact WA chip in the compose bar; minimal, visitor-initiated; best for support-heavy sites
- [ ] Style description and "best for" context is shown below the selector when a style is chosen
- [ ] The widget preview panel updates in real time when the style changes
- [ ] Only shown when handoff is enabled

### Story 4: Pre-fill message with variables
**As an** agent builder admin, **I want to** configure a pre-filled message that appears in the visitor's WhatsApp compose box when they tap the handoff button, **so that** the visitor's first WhatsApp message gives my team context about where they came from.

**Acceptance criteria:**
- [ ] A "Pre-fill message" textarea is shown when handoff is enabled
- [ ] Maximum 256 characters
- [ ] Default text is: "Hi! I was on {{page_header}} and I'd like to know more."
- [ ] Three variable chips are available to insert: `{{source_url}}` (page URL), `{{page_header}}` (H1 or OG title), `{{contact_name}}` (contact name if captured)
- [ ] Clicking a variable chip inserts it at the cursor position in the textarea
- [ ] Char count is shown

### Story 5: Silent tracking for pre-fill variables
**As an** agent builder admin, **I want to** capture page context variables silently (without showing them in the visitor's WhatsApp message), **so that** my team has full source context without the visitor seeing a pre-filled message that contains internal URLs or metadata.

**Acceptance criteria:**
- [ ] A "Silent Tracking" toggle appears in the WhatsApp Continuation section when handoff is enabled
- [ ] When on: `{{source_url}}` and `{{page_header}}` are captured to Lead Context only — they do not appear in the visitor's pre-fill message
- [ ] When on: a note states "Visitor sees a clean message; your team sees the full source"
- [ ] When on: a highlight note confirms "WhatsApp Handoff analytics enabled — visible in Dashboard tab"
- [ ] When off: variables appear literally in the visitor's pre-fill message
- [ ] Silent tracking state is part of the agent config and must be saved with the agent

### Story 6: Separate CTA button from WA handoff
**As an** agent builder admin, **I want** the external CTA button (redirect to a URL) and the WhatsApp handoff button to be configured as separate features with separate controls, **so that** I can enable one without enabling the other and track their performance independently.

**Acceptance criteria:**
- [ ] "CTA Button" section: controls an external redirect button; has its own on/off toggle, label, and redirect URL
- [ ] "WhatsApp Continuation" section: controls the WA handoff; has its own on/off toggle and channel selector
- [ ] Enabling or disabling one does not affect the other
- [ ] In the widget preview, both buttons can appear simultaneously if both are enabled
- [ ] CTA click events and WA handoff events are tracked as separate metric types (see US-004 Stories 4 and 5)

## Key decisions & trade-offs
| Decision | Chosen approach | Alternative considered | Reason |
|---|---|---|---|
| Channel selector sync with Channel Settings | Both tabs reference the same channel record; changing one updates the other | Two independent dropdowns | A mismatch between the handoff channel and the infusion channel would silently break Chat Infusion; single source of truth prevents this |
| CTA vs handoff separation | Two distinct sections with independent toggles | Single "exit action" section with type selector | CTA redirect and WA handoff are fundamentally different actions with different analytics, different APIs, and different user journeys; conflating them complicates future feature work |
| Pre-fill variable chips | Inline chip buttons that insert at cursor | Free-text only | Reduces typos in variable names; makes available variables discoverable without documentation |
| Silent tracking scope | Applies to `{{source_url}}` and `{{page_header}}` only | Applies to all variables | `{{contact_name}}` is personal data the visitor already provided; silencing it makes no sense. URL and page header are internal metadata. |
| Entry point style options | Three fixed options (Header, Above starters, Button) | Custom HTML entry point | Three options cover the known use cases; custom HTML would require sanitisation and is deferred |

## Prototype location
- File: GBWebWidget.html
- Component: ContinuationSection (function `ContinuationSection`)
- Approximate line: 1564–1675
- CTA section: look for `ctaOn`, `ctaLabel`, `ctaUrl` in FormPanel (~line 649, 937)

## Notes for engineering
- The channel selector in ContinuationSection and the "Connected WhatsApp channel" dropdown in ChannelSettingsPanel (US-002) must be kept in sync. The recommended approach is a single `handoffChannel` field on the agent config object that both UI sections read from and write to. Do not store two separate channel references.
- The production WA handoff mechanism opens a `wa.me` deep link with the pre-fill message URL-encoded. Silent tracking strips the variable values before encoding but writes them to Lead Context via the session event pipeline.
- The pre-fill message variables (`{{source_url}}`, `{{page_header}}`, `{{contact_name}}`) are resolved at the moment the visitor taps the handoff button in the embed script — not at session start.
- "Handoff converted" metric (US-004 Story 5) depends on the WA channel receiving the message and linking it back to a session ID via the ref code or contact match. This requires the Channel Settings infusion pipeline (US-002) to be active.
- The prototype's ContinuationSection does not implement the actual channel lookup from the account's WA channels list; it renders a static "brandName or Select a number" placeholder. Production must fetch available channels from the Gallabox channels API.
