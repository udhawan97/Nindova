# Graph Report - .  (2026-08-03)

## Corpus Check
- 60 files · ~49,691 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 552 nodes · 698 edges · 60 communities (46 shown, 14 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 108 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Session Runtime Orchestration
- Night State Engine
- Root Workspace Configuration
- Rasoi Board Engine
- Core Product Brief
- Root TypeScript Configuration
- v0.1.0 Release Hardening Evidence
- Public Site Package
- Dawn Media Engine
- Rasoi Visual Motif System
- User Journey Surfaces
- Session Build Package
- Session TypeScript Configuration
- Research Accessibility Limitations
- Phone Pair Interface
- Redesign Release Evidence
- Rasoi Pairs
- ADR 0010 Replace the Vista
- Seed Observation Runner
- App Icon Artwork
- Favicon Artwork
- Release Testing Documentation
- Deterministic Night Solvability
- Night Privacy and Return Behavior
- Rasoi Pairs Product Promise
- Offline PWA Browser Test
- Service Worker Cache
- Local Privacy Architecture
- Color Contrast Tests
- Dawn Core Tests
- Product Cultural Contract
- PWA Distribution Architecture
- Semantic State Compatibility
- Bounded Session Research
- Untested Public-surface Risks
- Rasoi Plan Review Query
- Composed Build Script
- Dawn Browser Test
- Seed Regression Test
- Nindova v0.1.0 Rasoi Pairs Release
- Demo Browser Test
- Static Test Server
- Portrait Accessibility Test
- Self Closing Test
- Wall Clock Cap Test
- Landing Page Routing
- Cultural Design Guardrails
- Night Memory Browser Test
- Reference Integrity Test
- Contributor Product Rules
- Starlight Content Collections
- Procedural Illustration Strategy
- Procedural Audio Strategy
- Portrait Session Design
- Site Session Separation
- Observational Evidence Limits

## God Nodes (most connected - your core abstractions)
1. `scripts` - 19 edges
2. `Nindova Master Brief` - 11 edges
3. `Rasoi Pairs` - 11 edges
4. `Rasoi Pairs Redesign Evidence` - 11 edges
5. `RasoiDebug` - 10 edges
6. `selectTile()` - 9 edges
7. `compilerOptions` - 9 edges
8. `sanitizeState()` - 8 edges
9. `restoreActiveSession()` - 8 edges
10. `finishSession()` - 8 edges

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

## Communities (60 total, 14 thin omitted)

### Community 0 - "Session Runtime Orchestration"
Cohesion: 0.08
Nodes (53): NindovaDawn, NindovaNight, NindovaRasoi, advanceBy(), beginSession(), boardElement, boardShell, boardStatus (+45 more)

### Community 1 - "Night State Engine"
Cohesion: 0.10
Nodes (36): addCivilDays(), captureNight(), CLOTHS, completeState(), createPrng(), decodeState(), emptyState(), isText() (+28 more)

### Community 2 - "Root Workspace Configuration"
Cohesion: 0.05
Nodes (38): @astrojs/check, devDependencies, @astrojs/check, @playwright/test, @types/node, typescript, engines, node (+30 more)

### Community 3 - "Rasoi Board Engine"
Cohesion: 0.10
Nodes (24): RasoiDebug, RasoiTileSnapshot, SessionState, Window, activeTiles(), BoardVerification, createBoard(), createPrng() (+16 more)

### Community 4 - "Core Product Brief"
Cohesion: 0.09
Nodes (30): User-Chosen Unguilted Wall, Asymmetric Vista Memory, Fifteen-Minute Session Cap, Browser and PWA Before iOS Wall, Codex Kickoff Protocol, Decay-Driven Assistance, Dual Pacing Profiles, Fixed Session State Arc (+22 more)

### Community 5 - "Root TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+11 more)

### Community 6 - "v0.1.0 Release Hardening Evidence"
Cohesion: 0.11
Nodes (19): Rasoi Session Night Dawn PWA Site and Browser Gate Connections, Release Architecture Scoped Query, Automated Release Gate Commands, Automated Gate Coverage, Chromium-Verified Rendered and Offline Browser Surfaces, Only Product Source Synchronized Media and Release Records Committed, v0.1.0 Release Hardening Evidence, Incremental Graphify Refresh Before Tag (+11 more)

### Community 7 - "Public Site Package"
Cohesion: 0.11
Nodes (17): dependencies, astro, @astrojs/starlight, @fontsource-variable/geist, @fontsource-variable/newsreader, name, private, scripts (+9 more)

### Community 8 - "Dawn Media Engine"
Cohesion: 0.15
Nodes (12): chooseLoopType(), DawnEligibility, DawnLocalParts, eligibility(), extensionFor(), localParts(), LOOP_TYPES, NindovaDawnApi (+4 more)

### Community 9 - "Rasoi Visual Motif System"
Cohesion: 0.15
Nodes (16): Highlighted Outer Edge Tiles, Icon-and-Text Tile Labels, Warm Stone Indigo Brass Madder and Blue Palette, Mirrored Authored Motif Groups, Chimta Tiffin Belan Chai Masala Tawa Katori Chakla and Cooker, Nine Indian Kitchen Motifs, Redundant Pair Recognition Through Icons and Text, Indigo Phulkari-Inspired Lattice Background (+8 more)

### Community 10 - "User Journey Surfaces"
Cohesion: 0.20
Nodes (12): First-Light Dawn Surface, Browser Dismissal Surface, Voluntary Intake Surface, Quiet End Card, Rasoi Pairs Session Interface, Captured-Zone Dawn Eligibility, Kitchen Dawn, Local Dawn Keepsake Exports (+4 more)

### Community 11 - "Session Build Package"
Cohesion: 0.17
Nodes (11): devDependencies, vite, name, private, scripts, build, dev, typecheck (+3 more)

### Community 12 - "Session TypeScript Configuration"
Cohesion: 0.18
Nodes (10): compilerOptions, noEmit, noImplicitAny, strict, strictNullChecks, useUnknownInCatchVariables, extends, include (+2 more)

### Community 13 - "Research Accessibility Limitations"
Cohesion: 0.18
Nodes (11): Rasoi Pairs Accessibility, Untested Real-Device Assistive Technology Acceptance, Nindova v0.1.0 Known Limitations, American College of Physicians CBT-I Guideline, Hartstein et al. 2022 Evening Light Study, Hill et al. 2022 Bedtime Procrastination Review, Nonclinical Claim Boundary, Nindova Research Receipts (+3 more)

### Community 14 - "Phone Pair Interface"
Cohesion: 0.27
Nodes (10): Chai Tile Pair, Chimta Tile Pair, The Edge Tiles Are Ready Status, Visible Free Edge Pairs, Katori Tile Pair, Indian Kitchen Tile Motifs, Match Free Edge Tiles, Punjabi-inspired Material Direction (+2 more)

### Community 15 - "Redesign Release Evidence"
Cohesion: 0.22
Nodes (10): Verified Public Surface, Historical Vista Portrait Accessibility Evidence, M3 Deterministic Nights and Quiet Memory Checkpoint, Historical Vista Dawn, Local Dawn Still and Silent Loop Exports, M4 Dawn Keepsake Checkpoint, Offline PWA and Public Surface, Rasoi Dawn and Distribution (+2 more)

### Community 16 - "Rasoi Pairs"
Cohesion: 0.22
Nodes (9): Rasoi Pairs Phone Interface, Sound Off Control, Tonight's Kitchen, Dawn, Nindova, Rasoi Pairs, Safe Pair, Session (+1 more)

### Community 17 - "ADR 0010 Replace the Vista"
Cohesion: 0.25
Nodes (9): ADR 0010 Replace the Vista Arc with Rasoi Pairs, Preserved Nindova Contracts, Superseded Experience-specific ADRs, M1 Portrait and Accessibility Checkpoint, M2 Tactile and Self-closing Checkpoint, Seed Asserted Regression Gate, Seed Observational Run Evidence Limit, Original Supplied Prototype (+1 more)

### Community 18 - "Seed Observation Runner"
Cohesion: 0.22
Nodes (8): child, disposablePath, output, portable, root, seedPath, sourcePath, tempParent

### Community 19 - "App Icon Artwork"
Cohesion: 0.32
Nodes (8): Four Cardinal Textile Diamonds, Symmetrical Central Focal Mark, Brass Masala Dabba, Indigo Madder Brass and Cream Palette, Phulkari-Inspired Diamond, Indian Kitchen Brand Identity, Five Radial Spice Bowls, Nindova Rasoi Pairs App Icon

### Community 20 - "Favicon Artwork"
Cohesion: 0.33
Nodes (7): Brass Circular Spice Box, Compact Geometric Legibility, Indigo Brass Cream and Madder Palette, Indigo Rasoi Diamond, Dark Rounded-Square Field, Radial Madder Spice Wells, Nindova Rasoi Diamond Favicon

### Community 21 - "Release Testing Documentation"
Cohesion: 0.29
Nodes (7): Nindova Getting Started, Standalone and Composed Release Surfaces, Hidden Twelve-Minute Wind-Down and Fifteen-Minute Ceiling, Verified Source-Proven and Untested Evidence Levels, Rasoi Release Gates, Rasoi Pairs Testing, Nindova v0.1.0 Distribution

### Community 22 - "Deterministic Night Solvability"
Cohesion: 0.29
Nodes (7): Deterministic Recipe Version 2, Ephemeral Same-Tab Resume, Immutable Night ID, Night and Local State, Universal 343-State Solvability, Same-Tab Active Session Record, Deterministic Solvable Closure

### Community 23 - "Night Privacy and Return Behavior"
Cohesion: 0.29
Nodes (7): Legacy Dawn Migration, Public-surface Evidence Ledger, Source-proven Runtime and State Properties, Deterministic Night Identity and Idempotent Replay, Historical Night Recipe v1, M5 Website Docs and Offline PWA Evidence, Night Privacy and Return Behavior

### Community 24 - "Rasoi Pairs Product Promise"
Cohesion: 0.29
Nodes (7): Authored and Exhaustively Verified Board Kernel, Enter Pair Settle Dawn Experience, Rasoi Non-negotiable Checks, Rasoi Pairs Product Promise, Rasoi Pairs Redesign Plan, Monotonic Fifteen-minute Session Cap, Rasoi Pure Board Model

### Community 25 - "Offline PWA Browser Test"
Cohesion: 0.29
Nodes (5): DeniedAudioContext, errors, requests, root, server

### Community 26 - "Service Worker Cache"
Cohesion: 0.53
Nodes (5): canonicalPrecacheUrl(), matchOwned(), PRECACHE, PRECACHE_URLS, refreshFromNetwork()

### Community 27 - "Local Privacy Architecture"
Cohesion: 0.33
Nodes (6): Bounded Long-Lived Record, Privacy and Local State, Same-Origin Static Runtime Boundary, Active Baseline Invariants, Historical Browser-First Build Plan, Local-Only Privacy Boundary

### Community 28 - "Color Contrast Tests"
Cohesion: 0.47
Nodes (5): bodyPairs, luminance(), ratio(), root, token()

### Community 30 - "Product Cultural Contract"
Cohesion: 0.40
Nodes (5): Session Asset Provenance, Punjabi-Inspired Cultural Direction, No Performance or Escalation Layer, Rasoi Pairs Product Contract, Punjabi-Inspired Indian Kitchen Direction

### Community 31 - "PWA Distribution Architecture"
Cohesion: 0.40
Nodes (5): Scoped PWA Bootstrap, Rasoi Browser Architecture, PWA and Standalone Distribution Boundary, Shared Rasoi Legality Kernel, Offline Cache Boundary

### Community 32 - "Semantic State Compatibility"
Cohesion: 0.40
Nodes (5): Semantic Rasoi Board, Semantic Tile Parity, Legacy Vista Dawn Composition, Version 3 Local Night State, Nindova v0.1.0 Rasoi Pairs Release

### Community 33 - "Bounded Session Research"
Cohesion: 0.40
Nodes (5): Free Edge Pair Rule, Rasoi Pairs Session, Uniform Settlement Closure, Two-Loop Law, Brosnan et al. 2024 Interactive Screen Use Study

### Community 34 - "Untested Public-surface Risks"
Cohesion: 0.40
Nodes (5): Untested Public-surface Risks, Punjabi-inspired Kitchen Cultural Direction, Behavioral Design Evidence Boundary, M5 Honest Verification Boundary, Rasoi Redesign Honest Limits

### Community 35 - "Rasoi Plan Review Query"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks, Source Nodes

### Community 36 - "Composed Build Script"
Cohesion: 0.40
Nodes (4): output, root, sessionOutput, siteOutput

### Community 37 - "Dawn Browser Test"
Cohesion: 0.40
Nodes (4): errors, output, root, server

### Community 38 - "Seed Regression Test"
Cohesion: 0.40
Nodes (4): errors, output, root, states

### Community 39 - "Nindova v0.1.0 Rasoi Pairs Release"
Cohesion: 0.50
Nodes (4): v0.1.0 Evidence and Limits, Nindova v0.1.0 Rasoi Pairs Release, v0.1.0 Distribution Artifacts, v0.1.0 Release Highlights

### Community 41 - "Static Test Server"
Cohesion: 0.50
Nodes (3): mime, port, root

### Community 44 - "Wall Clock Cap Test"
Cohesion: 0.50
Nodes (3): errors, root, server

### Community 48 - "Cultural Design Guardrails"
Cohesion: 0.67
Nodes (3): Cultural Visual Guardrails, Punjabi and Indian Material World, Theme and Behavior Independence

## Knowledge Gaps
- **214 isolated node(s):** `extends`, `./tsconfig.json`, `strict`, `noImplicitAny`, `strictNullChecks` (+209 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Rasoi Pairs` connect `Rasoi Pairs` to `Semantic State Compatibility`, `Phone Pair Interface`, `ADR 0010 Replace the Vista`, `Release Testing Documentation`, `Night Privacy and Return Behavior`, `Rasoi Pairs Product Promise`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Nindova v0.1.0 Rasoi Pairs Release` connect `Semantic State Compatibility` to `Rasoi Pairs`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Semantic Tile Parity` connect `Semantic State Compatibility` to `Local Privacy Architecture`, `Research Accessibility Limitations`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Rasoi Pairs` (e.g. with `Sound Off Control` and `Rasoi Pairs Product Promise`) actually correct?**
  _`Rasoi Pairs` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `extends`, `./tsconfig.json`, `strict` to the rest of the system?**
  _214 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Session Runtime Orchestration` be split into smaller, more focused modules?**
  _Cohesion score 0.07744107744107744 - nodes in this community are weakly interconnected._
- **Should `Night State Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.10121457489878542 - nodes in this community are weakly interconnected._