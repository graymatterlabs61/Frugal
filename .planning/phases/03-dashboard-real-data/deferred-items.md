# Deferred Items — Phase 03

## Out-of-scope issues discovered during 03-03 execution

### Build blocker: missing ProjectDetailClient component
- **Discovered during:** Task 1 (03-03)
- **File:** `app/(dashboard)/projects/[id]/page.tsx` line 10
- **Issue:** Imports `./ProjectDetailClient` which does not exist yet — this file is created in plan 03-04
- **Impact:** `npm run build` fails until 03-04 is executed
- **Action:** Log only — do not fix here. Will be resolved when 03-04 creates the client component.
- **Pre-existing:** Yes — this is a forward reference from a partially-executed plan set

### Pre-existing TypeScript warnings (unrelated to 03-03)
- `.next/types/validator.ts`: missing module errors for `cookies/page`, `privacy/page`, `refund/page`, `terms/page` — stale .next cache artifact
- `app/(dashboard)/dashboard/page.tsx`: SpendChart missing required props (scope of 03-02)
- `app/(dashboard)/settings/integration/page.tsx`: plan string comparison type errors (out of phase scope)
- `app/(dashboard)/settings/SettingsClient.tsx`: same plan type comparison errors
