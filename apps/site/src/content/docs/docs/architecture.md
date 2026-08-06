---
title: Architecture
description: Browser-first boundaries for the House registry, Salon games, Rasoi legality, Night state, PWAs, Dawn, and the public site.
---

## Workspace

- **House** — Vite-compiled TypeScript for five typed category doors, eight game definitions, pure classic-study rules, renderers, same-tab active state, replaceable result provenance, adult acknowledgement, and its scoped worker.
- **Session** — Vite-compiled TypeScript for the pure Rasoi kernel, native tile interface, boundary clock, optional audio, Night state, and Dawn export.
- **Site** — Astro landing page and Starlight documentation built from verified product facts and rendered release media.
- **Composition** — one static root artifact containing the landing page, `/docs/`, `/house/`, `/play/`, and portable `nindova.html`.

## House boundary

`salon-catalog.ts` owns the five-door/eight-game registry and total five-part metadata for every table. `stack-architect.ts` owns the complete three-plinth law and corrupt-board repair policy. `classic-studies.ts` keeps canonical board graphs and sowing rules private behind immutable semantic chapter views and one choice evaluator, so visual and nonvisual rendering cannot drift from the authored position. `house-state.ts` is the only owner of Gallery and active-table browser storage, including v1→v2 fallback, copy-on-write completion, failed-write behavior, compact active records, fail-closed runner reload, and exact clearing. `sector-sprint.ts` remains the pure deterministic engine and Canvas renderer; `sector-sprint-table.ts` owns the full production table lifecycle around it: consent-started session state, input and pointer queues, foreground clock and 240-second arbiter, pause and interruption, retry, Act transitions, narrated parity, audio cues, rendering, teardown guards, and exactly-once completion, boundary, or abandonment outcomes. `house.ts` only composes that table into hash-addressable House navigation, shared focus, sound, celebration, and completion presentation. A safety-boundary exit or runner document reload cannot create completion provenance. Every actual completion is permanently labeled `mode: "entertainment"`; no assessment scoring or population comparison is present.

`assessment-readiness.ts` is a source-only, fail-closed evidence contract. It is not imported by the House runtime and introduces no route, UI, storage, request, or scoring path. It rejects entertainment results as assessment inputs and keeps research collection and public cognitive output disabled.

The House links to but does not import the Night runtime. `/house/` and `/play/` have separate storage namespaces, manifests, service workers, and browser evidence contracts (`window.__house` and `window.__ct`).

## Legality kernel

`rasoi-core.ts` owns motif identity, deterministic board creation, free-tile calculation, legal-pair enumeration, pair removal, help selection, completion, and exhaustive reachability verification. Rendering and input do not duplicate its legality rule.

The authored Gentle geometry has 24 base, 8 middle, and 4 top Tiles. Deeper has 20 base, 10 middle, 4 upper, and 2 crown Tiles. Its interleaved upper/crown motif order creates a three-step opening search: each step exposes at least four free candidates, includes unmatched decoys, and offers only one legal pair. Both use a half-Tile coordinate grid. A remaining Tile is free only when no higher-layer Tile overlaps it and at least one same-layer horizontal side is open. The verifier confirms 382 Gentle and 510 Deeper reachable states, one terminal state each, and zero dead states; every legal choice remains safe.

## Browser and local state

`session.ts` renders semantic buttons and layered coordinates, applies the tonight-only profile, begins the hidden automatic settle at twelve minutes, enforces one fifteen-minute deadline through Rest, manages version-4 same-tab resume, synthesizes optional deterministic audio, presents the paired bloom, qualitative path reflection, and optional response-free Image Drift, and maintains versioned `window.__rasoi`. `window.__ct` remains an alias for compatibility evidence.

`night-core.ts` owns Night ID and Dawn-record recipe version 3, v3 state sanitization, v1/v2 migration, preservation of recipe-two Rasoi Dawn data, and idempotent completion. `rasoi-core.ts` independently owns board-geometry recipe version 5. `dawn-core.ts` owns captured-zone eligibility, still/loop capability handling, sharing, and temporary URL leases.

## Distribution boundary

The `/house/` and `/play/` builds register separately scoped versioned workers. The House precaches its full hashed static asset graph; the Night standalone removes its manifest and worker registration during composition. None requires an account or third-party runtime service. A build-time QR generator still encodes the canonical direct `/play/` route and adds no runtime request.

The deferred iOS Wall is a separate native boundary and is not implemented by the browser dismissal surface.
