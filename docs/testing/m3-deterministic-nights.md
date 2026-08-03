# M3 deterministic nights and quiet memory checkpoint

## Implementation

- Added a standalone classic-JavaScript night module used by the source Session, multi-file build, embedded portable HTML, and Node parity tests.
- Captured an immutable `nightId` from Dawn civil date, IANA zone, and recipe version at Session entry.
- Seeded weather, moon, object set, featured species and boats, meadow accent, and harbor paint without changing path, effort, duration, or ending.
- Added a versioned one-key local schema with missing, corrupt, stale, unsupported, and unavailable recovery.
- Kept one meadow Echo and up to five harbor boats; memory changes only on a new completed `nightId`.
- Made same-night replay idempotent.

## Evidence

- Fixed PRNG outputs and representative Chicago/Kolkata recipe vectors.
- Local 11:59/noon boundary and DST fallback vectors.
- Browser parity between the night module and rendered object set.
- Browser corruption recovery, completion write, Echo write, reload, and replay equality.
- Unit proof that the sixth harbor completion removes only the oldest boat and that skipped dates do not mutate the record.

## Owner checkpoint

Open one fixed Chicago night twice and confirm the same moon, objects, featured Visitors, and color detail. Complete it, reopen voluntarily, and see the same uncounted Echo without any history, missed-night, or attendance surface.
