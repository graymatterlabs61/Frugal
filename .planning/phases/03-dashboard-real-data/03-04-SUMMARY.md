---
phase: 03-dashboard-real-data
plan: 04
status: complete
completed_by: gsd-executor agent (docs blocked on write permissions)
completed_at: 2026-06-05
---

## What Was Built

Split project detail page into server + client components, wired all tabs to real data, and fixed the worker.ts column bug.

## Files Changed

- `lib/polling/worker.ts` — bug fix: `.eq("is_active", true)` → `.eq("status", "active")`
- `app/(dashboard)/projects/[id]/page.tsx` — rewritten as async server component with async params
- `app/(dashboard)/projects/[id]/ProjectDetailClient.tsx` — created as "use client" component receiving typed props

## Key Decisions

- Provider badge replaced with connection count badge (ProjectStats has no single provider field)
- SpendChart in Overview tab replaced with placeholder — project-scoped chart query out of Phase 3 scope per CONTEXT.md
- Delete connection button shows toast directing to /connections page (read-only in Phase 3)
- Budget Rules tab and model breakdown kept mock with Phase 4 TODO comments
- `formatRelativeTime` for `last_polled_at` on connections; absolute datetime for alert `firedAt`
- 404-style error state rendered if `getProjectStats` returns null (UUID not owned by user)

## Commits

- `b406cec` — fix(03-04): fix worker.ts is_active bug and rewrite page.tsx as server component
- `3f12ec1` — feat(03-04): create ProjectDetailClient with real data for connections and alerts tabs