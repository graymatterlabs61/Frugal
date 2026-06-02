# DESIGN — Frugal
## Brand & Design System
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## 1. Brand Direction

**Personality:** Direct, trustworthy, technically sharp. Not cold or corporate. Speaks like a developer who has been burned before and built something because of it.

**Design principle:** Clarity over decoration. Every element earns its place. The dashboard should make costs legible at a glance — not beautiful in a way that obscures what matters.

**Reference products:** Linear (clean, dark, fast), Stripe Dashboard (data-dense but readable), Plausible Analytics (minimal, focused).

---

## 2. Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | Slate 950 | `#0a0f1e` | App background (dark mode first) |
| Surface | Slate 900 | `#0f172a` | Cards, panels, sidebars |
| Border | Slate 800 | `#1e293b` | Dividers, card borders |
| Text primary | Slate 50 | `#f8fafc` | Headings, primary content |
| Text secondary | Slate 400 | `#94a3b8` | Labels, secondary info |
| Text muted | Slate 600 | `#475569` | Placeholders, disabled states |
| Brand accent | Emerald 500 | `#10b981` | CTA buttons, connected status, positive signals |
| Warning | Amber 400 | `#fbbf24` | 80% threshold alerts, caution states |
| Danger | Red 500 | `#ef4444` | Limit exceeded, blocked state, error alerts |
| Chart line | Emerald 400 | `#34d399` | Spend trend lines |
| Chart fill | Emerald 950 | `#022c22` | Chart area fill (very dark green) |

**Rationale:** Dark mode is the natural environment for developer tools. Emerald as the brand color signals "money" and "go" simultaneously — fitting for a cost management product. Amber and Red are universal warning colors that require no explanation in a financial context.

---

## 3. Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Headings | Inter | 600 (SemiBold) | 24–32px |
| Body | Inter | 400 (Regular) | 14–16px |
| Data / numbers | JetBrains Mono | 500 (Medium) | 14–20px |
| Labels | Inter | 500 (Medium) | 12–13px |
| Code snippets | JetBrains Mono | 400 (Regular) | 13px |

**Key decision:** All monetary values and metrics (spend amounts, percentages, counts) use JetBrains Mono. Numbers are data — monospace makes them scannable and aligned in tables. Everything else uses Inter.

**Load:** Both fonts via Google Fonts or next/font for zero layout shift.

---

## 4. Component Style Direction

- **Cards:** Slate 900 background, 1px Slate 800 border, 8px border radius. No drop shadows — borders do the separation work.
- **Buttons (Primary):** Emerald 500 background, Slate 950 text, 6px border radius, medium font weight. Hover: Emerald 600.
- **Buttons (Secondary):** Transparent background, Slate 400 border, Slate 100 text. Hover: Slate 800 background.
- **Inputs:** Slate 900 background, Slate 700 border, Slate 50 text. Focus: Emerald 500 border ring.
- **Badges:** Small pill shapes. Connected = Emerald. Warning = Amber. Error = Red. Muted = Slate.
- **Tables:** No alternating row colors. Hover state: Slate 800 row highlight. Sticky header.
- **Charts:** Recharts. Single-color spend line (Emerald 400). Area fill with low opacity. Clean axes with no gridlines — only horizontal guide lines at rounded values.

---

## 5. Mobile vs Desktop Priority

**Desktop first.** Primary users are developers who monitor costs during their workday on a laptop or desktop. The dashboard is data-dense and requires a wider viewport.

**Mobile:** Responsive layout collapses the sidebar to a bottom navigation bar. Charts switch to a simplified 7-day view. Alert log remains fully functional on mobile — alerts are actionable (not just informational).

---

## 6. First 3 Screens — Wireframe Descriptions

### Screen 1: Dashboard

```
[Sidebar: Logo | Dashboard | Connections | Rules | Alerts | Settings]

[Header: "Dashboard" | Date range picker: Last 7 days / 30 days / This month]

[Row of 4 stat cards:]
  [Total Spend: $247.80] [Burn Rate: $8.20/day] [Budget Used: 62%] [Active Rules: 3]

[Large spend chart: Line chart, 30 days, spend by day in USD]
[Below chart: Toggle to switch between "All providers" / "OpenAI" / "Anthropic" / "Replicate"]

[Two-column row:]
  [Left: "Spend by Provider" — horizontal bar chart showing % per provider]
  [Right: "Top Users by Cost" — table with user ID, total spend, % of total, trend arrow]

[Footer: "Data last updated 3 minutes ago"]
```

---

### Screen 2: Budget Rules

```
[Header: "Budget Rules" | [+ Add Rule] button (Emerald)]

[Table of existing rules:]
  | Project | Period | Limit | Current Spend | Used | Action | Status |
  | My App  | Monthly | $300 | $186.20 | 62% | Alert | [Active badge] |
  | Client A | Daily | $50  | $12.40  | 25% | Block  | [Active badge] |

[Add Rule modal (when + clicked):]
  Select project: [dropdown]
  Period: [Daily | Monthly] toggle
  Limit ($): [number input]
  Alert at: [80%] (slider)
  When limit hit: [Alert only | Throttle model | Block calls] radio
  Notify via: [Email] [Slack] checkboxes
  [Cancel] [Save Rule]
```

---

### Screen 3: Alert Log

```
[Header: "Alert Log"]
[Filter bar: All / Email Alerts / Slack Alerts / Blocks | Date range]

[Timeline list, newest first:]
  [Amber dot] Jul 2 14:32 — "My App" hit 80% of $300 monthly budget
              Current spend: $241.20 | Limit: $300 | Action: Email sent
              [View Rule]

  [Red dot]   Jul 1 09:15 — "Client A" hit 100% of $50 daily budget
              Current spend: $50.40 | Action: Calls blocked for 14h 45m
              [View Rule]

  [Amber dot] Jun 30 18:44 — "My App" hit 80% of $300 monthly budget
              Current spend: $238.80 | Action: Email sent
              [View Rule]

[Empty state when no alerts:]
  [Emerald checkmark icon]
  "No alerts fired yet. Your costs are under control."
```
