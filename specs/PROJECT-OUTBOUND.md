# Project: Outbound Campaigns

## Overview
The Outbound Campaigns initiative delivers a visual flow builder and analytics suite for sending broadcast and sequence campaigns over WhatsApp. Teams build multi-step flows with message nodes, condition branches, wait steps, tag actions, and A/B test splits — all on a drag-and-drop canvas. Analytics track delivery, read, and reply rates with correct denominators (rates calculated against delivered count, not sent count) and a separate exit bucket for contacts that never reached the first message.

## Goals (Q2-Q3 2026)
- Ship the 4-tab node inspector system (Content · Logic · Schedule · Audience) for all node types
- Deliver A/B test nodes so teams can statistically validate message variants before full rollout
- Provide per-campaign analytics covering delivery funnel, DND impact, and A/B winner detection
- Enforce correct rate denominators throughout: delivery rate = Delivered ÷ Sent; read/reply/cold rates = ÷ Delivered
- Enable enrollment condition logic (Logic tab) so flows can gate entry without a separate filter step
- Reach 100 active campaigns using the new builder by end of Q3 2026

## Prototype reference
- Campaign list: `gallabox-outbound.html`
- Flow builder / canvas: `outbound-builder.html`
- Analytics page: `outbound-analytics.html`
- Data + node metadata: `_outbound-data.js`

## Feature inventory (prototype vs production)

### In prototype ✅
- 4-tab node inspector: Content, Logic, Schedule, Audience
- Entry nodes: segment-enroll (with srcType variants — segment, broadcast, API trigger, form)
- Message nodes: WA template, custom message
- Condition branch node
- Wait node (delay + time-window)
- Tag action node
- A/B test node (2-variant split, weight sliders, winner detection)
- Exit nodes: exit-success, exit-failure, exit-dropped
- Enrollment conditions (Logic tab of entry nodes)
- Per-node audience estimates
- Campaign list with status badges, priority indicators, DND display
- Analytics: KPI tiles, funnel, per-variant A/B breakdown, delivery trend chart

### Not yet in production ❌
- A/B test node (spec: [see memory — A/B Testing Feature](../memory/project_ab_testing.md))
- Enrollment condition evaluator (prototype uses client-side mock; production needs server-side rule engine)
- Per-campaign audience segment sync (live contact counts)
- Webhook/API trigger entry source
- Multi-variate test (3+ variants) — deferred, 2-variant only in v1

## Key architectural decisions
- **Rate denominators are fixed** — delivery rate = Delivered ÷ Sent; read rate = Read ÷ Delivered; reply rate = Replied ÷ Delivered; cold rate = Cold ÷ Delivered. Never recalculate against Sent for post-delivery rates. If delivered = 0, fall back to Sent as denominator (see ARCHITECTURE.md §Key patterns)
- **exit-dropped ≠ exit-failure** — contacts that fail enrollment conditions exit via `exit-dropped` (never messaged); contacts that were messaged but bounced/opted-out exit via `exit-failure`. These must be tracked in separate analytics buckets
- **Priority 1 = highest** — campaign priority is displayed as 1 (highest) … N (lowest). Do not invert the scale
- **DND defaults ON** — Do Not Disturb is enabled by default on new campaigns; teams must explicitly disable it, reducing accidental late-night sends
- **All entry sources funnel through `segment-enroll`** — no separate node type per entry source; `cfg.srcType` distinguishes segment, broadcast, API trigger, and form sources inside a single node type
- **Node metadata in `_outbound-data.js`** — `NM` (node metadata), `OPTS_AFTER` (adjacency rules), and `PICKER_SECS` are the single source of truth for what nodes exist and what can follow what

## Trade-offs
| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Rate denominators | Post-delivery rates ÷ Delivered | All rates ÷ Sent | Sent includes DND-filtered and undelivered contacts; ÷ Delivered gives accurate engagement signal |
| exit-dropped separation | Separate exit node and analytics bucket | Count as exit-failure | Dropped contacts never received a message; conflating them with failures inflates bounce rate and misrepresents campaign health |
| A/B node as first-class node | Dedicated A/B test node type with weight sliders and winner UI | Condition branch workaround | Makes intent explicit; enables winner-detection logic and per-variant analytics that a condition branch cannot support cleanly |
| DND default | ON | OFF | Prevents accidental sends outside business hours for new users; experienced users can turn it off intentionally |

## Open questions
- What statistical test determines A/B winner — chi-squared on reply/click rate, or a Bayesian model? Minimum sample size?
- Can a single contact be enrolled in multiple campaigns simultaneously, or does enrollment in a higher-priority campaign block lower-priority ones?
- How are multi-channel campaigns (WA + email fallback) represented in the node graph — as sibling branches or as a separate flow type?
- What is the retention period for per-campaign analytics data — rolling 90 days, or indefinite?

## Spec files
| Spec | Description |
|---|---|
| [US-001 (web)](US-001-agent-dashboard.md) | (Web project) Agent dashboard |
| See memory | A/B test node — scope, decisions, files changed (May 2026) |
