# Supplied seed baseline

## Safety preflight

The four supplied artifacts were hashed and copied into `reference/` before use. Static inspection found no shell execution, credential access, browser credential APIs, cookie access, or non-local network requests in the executable demo or test.

The supplied test uses Playwright to load a local file and write screenshots. Its preserved limitations are material:

- the end-card selector timeout is caught and discarded;
- state and console outcomes are logged instead of asserted;
- the target uses a machine-specific absolute path;
- screenshots default to an unrestricted relative `shots/` directory.

`scripts/run-seed-observational.mjs` runs a disposable copy after changing only the local file target and screenshot output directory. Its outputs are generated evidence and are not committed.

## What the observational run can prove

The preserved desktop route completed on 2026-08-02. It logged `NAMEBOX OPENS ON TAP: true`, reached `approach` after the wipe, reported `FINAL STATE: end`, and captured no console errors. Its eleven generated screenshots and transcript remain in the ignored `artifacts/seed-observational/` directory.

That run proves only that one scripted desktop route was attempted and reached the seed’s reported final debug state without a captured browser error. It does not prove success, full state order, end-card presence, accessibility, portrait behavior, offline behavior, or the production fifteen-minute cap.

## Regression gate

`tests/browser/seed-asserted.mjs` separately asserts:

- the full debug state order from `intake` through `end`;
- the immutable intake and end-card lines;
- a visible final end card;
- zero console and page errors;
- the `window.__ct` automation contract;
- screenshots at intake, play, Vista, Drift, and end.

This asserted arc—not the observational script—is the baseline gate for behavior-preserving slices.

The independent gate passed on 2026-08-02 with the asserted order `intake → arrive → play → wipe → approach → vista → drift → return → sign → dark → end`, the required intake and end-card lines, a visible end card, and zero console or page errors.
