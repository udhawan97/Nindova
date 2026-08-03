# Graph Report - Nindova  (2026-08-03)

## Corpus Check
- 78 files · ~50,593 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 585 nodes · 739 edges · 51 communities (34 shown, 17 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 107 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `094d680e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- session.ts
- Rasoi Pairs
- night-core.ts
- Release Automated Gates
- scripts
- Rasoi Pairs Session Interface
- rasoi-core.ts
- Nindova Master Brief
- Calm Bounded Pair-removal Promise
- Rasoi Pairs v0.1.0 Change Set
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
- test-demo.mjs
- serve.mjs
- self-closing.mjs
- wall-clock-cap.mjs
- index.astro
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

## God Nodes (most connected - your core abstractions)
1. `scripts` - 19 edges
2. `Nindova Master Brief` - 11 edges
3. `Release Automated Gates` - 11 edges
4. `RasoiDebug` - 10 edges
5. `restoreActiveSession()` - 10 edges
6. `Rasoi Pairs` - 10 edges
7. `Rasoi Pairs Redesign Evidence` - 10 edges
8. `Rasoi Pairs v0.1.0 Change Set` - 10 edges
9. `selectTile()` - 9 edges
10. `settle()` - 9 edges

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
- **Complete Automated Release Gate** — docs_testing_m6_release_hardening_41_plus_assertions, docs_testing_m6_release_hardening_continuous_keyboard_200_zoom, docs_testing_m6_release_hardening_strict_active_record_recovery, docs_testing_m6_release_hardening_reload_during_settlement_closure [EXTRACTED 1.00]
- **Corrected Production Wall-clock Observation** — docs_testing_m6_release_hardening_corrected_wall_clock_proof, docs_testing_m6_release_hardening_passed_722_257_end, docs_testing_m6_release_hardening_passed_900_000_ceiling, docs_testing_m6_release_hardening_production_cap_result [EXTRACTED 1.00]
- **Rasoi v0.1.0 Release Evidence Chain** — docs_releases_v0_1_0_release_notes, docs_testing_m6_release_hardening_v0_1_0_release_hardening, docs_public_surface_evidence_public_surface_evidence_ledger, apps_site_src_content_docs_docs_testing_testing [INFERRED 0.95]
- **Bounded Rasoi Session Contract** — docs_redesign_plan_enter_pair_settle_dawn, apps_site_src_content_docs_docs_nightly_arc_fixed_session_path, apps_site_src_content_docs_docs_architecture_browser_local_state, apps_site_src_content_docs_docs_privacy_local_state_active_session_v2 [INFERRED 0.95]
- **Local Night State to Dawn Flow** — apps_site_src_content_docs_docs_night_and_local_state_version_3_state, apps_site_src_content_docs_docs_dawn_captured_zone_eligibility, apps_site_src_content_docs_docs_dawn_local_keepsake_exports [INFERRED 0.95]
- **Rasoi Dawn Visual Composition** — apps_site_public_media_rasoi_dawn_rasoi_dawn_image, apps_site_public_media_rasoi_dawn_first_light_kitchen, apps_site_public_media_rasoi_dawn_brass_plate_arrangement, apps_site_public_media_rasoi_dawn_warm_dawn_palette [INFERRED 0.95]
- **Three Visible Free Kitchen Pairs** — apps_site_public_media_rasoi_pairs_phone_chimta_pair, apps_site_public_media_rasoi_pairs_phone_chai_pair, apps_site_public_media_rasoi_pairs_phone_katori_pair [EXTRACTED 1.00]
- **Bounded Session Decision and Proof** — reference_nindova_master_brief_two_loop_law, reference_nindova_demo_fixed_session_state_arc, docs_adr_0005_cap_the_real_session_at_fifteen_minutes_fifteen_minute_session_cap [INFERRED 0.95]

## Communities (51 total, 17 thin omitted)

### Community 0 - "session.ts"
Cohesion: 0.08
Nodes (52): NindovaDawn, NindovaNight, NindovaRasoi, advanceBy(), beginSession(), boardElement, boardShell, boardStatus (+44 more)

### Community 1 - "Rasoi Pairs"
Cohesion: 0.06
Nodes (43): Chai Tile Pair, Chimta Tile Pair, The Edge Tiles Are Ready Status, Visible Free Edge Pairs, Katori Tile Pair, Indian Kitchen Tile Motifs, Match Free Edge Tiles, Punjabi-inspired Material Direction (+35 more)

### Community 2 - "night-core.ts"
Cohesion: 0.10
Nodes (37): addCivilDays(), captureNight(), CLOTHS, completeState(), createPrng(), decodeState(), emptyState(), isText() (+29 more)

### Community 3 - "Release Automated Gates"
Cohesion: 0.06
Nodes (39): Rasoi Pairs Accessibility, Accessible Alternate Presentation, Live Semantic Selection and Hint Feedback, Real-device Assistive Technology Limit, Semantic Tile Controls, Nindova Getting Started, Standalone and Composed Release Surfaces, Active-record Recovery and Reload Settlement Tests (+31 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (38): @astrojs/check, devDependencies, @astrojs/check, @playwright/test, @types/node, typescript, engines, node (+30 more)

### Community 5 - "Rasoi Pairs Session Interface"
Cohesion: 0.06
Nodes (38): Session Asset Provenance, First-Light Dawn Surface, Browser Dismissal Surface, Voluntary Intake Surface, Scoped PWA Bootstrap, Quiet End Card, Rasoi Pairs Session Interface, Semantic Rasoi Board (+30 more)

### Community 6 - "rasoi-core.ts"
Cohesion: 0.10
Nodes (25): RasoiDebug, RasoiTileSnapshot, SessionState, Window, activeTiles(), BoardVerification, createBoard(), createPrng() (+17 more)

### Community 7 - "Nindova Master Brief"
Cohesion: 0.09
Nodes (30): User-Chosen Unguilted Wall, Asymmetric Vista Memory, Fifteen-Minute Session Cap, Browser and PWA Before iOS Wall, Codex Kickoff Protocol, Decay-Driven Assistance, Dual Pacing Profiles, Fixed Session State Arc (+22 more)

### Community 8 - "Calm Bounded Pair-removal Promise"
Cohesion: 0.08
Nodes (26): Universal 343-state Board Guarantee, Deliberately Deferred iOS Wall, Human and Device Hardening, Nindova v0.1.0 Roadmap, Shipped Rasoi v0.1.0 Surface, 343-state Verified Browser Arc, All Eighteen Pairs by Keyboard at 200 Percent Zoom, Production Fifteen-minute Hard Ceiling (+18 more)

### Community 9 - "Rasoi Pairs v0.1.0 Change Set"
Cohesion: 0.10
Nodes (24): Rasoi Browser Architecture, Session Clock and Local State Architecture, Shared Rasoi Legality Kernel Architecture, Session Site and Composition Workspace, Voluntary Pair-removal Session Path, Semantic Safe-pair Hint, Active-session v2 Strict Validation and Reload Settlement, Bounded Version 3 Night Record (+16 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+11 more)

### Community 11 - "site/package.json"
Cohesion: 0.11
Nodes (17): dependencies, astro, @astrojs/starlight, @fontsource-variable/geist, @fontsource-variable/newsreader, name, private, scripts (+9 more)

### Community 12 - "dawn-core.ts"
Cohesion: 0.15
Nodes (12): chooseLoopType(), DawnEligibility, DawnLocalParts, eligibility(), extensionFor(), localParts(), LOOP_TYPES, NindovaDawnApi (+4 more)

### Community 13 - "Nine Indian Kitchen Motifs"
Cohesion: 0.15
Nodes (16): Highlighted Outer Edge Tiles, Icon-and-Text Tile Labels, Warm Stone Indigo Brass Madder and Blue Palette, Mirrored Authored Motif Groups, Chimta Tiffin Belan Chai Masala Tawa Katori Chakla and Cooker, Nine Indian Kitchen Motifs, Redundant Pair Recognition Through Icons and Text, Indigo Phulkari-Inspired Lattice Background (+8 more)

### Community 14 - "session/package.json"
Cohesion: 0.17
Nodes (11): devDependencies, vite, name, private, scripts, build, dev, typecheck (+3 more)

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
Cohesion: 0.29
Nodes (5): DeniedAudioContext, errors, requests, root, server

### Community 20 - "sw.js"
Cohesion: 0.53
Nodes (5): canonicalPrecacheUrl(), matchOwned(), PRECACHE, PRECACHE_URLS, refreshFromNetwork()

### Community 21 - "color-contrast.test.mjs"
Cohesion: 0.47
Nodes (5): bodyPairs, luminance(), ratio(), root, token()

### Community 23 - "Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks, Source Nodes

### Community 24 - "compose-build.mjs"
Cohesion: 0.40
Nodes (4): output, root, sessionOutput, siteOutput

### Community 25 - "dawn.mjs"
Cohesion: 0.40
Nodes (4): errors, output, root, server

### Community 27 - "seed-asserted.mjs"
Cohesion: 0.40
Nodes (4): errors, output, root, states

### Community 28 - "test-demo.mjs"
Cohesion: 0.50
Nodes (3): errors, page, state()

### Community 29 - "serve.mjs"
Cohesion: 0.50
Nodes (3): mime, port, root

### Community 31 - "wall-clock-cap.mjs"
Cohesion: 0.50
Nodes (3): errors, root, server

### Community 35 - "Punjabi and Indian Material World"
Cohesion: 0.67
Nodes (3): Cultural Visual Guardrails, Punjabi and Indian Material World, Theme and Behavior Independence

## Knowledge Gaps
- **233 isolated node(s):** `name`, `version`, `private`, `type`, `build` (+228 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Rasoi Pairs` connect `Rasoi Pairs` to `Calm Bounded Pair-removal Promise`, `Release Automated Gates`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `Calm Bounded Pair-removal Promise` connect `Calm Bounded Pair-removal Promise` to `Rasoi Pairs`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _233 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08315863032844165 - nodes in this community are weakly interconnected._
- **Should `Rasoi Pairs` be split into smaller, more focused modules?**
  _Cohesion score 0.05537098560354374 - nodes in this community are weakly interconnected._
- **Should `night-core.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10128205128205128 - nodes in this community are weakly interconnected._
- **Should `Release Automated Gates` be split into smaller, more focused modules?**
  _Cohesion score 0.0553306342780027 - nodes in this community are weakly interconnected._