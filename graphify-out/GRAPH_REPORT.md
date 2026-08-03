# Graph Report - Nindova  (2026-08-03)

## Corpus Check
- 78 files · ~50,384 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 554 nodes · 712 edges · 59 communities (46 shown, 13 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `142e1d3f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- session.ts
- night-core.ts
- scripts
- rasoi-core.ts
- Nindova Master Brief
- compilerOptions
- v0.1.0 Release Hardening Evidence
- site/package.json
- dawn-core.ts
- Nine Indian Kitchen Motifs
- Rasoi Pairs Session Interface
- session/package.json
- compilerOptions
- Nindova v0.1.0 Known Limitations
- Visible Free Edge Pairs
- Rasoi Pairs Redesign Evidence
- Rasoi Pairs
- ADR 0010 Replace the Vista Arc with Rasoi Pairs
- run-seed-observational.mjs
- Nindova Rasoi Pairs App Icon
- Nindova Rasoi Diamond Favicon
- Rasoi Release Gates
- Universal 343-State Solvability
- Night Privacy and Return Behavior
- Rasoi Pairs Product Promise
- pwa-offline.mjs
- sw.js
- Privacy and Local State
- color-contrast.test.mjs
- dawn-core.test.mjs
- Rasoi Pairs Product Contract
- PWA and Standalone Distribution Boundary
- Semantic Tile Parity
- Rasoi Pairs Session
- Untested Public-surface Risks
- Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks
- Composed Build Script
- dawn.mjs
- seed-asserted.mjs
- Nindova v0.1.0 Rasoi Pairs Release
- serve.mjs
- portrait-accessibility.mjs
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
- Observational Test Limitation

## God Nodes (most connected - your core abstractions)
1. `scripts` - 19 edges
2. `Nindova Master Brief` - 11 edges
3. `Rasoi Pairs` - 11 edges
4. `Rasoi Pairs Redesign Evidence` - 11 edges
5. `RasoiDebug` - 10 edges
6. `restoreActiveSession()` - 10 edges
7. `selectTile()` - 9 edges
8. `settle()` - 9 edges
9. `compilerOptions` - 9 edges
10. `sanitizeState()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Fifteen-Minute Session Cap` --semantically_similar_to--> `Bounded Self-Ending Session`  [INFERRED] [semantically similar]
  docs/adr/0005-cap-the-real-session-at-fifteen-minutes.md → reference/nindova-master-brief.md
- `Sound Off Control` --conceptually_related_to--> `Rasoi Pairs`  [INFERRED]
  apps/site/public/media/rasoi-pairs-phone.png → CONTEXT.md
- `User-Chosen Unguilted Wall` --semantically_similar_to--> `Between-Session Return System`  [INFERRED] [semantically similar]
  docs/adr/0003-keep-the-wall-user-chosen-and-unguilted.md → reference/nindova-master-brief.md
- `Asymmetric Vista Memory` --semantically_similar_to--> `Between-Session Return System`  [INFERRED] [semantically similar]
  docs/adr/0004-use-asymmetric-vista-memory.md → reference/nindova-master-brief.md
- `Browser and PWA Before iOS Wall` --semantically_similar_to--> `Browser Front Door`  [INFERRED] [semantically similar]
  docs/adr/0007-ship-browser-and-pwa-before-the-ios-wall.md → reference/nindova-master-brief.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **v0.1.0 Release Proof Bundle** — docs_testing_m6_release_hardening_automated_coverage, docs_testing_m6_release_hardening_wall_clock_passed_evidence, docs_testing_m6_release_hardening_graphify_release_gate, docs_testing_m6_release_hardening_release_inventory_scan, docs_testing_m6_release_hardening_chromium_verified_scope, docs_testing_m6_release_hardening_untested_scope [EXTRACTED 1.00]
- **Rasoi Session Contract and Surface** — apps_site_src_content_docs_docs_product_contract_product_contract, apps_site_src_content_docs_docs_nightly_arc_rasoi_pairs_session, apps_site_src_content_docs_docs_architecture_legality_kernel, apps_session_index_semantic_board [INFERRED 0.95]
- **Local Night State to Dawn Flow** — apps_site_src_content_docs_docs_night_and_local_state_version_3_state, apps_site_src_content_docs_docs_privacy_local_state_bounded_long_lived_record, apps_site_src_content_docs_docs_dawn_captured_zone_eligibility, apps_site_src_content_docs_docs_dawn_local_keepsake_exports [INFERRED 0.95]
- **Honest Release Evidence Boundary** — apps_site_src_content_docs_docs_testing_evidence_levels, apps_site_src_content_docs_docs_known_limitations_known_limitations, apps_site_src_content_docs_docs_research_receipts_nonclinical_claim_boundary, readme_product_evidence_boundary [INFERRED 0.95]
- **Rasoi Dawn Visual Composition** — apps_site_public_media_rasoi_dawn_rasoi_dawn_image, apps_site_public_media_rasoi_dawn_first_light_kitchen, apps_site_public_media_rasoi_dawn_brass_plate_arrangement, apps_site_public_media_rasoi_dawn_warm_dawn_palette [INFERRED 0.95]
- **Three Visible Free Kitchen Pairs** — apps_site_public_media_rasoi_pairs_phone_chimta_pair, apps_site_public_media_rasoi_pairs_phone_chai_pair, apps_site_public_media_rasoi_pairs_phone_katori_pair [EXTRACTED 1.00]
- **Bounded Session Decision and Proof** — reference_nindova_master_brief_two_loop_law, reference_nindova_demo_fixed_session_state_arc, docs_adr_0005_cap_the_real_session_at_fifteen_minutes_fifteen_minute_session_cap [INFERRED 0.95]

## Communities (59 total, 13 thin omitted)

### Community 0 - "session.ts"
Cohesion: 0.06
Nodes (61): RasoiDebug, RasoiTileSnapshot, SessionState, Window, NindovaDawn, NindovaNight, NindovaRasoi, RasoiBoard (+53 more)

### Community 1 - "night-core.ts"
Cohesion: 0.10
Nodes (37): addCivilDays(), captureNight(), CLOTHS, completeState(), createPrng(), decodeState(), emptyState(), isText() (+29 more)

### Community 2 - "scripts"
Cohesion: 0.05
Nodes (38): @astrojs/check, devDependencies, @astrojs/check, @playwright/test, @types/node, typescript, engines, node (+30 more)

### Community 3 - "rasoi-core.ts"
Cohesion: 0.19
Nodes (19): activeTiles(), BoardVerification, createBoard(), createPrng(), freeTiles(), hintPair(), isComplete(), isFree() (+11 more)

### Community 4 - "Nindova Master Brief"
Cohesion: 0.09
Nodes (30): User-Chosen Unguilted Wall, Asymmetric Vista Memory, Fifteen-Minute Session Cap, Browser and PWA Before iOS Wall, Codex Kickoff Protocol, Decay-Driven Assistance, Dual Pacing Profiles, Fixed Session State Arc (+22 more)

### Community 5 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+11 more)

### Community 6 - "v0.1.0 Release Hardening Evidence"
Cohesion: 0.11
Nodes (19): Rasoi Session Night Dawn PWA Site and Browser Gate Connections, Release Architecture Scoped Query, Automated Release Gate Commands, Automated Gate Coverage, Chromium-Verified Rendered and Offline Browser Surfaces, Only Product Source Synchronized Media and Release Records Committed, v0.1.0 Release Hardening Evidence, Incremental Graphify Refresh Before Tag (+11 more)

### Community 7 - "site/package.json"
Cohesion: 0.11
Nodes (17): dependencies, astro, @astrojs/starlight, @fontsource-variable/geist, @fontsource-variable/newsreader, name, private, scripts (+9 more)

### Community 8 - "dawn-core.ts"
Cohesion: 0.15
Nodes (12): chooseLoopType(), DawnEligibility, DawnLocalParts, eligibility(), extensionFor(), localParts(), LOOP_TYPES, NindovaDawnApi (+4 more)

### Community 9 - "Nine Indian Kitchen Motifs"
Cohesion: 0.15
Nodes (16): Highlighted Outer Edge Tiles, Icon-and-Text Tile Labels, Warm Stone Indigo Brass Madder and Blue Palette, Mirrored Authored Motif Groups, Chimta Tiffin Belan Chai Masala Tawa Katori Chakla and Cooker, Nine Indian Kitchen Motifs, Redundant Pair Recognition Through Icons and Text, Indigo Phulkari-Inspired Lattice Background (+8 more)

### Community 10 - "Rasoi Pairs Session Interface"
Cohesion: 0.20
Nodes (12): First-Light Dawn Surface, Browser Dismissal Surface, Voluntary Intake Surface, Quiet End Card, Rasoi Pairs Session Interface, Captured-Zone Dawn Eligibility, Kitchen Dawn, Local Dawn Keepsake Exports (+4 more)

### Community 11 - "session/package.json"
Cohesion: 0.17
Nodes (11): devDependencies, vite, name, private, scripts, build, dev, typecheck (+3 more)

### Community 12 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, noEmit, noImplicitAny, strict, strictNullChecks, useUnknownInCatchVariables, extends, include (+2 more)

### Community 13 - "Nindova v0.1.0 Known Limitations"
Cohesion: 0.18
Nodes (11): Rasoi Pairs Accessibility, Untested Real-Device Assistive Technology Acceptance, Nindova v0.1.0 Known Limitations, American College of Physicians CBT-I Guideline, Hartstein et al. 2022 Evening Light Study, Hill et al. 2022 Bedtime Procrastination Review, Nonclinical Claim Boundary, Nindova Research Receipts (+3 more)

### Community 14 - "Visible Free Edge Pairs"
Cohesion: 0.27
Nodes (10): Chai Tile Pair, Chimta Tile Pair, The Edge Tiles Are Ready Status, Visible Free Edge Pairs, Katori Tile Pair, Indian Kitchen Tile Motifs, Match Free Edge Tiles, Punjabi-inspired Material Direction (+2 more)

### Community 15 - "Rasoi Pairs Redesign Evidence"
Cohesion: 0.22
Nodes (10): Verified Public Surface, Historical Vista Portrait Accessibility Evidence, M3 Deterministic Nights and Quiet Memory Checkpoint, Historical Vista Dawn, Local Dawn Still and Silent Loop Exports, M4 Dawn Keepsake Checkpoint, Offline PWA and Public Surface, Rasoi Dawn and Distribution (+2 more)

### Community 16 - "Rasoi Pairs"
Cohesion: 0.22
Nodes (9): Rasoi Pairs Phone Interface, Sound Off Control, Tonight's Kitchen, Dawn, Nindova, Rasoi Pairs, Safe Pair, Session (+1 more)

### Community 17 - "ADR 0010 Replace the Vista Arc with Rasoi Pairs"
Cohesion: 0.25
Nodes (9): ADR 0010 Replace the Vista Arc with Rasoi Pairs, Preserved Nindova Contracts, Superseded Experience-specific ADRs, M1 Portrait and Accessibility Checkpoint, M2 Tactile and Self-closing Checkpoint, Seed Asserted Regression Gate, Seed Observational Run Evidence Limit, Original Supplied Prototype (+1 more)

### Community 18 - "run-seed-observational.mjs"
Cohesion: 0.22
Nodes (8): child, disposablePath, output, portable, root, seedPath, sourcePath, tempParent

### Community 19 - "Nindova Rasoi Pairs App Icon"
Cohesion: 0.32
Nodes (8): Four Cardinal Textile Diamonds, Symmetrical Central Focal Mark, Brass Masala Dabba, Indigo Madder Brass and Cream Palette, Phulkari-Inspired Diamond, Indian Kitchen Brand Identity, Five Radial Spice Bowls, Nindova Rasoi Pairs App Icon

### Community 20 - "Nindova Rasoi Diamond Favicon"
Cohesion: 0.33
Nodes (7): Brass Circular Spice Box, Compact Geometric Legibility, Indigo Brass Cream and Madder Palette, Indigo Rasoi Diamond, Dark Rounded-Square Field, Radial Madder Spice Wells, Nindova Rasoi Diamond Favicon

### Community 21 - "Rasoi Release Gates"
Cohesion: 0.29
Nodes (7): Nindova Getting Started, Standalone and Composed Release Surfaces, Hidden Twelve-Minute Wind-Down and Fifteen-Minute Ceiling, Verified Source-Proven and Untested Evidence Levels, Rasoi Release Gates, Rasoi Pairs Testing, Nindova v0.1.0 Distribution

### Community 22 - "Universal 343-State Solvability"
Cohesion: 0.29
Nodes (7): Deterministic Recipe Version 2, Ephemeral Same-Tab Resume, Immutable Night ID, Night and Local State, Universal 343-State Solvability, Same-Tab Active Session Record, Deterministic Solvable Closure

### Community 23 - "Night Privacy and Return Behavior"
Cohesion: 0.29
Nodes (7): Legacy Dawn Migration, Public-surface Evidence Ledger, Source-proven Runtime and State Properties, Deterministic Night Identity and Idempotent Replay, Historical Night Recipe v1, M5 Website Docs and Offline PWA Evidence, Night Privacy and Return Behavior

### Community 24 - "Rasoi Pairs Product Promise"
Cohesion: 0.29
Nodes (7): Authored and Exhaustively Verified Board Kernel, Enter Pair Settle Dawn Experience, Rasoi Non-negotiable Checks, Rasoi Pairs Product Promise, Rasoi Pairs Redesign Plan, Monotonic Fifteen-minute Session Cap, Rasoi Pure Board Model

### Community 25 - "pwa-offline.mjs"
Cohesion: 0.29
Nodes (5): DeniedAudioContext, errors, requests, root, server

### Community 26 - "sw.js"
Cohesion: 0.53
Nodes (5): canonicalPrecacheUrl(), matchOwned(), PRECACHE, PRECACHE_URLS, refreshFromNetwork()

### Community 27 - "Privacy and Local State"
Cohesion: 0.33
Nodes (6): Bounded Long-Lived Record, Privacy and Local State, Same-Origin Static Runtime Boundary, Active Baseline Invariants, Historical Browser-First Build Plan, Local-Only Privacy Boundary

### Community 28 - "color-contrast.test.mjs"
Cohesion: 0.47
Nodes (5): bodyPairs, luminance(), ratio(), root, token()

### Community 30 - "Rasoi Pairs Product Contract"
Cohesion: 0.40
Nodes (5): Session Asset Provenance, Punjabi-Inspired Cultural Direction, No Performance or Escalation Layer, Rasoi Pairs Product Contract, Punjabi-Inspired Indian Kitchen Direction

### Community 31 - "PWA and Standalone Distribution Boundary"
Cohesion: 0.40
Nodes (5): Scoped PWA Bootstrap, Rasoi Browser Architecture, PWA and Standalone Distribution Boundary, Shared Rasoi Legality Kernel, Offline Cache Boundary

### Community 32 - "Semantic Tile Parity"
Cohesion: 0.40
Nodes (5): Semantic Rasoi Board, Semantic Tile Parity, Legacy Vista Dawn Composition, Version 3 Local Night State, Nindova v0.1.0 Rasoi Pairs Release

### Community 33 - "Rasoi Pairs Session"
Cohesion: 0.40
Nodes (5): Free Edge Pair Rule, Rasoi Pairs Session, Uniform Settlement Closure, Two-Loop Law, Brosnan et al. 2024 Interactive Screen Use Study

### Community 34 - "Untested Public-surface Risks"
Cohesion: 0.40
Nodes (5): Untested Public-surface Risks, Punjabi-inspired Kitchen Cultural Direction, Behavioral Design Evidence Boundary, M5 Honest Verification Boundary, Rasoi Redesign Honest Limits

### Community 35 - "Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks, Source Nodes

### Community 36 - "Composed Build Script"
Cohesion: 0.40
Nodes (4): output, root, sessionOutput, siteOutput

### Community 37 - "dawn.mjs"
Cohesion: 0.40
Nodes (4): errors, output, root, server

### Community 38 - "seed-asserted.mjs"
Cohesion: 0.40
Nodes (4): errors, output, root, states

### Community 39 - "Nindova v0.1.0 Rasoi Pairs Release"
Cohesion: 0.50
Nodes (4): v0.1.0 Evidence and Limits, Nindova v0.1.0 Rasoi Pairs Release, v0.1.0 Distribution Artifacts, v0.1.0 Release Highlights

### Community 41 - "serve.mjs"
Cohesion: 0.50
Nodes (3): mime, port, root

### Community 44 - "wall-clock-cap.mjs"
Cohesion: 0.50
Nodes (3): errors, root, server

### Community 48 - "Punjabi and Indian Material World"
Cohesion: 0.67
Nodes (3): Cultural Visual Guardrails, Punjabi and Indian Material World, Theme and Behavior Independence

## Knowledge Gaps
- **213 isolated node(s):** `name`, `version`, `private`, `type`, `build` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Rasoi Pairs` connect `Rasoi Pairs` to `Semantic Tile Parity`, `Visible Free Edge Pairs`, `ADR 0010 Replace the Vista Arc with Rasoi Pairs`, `Rasoi Release Gates`, `Night Privacy and Return Behavior`, `Rasoi Pairs Product Promise`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Nindova v0.1.0 Rasoi Pairs Release` connect `Semantic Tile Parity` to `Rasoi Pairs`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Semantic Tile Parity` connect `Semantic Tile Parity` to `Privacy and Local State`, `Nindova v0.1.0 Known Limitations`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Rasoi Pairs` (e.g. with `Sound Off Control` and `Rasoi Pairs Product Promise`) actually correct?**
  _`Rasoi Pairs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05594679186228482 - nodes in this community are weakly interconnected._
- **Should `night-core.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10128205128205128 - nodes in this community are weakly interconnected._