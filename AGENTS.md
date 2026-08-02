# Nindova contributor guidance

## Product contract

- Protect the Two-Loop Law: satisfaction belongs inside one bounded Session; pull belongs only between Sessions.
- Never add scores, streaks, achievements, levels, visible timers, countdowns, collections, missed-night language, sleep grades, or randomized rewards.
- A production Session must close on its own within 15 minutes. Reviewer timing may compress duration, never order or outcome.
- Keep state local and telemetry at zero. Runtime requests must remain same-origin and static.
- Audio, animation, precision movement, and vision may enrich an action but cannot be required to complete it.
- Preserve the immutable lines documented in `docs/BUILD-PLAN.md`.

## Working rules

- Read `CONTEXT.md`, the build plan, and relevant ADRs before changing a boundary.
- Extend the supplied seed in behavior-preserving slices. Do not replace it with a parallel implementation.
- Keep `window.__ct` stable for browser evidence until a versioned successor exists.
- Test the standalone HTML and PWA wrapper independently.
- Verify rendered phone and desktop surfaces; source and unit tests are not sufficient UI proof.
- Commit one approved Must slice at a time. Do not enable deployment, tag a release, or describe the deferred iOS Wall as implemented.
