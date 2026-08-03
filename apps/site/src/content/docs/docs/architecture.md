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

The authored geometry has 24 base Tiles, 8 middle Tiles, and 4 top Tiles on a half-Tile coordinate grid. A remaining Tile is free only when no higher-layer Tile overlaps it and at least one same-layer horizontal side is open. The verifier confirms 382 reachable states, one terminal state, and zero dead states; every legal choice remains safe.

## Browser and local state

`session.ts` renders semantic buttons and layered coordinates, begins the hidden automatic settle at twelve minutes, enforces the fifteen-minute ceiling, manages same-tab resume, synthesizes optional audio, presents the deterministic brass bloom, and maintains versioned `window.__rasoi`. `window.__ct` remains an alias for compatibility evidence.

`night-core.ts` owns Night ID, deterministic recipe version 3, v3 state sanitization, v1/v2 migration, preservation of recipe-two Rasoi Dawn data, and idempotent completion. `dawn-core.ts` owns captured-zone eligibility, still/loop capability handling, sharing, and temporary URL leases.

## Distribution boundary

The `/play/` build registers a versioned service worker scoped to its own static shell. The standalone removes its manifest and worker registration during composition. Both artifacts inline the same compiled Session runtime; neither requires an account or third-party runtime service. A build-time QR generator encodes the canonical Pages `/play/` URL and adds no runtime request.

The deferred iOS Wall is a separate native boundary and is not implemented by the browser dismissal surface.
