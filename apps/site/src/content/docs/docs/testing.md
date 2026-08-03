---
title: Testing
description: Evidence levels and release verification commands for Rasoi Pairs.
---

Nindova distinguishes three evidence levels:

- **Verified** — directly observed on a rendered or release-facing surface.
- **Source-proven** — supported by code or deterministic tests but not observed on every target device.
- **Untested risk** — plausible behavior that still lacks the required human/device evidence.

## Gates

- `test:unit` proves motif and layer counts, covered/open-side behavior, deterministic recipes, exhaustive 382-state solvability, recipe-two completion preservation, state sanitization/migration, captured-zone Dawn boundaries, and export utilities.
- `test:arc` removes all 18 pairs through `window.__ct`, asserts `intake → play → settling → end`, immutable copy, local completion, screenshots, and zero browser errors.
- `test:portrait` covers 320, 375, 414, 768, and 1440px surfaces, 44px targets, semantic labels, keyboard pairing, 200% zoom, reduced motion, and horizontal overflow.
- `test:layered` proves real visual overlap and z-order, covered/side-blocked semantics, synchronous pair removal, the brass bloom, reduced-motion opacity, the screen-away handoff, and deliberate same-night return.
- `test:self-closing` proves help does not play, reviewer and production caps remain distinct, and no-input/partial/selected-tile paths converge on the same ending.
- `test:night` covers corrupt recovery, “Not now” return, reload resume, same-night board identity, v3 completion, and replay idempotence.
- `test:dawn` serves the composed build and verifies morning boundaries, the rendered kitchen composition, local PNG download, share cancellation, loop fallback, and a real browser loop.
- `test:pwa` verifies manifest/scope, offline cache ownership, denied-audio operation, same-tab resume, offline closure, quiet tomorrow intent, same-origin requests, and standalone independence.
- `test:wall-clock` leaves a production Session untouched through its twelve-minute automatic settle and the absolute fifteen-minute ceiling.

## Release commands

```sh
npm run check
npm test
npm run test:wall-clock
```

Interface changes also require visual inspection at phone and desktop widths. Automation cannot close the current real-device screen-reader or Punjabi cultural-review limitations.
