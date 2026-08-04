# Graph Report - Nindova  (2026-08-04)

## Corpus Check
- 118 files · ~111,915 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 941 nodes · 1181 edges · 86 communities (65 shown, 21 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 112 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ca69009`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- session.ts
- Rasoi Pairs
- night-core.ts
- Automated Release Gates
- scripts
- Rasoi Pairs Session Interface
- rasoi-core.ts
- Nindova Master Brief
- NINDOVA — Brand Guide
- Rasoi Pairs Accessibility
- compilerOptions
- site/package.json
- dawn-core.ts
- Nine Indian Kitchen Motifs
- session/package.json
- compilerOptions
- run-seed-observational.mjs
- Nindova Rasoi Pairs App Icon
- Nindova Rasoi Diamond Favicon
- pwa-offline.mjs
- sw.js
- color-contrast.test.mjs
- dawn-core.test.mjs
- Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks
- compose-build.mjs
- dawn.mjs
- portrait-accessibility.mjs
- seed-asserted.mjs
- assessment-readiness.ts
- serve.mjs
- self-closing.mjs
- wall-clock-cap.mjs
- package.json
- copy-contract.test.mjs
- Punjabi and Indian Material World
- night-memory.mjs
- reference-integrity.test.mjs
- Nindova contributor guidance
- content.config.ts
- Hybrid Procedural Illustration
- Hybrid Procedural and Composed Audio
- Portrait-First Session
- Public Site and Session Separation
- Monotonic Fifteen-minute Session Cap
- M5 Honest Verification Boundary
- Deterministic Solvable Closure
- Local-Only Privacy Boundary
- Observational Test Limitation
- Bedtime game evidence brief
- Quiet Depth plan
- Nindova v0.2.0 — Quiet Depth
- Q: Why does Rasoi Pairs lack Mahjong-like layered challenge and visible replay?
- layered-rasoi.mjs
- generate-play-qr.mjs
- devDependencies
- public-surface.mjs
- visual-identity.md
- NINDOVA — Asset Manifest
- Nindova v0.3.0 — Shahi Mound
- Assessment readiness
- brand-assets.test.mjs
- Q: Make the app theme more royal and sophisticated
- Rasoi Pairs v0.1.0 Change Set
- workspaces
- tile-latency.mjs
- house.ts
- test-demo.mjs
- house/package.json
- compilerOptions
- house.mjs
- assessment-readiness.test.mjs
- Q: rasoi dawn looks so ugly
- Q: Council coverage review of the adult Nindova House entertainment implementation
- house-core.test.mjs
- showView
- RasoiDebug
- selectTile
- restoreActiveSession

## God Nodes (most connected - your core abstractions)
1. `scripts` - 28 edges
2. `Bedtime game evidence brief` - 17 edges
3. `NINDOVA — Brand Guide` - 13 edges
4. `restoreActiveSession()` - 12 edges
5. `Quiet Depth plan` - 12 edges
6. `getGame()` - 11 edges
7. `advanceChapter()` - 11 edges
8. `Nindova Master Brief` - 11 edges
9. `RasoiDebug` - 10 edges
10. `selectTile()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Fifteen-Minute Session Cap` --semantically_similar_to--> `Bounded Self-Ending Session`  [INFERRED] [semantically similar]
  docs/adr/0005-cap-the-real-session-at-fifteen-minutes.md → reference/nindova-master-brief.md
- `Sound Off Control` --conceptually_related_to--> `Rasoi Pairs`  [INFERRED]
  apps/site/public/media/rasoi-pairs-phone.png → CONTEXT.md
- `persistActiveSession()` --indirect_call--> `state()`  [INFERRED]
  apps/session/src/session.ts → reference/test-demo.mjs
- `User-Chosen Unguilted Wall` --semantically_similar_to--> `Between-Session Return System`  [INFERRED] [semantically similar]
  docs/adr/0003-keep-the-wall-user-chosen-and-unguilted.md → reference/nindova-master-brief.md
- `Asymmetric Vista Memory` --semantically_similar_to--> `Between-Session Return System`  [INFERRED] [semantically similar]
  docs/adr/0004-use-asymmetric-vista-memory.md → reference/nindova-master-brief.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Measured Production Wall-clock Result** — docs_testing_m6_release_hardening_722_330_wall_seconds, docs_testing_m6_release_hardening_722_289_internal_seconds, docs_testing_m6_release_hardening_900_000_ceiling, docs_testing_m6_release_hardening_production_cap, docs_testing_m6_release_hardening_zero_browser_errors [EXTRACTED 1.00]
- **Release Gate Evidence** — docs_testing_m6_release_hardening_41_plus_assertions, docs_testing_m6_release_hardening_rasoi_reachability, docs_testing_m6_release_hardening_pair_removal_arc, docs_testing_m6_release_hardening_accessibility_evidence, docs_testing_m6_release_hardening_state_recovery_evidence, docs_testing_m6_release_hardening_distribution_evidence [EXTRACTED 1.00]
- **Rasoi v0.1.0 Release Evidence Chain** — docs_releases_v0_1_0_release_notes, docs_public_surface_evidence_public_surface_evidence_ledger, apps_site_src_content_docs_docs_testing_testing [INFERRED 0.95]
- **Bounded Rasoi Session Contract** — docs_redesign_plan_enter_pair_settle_dawn, apps_site_src_content_docs_docs_nightly_arc_fixed_session_path, apps_site_src_content_docs_docs_architecture_browser_local_state, apps_site_src_content_docs_docs_privacy_local_state_active_session_v2 [INFERRED 0.95]
- **Local Night State to Dawn Flow** — apps_site_src_content_docs_docs_night_and_local_state_version_3_state, apps_site_src_content_docs_docs_dawn_captured_zone_eligibility, apps_site_src_content_docs_docs_dawn_local_keepsake_exports [INFERRED 0.95]
- **Rasoi Dawn Visual Composition** — apps_site_public_media_rasoi_dawn_rasoi_dawn_image, apps_site_public_media_rasoi_dawn_first_light_kitchen, apps_site_public_media_rasoi_dawn_brass_plate_arrangement, apps_site_public_media_rasoi_dawn_warm_dawn_palette [INFERRED 0.95]
- **Three Visible Free Kitchen Pairs** — apps_site_public_media_rasoi_pairs_phone_chimta_pair, apps_site_public_media_rasoi_pairs_phone_chai_pair, apps_site_public_media_rasoi_pairs_phone_katori_pair [EXTRACTED 1.00]
- **Bounded Session Decision and Proof** — reference_nindova_master_brief_two_loop_law, reference_nindova_demo_fixed_session_state_arc, docs_adr_0005_cap_the_real_session_at_fifteen_minutes_fifteen_minute_session_cap [INFERRED 0.95]

## Communities (86 total, 21 thin omitted)

### Community 0 - "session.ts"
Cohesion: 0.07
Nodes (33): NindovaDawn, boardElement, boardShell, boardStatus, closeDawn(), DAWN_PALETTE, dawnButton, dawnCanvas (+25 more)

### Community 1 - "Rasoi Pairs"
Cohesion: 0.05
Nodes (48): Chai Tile Pair, Chimta Tile Pair, The Edge Tiles Are Ready Status, Visible Free Edge Pairs, Katori Tile Pair, Indian Kitchen Tile Motifs, Match Free Edge Tiles, Punjabi-inspired Material Direction (+40 more)

### Community 2 - "night-core.ts"
Cohesion: 0.10
Nodes (38): addCivilDays(), captureNight(), CLOTHS, completeState(), createPrng(), decodeState(), emptyState(), isText() (+30 more)

### Community 3 - "Automated Release Gates"
Cohesion: 0.07
Nodes (30): Active-record Recovery and Reload Settlement Tests, Full Keyboard Pairing at 200 Percent Zoom, Verified Source-proven and Untested Evidence Levels, Release Verification Commands, Rasoi Release Gates, Rasoi Pairs Testing, Untouched Production Wall-clock Gate, 41 Plus Pure Unit Assertions (+22 more)

### Community 4 - "scripts"
Cohesion: 0.07
Nodes (28): scripts, build, build:house, build:qr, build:session, build:site, capture:brand-social, capture:public-media (+20 more)

### Community 5 - "Rasoi Pairs Session Interface"
Cohesion: 0.05
Nodes (44): Session Asset Provenance, First-Light Dawn Surface, Browser Dismissal Surface, Voluntary Intake Surface, Scoped PWA Bootstrap, Quiet End Card, Rasoi Pairs Session Interface, Semantic Rasoi Board (+36 more)

### Community 6 - "rasoi-core.ts"
Cohesion: 0.12
Nodes (29): activeTiles(), availabilityReason(), BoardVerification, createBoard(), createPrng(), DEEPER_LAYOUT, freeTiles(), GENTLE_LAYOUT (+21 more)

### Community 7 - "Nindova Master Brief"
Cohesion: 0.09
Nodes (30): User-Chosen Unguilted Wall, Asymmetric Vista Memory, Fifteen-Minute Session Cap, Browser and PWA Before iOS Wall, Codex Kickoff Protocol, Decay-Driven Assistance, Dual Pacing Profiles, Fixed Session State Arc (+22 more)

### Community 8 - "NINDOVA — Brand Guide"
Cohesion: 0.14
Nodes (13): Clear space & minimum sizes, Comparison (5 = best), Design rationale — three concepts explored, Final refinements applied, Icon family (Masala Mound motifs), Identity, Incorrect usage, Motion (+5 more)

### Community 9 - "Rasoi Pairs Accessibility"
Cohesion: 0.40
Nodes (5): Rasoi Pairs Accessibility, Accessible Alternate Presentation, Live Semantic Selection and Hint Feedback, Real-device Assistive Technology Limit, Semantic Tile Controls

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+11 more)

### Community 11 - "site/package.json"
Cohesion: 0.11
Nodes (18): dependencies, astro, @astrojs/starlight, @fontsource-variable/geist, @fontsource-variable/newsreader, @fontsource-variable/geist, @fontsource-variable/newsreader, license (+10 more)

### Community 12 - "dawn-core.ts"
Cohesion: 0.15
Nodes (12): chooseLoopType(), DawnEligibility, DawnLocalParts, eligibility(), extensionFor(), localParts(), LOOP_TYPES, NindovaDawnApi (+4 more)

### Community 13 - "Nine Indian Kitchen Motifs"
Cohesion: 0.15
Nodes (16): Highlighted Outer Edge Tiles, Icon-and-Text Tile Labels, Warm Stone Indigo Brass Madder and Blue Palette, Mirrored Authored Motif Groups, Chimta Tiffin Belan Chai Masala Tawa Katori Chakla and Cooker, Nine Indian Kitchen Motifs, Redundant Pair Recognition Through Icons and Text, Indigo Phulkari-Inspired Lattice Background (+8 more)

### Community 14 - "session/package.json"
Cohesion: 0.15
Nodes (12): devDependencies, vite, vite, license, name, private, scripts, build (+4 more)

### Community 15 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, noEmit, noImplicitAny, strict, strictNullChecks, useUnknownInCatchVariables, extends, include (+2 more)

### Community 16 - "run-seed-observational.mjs"
Cohesion: 0.22
Nodes (8): child, disposablePath, output, portable, root, seedPath, sourcePath, tempParent

### Community 17 - "Nindova Rasoi Pairs App Icon"
Cohesion: 0.32
Nodes (8): Four Cardinal Textile Diamonds, Symmetrical Central Focal Mark, Brass Masala Dabba, Indigo Madder Brass and Cream Palette, Phulkari-Inspired Diamond, Indian Kitchen Brand Identity, Five Radial Spice Bowls, Nindova Rasoi Pairs App Icon

### Community 18 - "Nindova Rasoi Diamond Favicon"
Cohesion: 0.33
Nodes (7): Brass Circular Spice Box, Compact Geometric Legibility, Indigo Brass Cream and Madder Palette, Indigo Rasoi Diamond, Dark Rounded-Square Field, Radial Madder Spice Wells, Nindova Rasoi Diamond Favicon

### Community 19 - "pwa-offline.mjs"
Cohesion: 0.17
Nodes (9): base, href(), motifs, standaloneUrl, DeniedAudioContext, errors, requests, root (+1 more)

### Community 20 - "sw.js"
Cohesion: 0.53
Nodes (5): canonicalPrecacheUrl(), matchOwned(), PRECACHE, PRECACHE_URLS, refreshFromNetwork()

### Community 21 - "color-contrast.test.mjs"
Cohesion: 0.24
Nodes (10): bodyPairs, luminance(), motifRules, ratio(), relativeLuminance(), rgbRatio(), root, sessionRatio() (+2 more)

### Community 23 - "Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks, Source Nodes

### Community 24 - "compose-build.mjs"
Cohesion: 0.33
Nodes (5): houseOutput, output, root, sessionOutput, siteOutput

### Community 25 - "dawn.mjs"
Cohesion: 0.18
Nodes (7): captures, errors, output, port, root, server, recipeTwoCompletion

### Community 27 - "seed-asserted.mjs"
Cohesion: 0.40
Nodes (4): errors, output, root, states

### Community 28 - "assessment-readiness.ts"
Cohesion: 0.16
Nodes (12): ASSESSMENT_AUTHORIZATION, ASSESSMENT_PROTOCOL_VERSION, AssessmentInputDecision, AssessmentReadiness, evaluateAssessmentReadiness(), EvidenceStatus, hasText(), isReviewedEvidence() (+4 more)

### Community 29 - "serve.mjs"
Cohesion: 0.50
Nodes (3): mime, port, root

### Community 31 - "wall-clock-cap.mjs"
Cohesion: 0.50
Nodes (3): errors, root, server

### Community 32 - "package.json"
Cohesion: 0.22
Nodes (8): engines, node, license, name, packageManager, private, type, version

### Community 35 - "Punjabi and Indian Material World"
Cohesion: 0.67
Nodes (3): Cultural Visual Guardrails, Punjabi and Indian Material World, Theme and Behavior Independence

### Community 51 - "Bedtime game evidence brief"
Cohesion: 0.07
Nodes (27): 0. Why sleep matters—and how to say it without fear, 1. Interactive screen games and sleepiness, 2. Evening light, arousal, and media displacement, 3. Cognitive distraction and serial diverse imagining, 4. Memory evidence: pair matching is not general memory improvement, 5. Why “dopamine effect” is not supportable, 6. Why rankings, streaks and weekly performance are the wrong layer, 7. Candidate post-board transitions (+19 more)

### Community 52 - "Quiet Depth plan"
Cohesion: 0.05
Nodes (37): Layer Rasoi and keep replay deliberate, Add tonight-only depth and optional Image Drift, Add the adult Nindova House while preserving the Night Room, Add a fail-closed assessment-readiness contract, Acceptance gates, Availability, Board contract, Desktop wireframe (+29 more)

### Community 53 - "Nindova v0.2.0 — Quiet Depth"
Cohesion: 0.40
Nodes (4): Added, Evidence boundary, Improved, Nindova v0.2.0 — Quiet Depth

### Community 54 - "Q: Why does Rasoi Pairs lack Mahjong-like layered challenge and visible replay?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Why does Rasoi Pairs lack Mahjong-like layered challenge and visible replay?, Source Nodes

### Community 55 - "layered-rasoi.mjs"
Cohesion: 0.33
Nodes (3): open(), root, watchPage()

### Community 58 - "devDependencies"
Cohesion: 0.13
Nodes (15): @astrojs/check, jsqr, devDependencies, @astrojs/check, jsqr, @playwright/test, pngjs, qrcode (+7 more)

### Community 59 - "public-surface.mjs"
Cohesion: 0.33
Nodes (4): errors, output, root, server

### Community 60 - "visual-identity.md"
Cohesion: 0.40
Nodes (4): Masala Mound silhouettes, Motion and provenance, Phulkari lattice, Shahi Raat palette

### Community 61 - "NINDOVA — Asset Manifest"
Cohesion: 0.40
Nodes (4): apps/session/assets/motifs/, apps/site/public/brand/, docs/brand/, NINDOVA — Asset Manifest

### Community 62 - "Nindova v0.3.0 — Shahi Mound"
Cohesion: 0.40
Nodes (4): Added, Evidence boundary, Improved, Nindova v0.3.0 — Shahi Mound

### Community 63 - "Assessment readiness"
Cohesion: 0.40
Nodes (4): Assessment readiness, Required evidence gates, Sequencing, What is implemented

### Community 65 - "Q: Make the app theme more royal and sophisticated"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Make the app theme more royal and sophisticated, Source Nodes

### Community 67 - "Rasoi Pairs v0.1.0 Change Set"
Cohesion: 0.05
Nodes (46): Rasoi Browser Architecture, Session Clock and Local State Architecture, Shared Rasoi Legality Kernel Architecture, Session Site and Composition Workspace, Universal 343-state Board Guarantee, Voluntary Pair-removal Session Path, Mahjong-solitaire Rule Inspiration, Rasoi Pairs Session Arc (+38 more)

### Community 68 - "workspaces"
Cohesion: 0.50
Nodes (4): workspaces, apps/house, apps/session, apps/site

### Community 69 - "tile-latency.mjs"
Cohesion: 0.38
Nodes (5): cpuThrottle, elapsedUntil(), measureTarget(), root, tapTile()

### Community 70 - "house.ts"
Cohesion: 0.08
Nodes (55): active, ActiveGame, advanceChapter(), answerChoice(), audienceDialog, celebration, ChoiceChapter, completeEntertainmentGame() (+47 more)

### Community 71 - "test-demo.mjs"
Cohesion: 0.50
Nodes (3): errors, page, state()

### Community 72 - "house/package.json"
Cohesion: 0.11
Nodes (17): dependencies, @fontsource-variable/geist, @fontsource-variable/newsreader, devDependencies, vite, @fontsource-variable/geist, @fontsource-variable/newsreader, vite (+9 more)

### Community 73 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+8 more)

### Community 74 - "house.mjs"
Cohesion: 0.20
Nodes (7): completeStackGame(), errors, externalRequests, hanoiMoves(), output, root, server

### Community 76 - "Q: rasoi dawn looks so ugly"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: rasoi dawn looks so ugly, Source Nodes

### Community 77 - "Q: Council coverage review of the adult Nindova House entertainment implementation"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Council coverage review of the adult Nindova House entertainment implementation, Source Nodes

### Community 82 - "showView"
Cohesion: 0.18
Nodes (16): advanceBy(), clearClosureTimers(), currentDawnEligibility(), element(), enforceBoundary(), enterDrift(), enterRest(), iconSvg() (+8 more)

### Community 83 - "RasoiDebug"
Cohesion: 0.16
Nodes (6): RasoiDebug, RasoiTileSnapshot, SessionState, Window, RasoiBoard, RasoiMotifId

### Community 84 - "selectTile"
Cohesion: 0.38
Nodes (12): NindovaRasoi, animatePair(), beginSession(), createBoardDom(), hint(), persistActiveSession(), selectTile(), setStatus() (+4 more)

### Community 85 - "restoreActiveSession"
Cohesion: 0.39
Nodes (8): NindovaNight, anchorSessionClock(), clearActiveSession(), finishSession(), LEGACY_ACTIVE_SESSION_KEYS, renderPathNote(), restoreActiveSession(), safeStorage()

## Knowledge Gaps
- **435 isolated node(s):** `name`, `version`, `license`, `private`, `type` (+430 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `Theme and Behavior Independence` (2× useful, score=1.988434631)
- `Rasoi Pairs Session Interface` (2× useful, score=1.964935488) _(code changed — re-verify)_
- `Dawn` (2× useful, score=1.964611965) _(code changed — re-verify)_

**Known dead ends** — questions that led nowhere; don't re-derive.
- "Council coverage review of the adult Nindova House entertainment implementation" -> `Offline PWA and Public Surface`, `pwa-offline.mjs`

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Rasoi Pairs` connect `Rasoi Pairs` to `Rasoi Pairs Session Interface`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Calm Bounded Pair-removal Promise` connect `Rasoi Pairs` to `Rasoi Pairs v0.1.0 Change Set`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `Nindova v0.1.0 Distribution` connect `Rasoi Pairs Session Interface` to `Rasoi Pairs`, `Automated Release Gates`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `version`, `license` to the rest of the system?**
  _435 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0746031746031746 - nodes in this community are weakly interconnected._
- **Should `Rasoi Pairs` be split into smaller, more focused modules?**
  _Cohesion score 0.04964539007092199 - nodes in this community are weakly interconnected._
- **Should `night-core.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0975609756097561 - nodes in this community are weakly interconnected._