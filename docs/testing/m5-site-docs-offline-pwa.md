# M5 — Website, docs, and offline PWA evidence

> Historical Vista-arc public-surface evidence. Current release-facing proof is recorded in [Rasoi redesign evidence](./rasoi-redesign.md) and the [public-surface ledger](../PUBLIC-SURFACE-EVIDENCE.md).

## Implemented

- Replaced the generic public illustration with real 375×812 Session media and a real Dawn canvas render.
- Carried the Punjabi and Indian material system across the landing page, docs tokens, install icon, Session, and Dawn: indigo, marigold, madder/terracotta, brass, phulkari geometry, jali rhythm, mustard meadow, and riverside harbor.
- Added the complete docs set: nightly arc, privacy/local state, research receipts, roadmap, and deferred iOS Wall alongside the existing contract, accessibility, architecture, testing, Dawn, and limitations pages.
- Added a versioned `/play/` service worker, install manifest, maskable SVG icon, deterministic cache replacement, and base-path-aware preview routing.
- Added the local, notification-free, idempotent “Same time tomorrow?” action and a one-time state migration from v1 to v2.

## Automated proof

- Chromium reports zero installability errors and parses the standalone-display manifest.
- `/Nindova/` base-path links resolve to `/Nindova/play/` and `/Nindova/docs/`; the service worker scope is exactly `/Nindova/play/`.
- The offline cache contains only same-origin static shell URLs. It contains no local-state key, blob URL, Dawn export, or share payload.
- With audio construction forced to fail, an offline Session still reaches `end`, persists one completion, records the return intention without requesting notification permission, and replays the same night idempotently.
- Legacy v1 state migrates once to `nindova:night-state:v2`; corrupt v2 state fails open.
- The self-contained `nindova.html` has embedded Night and Dawn engines, no manifest, no worker registration, and no controlling service worker.
- Landing and documentation surfaces have no horizontal overflow at 320, 375, 414, 768, or 1280 CSS pixels. Clickable labels remain single-line, and essential hero content fits a 1280×800 fold.
- Token contrast tests cover ink, soft ink, muted text, neutral text, accent text, accent-button text, reverse surfaces, and focus against every surface they use.

Run:

```sh
npm run test:unit
npm run test:pwa
```

## Rendered inspection

- Inspected the public page at 320×568, 375×812, 1280×800, and 1440×900.
- Inspected the tracked real Session portrait and Dawn media before wiring them into the page.
- Hallmark pre-emit critique: Philosophy 5, Hierarchy 5, Execution 5, Specificity 5, Restraint 5, Variety 4.
- Hallmark slop gate: 58/58 passed after reducing the hero media for the 1280×800 fold and expanding contrast coverage.

## Honest boundary

Chromium proves installability and offline behavior in automation. A real installed Safari/Android PWA and mobile VoiceOver/TalkBack remain untested risks; they are documented rather than claimed.
