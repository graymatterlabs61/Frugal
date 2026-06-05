# Phase 4: Budget Rules API + UI — Context

**Gathered:** 2026-06-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Full CRUD REST API for `budget_rules` table. Wire the project detail "Budget Rules" tab from mock to real DB — create, list, delete rules persist on refresh. Tier enforcement: Free users cannot create rules (upgrade prompt); Plus gets alert + block; Pro also gets throttle. Budget checker column alignment. No Stripe wiring (Phase 5). No actual API call interception (SDK scope).

</domain>

<decisions>
## Implementation Decisions

### Rule creation form
- Dialog shows: **threshold %** + **action type** only — minimal fields
- Default threshold: **80%** when dialog opens
- Budget limit lives **on the project** (project-level default) but is **overridable per rule** — form shows limit field only if project has no limit set, or allows optional override
- **Multiple rules per project** allowed — user can stack e.g. 70% alert + 100% block
- **Validation:** if project has no budget limit and rule form has no limit override, block submission with inline error: "Set a monthly budget limit on this project first."

### Tier gate UI
- Free user opens Budget Rules tab → sees **blurred/dimmed rule list preview + upgrade banner on top**
- Banner text: "Upgrade to Plus to create budget rules" + "Upgrade to Plus" button → links to `/billing`
- `/billing` is a placeholder in Phase 4 (Stripe wired in Phase 5); clicking upgrade navigates there
- **'Pro' badge** shown next to the Throttle action option in the dialog — visually distinguishes Plus from Pro capability

### Rule action behavior
- Actions presented as **radio cards** with icon + 1-line description:
  - Alert 🔔 — "Send email/Slack notification when threshold is crossed"
  - Block 🛡️ — "Record a block event and fire notification" (enforcement via SDK — future)
  - Throttle ⚡ — "Slow down requests [Pro]" (Pro badge visible, disabled for Plus users)
- **Block in Phase 4** = writes `alert_log` entry with `action_taken='block'` + fires notification — no actual API interception (that's SDK/Phase 7+)
- **No real-time push** in Phase 4 — alerts appear on next dashboard refresh (5-min poll delay is acceptable)

### Rule list display
- Rows: `[threshold %] · [action badge] · [delete icon]` — e.g. "80% · Alert · 🗑"
- **Delete-only in Phase 4** — no edit/PATCH endpoint; user deletes + recreates if they want to change
- **Delete confirmation:** inline — clicking trash shows "Delete? [Cancel] [Delete]" in the same row; no modal
- **Empty state** (Plus/Pro, no rules yet): illustration + "No rules yet. Add your first budget rule." + Add Rule button

### Claude's Discretion
- Loading/submitting states in the Add Rule dialog
- Exact illustration for empty state
- Error toast wording for API failures
- Color of action badges (alert = yellow, block = red, throttle = blue — or Claude decides)

</decisions>

<specifics>
## Specific Ideas

- Block action should be honest about current capability — UI can say "Block" but the enforcement note ("enforcement requires SDK") is acceptable as a tooltip or small footnote, not a hard disclaimer
- The "Pro" badge on throttle should feel like a capability indicator, not a lock/upsell — it's informational

</specifics>

<deferred>
## Deferred Ideas

- Actual API call blocking/interception — requires `@frugal/sdk` npm package (Phase 7+ / SDK phase)
- Supabase Realtime subscription for live alert badge updates — future polish
- Edit existing rules (PATCH endpoint) — omitted in Phase 4 for simplicity; could be Phase 7 polish
- Notification channel selector in rule form (email vs Slack) — Phase 6 (Email Alerts + Slack)

</deferred>

---

*Phase: 04-budget-rules-api-ui*
*Context gathered: 2026-06-05*
