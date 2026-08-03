---
title: Nindova documentation
description: Product contract and implementation notes for Rasoi Pairs and its browser-first release.
---

Nindova is a bounded late-night game. **Masala Mound** presents 36 Indian kitchen tiles in a Gentle three-layer or Deeper four-layer profile. Match two identical tiles when nothing covers them and one side is open; the board grows lighter and then the Session closes.

> Nothing to win. Nothing tracked. Nothing you can do wrong.

## Start here

- [Getting started](./getting-started/) covers the standalone file, local workspace, and composed PWA build.
- [Product contract](./product-contract/) records the promises every implementation must keep.
- [Rasoi Pairs Session](./nightly-arc/) defines free tiles, pairing, help, settlement, and closure.
- [Night and local state](./night-and-local-state/) explains deterministic boards and safe v1/v2 migration.
- [Privacy and local state](./privacy-local-state/) inventories long-lived, ephemeral, and cached data.
- [Dawn](./dawn/) describes the first-light kitchen composition and local exports.
- [Accessibility](./accessibility/) explains the native tile controls and alternate presentation.
- [Architecture](./architecture/) maps the legality kernel, browser shell, PWA, site, and Dawn.
- [Testing](./testing/) separates rendered evidence, source proof, and untested risk.
- [Research receipts](./research-receipts/) states the behavioral evidence and its limits.
- [Roadmap](./roadmap/), [Known limitations](./known-limitations/), and [Deferred iOS Wall](./ios-wall/) distinguish the release from future work.

The iOS Wall remains deferred. “Not now” in the browser demonstrates voluntary re-entry; it is not proof of native Screen Time interception.
