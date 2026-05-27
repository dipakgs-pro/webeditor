# Inbox Infusion — Research, Architecture & Phased Plan

---

## Section 1 — Research & Thinking

### The core question
When a customer engages with a web agent before (or during) a WhatsApp conversation, how do we get that context into the agent's hands — with the least possible overhead, the most relevant signal, and without cluttering the thread or requiring any ongoing state management?

### What we considered and ruled out

#### Option A: Rich coupled card (the starting point)
One card, always in thread, showing create + resolve together. A "Previous sessions" accordion at the bottom.

**Why this is wrong:**
- Create and resolve don't happen at the same time. Coupling them forces a state update when resolve fires, which means indexing an existing record.
- "Previous sessions" inside the card is redundant with the thread itself. If the agent scrolls up they see all prior context events chronologically. Bundling it inside the current card adds noise and maintains a data structure that doesn't need to exist.
- Any update to an existing injected message requires a write to message storage. Append-only is zero-cost by comparison.

#### Option B: Full rich card injected once on resolve only
Wait for resolve, inject everything together when summary is ready.

**Why this is suboptimal:**
- If the customer texts WhatsApp before resolve fires (e.g., immediately after clicking "Chat on WhatsApp"), the agent sees nothing. The injection arrives mid-conversation, potentially after the agent has already typed a generic reply.
- The agent loses the awareness that a web session happened at all until summary is complete.

#### Option C: Two independent, immutable injections (chosen)
`session.create` fires as a single-line system note when contact is mapped.  
`session.resolve` fires as a compact expandable card when summary is ready (~10s after session ends).  
Both are append-only. Neither is ever updated.

**Why this wins:**
- Zero indexing cost. Two writes total per session, ever.
- Agent gets awareness immediately (create line) and intelligence when it's ready (resolve card).
- If resolve never fires (dropped session), the create line is still there — the agent knows the customer was on the web.
- The thread IS the history. Scroll up = all prior sessions visible at their natural timestamps. No accordion, no "previous sessions" widget.
- 30-day window is a filter at injection time, not a query. If a session is older than 30 days when infusion would fire, skip it. Simple.

---

### Why not inject everything?

Three reasons:

**1. Attention economics.** An agent handles many threads. If every page visit, every bounce, every 30-second chat fires an injection, the thread fills with noise. The agent stops trusting what's in there. A resolved session (contact engaged, fields captured, summary generated) is a high-signal event. That's the only thing that earns a thread entry.

**2. Storage economics.** 30 days × N sessions × average thread volume = bounded. No time-to-live cleanup needed for injected messages if the 30-day gate is applied at injection time. The data never enters the thread to begin with.

**3. Summary timing.** The ~10s async window for summary generation means we can't inject everything at once anyway. The two-event model turns that constraint into a feature: create gives immediate awareness, resolve delivers the intelligence when it's actually ready. No placeholder messages, no "generating…" states to manage.

---

### Contact mapping and injection timing

The `create` injection fires at the moment the session is mappable — not necessarily at session start.

| Mapping method | When `create` fires |
|---|---|
| Cookie present | Immediately at session start |
| Phone captured during chat | At the moment phone is matched/created |
| Business API inject | At the moment API call is processed |
| Ref lookup (customer texts WA) | At the moment Ref is matched |
| Anonymous — never mapped | Never injected |

This means the create entry in the WA thread carries an accurate "contact matched" timestamp. It is not the session start time — it is the mapping time. The session start time is still stored and shown inside the entry, but the thread timestamp is the mapping moment.

The `resolve` entry fires once: when the session status changes to Resolved AND summary generation is complete. It is injected as a new thread entry at that wall-clock time. If a WA thread doesn't exist yet when resolve fires, the entry is queued and injected on first WA thread creation — but only if the session is less than 30 days old.

---

### The "Past sessions" removal rationale

The previous design included a "Previous sessions" accordion at the bottom of the context card. This was a mistake in information architecture:

- It duplicated information already visible by scrolling the thread
- It required the card to know about sibling sessions — a query that adds load and coupling
- It grew unbounded without a hard cap

With the two-event model:
- All prior sessions appear as their own create/resolve entries in the thread at the timestamps they occurred
- The agent scrolls up to see them — the same motion they use to read prior messages
- No query, no widget, no coupling

The 30-day window means a thread will contain at most 30 days of session events. Old sessions are not visible in the thread (they're in the contact profile for longer-term audit), which keeps the thread clean and action-relevant.

---

### Efficiency / ROI summary

| Factor | Old approach | New approach |
|---|---|---|
| Writes per session | 1 (update when resolve fires) | 2 (create append + resolve append) |
| Index updates | Yes (update existing) | None (append-only) |
| Past sessions query | Yes (per card render) | None |
| Agent awareness before summary | No | Yes (create line) |
| Thread footprint | 1 card + accordion | 1 line + 1 card |
| 30-day window | Applied on read | Applied at injection time |
| State to manage | Live → Generating → Ready → Injected | Create: fire once. Resolve: fire once. |
| AI context extraction | Separate call | rawLog available on resolve |

---

## Section 2 — Architecture

### Two-event injection model

```
WEB SESSION LIFECYCLE
─────────────────────────────────────────────────────────────────

SESSION START
    │
    ▼
Contact mapping attempt
    │
    ├── Cookie found ──────────────────────────────────────────┐
    │                                                           │
    ├── Anonymous: capture phone/email during session ────────┤
    │                                                           │
    ├── Anonymous: business API injects contact info ─────────┤
    │                                                           │
    └── Anonymous: no mapping achieved ─────────────────────── ✗ (no injection)
                                                               │
                                                               ▼
                                              ┌────────────────────────────────┐
                                              │  EVENT 1: session.create       │
                                              │  ─────────────────────────────  │
                                              │  Fires: at mapping moment      │
                                              │  Type: single-line system note  │
                                              │  Immutable: yes                │
                                              │  Content:                       │
                                              │   · Session ref (Ref:100041)   │
                                              │   · Source URL                 │
                                              │   · Session start time         │
                                              │   · Mapping method label       │
                                              └────────────────────────────────┘

SESSION ACTIVITY
    │
    ▼
Customer ends session / clicks "Chat on WhatsApp"
    │
    ▼
Resolve trigger
(auto-resolve: ON | manual | Ref lookup)
    │
    ▼
Async summary generation (~10s)
    │   · Pull rawLog
    │   · LLM → summary (≤600 chars)
    │   · LLM → intent score (0–10)
    │   · LLM → structured fields (intent type, budget, location, timeline)
    │
    ▼
                   ┌────────────────────────────────────────────┐
                   │  EVENT 2: session.resolve                  │
                   │  ─────────────────────────────────────────  │
                   │  Fires: when summary is ready              │
                   │  Type: compact expandable card             │
                   │  Immutable: yes                            │
                   │  Content:                                   │
                   │   · resolve label + timestamp              │
                   │   · Stats: X msgs · Y min (inline)         │
                   │   · Status text                            │
                   │   · Lead summary card (collapsed)          │
                   │     — intent type, fields, score, summary  │
                   └────────────────────────────────────────────┘
                           │
                           ▼
               Active WA thread exists?
                   │           │
                  YES           NO
                   │           │
                   ▼           ▼
              Inject now    Queue (TTL: 30 days)
                            Inject on first WA thread creation
                            Skip if session > 30 days old
```

---

### Visual shape of the two events in thread

```
WA THREAD (agent view — scrolling down)

  ···earlier messages···

  ┌───────────────────────────────────────────────────────────┐
  │  🌐  Web session  ·  Ref:100041  ·  7:27 AM               │ ← EVENT 1 (create)
  │      pricing.gallabox.com/villas  ·  Contact via cookie   │   Single-line chip
  └───────────────────────────────────────────────────────────┘

  ···customer may text here, agent may reply here···

  ┌───────────────────────────────────────────────────────────┐
  │  ● Context injected  ·  7:34 AM        View summary ▾     │ ← EVENT 2 (resolve)
  └───────────────────────────────────────────────────────────┘  Collapsed (default)

  ↓ on expand:

  ┌───────────────────────────────────────────────────────────┐
  │  ● Context injected  ·  7:34 AM        View summary ▲     │
  │  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  │
  │  [create]  ·  7:27 AM                                      │
  │  Web session started · contact matched                     │
  │  🌐 pricing.gallabox.com/villas         View chat →        │
  │  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  │
  │  [resolve]  ·  7:34 AM          10 msgs  ·  7 min          │
  │  Lead context written · contact record updated             │
  │  ┌─────────────────────────────────────────────────────┐  │
  │  │  ● LEAD SUMMARY — AI GENERATED                      │  │
  │  │  Intent    Villa Purchase                           │  │
  │  │  Budget    50L – 1 Crore                            │  │
  │  │  Location  Chennai                                  │  │
  │  │  Timeline  Within 3 months                         │  │
  │  │  Lead score  ████████░░  8/10                       │  │
  │  │                                                     │  │
  │  │  Ganesh is actively looking for a villa in          │  │
  │  │  Chennai, budget 50L–1Cr, within 3 months…         │  │
  │  └─────────────────────────────────────────────────────┘  │
  └───────────────────────────────────────────────────────────┘

  ···later messages···
```

Note: If the session was dropped (no resolve), only the EVENT 1 chip appears. The agent knows the customer was on the web but left. No summary card, no noise.

---

### Session data model

```js
{
  // Identity
  id: 's1',
  refCode: '100041',                    // lookup code; generated at session start
  status: 'Resolved',                   // Live | Resolved | Dropped

  // Source
  sourceUrl: 'pricing.gallabox.com/villas',
  startedAt: '7:27 AM',
  endedAt:   '7:34 AM',
  msgCount:  10,
  durationMin: 7,
  sessionId: '69f2b713…',

  // Contact mapping
  contactMapping: {
    status: 'mapped',                   // mapped | anonymous | pending | failed
    contactId: 'c-8821',
    method: 'cookie',                   // cookie | phone_capture | business_inject
                                        // | wa_ref | ip_fallback | manual
    mappedAt: '7:27 AM',               // when mapping resolved (create fires here)
    anonUntil: null,                    // if started anon, when it became known
    retroactive: false                  // true = prior messages backfilled
  },

  // Infusion state
  infusion: {
    createInjectedAt: '7:27 AM',        // when EVENT 1 fired
    resolveInjectedAt: '7:34 AM',       // when EVENT 2 fired
    targetThreadId: 'wa-thread-9921',
    method: 'auto_resolve',             // auto_resolve | wa_ref | manual | queued
    summaryReadyAt: '7:34:10 AM',       // ~10s after resolve trigger
    withinWindow: true                  // session age < 30 days at injection time
  },

  // Lead intelligence (populated on resolve)
  fields: {
    intentType: 'Villa Purchase',
    budget: '50L – 1 Crore',
    location: 'Chennai',
    timeline: 'Within 3 months',
    leadScore: 8,
    summary: 'Ganesh is actively looking for a villa in Chennai…'
  },

  // Raw conversation (available for AI context extraction)
  rawLog: [
    { id:'w1', who:'in',  text:'villas',               time:'7:27 AM' },
    { id:'w2', who:'bot', text:'What is your budget?', time:'7:27 AM' },
    // …
  ]
}
```

---

### Contact mapping decision table

| State at session start | Mapping fires | EVENT 1 fires | EVENT 1 label |
|---|---|---|---|
| Cookie present | Immediately | At session start | "Contact via cookie" |
| No cookie, phone captured mid-session | At capture moment | At capture moment | "Contact via phone" |
| No cookie, business API injects | At API call | At API call | "Contact via form" |
| No cookie, customer texts Ref on WA | At Ref match | At Ref match | "Contact via Ref" |
| No cookie, no capture ever | Never | Never | — |

EVENT 2 (`session.resolve`) always fires independently of mapping. But if contact is anonymous, the resolve entry is queued (not injected) — it only injects when/if the contact is later mapped and a WA thread exists. After 30 days, queued entries are discarded.

---

### 30-day window logic

```
On any infusion trigger:

  if (session.startedAt < now - 30 days):
    discard — do not inject
    log: "Session outside 30-day window, skipped"

  else:
    proceed with injection
```

This is checked once, at the point of injection. There is no background job reaping old sessions from threads. Sessions that were injected while within the window remain in the thread permanently (they are immutable log entries).

---

## Section 3 — Configuration / Toggles

Per-web-agent settings (stored in web agent config):

| Toggle | Default | Description |
|---|---|---|
| **Contact capture** | ON | Bot attempts to capture phone/email during session. OFF = anonymous only. |
| **Auto-resolve on WA handoff** | ON | When customer clicks "Chat on WhatsApp," the web session auto-resolves. Summary generation begins immediately. |
| **Ref code in handoff** | ON | `Ref:XXXXX` embedded in the WA handoff template message and shown on the "moving to WhatsApp" screen. Enables Ref-based mapping if cookie fails. |
| **30-day infusion window** | 30 days | Only sessions within this window are injected. Configurable: 7d, 14d, 30d. Never longer than 30d. |
| **Create event injection** | ON | Whether EVENT 1 (single-line chip) is injected. Turning this OFF means agents only see resolved sessions, not live/dropped ones. |
| **Resolve event injection** | ON | Whether EVENT 2 (summary card) is injected. Turning this OFF disables AI summary infusion entirely. |
| **AI context extraction** | ON | Whether rawLog is made available to the WA AI agent for conversational use. Does not affect visual injection. |
| **Summary in resolve card** | ON | Whether the ≤600-char AI summary paragraph appears inside the resolve card. Turning OFF shows only structured fields + score. |
| **Dropped session inject** | OFF | Whether EVENT 1 is injected for dropped (no resolve) sessions. Default OFF to avoid noise. |

---

## Section 4 — Phased Plan

### Phase 0 — Foundation ✓ Complete

**What was built:**
- `ChannelSettingsPanel` component in `GBWebWidget.html` — full Channel Settings tab with WA channel selector, infusion toggles (create/resolve/AI summary), auto-resolve trigger dropdown, contact mapping toggles
- Credit model UI: AI summary tier nested under resolve event toggle, "1 AI credit / session" badge, info box when enabled
- `SESSION_DONE` extended with `intentType`, `leadScore`, `summary` fields
- `ContextCard` with expand/collapse — compact header with "View summary ▾", expanded panel shows CreateCard + ResolveCard + LeadSummary sub-components
- `ARCHITECTURE.md` updated with new file entries and Channel Settings tab description

**What remains:** ContextCard still couples create/resolve in one expandable panel; PastSessions still present; session data model missing `refCode`, `contactMapping`, `infusion` blocks; ChannelSettingsPanel state not persisted to `cfg`.

---

### Phase 1 — Inbox: Split Create + Resolve, Data Model

**Goal:** Create and resolve are independent thread entries. No past sessions widget.

**Files changed:**
- `gallabox-web-inbox.html`
- `inbox-infusion.md` (this section)
- `ARCHITECTURE.md`

**Changes:**

1. **Session data model** — extend `SESSION_DONE` and `SESSIONS_INIT` with:
   - `refCode: '100041'`
   - `contactMapping: { status, contactId, method, mappedAt }`
   - `infusion: { createInjectedAt, resolveInjectedAt, withinWindow: true }`

2. **Remove `PastSessions`** from `ContextCard` entirely — thread scroll is the history.

3. **`CreateEntry` component** — new standalone single-line chip:
   - Content: `🌐 Web session · Ref:100041 · 7:27 AM · via cookie`
   - Left teal border, no expand
   - "View chat →" opens overlay
   - Renders at mapping timestamp

4. **`ResolveCard` component** — true standalone entry:
   - Compact header (always visible): `● Context injected · 7:34 AM [View summary ▾]`
   - Expand: create section + resolve section + LeadSummary
   - Stats inline in resolve row header (10 msgs · 7 min)

5. **Async simulation** — "Simulate resolve" button:
   - Immediately shows a `generating...` stub card
   - After 2s delay: appends full ResolveCard (no update — new entry)

6. **`ContextCard` wrapper** stays but becomes thin: decides what to render based on `sess.status` and `isExp` state

**Outcome:** Thread shows two separate, immutable events. Scrolling up replaces "Previous sessions." Card is compact by default.

---

### Phase 2 — Local LLM: Spec + Documentation Only

**Goal:** Document LLM integration architecture for engineering. HTML prototype stays on mock data — prototype remains shareable.

**Files changed:**
- `inbox-infusion.md` — add **Section 9: Local LLM Integration**

**What Section 9 covers:**
- LM Studio endpoint setup (Qwen 9B)
- Ollama endpoint setup + CORS fix (Gemma 4B)
- `generateSummary()` utility function spec
- Model task allocation (Qwen → full summary + field extraction; Gemma → intent scoring)
- Graceful fallback pattern
- Where to wire it in code (deferred — currently calls mock; future call replaces with `generateSummary(rawLog, endpoint)`)

**No runtime test** — engineering accesses the spec from this doc during story run.

---

### Phase 3 — Cross-Channel Injection Architecture

**Goal:** Demonstrate that the same web context can be shown/hidden per channel. Document the two-layer model.

**Files changed:**
- `gallabox-web-inbox.html` — `webContextEnabled` channel flag + inline toggle
- `GBWebWidget.html` — rename "Inject into channel" section to "Primary infusion channel", add Layer B note
- `inbox-infusion.md` — add **Section 10: Cross-Channel Architecture**
- `ARCHITECTURE.md` — add `webContextEnabled` flag to inbox data architecture

**Changes:**

1. Add `webContextEnabled: true` to channel entry shown in inbox thread header
2. Subtle toggle in conversation header: `Web context ●` — clicking toggles `webContextEnabled`
3. When `webContextEnabled = false`:
   - `CreateEntry` and `ResolveCard` both hidden
   - Single greyed-out line: "Web context not enabled for this channel — configure in Channel Settings"
4. `ChannelSettingsPanel`: "Inject into channel" → "Primary infusion channel" with note about Layer B

**Outcome:** Business can control per-channel context visibility without re-injecting or re-processing.

---

### Phase 4 — Resolve Pipeline + Persistence

**Goal:** ChannelSettingsPanel state persisted; auto-resolve simulation; Ref code visible on handoff.

**Files changed:**
- `GBWebWidget.html` — persist Channel Settings to `cfg`, show Ref on handoff screen
- `gallabox-web-inbox.html` — queued infusion state
- `inbox-infusion.md` — update Section 6 open questions, add queue/TTL detail

**Changes:**

1. Wire `ChannelSettingsPanel` state into `cfg` (pass `setCfg` down, persist to localStorage)
2. Add `refCode` display to widget's "Moving to WhatsApp" screen
3. "Session queued for injection" chip when contact goes to WA but no thread exists yet
4. Inbox simulate panel: "Trigger from Ref:100041" button for ref-based infusion demo
5. Auto-resolve: "Chat on WhatsApp" → if `autoResolve: true` in cfg → session resolves in inbox automatically

---

### Phase 5 — Intelligence Layer + Multi-Session

**Goal:** Multiple sessions for same contact. Intent trend. AI extraction signal.

**Files changed:**
- `gallabox-web-inbox.html` — multi-session entries in thread, trend indicator
- `inbox-infusion.md` — update this section to mark Phase 5 scope

**Changes:**

1. Second resolved session in demo data (older, different fields)
2. Both sessions appear as separate CreateEntry + ResolveCard pairs at their timestamps
3. Intent score trend arrow on ResolveCard: ↑ if score improved vs prior session
4. "Session 2 of 2 in 30 days" label in compact header
5. "AI context: available" tag in ResolveCard footer (signals rawLog fed to WA AI agent)

---

## Section 5 — What changes in the inbox (after phases)

### Removed
- `PastSessions` sub-component inside `ContextCard`
- The old "Previous sessions" accordion
- `StatsRow` as a separate component (stats are now inline in resolve header)
- The coupled create+resolve layout (these are now separate thread entries)

### Added
- `CreateEntry` component — single-line chip, fires on contact mapping
- `ResolveCard` component — compact expandable card, fires on resolve
- `refCode` field displayed in resolve card footer
- `contactMapping.method` label in create chip
- `withinWindow` check at injection (30-day filter)
- "Dropped session" create chip state (if `Dropped session inject` toggle is ON)

### Preserved
- Expand/collapse behavior on resolve card (non-removable, compact by default)
- Lead summary card inside resolve (intent, fields, score, summary text)
- `View chat →` link inside expanded create entry
- Async animation on resolve card appearance

---

## Section 6 — Open questions (resolved)

1. **Ref code format** → **Sequential integer** (e.g., `100041`). Human-readable and voice-friendly ("your reference is one hundred thousand forty-one"). Security concern: integers are guessable, but the Ref only resolves to a thread entry — no PII exposed via Ref alone. Engineering can add rate-limiting on the Ref lookup endpoint if needed.

2. **Anonymous session inject for dropped?** → **Default OFF**. Configurable per web agent (the "Dropped session inject" toggle in Channel Settings). Default OFF keeps threads clean. Businesses with high-volume anonymous traffic should keep this OFF to avoid noise. Only turn ON if you have a specific reason to track dropped anonymous sessions in the WA thread.

3. **Multiple mapping events on same session** → **First-write-wins**. If a session starts anonymous, then the bot captures a phone, then the business API also injects — the first successful mapping (cookie → phone capture → API inject, in priority order) is used. Subsequent attempts are logged internally but not shown in the thread. The `contactMapping.method` label shows the winning method only.

4. **30-day window** → **Rolling from session start time** (not calendar month). If a session started on May 1 and today is May 31, it is within window. If today is June 1, it is outside. This is consistent, predictable, and cheap to evaluate at injection time.

5. **Create chip when WA thread already active** → **Keep `ConcurrentBanner` as-is**. If the customer has an active WA conversation and opens the web agent, the create chip injects immediately with an "Active web session" indicator. The `ConcurrentBanner` in the current prototype handles this correctly — no change needed.

6. **Summary language** → **Match session language** (detected from conversation). Configurable override to English available in Channel Settings (future toggle — not in current prototype scope). Engineering: use the conversation's detected language code when calling the LLM, pass it as a system prompt instruction.

---

## Section 7 — Channel Settings Architecture

### Navigation pattern (Gallabox double-nav)

```
Gallabox sidebar
  └── Web
        └── [Agent list — "Villas Bot", "Support Bot", …]
              └── Click agent → Agent detail page
                    └── Channel Settings  ← infusion lives here
```

This mirrors the WhatsApp double-nav:  
`WhatsApp → Channel Settings` (for WA-specific config)  
`Web → [Agent] → Channel Settings` (for web channel config)

The agent name IS the channel name. "Villas Bot" is not just a bot — it is the web channel for that surface. Channel Settings is where you configure how that channel behaves within Gallabox.

---

### Channel Settings page — layout

```
← Back to Web Agents

[Agent avatar]  Villas Bot
                pricing.gallabox.com/villas  ·  Active

──────────────────────────────────────────────────────────

INFUSION SETTINGS
Connect this web channel to WhatsApp to pass context automatically.

  Inject into channel
  ┌──────────────────────────────────────────────────────┐
  │  🟢 Acharya Academy — +91 98765 43210          ▾    │
  └──────────────────────────────────────────────────────┘
  Context from this web agent will be injected into threads
  on the selected WhatsApp channel.

──────────────────────────────────────────────────────────

CONVERSATION EVENTS

  Allow chat infusion                          [● ON]
  Inject web session context into WhatsApp
  threads when a contact is matched.

  ──────────────────────────────────────────────────────

  Conversation create event                    [● ON]
  A single-line note is added to the WA thread
  when a web session starts and contact is matched.
  Free · No AI credits used.

  ──────────────────────────────────────────────────────

  Conversation resolve event                   [● ON]
  A context card is added when the web session
  ends. Shows bot-captured fields.
  Free · Structured fields only.

    └── Resolve with AI summary                [○ OFF]
        Intent score, summary, and extracted   [1 AI credit / session]
        fields generated from conversation.
        Charged only on successful resolution.
        [Learn about AI credits ↗]

──────────────────────────────────────────────────────────

AUTO-RESOLVE

  Auto-resolve web session
  Automatically close the web session when the
  contact moves to WhatsApp.

  Resolve trigger
  ┌──────────────────────────────────────────────────────┐
  │  On WhatsApp handoff click                     ▾    │
  │  ─────────────────────────────────────────────       │
  │  On WhatsApp handoff click                           │
  │  After 5 min inactivity                              │
  │  After 15 min inactivity                             │
  │  Manual only                                         │
  └──────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────

CONTACT MAPPING

  Enable contact capture                       [● ON]
  Bot attempts to collect phone/email during
  session to map to a Gallabox contact.

  Ref code in handoff                          [● ON]
  Embed a session reference code (Ref:XXXXX)
  in the WhatsApp handoff template. Enables
  session lookup if cookie mapping fails.

──────────────────────────────────────────────────────────

                              [Cancel]  [Save changes]
```

---

### Tiered feature model

| Feature | Tier | Credit cost | What it shows |
|---|---|---|---|
| Create event chip | Free | 0 | URL · timestamp · mapping method |
| Resolve event card | Free | 0 | Bot-captured fields (budget, location, timeline) |
| Resolve WITH AI summary | AI credits | 1 per resolved session | Intent score (X/10) · AI summary (≤600 chars) · LLM-extracted fields |
| Contact capture | Free | 0 | Phone/email capture during chat |
| Ref code in handoff | Free | 0 | Ref:XXXXX in handoff template |
| Auto-resolve | Free | 0 | Trigger config only |

**Credit charge rule**: 1 AI credit is consumed only when:
- `Resolve with AI summary` is ON
- The session status reaches `Resolved` (not Dropped)
- Summary generation completes successfully

No charge for dropped sessions, failed generation, or anonymous (unmapped) sessions.

---

### Summary changes by channel

Each web channel has its own summary context. This matters because:
- A real estate agent captures: budget, location, timeline, property type
- An education agent captures: course interest, batch, location, fee range
- A support agent captures: issue category, product, urgency

The structured fields extracted by the LLM are guided by the channel's configured `fieldSchema`. The base schema is always:
`{ intentType, budget, location, timeline }` — but channels can extend this.

Summary language defaults to the session language (detected from conversation). Can be overridden to English in Channel Settings (future toggle).

---

### Settings state machines

**Allow chat infusion = OFF:**
→ No create event, no resolve event, no summary
→ All other toggles are disabled (greyed out)
→ Session data still collected, just not injected

**Resolve event = OFF (infusion ON):**
→ Create event still fires
→ No resolve card in WA thread
→ Session data collected, fields available in contact profile

**Resolve event ON, AI summary OFF:**
→ Basic resolve card: shows bot-captured fields only
→ No intent score, no summary text
→ Resolve card still expandable, shows `[create]` + `[resolve]` sections

**Resolve event ON, AI summary ON:**
→ Full resolve card with lead summary
→ Intent score bar (X/10)
→ Summary text (≤600 chars)
→ 1 AI credit charged

**Auto-resolve = Manual only:**
→ Agent must click "Resolve" in the web session panel
→ No automatic trigger
→ AI summary still generates when manually resolved (if toggle is ON)

---

## Section 8 — Phase 1 Build Plan (Inbox: Split Create + Resolve)

### Status: In execution (Phase 0 complete, Phase 1 next)

### What changes in `gallabox-web-inbox.html`

The current `ContextCard` couples create and resolve in one expandable panel. Phase 1 makes them independent thread entries.

#### Current state (Phase 0 output):
```
ContextCard
├── Compact header (dot + "View summary ▾")
├── [create] section (inside expand)
├── [resolve] section (inside expand, only shown when !isLive)
│   └── LeadSummary (intent, fields, score, summary)
├── StatsRow (inside expand)
└── PastSessions (still present — to be removed)
```

#### Phase 1 target:
```
Thread timeline
  ···
  CreateEntry          ← standalone chip at mapping timestamp
  ···messages may appear here···
  ResolveCard          ← standalone card when summary is ready
  ···
```

---

### Component specs

**`CreateEntry` component (new):**
- Single line: `🌐 Web session · Ref:100041 · 7:27 AM · via cookie`
- Left border: 3px teal (`#0d9488`)
- No expand state — all info in one line
- "View chat →" link at end opens web session chat overlay
- Renders at `contactMapping.mappedAt` timestamp

**`ResolveCard` component (standalone, was nested):**
- Compact header (always visible): `● Context injected · 7:34 AM  [View summary ▾]`
- Left border: 3px blue (resolved) / 3px grey (dropped / generating)
- Expand panel contains:
  - `[create]` row: timestamp, URL, mapping method
  - `[resolve]` row: timestamp, stats (10 msgs · 7 min), status
  - `LeadSummary` card: intent, fields, score bar, summary text
- Non-removable (no × button)
- `refCode` in footer: `Ref:100041`

**`ContextCard` wrapper (simplified):**
- Remains as the outer wrapper in the thread
- Decides what to render based on `sess.status` and whether resolve has fired
- Live session: `CreateEntry` only
- Resolved: `CreateEntry` (if not in separate prior entry) + `ResolveCard`
- Dropped: `CreateEntry` with dropped variant styling

**Generating stub (new):**
- Appears immediately when "Simulate resolve" is clicked
- Content: single-line `⏳ Generating context · 7:34 AM`
- Styled as greyed card with subtle pulse animation
- After 2s: replaced by full `ResolveCard` (append-and-swap, not update)

---

### Async simulation wiring

```
User clicks "Simulate resolve"
  → setStatus('generating')
  → GeneratingStub renders immediately in thread
  → setTimeout(2000)
  → setStatus('resolved')  
  → GeneratingStub unmounts, ResolveCard mounts (full card with LeadSummary)
```

The 2s delay represents the ~10s real-world summary generation time, compressed for demo purposes.

---

### Files in Phase 1

| File | Change |
|---|---|
| `gallabox-web-inbox.html` | Split ContextCard → CreateEntry + ResolveCard; remove PastSessions; extend session data model with refCode/contactMapping/infusion; add generating stub + 2s async |
| `inbox-infusion.md` | This section updated |
| `ARCHITECTURE.md` | Update file map: CreateEntry + ResolveCard as distinct components; remove PastSessions mention |

`GBWebWidget.html` Channel Settings tab was completed in Phase 0 — no changes needed in Phase 1.

---

## Section 9 — Local LLM Integration

> **Scope:** Specification only. The HTML prototype continues to use mock data. This section is the engineering spec — to be accessed during story run. No live fetch() calls are wired in the prototype (keeps it shareable without requiring a running local server).

---

### Purpose

Offload AI summary generation (output tokens) to local models during prototyping and early staging. Makes the "Simulate resolve" flow genuinely intelligent instead of pre-mocked. Two models, two tasks — the lighter model handles the fast scoring call, the heavier model handles full summary + field extraction.

---

### LM Studio (Qwen 9B) — Endpoint Setup

**Task:** Full summary generation + structured field extraction (budget, location, timeline, intent type). Qwen 9B is better at structured output and longer inference.

1. Open LM Studio → **Local Server** tab
2. Load the Qwen 9B model → click **Start Server**
3. Server runs at: `http://localhost:1234`
4. API endpoint: `POST http://localhost:1234/v1/chat/completions` (OpenAI-compatible)
5. Headers: `Content-Type: application/json` — no auth required
6. CORS: enabled by default, works from local HTML files served via `file://` or `localhost`
7. Model name in request body: any string — LM Studio uses whichever model is currently loaded

---

### Ollama (Gemma 4B) — Endpoint Setup

**Task:** Intent score (0–10) quick inference. Lighter, faster, lower latency per call.

1. Ensure Ollama is running: `ollama serve` (or it runs as a system daemon on Mac)
2. Pull model: `ollama pull gemma2:4b`
3. **CORS fix required** — Ollama blocks cross-origin requests by default:
   ```bash
   launchctl setenv OLLAMA_ORIGINS "*"
   # Then restart Ollama (quit from menu bar + relaunch, or: killall ollama && ollama serve)
   ```
4. API endpoint: `POST http://localhost:11434/v1/chat/completions` (OpenAI-compatible)
5. Native endpoint also available: `POST http://localhost:11434/api/generate` — but use `/v1/` for consistency with LM Studio
6. Body: `{ model: "gemma2:4b", messages: [...], temperature: 0.2 }`

---

### Model Task Allocation

| Model | Endpoint | Task | Why |
|---|---|---|---|
| Qwen 9B (LM Studio) | `localhost:1234` | Full summary (≤600 chars) + structured field extraction: `intentType`, `budget`, `location`, `timeline` | Better at instruction-following for structured JSON output |
| Gemma 4B (Ollama) | `localhost:11434` | Intent score (0–10) — single integer output | Fast, low token count, low latency for a single numeric inference |

---

### `generateSummary()` Utility Function

To be added to `gallabox-web-inbox.html` when engineering wires it in. Currently the "Simulate resolve" button calls mock data directly — this function replaces that call.

```javascript
// endpoint: 'lm-studio' | 'ollama' | 'mock'
async function generateSummary(rawLog, endpoint) {
  if (endpoint === 'mock' || !endpoint) return SESSION_DONE.fields; // graceful fallback

  var base  = endpoint === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234';
  var model = endpoint === 'ollama' ? 'gemma2:4b' : 'local-model';

  var transcript = rawLog.map(function(m) {
    return m.who + ': ' + m.text;
  }).join('\n');

  var messages = [
    {
      role: 'system',
      content: 'Extract lead intelligence from this web chat transcript. Return ONLY valid JSON with no markdown: {"intentType":"...","budget":"...","location":"...","timeline":"...","leadScore":8,"summary":"max 600 chars"}'
    },
    { role: 'user', content: transcript }
  ];

  try {
    var resp = await fetch(base + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model, messages: messages, temperature: 0.2 })
    });
    var data = await resp.json();
    return JSON.parse(data.choices[0].message.content);
  } catch(e) {
    // Endpoint unreachable or malformed JSON — fall back to mock silently
    return SESSION_DONE.fields;
  }
}
```

---

### Graceful Fallback Pattern

If the local endpoint is unreachable (server not started, CORS not configured, parse error):
- `generateSummary()` catches the error silently
- Returns `SESSION_DONE.fields` (the mock data object)
- The prototype continues to function as if nothing happened
- No error is surfaced to the user in the prototype

In production, the fallback should surface a "Summary unavailable" state in the resolve card and not charge an AI credit.

---

### Where to Wire It In the Code

Current (mock) path in `gallabox-web-inbox.html`:
```javascript
// "Simulate resolve" button onClick:
setTimeout(() => {
  setStatus('resolved');
  // sets sess.fields = SESSION_DONE.fields (hardcoded mock)
}, 2000);
```

Future (LLM) path:
```javascript
// "Simulate resolve" button onClick:
setStatus('generating');
generateSummary(sess.rawLog, selectedEndpoint)
  .then(fields => {
    sess.fields = fields;
    setStatus('resolved');
  });
```

The `selectedEndpoint` comes from a small UI selector (Mock / LM Studio / Ollama) in the simulate panel — visible during story demos to show the source switching live.

---

## Section 10 — Cross-Channel Injection Architecture

### The Problem

A business typically has multiple channels: Sales WhatsApp, Support WhatsApp, an Instagram DM channel, and possibly a Voice (PSTN) channel. When a web session produces context, it should inject into the right channel — and only the right channel. But "right" is business-defined, not system-defined.

**Example:** Ganesh chats on the villa pricing bot → Sales WA thread should see the context. Support WA should not (different team, different context). But another business may want Support to see it too, for continuity.

---

### Two-Layer Model

**Layer A — Primary channel (web agent config):**
- Set in `GBWebWidget.html` → Channel Settings → "Primary infusion channel"
- This is where the session.create and session.resolve events are ATTRIBUTED and first injected
- One web agent has one primary channel (the one Gallabox routes the handoff to)
- Already built in `ChannelSettingsPanel` as "Inject into channel" dropdown

**Layer B — Per-channel receive setting (opt-in):**
- Each WA/Instagram/Voice channel has a separate toggle: "Show web context for contacts" — ON/OFF
- When any thread opens on any channel, check: is this channel's `webContextEnabled = true`?
- If YES → inject CreateEntry + ResolveCard for this contact's web sessions (last 30 days)
- If NO → no web context shown, even if the contact has sessions
- Default: ON for the primary channel, OFF for all others

**Efficiency:** Generate events ONCE at contact level (1 AI credit per session). Distribution to additional channels is a flag check — zero additional cost.

---

### Layer A vs Layer B at a Glance

```
Web Agent (Villas Bot)
  └── Layer A: "Primary infusion channel" = Sales WA / Maya-Dialog360
        ↓ session.create and session.resolve always inject here
        ↓ this is where AI credit is consumed

Channel: Sales WA / Maya-Dialog360
  └── Layer B: "Show web context" = ON  ← inherits from Layer A attribution
        → shows CreateEntry + ResolveCard in all threads for mapped contacts

Channel: Support WA / +91 80121 44822
  └── Layer B: "Show web context" = OFF (default)
        → no web context shown even if contact has sessions

Channel: Instagram DM
  └── Layer B: "Show web context" = OFF (default)
        → same
```

---

### Prototype Implementation (Phase 3)

Rather than building a full Channel Settings page for each WA channel, Phase 3 demonstrates the concept with an inline toggle in the inbox conversation header.

**What's added to `gallabox-web-inbox.html`:**

1. `webContextEnabled: true` in the channel data for the current conversation
2. A subtle toggle in the conversation header bar: `Web context ●`
3. Clicking the toggle flips `webContextEnabled`
4. When `false`:
   - `CreateEntry` and `ResolveCard` both unmount
   - A single greyed note appears: "Web context not enabled for this channel — configure in Channel Settings"
5. When `true` again: entries re-mount

This demonstrates the flexibility to sales/product without needing a real settings page.

**What's added to `GBWebWidget.html`:**
- "Inject into channel" section renamed to "**Primary infusion channel**"
- Sub-note added: "Other channels can opt in to display this contact's web context via their own Channel Settings (Layer B)"

---

### Real Implementation Notes (for engineering)

- Layer B toggle lives on each channel's own Channel Settings page in Gallabox:
  `WhatsApp → [Channel] → Channel Settings → "Receive web context for contacts" ON/OFF`
- This is a per-channel flag in the channel config object — not per-agent, not per-contact
- When a thread opens, the inbox checks: `channel.webContextEnabled && contact.hasSessions`
- If true, fetch sessions for this contact (last 30 days) and render CreateEntry/ResolveCard pairs
- The fetch happens once per thread open, result cached for the session duration
- Sessions are stored at contact level — no duplication for multi-channel distribution
