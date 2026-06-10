# Deferred Items — Phase 06

## Pre-existing TypeScript Errors (out of scope for 06-02)

Discovered during `npx tsc --noEmit` run in Task 1 of 06-02. These errors exist in settings
files unrelated to alertService.ts. They were NOT introduced by 06-02 changes.

### TS2367 — Comparison with no overlap

- `app/(dashboard)/settings/integration/page.tsx:163` — `'"Free"' and '"Pro"' have no overlap`
- `app/(dashboard)/settings/integration/page.tsx:204` — `'"Free"' and '"Pro"' have no overlap`
- `app/(dashboard)/settings/SettingsClient.tsx:422` — `'"Free"' and '"Pro"' have no overlap`
- `app/(dashboard)/settings/SettingsClient.tsx:439` — `'"Free"' and '"Pro"' have no overlap`

**Root cause:** Plan type literal `"Free"` is being compared to `"Pro"` but the type system
considers them non-overlapping (likely the plan type is typed as a specific literal). Should be
fixed when the settings/billing integration is revisited.

**Suggested fix:** Check the plan type definition and ensure comparisons use a union type
`"Free" | "Pro" | "Starter"` or use a type guard.
