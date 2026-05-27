# US-001: Agent Dashboard

## Status
- Prototype: Built (GBWebWidget.html, component: AnalyticsPanel)
- Production: Not yet shipped
- Sprint target: Phase 2

## Problem statement
Agent operators have no way to see how their web widget is performing without leaving Gallabox. They need session counts, lead capture rates, and individual session details surfaced inside the agent builder so they can spot problems and tune the agent without switching tools.

## User stories

### Story 1: Session KPI tiles
**As an** agent operator, **I want to** see a summary row of key session metrics (widget opened, session started, contacts captured, anonymous chats, CTA clicks) at the top of the Dashboard tab, **so that** I can assess agent performance at a glance without reading a full report.

**Acceptance criteria:**
- [ ] Five KPI tiles are shown: Widget Opened, Session Started, Contacts Captured, Anonymous Chats, CTA Clicks
- [ ] Each tile shows the total count for the selected date range
- [ ] Widget Opened tile shows a sub-line splitting user-clicked vs auto-opened counts and percentages
- [ ] Session Started tile shows the percentage of opens that became sessions
- [ ] Contacts Captured tile shows the percentage of sessions that submitted a form
- [ ] No tile is editable; the entire dashboard is read-only
- [ ] The AI provider version is displayed as read-only (locked at "v2"); there is no control to change it on this tab

### Story 2: Daily breakdown chart
**As an** agent operator, **I want to** see sessions, contacts, new contacts, and returning contacts plotted per day, **so that** I can identify day-over-day trends and spot traffic spikes.

**Acceptance criteria:**
- [ ] Chart displays daily data for the selected date range
- [ ] Four series are plotted: Sessions (blue), Contacts (green), New contacts (purple), Returning contacts (amber)
- [ ] User can toggle between bar chart and line chart views
- [ ] A legend identifies each series by color and label
- [ ] Chart is not interactive beyond the view toggle (no drill-down in v1)

### Story 3: Contact mix card
**As an** agent operator, **I want to** see the split between identified and anonymous sessions as a donut chart alongside a new vs returning breakdown, **so that** I understand the quality of traffic reaching the widget.

**Acceptance criteria:**
- [ ] Donut shows identified (green) vs anonymous (amber) as percentages of total sessions
- [ ] Below the donut, a legend row shows exact counts and percentages for each slice
- [ ] A sub-section breaks identified contacts into New contacts vs Returning contacts with counts and percentages

### Story 4: Conversion funnel
**As an** agent operator, **I want to** see a step-by-step funnel (widget opened → session started → lead captured → WA handoff) with conversion rates between each step, **so that** I can see where visitors are dropping off.

**Acceptance criteria:**
- [ ] Four funnel steps are shown in order: Widget opened, Session started, Lead captured, WA handoff
- [ ] Each step shows an absolute count and a bar scaled relative to the top step
- [ ] The right column shows the conversion rate from the previous step (not from the top step)
- [ ] First step shows "—" instead of a conversion rate
- [ ] Conversion rates below 30% are shown in red; 30–55% in amber; above 55% in green

### Story 5: Traffic source, country, and device breakdowns
**As an** agent operator, **I want to** see where my widget visitors are coming from (traffic source, country, device type), **so that** I can understand which acquisition channels and geographies are driving engagement.

**Acceptance criteria:**
- [ ] Traffic source card lists up to 6 sources with count and a proportional bar
- [ ] Countries card lists top 5 countries with flag, count, and a proportional bar; a "See all" link is available
- [ ] Device type card lists Desktop, Mobile, and Other with counts and bars; includes a mobile responsiveness note
- [ ] All three cards use data scoped to the selected date range

### Story 6: Session log
**As an** agent operator, **I want to** see a paginated table of individual sessions with contact name, phone, session ID, contact type (New / Returning / Anonymous), traffic source, landing page, timestamp, and how the widget was opened (User / Auto), **so that** I can investigate specific sessions and contacts.

**Acceptance criteria:**
- [ ] Table shows columns: Contact name, Phone, Session ID, Type, Source, Landing page, Time, Open type
- [ ] Anonymous sessions show "Unknown" for name and "—" for phone
- [ ] Table is paginated (5 rows per page) with next/previous controls
- [ ] A search input filters rows by contact name or phone number
- [ ] A type filter dropdown allows filtering by All / New / Returning / Anonymous
- [ ] Export button downloads the filtered session list as CSV (see Story 7)

### Story 7: Date range filter
**As an** agent operator, **I want to** filter all dashboard data by date range using preset buttons (7D, 14D, 30D), **so that** I can compare different time windows without manually entering dates.

**Acceptance criteria:**
- [ ] Date range selector shows at least three presets: 7D, 14D, 30D
- [ ] Selecting a preset updates all KPI tiles, charts, and the session log simultaneously
- [ ] The active preset is visually highlighted
- [ ] The header sub-line shows the human-readable date range currently applied (e.g., "May 5 – May 11, 2025")

### Story 8: Export
**As an** agent operator, **I want to** export the current session log to a file, **so that** I can share data with my team or load it into a spreadsheet.

**Acceptance criteria:**
- [ ] An Export button is present in both the sticky header and the session log section
- [ ] Clicking Export downloads the session data scoped to the active date range filter
- [ ] Export format is CSV (minimum viable; Excel optional)
- [ ] Anonymous sessions are included in the export with "Unknown" and "—" values

## Key decisions & trade-offs
| Decision | Chosen approach | Alternative considered | Reason |
|---|---|---|---|
| AI provider visibility | Show provider version as read-only locked field | Allow changing provider per agent | In production, provider is set at flow creation and cannot be changed; showing it prevents confusion without enabling misconfiguration |
| WA Handoff analytics section | Only shown when Silent Tracking is enabled on the agent | Always shown | Handoff analytics depend on the silent tracking data pipeline; showing it without data would be misleading |
| Dashboard vs Settings separation | Dashboard is a standalone tab; AI model config lives in Settings | Merge into one tab | Prevents operators from accidentally treating analytics context as a place to change model settings |
| Data source | Prototype mocks all data; production pulls from Gallabox session events + AI provider completion logs | Mock only | Engineers need to wire two data sources; spec intentionally leaves the API contract open |

## Prototype location
- File: GBWebWidget.html
- Component: AnalyticsPanel (function `AnalyticsPanel`)
- Supporting components: KpiTile, LineAreaChart, GroupedBarChart, MiniDonut, CompactFunnel, ChatsTable, CountryRow, DeviceRow, Leg
- Approximate line: 2542–3229

## Notes for engineering
- The Dashboard tab must be hidden when opening the builder in `?mode=new` (new agent flow). It is only available for existing, published agents.
- All metric computations must satisfy: `sessions = contacts + anonymous`, `contacts = newC + returning`. Inconsistent data should fall back gracefully rather than showing NaN.
- Lead score and intent type (referenced in US-004) are NOT shown in this dashboard view; they live in the per-session detail (future work).
- The WhatsApp Handoff analytics card is gated on `cfg.silentTracking === true`. Do not show it if silent tracking is off for the agent.
- Export must respect the active date range filter and type filter simultaneously.
