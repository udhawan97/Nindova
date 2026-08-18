# Changelog

## Unreleased

### Changed

- Gave the Session boundary an answer for every phase. A board still settling was previously unsupervised — nothing would close it if its final response never completed — and at the cap it now completes that response and records the Night before Rest.
- Moved the Session closure decision into one module so the fifteen-minute promise is decided in a single place and covered directly instead of only through the rendered Session.
- Moved version-4 same-tab resume validation into one decoder, so board identity, settled-Tile reachability, phase agreement, and the clock audit are proven directly rather than only through page reloads.
- Made the Masala Mound the single authority for kitchen-form Tiles; local memory now validates a stored completion against the vocabulary the board deals instead of a second hand-maintained list.
- Moved the Dawn keepsake frame beside the rest of Dawn, leaving the Session surface only to host the canvas and its export.

### Removed

- Deleted an unused nightly-recipe path in local memory that could never produce a board this product deals, and rebuilt the persistence fixture from a real Masala Mound.

### Verified

- Reran the full unit and rendered browser suites, added direct coverage for the closure rule and the resume decoder, and confirmed a capped Session records its Night before Rest through both the standalone HTML and the Session surface.
- Confirmed the Dawn keepsake frame is byte-identical before and after its move, on both the remembered Rasoi Night and the migrated legacy record.

### Not added

- No game, authored answer, state schema, score, streak, rank, visible timer, collection, randomized reward, assessment output, telemetry, or third-party runtime request. No release, tag, or deployment.

## 0.4.3 — 2026-08-13

### Changed

- Concentrated House hash, History, unfinished-table consent, scroll restoration, and focus return into one navigation transaction.
- Moved Grand Salon opening, restore, progress, table-kind interaction, chapter advance, focus policy, and persistence into one lifecycle module.
- Reduced the House-facing Sector Sprint interface to five operations while preserving its fixed route, foreground boundary, narrated parity, optional inputs, and fail-closed reload.
- Centralized preview, Chromium context, capability adapters, failure/request capture, and teardown for all twelve browser journeys without mocking product routes.
- Reframed the README and public site around one verified promise—every room knows when to close—and synchronized the Starlight docs, architecture decision, source-rendered media, social card, release facts, and House cache.

### Verified

- Added direct navigation-transaction and architecture ownership tests, then reran all eight rendered House completions, Sector Sprint Action/Narrated and feel paths, standalone and PWA journeys, local-state recovery, responsive/zoom/reduced-motion surfaces, same-origin request capture, and cold-offline entry.

### Not added

- No game, authored answer, state schema, score, streak, rank, visible timer, collection, randomized reward, assessment output, telemetry, or third-party runtime request.
- No native installer or iOS Wall; no claim of human enjoyment, sleep or memory benefit, cultural authenticity, or real-device assistive-technology acceptance.

## 0.4.2 — 2026-08-13

### Fixed

- Preserved a cancelled unfinished-table exit's exact category destination and scroll position so a later retry and confirmed leave returns to the same table context.
- Normalized Escape dismissal for the Gallery clear dialog and restored focus to its invoker in WebKit as well as Chromium.
- Restored the visible table Back control after browser-Back leave confirmation is cancelled by Escape, even when the browser supplies no useful dialog invoker.

### Verified

- Extended the rendered House gate so Sector Sprint's real Action pilot clears all five Acts and reaches the authored curtain call; the complete Narrated route remains independently covered.
- Refreshed the README, landing page, Starlight docs, release record, source media, package versions, and House static cache from the same candidate.

### Not added

- No score, streak, rank, visible timer, collection, randomized reward, assessment output, telemetry, or third-party runtime request.
- No change to Sector Sprint's authored gates, 240-second foreground boundary, the bounded Night Room, or the deferred iOS Wall.

## 0.4.1 — 2026-08-09

### Fixed

- Restored the exact House and category scroll position through browser and in-page Back while keeping forward transitions at the new view's top.
- Made failed Gallery completion writes truthful and retryable with the original run identity and completion time.
- Added count-scoped Gallery clear confirmation and failure-atomic clearing that preserves a canonical snapshot until both Gallery keys can be removed.
- Exposed immediate mobile paths to the five doors, including a visible recovery action after Sector Sprint safely closes on reload.
- Kept both adult-boundary choices operable at 320×568 and returned focus to the actual deep-linked view after acknowledgement.

### Changed

- Refreshed the House static cache, package versions, release downloads, and public documentation for the continuity fixes.
- Updated the transitive `nanoid` dependency to an audited non-vulnerable version without adding a runtime service or changing game behavior.

### Not added

- No score, streak, rank, visible timer, collection, randomized reward, assessment output, telemetry, or third-party runtime request.
- No change to the bounded Night Room, the deferred iOS Wall, or the entertainment-only meaning of Gallery completions.

## 0.4.0 — 2026-08-05

### Added

- Five Grand Salon category doors grouping eight finite games.
- Three sourced authored tactical rule studies: Navakankari placement, Aadu Puli Aattam movement, and one-turn Pallanguzhi sowing.
- Visible documented-scope, source, included-rule, and omitted-rule disclosures for every classic study.
- Canonical door/table URL fragments and safe copy-on-write migration from the v1 Gallery record to v2.

### Changed

- Polished Pattern Court with sandstone inlay, Mirror Forge with smoked mirror and brass, Stack Architect with rosewood pieces, and Lantern Ledger with a richer velvet stage.
- Synchronized the House, README, website, Starlight docs, source media, cache version, package versions, and release copy.
- Expanded deterministic and rendered coverage to all eight games, three traditional board geometries, phone layouts, keyboard paths, reduced motion, and cold-offline use.

### Not added

- No claim that the classic studies are complete traditional matches, definitive pan-Indian rules, or culturally representative human validation.
- No score, streak, rank, visible timer, collection, randomized reward, assessment output, telemetry, or third-party runtime service.

## 0.3.0 — 2026-08-03

### Added

- A complete original CC0-1.0 Nindova identity: the paired-diamond Phulkari lattice, drawn wordmark, Shahi Raat palette, utensil silhouettes, PWA icons, social card, and documented asset provenance.
- A qualitative end reflection that names the chosen path without measuring ability, speed, or performance.
- A restrained deterministic three-note chime and paired brass-and-peacock match bloom, both optional and reduced-motion safe.

### Changed

- Re-authored Deeper as a staged triple-crown search: each opening step includes unmatched free decoys but only one legal pair, across 510 exhaustively verified reachable states.
- Reworked the Session cards, layers, frame, and public surfaces with richer color and Punjabi-inspired material detail while preserving text labels and native controls.
- Refreshed the README, website, screenshots, public documentation, manifest, offline cache, and release evidence for the same source tree.

### Not added

- No IQ estimate, brain-speed judgment, score, rank, timer, personal best, history, streak, achievement, grade, collection, or randomized reward.
- No claim that the match feedback produces dopamine, ASMR, better cognition, or better sleep.

## 0.2.0 — 2026-08-03

### Added

- Gentle and Deeper tonight-only Masala Mound profiles with three- and four-layer authored geometry.
- Exhaustive proof of 382 Gentle and 517 Deeper reachable states, one terminal state each, and zero dead states.
- Optional Rasoi Image Drift: three deterministic board forms, a response-free screen-away prompt, and an immediate Rest exit.
- Calm, attributed CDC and NIH/NHLBI sleep education outside the nightly Session.

### Changed

- Extended the one global Session deadline through the end surface, optional Image Drift, and near-black Rest.
- Added version-4 same-tab recovery for exact profile/board restoration while keeping long-lived Dawn state and same-night completion idempotent.
- Made profile and layer distinctions explicit in native controls and semantic Tile labels.

### Not added

- No weekly ranking, score, streak, personal best, history, sleep grade, memory grade, randomized reward, or improvement claim.
- No runtime service, account, paid API, free-tier dependency, third-party asset, analytics, or remote resource.

## 0.1.0 — 2026-08-03

### Added

- Rasoi Pairs, a deterministic 36-tile pair-removal Session using nine Indian kitchen motifs.
- One shared legality kernel for rendering, input, help, removal, and exhaustive no-dead-state verification.
- Native semantic tiles, visible object names, keyboard completion, reduced motion, 200% zoom, and 320–1440px responsive layouts.
- Hidden twelve-minute automatic settle, fifteen-minute ceiling, optional sound, same-tab resume, and voluntary same-night deterministic replay.
- Version-3 local state with safe version-1/version-2 Dawn migration.
- First-light kitchen Dawn with local PNG and silent-loop export.
- Refreshed README, landing page, Starlight documentation, real rendered media, release notes, and checksummed artifacts.

### Changed

- Replaced the rejected desk, Vista, Visitor, and Drift game with the approved Rasoi Pairs experience.
- Reframed the Punjabi/Indian direction around everyday kitchen forms and restrained material craft.
- Tightened product claims: no clinical sleep, dopamine, CBT-I endorsement, or completed cultural-authenticity claim.
- Hardened same-tab resume to reject incomplete, invalid, duplicate, unreachable, or impossible phase/reason records and to continue quiet closure after a reload during settlement.
- Moved keyboard focus deterministically to the next free tile after each pair and exposed hints through both live text and tile labels.

### Removed

- The unused AI-generated object/Visitor sprite sheet and old Vista/Dawn screenshots.
- Old Echo/boat behavior from the active product; preserved legacy data remains available through the migration union.
