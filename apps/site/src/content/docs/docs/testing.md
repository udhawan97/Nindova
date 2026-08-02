---
title: Testing
description: Evidence levels and verification commands for Nindova.
---

Nindova distinguishes three evidence levels:

- **Verified** — observed on the rendered or installed user-facing surface.
- **Source-proven** — directly supported by code or deterministic tests, but not yet observed on every target surface.
- **Untested risk** — plausible behavior that still lacks direct evidence.

## Seed baseline

`npm run test:seed:observe` runs a disposable copy of the supplied Playwright script after changing only its local file target and screenshot output directory. It records state and screenshots but intentionally remains observational.

`npm run test:arc` asserts the state order, final `end` state, immutable end-card copy, zero console or page errors, screenshots, and the `window.__ct` contract. It is the regression gate for behavior-preserving slices.

`npm run test:portrait` verifies 320×568, 375×812, 375×667, and desktop layouts; native semantic actions; keyboard operation; 200% page scale; rotation; virtual-keyboard height; reduced motion; held touch; pointer cancellation; safe 44×44-pixel targets; and the complete phone arc.

## Build gates

```sh
npm run typecheck
npm run test:unit
npm run test:arc
npm run test:portrait
npm run build
```

Interface slices also require rendered inspection at phone and desktop widths. A green source test alone is not shipped-surface proof.
