# US-009 — Visitor Analytics: Conversion Uplifts Funnel

## User Story
As a Gallabox web agent owner, I want to see a structured funnel from visitor to contact captured — and get actionable recommendations for each drop-off step — so I can improve conversion without guessing which lever to pull.

## Context
The Engagement Funnel shows 6 steps: Visitors → Widget Visible → Widget Opened → Chat Started → WA Handoff → Contact Captured. Each step has a drop-off gap. The Conversion Uplifts panel surfaces one actionable recommendation at a time, cycling through 4 areas.

## Funnel Steps
| Step | Typical % | Key drop cause |
|------|-----------|---------------|
| Visitors | 100% | — |
| Widget Visible | ~92% | Long pages, widget below fold |
| Widget Opened | ~31% | No nudge / no auto-open |
| Chat Started | ~11% | Poor welcome message / no starters |
| WA Handoff | ~9.9% | Button copy, agent header not optimised |
| Contact Captured | ~8.7% | No contact capture journey / force off |

## Uplift Areas
1. Widget Visible → Opened (−66%): Enable nudge, Customize nudge, Auto-open
2. Widget Opened → Chat Started (−65%): Welcome message, Conversation starters  
3. Chat Started → WA Handoff (−10%): Handoff button copy, Conversation starter, Agent header
4. WA Handoff → Contact Captured (−11%): Contact capture journey, Force capture (business-requirement opt-in)

## Acceptance Criteria
- [ ] Funnel shows all 6 steps with correct drop percentages
- [ ] Each gap line shows −N% and a warn/ok badge based on severity
- [ ] WA Handoff step appears between Chat Started and Contact Captured
- [ ] Cycling uplift panel shows 1 uplift area at a time with prev/next controls
- [ ] Each uplift action links to the relevant settings page
- [ ] "Force capture" is clearly labelled as a business-requirement toggle (not default-on)
- [ ] Empty state shown when no web channels are configured in gb_channels
- [ ] Channel dropdown reads from gb_channels localStorage (shared with Channel Settings)
- [ ] Uplift panel is positioned INSIDE the funnel card, below Contact Captured step

## Design Decisions
- **Cycling vs all-at-once**: showing one uplift at a time reduces cognitive load vs a 4-section card. User can navigate with ‹ › controls.
- **Auto-open moved out of featured position**: the old "Auto-open Recommendation" insight card was too prominent. It's now one of 3 actions under the Widget Visible → Opened uplift.
- **Force capture is NOT default-on**: enabling it removes user choice. It must be a deliberate business decision. The uplift surfaces it without recommending it universally.
- **Future widget customization features**: the cycling uplifts panel is the designated landing area for new per-step optimizations (nudge customization, proactive messages, etc.).

## Files
- `gallabox-web-visitor-analytics.html` — main page
- `gallabox-web-channel-settings.html` — linked for auto-open, force capture
- `gallabox-web-empty.html` — linked for widget/agent settings
- Shared localStorage key: `gb_channels` (also used by channel settings)
