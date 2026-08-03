# Nindova

Nindova is a calm, bounded pair-removal game for the end of the day. **Masala Mound** uses the uncovered-and-open-side rule of Mahjong solitaire and fills authored overlapping layers with everyday Indian kitchen forms: belan, chakla, tawa, chimta, steel katori, tiffin, masala dabba, chai glass, and pressure cooker.

> Nothing to win. Nothing tracked. Nothing you can do wrong.

![The real Deeper Masala Mound board, showing four overlapping layers of Indian kitchen tiles](./apps/site/public/media/rasoi-board.png)

## Get Nindova

- [Download v0.2.0](https://github.com/udhawan97/Nindova/releases/tag/v0.2.0) for the checksummed self-contained HTML file and complete web/PWA archive, or build the same source locally.
- [Play the live PWA](https://udhawan97.github.io/Nindova/play/) or scan the direct, non-tracking QR below. The pinned GitHub Pages workflow publishes the same static build from `main`; the live route is browser-verified and a physical-device scan remains a separate evidence lane.
- [Open the release history](https://github.com/udhawan97/Nindova/releases) for the previous flat-rack build and its checksums.

The local `/play/` route works after serving a build, and `dist/nindova.html` works as a self-contained file even when hosting is unavailable.

<img src="./apps/site/public/play-qr.svg" width="180" alt="Direct QR for the canonical Nindova play URL">

The QR artifact encodes the full canonical URL with no shortener or tracking parameter. Keep the printed URL with the code so people can verify its destination when hosting is available.

## The experience

- **A spatial rule.** Choose two matching tiles only when nothing overlaps them from above and at least one horizontal side is open.
- **A tonight-only choice.** Gentle stack has three more-open layers. Deeper stack uses four layers and more look-ahead. They are equal preferences, not levels or ability labels.
- **Guaranteed closure.** Gentle is exhaustively verified across 382 reachable states; Deeper across 517. Each has one terminal state, zero dead states, and no losing legal choice.
- **Clear match feedback.** Each legal pair folds inward through one brief, deterministic brass bloom; reduced motion uses opacity only and sound stays off by default.
- **Quiet help.** “Show a safe pair” identifies a pair but never removes it.
- **No performance layer.** No score, weekly rank, history, count, timer, streak, achievement, grade, collection, missed-night state, or randomized reward.
- **A real ending.** Clearing the board closes the Session. If left unfinished, it settles itself before the hidden fifteen-minute ceiling. Rest is primary; optional Rasoi Image Drift carries three familiar forms away from the screen and never routes back into play.
- **Dawn, by choice.** From 06:00 through 11:59 in the captured Night ID zone, the previous night’s kitchen forms return as a first-light still and optional silent loop.
- **Voluntary return.** “Not now” leaves Nindova available later that same night. After completion, closing and deliberately reopening Nindova starts another separately bounded Session on the identical board without multiplying Dawn.

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

The main gates prove the 382-state Gentle and 517-state Deeper invariants, deterministic Night ID, recipe-two Dawn preservation, v1/v2-to-v3 local migration, profile-bound same-tab recovery, idempotent same-night return, layered rendering, brass-bloom/Image-Drift/reduced-motion behavior, Dawn eligibility/export fallback, 320–1440px rendered layouts, keyboard operation, 200% zoom, 44px targets, offline PWA closure, standalone independence, same-origin runtime requests, and the real production ceiling.

See [Testing](./apps/site/src/content/docs/docs/testing.md) and the [public-surface evidence ledger](./docs/PUBLIC-SURFACE-EVIDENCE.md) for evidence levels and remaining risk.

## Privacy and local state

Nindova has no account, analytics, app telemetry, ads, app-controlled remote logging, or third-party runtime request. The production Session is static and same-origin. A static host may keep its own operational access logs outside the app's control.

Long-lived local storage contains one version-3 record with only the latest completion facts needed by Dawn, a safely migrated legacy Dawn variant when present, and the optional local “Same time tomorrow?” intention. The selected board profile and interaction timing exist only in version-4 same-tab session storage to enforce deterministic resume and closure; neither becomes history. Generated images and loops remain local blobs unless the person explicitly saves or shares them.

## Product and evidence boundary

Nindova is a behavioral design study for people aged 13 and up. It is not a sleep tracker, sleep-performance tool, memory intervention, or treatment. Masala Mound uses recognition, visual search, and spatial planning, but has not been clinically shown to make people sleepy, produce a useful dopamine response, improve general memory, or improve sleep at any age. Persistent sleep difficulty deserves evidence-based care such as CBT-I with a qualified clinician.

The browser and standalone surfaces are implemented. The iOS Wall is deferred and is not represented as shipped. Chromium automation covers the release surfaces; broader installed Safari/Android proof, real-device VoiceOver/TalkBack acceptance, and human Punjabi cultural review remain open limitations.

## Contributing

Read [CONTEXT.md](./CONTEXT.md), the [Quiet Depth plan](./docs/QUIET-DEPTH-PLAN.md), and [ADR 0012](./docs/adr/0012-add-tonight-only-depth-and-image-drift.md) before changing a product boundary. Preserve the Two-Loop Law, the immutable language, zero telemetry, deterministic solvability, and rendered phone/desktop evidence.

## License

Nindova is licensed under the [Apache License 2.0](./LICENSE). It is free to use, modify, and distribute under that license and its notice requirements.

Redistributed font licenses are listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) and shipped with the composed site.
