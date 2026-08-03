---
title: Architecture
description: Browser-first boundaries for Rasoi legality, Night state, Dawn, PWA, and the public site.
---

## Workspace

- **Session** — Vite-compiled TypeScript for the pure Rasoi kernel, native tile interface, boundary clock, optional audio, Night state, and Dawn export.
- **Site** — Astro landing page and Starlight documentation built from verified product facts and rendered release media.
- **Composition** — one static root artifact containing the landing page, `/docs/`, `/play/`, and portable `nindova.html`.

## Legality kernel

`rasoi-core.ts` owns motif identity, deterministic board creation, free-tile calculation, legal-pair enumeration, pair removal, help selection, completion, and exhaustive reachability verification. Rendering and input do not duplicate its legality rule.

The authored geometry has three 12-tile racks. The active tile with the lowest and highest slot on each rack is free. Motifs occupy two consecutive pairs on exactly one rack, which makes all interleavings of legal rack choices safe. The verifier confirms 343 reachable states, one terminal state, and zero dead states.

## Browser and local state

`session.ts` renders semantic buttons, enforces the hidden wind-down/ceiling, manages same-tab resume, synthesizes optional audio, and maintains versioned `window.__rasoi`. `window.__ct` remains an alias for compatibility evidence.

`night-core.ts` owns Night ID, deterministic recipe version 2, v3 state sanitization, v1/v2 migration, and idempotent completion. `dawn-core.ts` owns captured-zone eligibility, still/loop capability handling, sharing, and temporary URL leases.

## Distribution boundary

The `/play/` build registers a versioned service worker scoped to its own static shell. The standalone removes its manifest and worker registration during composition. Both artifacts inline the same compiled Session runtime; neither requires an account or third-party runtime service.

The deferred iOS Wall is a separate native boundary and is not implemented by the browser dismissal surface.
