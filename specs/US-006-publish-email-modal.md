# US-006: Publish → Send Developer Email

## Status
- Prototype: Built (GBWebWidget.html, modal triggered by "Publish Agent" button)
- Production: Not yet shipped
- Sprint target: Phase 2

## Problem statement
Agent owners who build a web agent are often not the person who will install the embed script on the website. Today there is no way to send the script and installation docs to a developer directly from the builder — owners must copy the script manually, paste it into an email, and find the docs link themselves. This creates friction and errors (wrong script version, missing `data-agent` attribute). The publish modal solves this by letting the owner send a complete installation package in one click.

## User stories

### Story 1: Send embed script to developer
**As an** agent owner, **I want to** send the embed script to my developer via email directly from the Publish Agent button, **so that** they can install the widget without me finding and forwarding the docs.

**Acceptance criteria:**
- [ ] Clicking "Publish Agent" opens a modal titled "Send installation guide to your developer"
- [ ] The modal has an email input field with placeholder "developer@yourcompany.com"
- [ ] Clicking "Send Email →" triggers a 1-second simulated send, then shows a success state: "✓ Email sent to [email]"
- [ ] The modal can be dismissed with a Cancel button at any point before or after sending
- [ ] After success, the modal closes automatically or can be closed with the Cancel button (now labeled accordingly)
- [ ] The email input is type="email" so mobile keyboards show the email keyboard

### Story 2: Developer receives complete installation guide
**As a** developer, **I want to** receive a complete installation guide email (script tag, placement instructions, docs link), **so that** I can deploy the widget in one sitting without asking follow-up questions.

**Acceptance criteria:**
- [ ] The email contains the embed script tag pre-filled with the correct `data-agent` ID
- [ ] The email includes placement instructions (where in the HTML to put the script)
- [ ] The email includes a link to the Gallabox web widget documentation
- [ ] The `data-agent` value in the email is the actual agent ID, not a placeholder
- [ ] The email is sent from a Gallabox no-reply address, not from the agent owner's personal email

### Story 3: Script preview in the publish modal
**As an** agent owner, **I want to** see the embed script snippet in the publish modal, **so that** I can copy it myself if I prefer not to email it.

**Acceptance criteria:**
- [ ] A read-only code block showing the full script tag is visible in the modal before and after sending
- [ ] The code block uses a monospace font on a dark background for readability
- [ ] Selecting the code block text (click-to-select-all) is enabled via `userSelect: all`
- [ ] The script shown is identical to what would be emailed
- [ ] The code block is always visible regardless of the pubSent state

## Key decisions & trade-offs
| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Modal vs inline | Modal overlay | Inline section below Publish button | A dedicated modal focuses attention and prevents accidental dismissal; inline would be easy to scroll past |
| Email vs copy-only | Email input + Send Email button | Copy-to-clipboard button only | Many agent owners hand off to a developer; copy-only leaves them to write the email themselves and risk omitting instructions |
| 1-second delay before success | Simulate async with setTimeout(1000) | Instant success | Instant success feels broken; a brief delay signals that work is happening and makes the success state feel real |
| `data-agent` value in prototype | Shown as `[agentId]` placeholder | Use a fake UUID | The real ID is not available in the prototype; placeholder signals to engineers that the production implementation must inject the actual agent record ID |
| Modal close after success | User must click Cancel to close | Auto-close after 3s | Auto-close can feel abrupt if the user wants to copy the script; keeping the modal open lets them copy before dismissing |

## Prototype location
- File: `GBWebWidget.html`
- Component: modal rendered inline inside `GallaboxBuilder` function when `pubModal === true`
- State vars: `pubModal`, `devEmail`, `pubSent`
- Trigger: "Publish Agent" button in top nav (`onClick: function(){setPubModal(true);}`)
- Approximate line: 3651–3699 (after main content area)

## Notes for engineering
- The production `data-agent` value must be the agent's UUID from the Gallabox backend, not a frontend-generated ID.
- The email sending endpoint should accept: `{agentId, recipientEmail, agentName}` and return a job ID for status polling — the prototype simulates this with a 1-second timeout.
- The script preview code block should NOT be inside a `<textarea>` — use a styled `<pre>` or `<code>` block with `userSelect: all` so the user can triple-click to select everything.
- Consider adding a "Copy script" button alongside "Send Email →" in v2 so copy-first users have an explicit action.
