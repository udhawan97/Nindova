# Nindova

Nindova is a calm, bounded pair-removal game for the end of the day. **Masala Mound** uses the uncovered-and-open-side rule of Mahjong solitaire and fills three overlapping layers with everyday Indian kitchen forms: belan, chakla, tawa, chimta, steel katori, tiffin, masala dabba, chai glass, and pressure cooker.

> Nothing to win. Nothing tracked. Nothing you can do wrong.

![The real Masala Mound board, showing three overlapping layers of Indian kitchen tiles](./apps/site/public/media/rasoi-board.png)

## Get Nindova

- Build the v0.2.0 source candidate locally for the layered Session, installable offline PWA, documentation, and self-contained `nindova.html`.
- The direct, non-tracking QR targets `https://udhawan97.github.io/Nindova/play/`. A Pages workflow is configured, but the live deployment is not claimed until it is published and observed.
- [Open the v0.1.0 release](https://github.com/udhawan97/Nindova/releases/tag/v0.1.0) for the previous flat-rack build and its checksums.

Until the Pages candidate is published, `/play/` works after serving a local build and `dist/nindova.html` works as a self-contained file.

<img src="./apps/site/public/play-qr.svg" width="180" alt="Direct QR for the canonical Nindova play URL">

The QR encodes the full canonical URL with no shortener or tracking parameter. Keep the printed URL with the code so people can verify its destination.

## The experience

- **A spatial rule.** Choose two matching tiles only when nothing overlaps them from above and at least one horizontal side is open.
- **Guaranteed closure.** The 36-tile, 24/8/4-layer board is exhaustively verified across 382 reachable states: every reachable nonterminal state has a legal pair, and every legal choice remains solvable.
- **Clear match feedback.** Each legal pair folds inward through one brief, deterministic brass bloom; reduced motion uses opacity only and sound stays off by default.
- **Quiet help.** “Show a safe pair” identifies a pair but never removes it.
- **No performance layer.** No score, count, timer, streak, achievement, grade, collection, missed-night state, or randomized reward.
- **A real ending.** Clearing the board closes the Session. If left unfinished, it settles itself before the hidden fifteen-minute ceiling. The primary handoff asks the person to put the screen down.
- **Dawn, by choice.** From 06:00 through 11:59 in the captured Night ID zone, the previous night’s kitchen forms return as a first-light still and optional silent loop.
- **Voluntary return.** “Not now” leaves Nindova available later that same night. After completion, “Back to Nindova” makes another separately bounded Session possible without promoting one more board.

## Punjabi and Indian direction

The interface uses indigo, madder, marigold, brass, sheesham-toned wood, and restrained phulkari-inspired geometry. The kitchen motifs are code-native SVG forms with visible English names, so the accessible label and drawing remain the same source of truth.

The art direction is Punjabi-inspired. It deliberately excludes flags, sacred symbols, festival collage, and generic “exotic” ornament. A completed human Punjabi cultural-authenticity review is **not** claimed and remains a known release limitation.

## Run locally

Requires Node.js 24 or newer.

```sh
npm install --ignore-scripts
npm run dev:session
```

For the complete landing page, docs, `/play/` PWA, and standalone file:

```sh
npm run build
npm run preview
```

Then open:

- `http://127.0.0.1:4173/play/` — installable Session
- `http://127.0.0.1:4173/docs/` — product and implementation docs
- `dist/nindova.html` — standalone artifact

## Repository map

- `apps/session/` — Vite + TypeScript Rasoi engine, semantic tile interface, Night/Dawn state, export, manifest, and worker.
- `apps/site/` — Astro landing page and Starlight documentation.
- `docs/` — approved redesign, ADRs, evidence ledger, and release/testing records.
- `graphify-out/` — generated architecture graph and report.
- `reference/` — immutable copies of the four original handoff artifacts.
- `tests/` — pure engine, state, browser, PWA, accessibility, and wall-clock gates.

## Verification

```sh
npm run check
npm test
npm run test:wall-clock
```

The main gates prove the 382-state board invariant, deterministic Night ID, recipe-two Dawn preservation, v1/v2-to-v3 local migration, idempotent same-night return, layered rendering, brass-bloom/reduced-motion behavior, Dawn eligibility/export fallback, 320–1440px rendered layouts, keyboard operation, 200% zoom, 44px targets, offline PWA closure, standalone independence, same-origin runtime requests, and the real production ceiling.

See [Testing](./apps/site/src/content/docs/docs/testing.md) and the [public-surface evidence ledger](./docs/PUBLIC-SURFACE-EVIDENCE.md) for evidence levels and remaining risk.

## Privacy and local state

Nindova has no account, analytics, telemetry, ads, remote logging, or third-party runtime request. The production Session is static and same-origin.

Long-lived local storage contains one version-3 record with only the latest completion facts needed by Dawn, a safely migrated legacy Dawn variant when present, and the optional local “Same time tomorrow?” intention. Interaction timing exists only in same-tab session storage to enforce resume and closure; it is not written to the long-lived record. Generated images and loops remain local blobs unless the person explicitly saves or shares them.

## Product and evidence boundary

Nindova is a behavioral design study for people aged 13 and up. It is not a sleep tracker, sleep-performance tool, memory intervention, or treatment. Masala Mound uses recognition, visual search, and spatial planning, but has not been clinically shown to make people sleepy, produce a useful dopamine response, improve general memory, or improve sleep. Persistent sleep difficulty deserves evidence-based care such as CBT-I with a qualified clinician.

The browser and standalone surfaces are implemented. The iOS Wall is deferred and is not represented as shipped. Chromium automation covers the release surfaces; broader installed Safari/Android proof, real-device VoiceOver/TalkBack acceptance, and human Punjabi cultural review remain open limitations.

## Contributing

Read [CONTEXT.md](./CONTEXT.md), the [layered Rasoi plan](./docs/LAYERED-RASOI-PLAN.md), and [ADR 0011](./docs/adr/0011-layer-rasoi-and-keep-replay-deliberate.md) before changing a product boundary. Preserve the Two-Loop Law, the immutable language, zero telemetry, deterministic solvability, and rendered phone/desktop evidence.

## License

Nindova is licensed under the [Apache License 2.0](./LICENSE). It is free to use, modify, and distribute under that license and its notice requirements.
