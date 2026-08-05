# Graph Report - Nindova  (2026-08-04)

## Corpus Check
- 133 files · ~156,650 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1187 nodes · 1595 edges · 116 communities (96 shown, 20 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 120 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4c1d2cab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- house.ts
- session.ts
- rasoi-core.ts
- night-core.ts
- site/package.json
- compilerOptions
- Automated Release Gates
- Nindova Master Brief
- scripts
- sector-sprint.ts
- dawn-core.ts
- Nine Indian Kitchen Motifs
- house-core.ts
- Bedtime game evidence brief
- dawn.mjs
- devDependencies
- assessment-readiness.ts
- The Grand Salon
- Known Limitations
- Public-Surface Evidence Ledger
- NINDOVA — Brand Guide
- session/package.json
- house.mjs
- Nindova House
- Rasoi Pairs
- Rasoi Pairs Redesign Evidence
- Nindova Asset Manifest
- color-contrast.test.mjs
- Nindova Research Receipts
- compilerOptions
- Rasoi Pairs v0.1.0 Change Set
- House-First Public-Surface Refresh
- Night and Local State
- Visible Free Edge Pairs
- Tagged v0.3.0 Release
- ADR 0010 Replace the Vista Arc with Rasoi Pairs
- package.json
- run-seed-observational.mjs
- Nindova Rasoi Pairs App Icon
- Rasoi Pairs Session Interface
- Quiet Depth plan
- Rasoi v0.1.0 Highlights
- Rasoi Browser Architecture
- Nindova Rasoi Diamond Favicon
- Rasoi Pairs Session Arc
- advanceChapter
- layered-rasoi.mjs
- pwa-offline.mjs
- tile-latency.mjs
- session/sw.js
- Nindova Social Preview
- Privacy and Local State
- Calm Bounded Pair-removal Promise
- getGame
- compose-build.mjs
- portrait-accessibility.mjs
- public-surface.mjs
- dawn-core.test.mjs
- Sector Sprint Scene
- Rasoi Pairs Accessibility
- Complete Static Release Surface
- visual-identity.md
- Assessment readiness
- house/package.json
- Nindova v0.2.0 — Quiet Depth
- Nindova v0.3.0 — Shahi Mound
- Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks
- Q: Why does Rasoi Pairs lack Mahjong-like layered challenge and visible replay?
- Q: Make the app theme more royal and sophisticated
- Q: rasoi dawn looks so ugly
- Q: Council coverage review of the adult Nindova House entertainment implementation
- Q: Build entertainment first for adults above 18, test it, run a council review, then implement assessment grade.
- Q: How is Sector Sprint registered, rendered, persisted, completed, tested, and isolated from the Night Room?
- Q: How is Sector Sprint registered, rendered, persisted, completed, tested, and isolated from the Night Room?
- Q: How does the polished Sector Sprint connect rendering, state, audio, accessibility, and tests?
- serve.mjs
- seed-asserted.mjs
- Nindova Roadmap
- render
- compilerOptions
- Q: How do the adult House and Sector Sprint connect through house source/core to Night state, public surface, and PWA/offline boundary?
- workspaces
- self-closing.mjs
- wall-clock-cap.mjs
- assessment-readiness.test.mjs
- Punjabi and Indian Material World
- Q: How do Sector Sprint hold-to-lift input, fixed-step flight, lazy illustrated art, deterministic complications, adaptive Canvas quality, audio suspension, narrated fallback, and offline caching connect without changing the House completion contract?
- night-memory.mjs
- brand-assets.test.mjs
- copy-contract.test.mjs
- reference-integrity.test.mjs
- sector-sprint.test.mjs
- astro.config.mjs
- content.config.ts
- generate-play-qr.mjs
- house-core.test.mjs
- Hybrid Procedural Illustration
- Hybrid Procedural and Composed Audio
- Portrait-First Session
- Public Site and Session Separation
- Monotonic Fifteen-minute Session Cap
- M5 Honest Verification Boundary
- Observational Test Limitation
- sector-sprint-feel.mjs
- Sector Sprint cinematic game-feel checkpoint
- finishGame
- Sector Sprint character sheet
- Q: How is Sector Sprint's runner state, input, Canvas renderer, audio loop, mobile performance, and reduced-motion route structured?

## God Nodes (most connected - your core abstractions)
1. `scripts` - 29 edges
2. `drawRunnerFrame()` - 23 edges
3. `getGame()` - 21 edges
4. `Bedtime game evidence brief` - 17 edges
5. `advanceChapter()` - 15 edges
6. `runRunnerFrame()` - 14 edges
7. `NINDOVA — Brand Guide` - 13 edges
8. `saveActiveGame()` - 12 edges
9. `render()` - 12 edges
10. `stopRunnerLoop()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Live Nindova House` --semantically_similar_to--> `Nindova House`  [INFERRED] [semantically similar]
  apps/site/src/content/docs/docs/downloads.md → README.md
- `Live Night Room` --semantically_similar_to--> `Night Room`  [INFERRED] [semantically similar]
  apps/site/src/content/docs/docs/downloads.md → README.md
- `Tagged v0.3.0 Release` --semantically_similar_to--> `v0.3.0 Shahi Mound Release`  [INFERRED] [semantically similar]
  apps/site/src/content/docs/docs/downloads.md → README.md
- `Fifteen-Minute Session Cap` --semantically_similar_to--> `Bounded Self-Ending Session`  [INFERRED] [semantically similar]
  docs/adr/0005-cap-the-real-session-at-fifteen-minutes.md → reference/nindova-master-brief.md
- `Sound Off Control` --conceptually_related_to--> `Rasoi Pairs`  [INFERRED]
  apps/site/public/media/rasoi-pairs-phone.png → CONTEXT.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **House-First Public-Surface Proof** — apps_site_src_content_docs_docs_roadmap_public_surface, docs_public_surface_evidence_house_first_refresh, docs_public_surface_evidence_source_rendered_media [INFERRED 0.85]
- **Bounded Night Session Evidence** — apps_site_src_content_docs_docs_roadmap_session_time_boundary, docs_public_surface_evidence_board_state_space_verification, docs_public_surface_evidence_deterministic_session_closure [INFERRED 0.95]
- **Local Delivery and Open Risk Boundary** — apps_site_src_content_docs_docs_roadmap_delivery_boundary, apps_site_src_content_docs_docs_roadmap_next_hardening, docs_public_surface_evidence_local_delivery_limit, docs_public_surface_evidence_real_device_and_human_risks [INFERRED 0.95]
- **Nindova Product Rooms** — readme_nindova, readme_nindova_house, readme_night_room [EXTRACTED 1.00]
- **Tagged v0.3.0 Artifacts** — apps_site_src_content_docs_docs_downloads_tagged_v0_3_0, apps_site_src_content_docs_docs_downloads_standalone_html, apps_site_src_content_docs_docs_downloads_static_web_archive, apps_site_src_content_docs_docs_downloads_sha_256_checksums [EXTRACTED 1.00]
- **Public Media Evidence Pipeline** — docs_brand_asset_manifest_capture_public_media, docs_brand_asset_manifest_public_media_family, docs_public_surface_evidence_source_rendered_media [INFERRED 0.95]
- **Grand Salon Tables** — apps_site_public_media_nindova_house_pattern_court, apps_site_public_media_nindova_house_mirror_forge, apps_site_public_media_nindova_house_stack_architect, apps_site_public_media_nindova_house_lantern_ledger [EXTRACTED 1.00]
- **Primary House Rooms** — apps_site_public_media_nindova_house_night_room, apps_site_public_media_nindova_house_grand_salon, apps_site_public_media_nindova_house_gallery [EXTRACTED 1.00]
- **Featured Nindova Rooms** — apps_site_public_brand_nindova_og_night_room, apps_site_public_brand_nindova_og_gallery, apps_site_public_brand_nindova_og_grand_salon [EXTRACTED 1.00]
- **Measured Production Wall-clock Result** — docs_testing_m6_release_hardening_722_330_wall_seconds, docs_testing_m6_release_hardening_722_289_internal_seconds, docs_testing_m6_release_hardening_900_000_ceiling, docs_testing_m6_release_hardening_production_cap, docs_testing_m6_release_hardening_zero_browser_errors [EXTRACTED 1.00]
- **Release Gate Evidence** — docs_testing_m6_release_hardening_41_plus_assertions, docs_testing_m6_release_hardening_rasoi_reachability, docs_testing_m6_release_hardening_pair_removal_arc, docs_testing_m6_release_hardening_accessibility_evidence, docs_testing_m6_release_hardening_state_recovery_evidence, docs_testing_m6_release_hardening_distribution_evidence [EXTRACTED 1.00]
- **Rasoi v0.1.0 Release Evidence Chain** — docs_releases_v0_1_0_release_notes, apps_site_src_content_docs_docs_testing_testing [INFERRED 0.95]
- **Bounded Rasoi Session Contract** — docs_redesign_plan_enter_pair_settle_dawn, apps_site_src_content_docs_docs_nightly_arc_fixed_session_path, apps_site_src_content_docs_docs_architecture_browser_local_state, apps_site_src_content_docs_docs_privacy_local_state_active_session_v2 [INFERRED 0.95]
- **Local Night State to Dawn Flow** — apps_site_src_content_docs_docs_night_and_local_state_version_3_state, apps_site_src_content_docs_docs_dawn_captured_zone_eligibility, apps_site_src_content_docs_docs_dawn_local_keepsake_exports [INFERRED 0.95]
- **Rasoi Dawn Visual Composition** — apps_site_public_media_rasoi_dawn_rasoi_dawn_image, apps_site_public_media_rasoi_dawn_first_light_kitchen, apps_site_public_media_rasoi_dawn_brass_plate_arrangement, apps_site_public_media_rasoi_dawn_warm_dawn_palette [INFERRED 0.95]
- **Three Visible Free Kitchen Pairs** — apps_site_public_media_rasoi_pairs_phone_chimta_pair, apps_site_public_media_rasoi_pairs_phone_chai_pair, apps_site_public_media_rasoi_pairs_phone_katori_pair [EXTRACTED 1.00]
- **Bounded Session Decision and Proof** — reference_nindova_master_brief_two_loop_law, reference_nindova_demo_fixed_session_state_arc, docs_adr_0005_cap_the_real_session_at_fifteen_minutes_fifteen_minute_session_cap [INFERRED 0.95]

## Communities (116 total, 20 thin omitted)

### Community 0 - "house.ts"
Cohesion: 0.07
Nodes (28): active, ActiveGame, audienceDialog, celebration, DebugHouse, describePeg(), enterHouseButton, houseAudioVoices (+20 more)

### Community 1 - "session.ts"
Cohesion: 0.06
Nodes (72): NindovaDawn, NindovaNight, NindovaRasoi, advanceBy(), anchorSessionClock(), animatePair(), beginSession(), boardElement (+64 more)

### Community 2 - "rasoi-core.ts"
Cohesion: 0.07
Nodes (35): RasoiDebug, RasoiTileSnapshot, SessionState, Window, activeTiles(), availabilityReason(), BoardVerification, createBoard() (+27 more)

### Community 3 - "night-core.ts"
Cohesion: 0.10
Nodes (38): addCivilDays(), captureNight(), CLOTHS, completeState(), createPrng(), decodeState(), emptyState(), isText() (+30 more)

### Community 4 - "site/package.json"
Cohesion: 0.10
Nodes (20): dependencies, astro, @astrojs/sitemap, @astrojs/starlight, @fontsource-variable/geist, @fontsource-variable/newsreader, @fontsource-variable/geist, @fontsource-variable/newsreader (+12 more)

### Community 5 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+11 more)

### Community 6 - "Automated Release Gates"
Cohesion: 0.07
Nodes (30): Active-record Recovery and Reload Settlement Tests, Full Keyboard Pairing at 200 Percent Zoom, Verified Source-proven and Untested Evidence Levels, Release Verification Commands, Rasoi Release Gates, Rasoi Pairs Testing, Untouched Production Wall-clock Gate, 41 Plus Pure Unit Assertions (+22 more)

### Community 7 - "Nindova Master Brief"
Cohesion: 0.09
Nodes (30): User-Chosen Unguilted Wall, Asymmetric Vista Memory, Fifteen-Minute Session Cap, Browser and PWA Before iOS Wall, Codex Kickoff Protocol, Decay-Driven Assistance, Dual Pacing Profiles, Fixed Session State Arc (+22 more)

### Community 8 - "scripts"
Cohesion: 0.07
Nodes (29): scripts, build, build:house, build:qr, build:session, build:site, capture:brand-social, capture:public-media (+21 more)

### Community 9 - "sector-sprint.ts"
Cohesion: 0.07
Nodes (50): ACT_GRADES, advanceProjectile(), drawActSetting(), drawAuthoredLead(), drawCinematicGrade(), drawCityLayers(), drawComplicationAura(), drawComplicationGate() (+42 more)

### Community 10 - "dawn-core.ts"
Cohesion: 0.15
Nodes (12): chooseLoopType(), DawnEligibility, DawnLocalParts, eligibility(), extensionFor(), localParts(), LOOP_TYPES, NindovaDawnApi (+4 more)

### Community 11 - "Nine Indian Kitchen Motifs"
Cohesion: 0.15
Nodes (16): Highlighted Outer Edge Tiles, Icon-and-Text Tile Labels, Warm Stone Indigo Brass Madder and Blue Palette, Mirrored Authored Motif Groups, Chimta Tiffin Belan Chai Masala Tawa Katori Chakla and Cooker, Nine Indian Kitchen Motifs, Redundant Pair Recognition Through Icons and Text, Indigo Phulkari-Inspired Lattice Background (+8 more)

### Community 12 - "house-core.ts"
Cohesion: 0.13
Nodes (21): ChoiceChapter, emptyHouseState(), EntertainmentResult, GameDefinition, GameId, GAMES, HOUSE_RULESET_VERSION, HOUSE_SCHEMA_VERSION (+13 more)

### Community 13 - "Bedtime game evidence brief"
Cohesion: 0.07
Nodes (27): 0. Why sleep matters—and how to say it without fear, 1. Interactive screen games and sleepiness, 2. Evening light, arousal, and media displacement, 3. Cognitive distraction and serial diverse imagining, 4. Memory evidence: pair matching is not general memory improvement, 5. Why “dopamine effect” is not supportable, 6. Why rankings, streaks and weekly performance are the wrong layer, 7. Candidate post-board transitions (+19 more)

### Community 14 - "dawn.mjs"
Cohesion: 0.15
Nodes (7): captures, errors, output, port, root, server, recipeTwoCompletion

### Community 15 - "devDependencies"
Cohesion: 0.13
Nodes (15): @astrojs/check, jsqr, devDependencies, @astrojs/check, jsqr, @playwright/test, pngjs, qrcode (+7 more)

### Community 16 - "assessment-readiness.ts"
Cohesion: 0.16
Nodes (12): ASSESSMENT_AUTHORIZATION, ASSESSMENT_PROTOCOL_VERSION, AssessmentInputDecision, AssessmentReadiness, evaluateAssessmentReadiness(), EvidenceStatus, hasText(), isReviewedEvidence() (+4 more)

### Community 17 - "The Grand Salon"
Cohesion: 0.14
Nodes (14): Bounded Night Contract, Finite Replayable Tables by Choice, The Gallery, The Grand Salon, Nindova House Interface, Lantern Ledger, Device-Local Recent Completed Reading, Mirror Forge (+6 more)

### Community 18 - "Known Limitations"
Cohesion: 0.14
Nodes (14): Bounded Night Room Session, Deferred iOS Wall, Product and Implementation Documentation Map, Nindova Documentation Index, Five Grand Salon Games, Nindova Product Contract, Fail-Closed Assessment Readiness Limit, Real-Device Assistive Technology Gap (+6 more)

### Community 19 - "Public-Surface Evidence Ledger"
Cohesion: 0.15
Nodes (14): Dawn Export, Deterministic Recipe Verification, Gentle and Deeper Profiles, House and Night PWAs, Rest and Rasoi Image Drift, Twelve-Minute Settle and Fifteen-Minute Ceiling, State Migration and Same-Tab Resume, Art and License Provenance (+6 more)

### Community 20 - "NINDOVA — Brand Guide"
Cohesion: 0.14
Nodes (13): Clear space & minimum sizes, Comparison (5 = best), Design rationale — three concepts explored, Final refinements applied, Icon family (Masala Mound motifs), Identity, Incorrect usage, Motion (+5 more)

### Community 21 - "session/package.json"
Cohesion: 0.15
Nodes (12): devDependencies, vite, vite, license, name, private, scripts, build (+4 more)

### Community 22 - "house.mjs"
Cohesion: 0.15
Nodes (10): completeRunnerStory(), completeStackGame(), enterRunnerNarrated(), errors, externalRequests, hanoiMoves(), output, publishedHouseText (+2 more)

### Community 23 - "Nindova House"
Cohesion: 0.21
Nodes (12): Nindova contributor guidance, Two-Loop Law, Local Completion Provenance, Product Claim Boundary, Nindova README, Local Gallery, Session Leaveability Rationale, Night Room (+4 more)

### Community 24 - "Rasoi Pairs"
Cohesion: 0.17
Nodes (12): Rasoi Pairs Phone Interface, Sound Off Control, Tonight's Kitchen, Dawn, Rasoi Pairs, Safe Pair, Session, Deferred Wall (+4 more)

### Community 25 - "Rasoi Pairs Redesign Evidence"
Cohesion: 0.17
Nodes (12): Authored and Exhaustively Verified Board Kernel, Historical Vista Portrait Accessibility Evidence, M3 Deterministic Nights and Quiet Memory Checkpoint, Historical Vista Dawn, Local Dawn Still and Silent Loop Exports, M4 Dawn Keepsake Checkpoint, M5 Website Docs and Offline PWA Evidence, Offline PWA and Public Surface (+4 more)

### Community 26 - "Nindova Asset Manifest"
Cohesion: 0.20
Nodes (12): Public Brand Asset Family, Nindova Brand Guide, capture-brand-social.mjs, capture-public-media.mjs, CC0 Original Project Assets, Nindova Asset Manifest, Product Evidence Rather Than Marketing Mockups, Public Product Media Family (+4 more)

### Community 27 - "color-contrast.test.mjs"
Cohesion: 0.24
Nodes (10): bodyPairs, luminance(), motifRules, ratio(), relativeLuminance(), rgbRatio(), root, sessionRatio() (+2 more)

### Community 28 - "Nindova Research Receipts"
Cohesion: 0.18
Nodes (11): Session Asset Provenance, Punjabi-Inspired Cultural Direction, No Performance or Escalation Layer, Rasoi Pairs Product Contract, Two-Loop Law, American College of Physicians CBT-I Guideline, Brosnan et al. 2024 Interactive Screen Use Study, Hartstein et al. 2022 Evening Light Study (+3 more)

### Community 29 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, noEmit, noImplicitAny, strict, strictNullChecks, useUnknownInCatchVariables, extends, include (+2 more)

### Community 30 - "Rasoi Pairs v0.1.0 Change Set"
Cohesion: 0.22
Nodes (11): Session Clock and Local State Architecture, Active-session v2 Strict Validation and Reload Settlement, Accessible Responsive Rasoi Session, Nindova Changelog, Fifteen-minute Session Ceiling, Punjabi and Indian Kitchen Reframing, Removed Vista Assets and Active Echo Behavior, Strict Active-session Resume and Settlement Reload (+3 more)

### Community 31 - "House-First Public-Surface Refresh"
Cohesion: 0.20
Nodes (11): Local Refresh Delivery Boundary, Synchronized Public Surface, Graphify Corpus Health, House-First Public-Surface Refresh, Live Source and Tagged Release Boundary, Local Delivery Limit, Canonical Public Facts, Responsive and Accessibility Verification (+3 more)

### Community 32 - "Night and Local State"
Cohesion: 0.20
Nodes (10): First-Light Dawn Surface, Captured-Zone Dawn Eligibility, Kitchen Dawn, Legacy Vista Dawn Composition, Local Dawn Keepsake Exports, Deterministic Recipe Version 2, Ephemeral Same-Tab Resume, Immutable Night ID (+2 more)

### Community 33 - "Visible Free Edge Pairs"
Cohesion: 0.27
Nodes (10): Chai Tile Pair, Chimta Tile Pair, The Edge Tiles Are Ready Status, Visible Free Edge Pairs, Katori Tile Pair, Indian Kitchen Tile Motifs, Match Free Edge Tiles, Punjabi-inspired Material Direction (+2 more)

### Community 34 - "Tagged v0.3.0 Release"
Cohesion: 0.24
Nodes (10): Current House and Night Room Build, Downloads Guide, Live Nindova House, Live Night Room, Browser and PWA Platform Boundary, SHA-256 Checksums, Standalone Night Room HTML, Static Web Archive (+2 more)

### Community 35 - "ADR 0010 Replace the Vista Arc with Rasoi Pairs"
Cohesion: 0.25
Nodes (9): ADR 0010 Replace the Vista Arc with Rasoi Pairs, Preserved Nindova Contracts, Superseded Experience-specific ADRs, M1 Portrait and Accessibility Checkpoint, M2 Tactile and Self-closing Checkpoint, Seed Asserted Regression Gate, Seed Observational Run Evidence Limit, Original Supplied Prototype (+1 more)

### Community 36 - "package.json"
Cohesion: 0.22
Nodes (8): engines, node, license, name, packageManager, private, type, version

### Community 37 - "run-seed-observational.mjs"
Cohesion: 0.22
Nodes (8): child, disposablePath, output, portable, root, seedPath, sourcePath, tempParent

### Community 38 - "Nindova Rasoi Pairs App Icon"
Cohesion: 0.32
Nodes (8): Four Cardinal Textile Diamonds, Symmetrical Central Focal Mark, Brass Masala Dabba, Indigo Madder Brass and Cream Palette, Phulkari-Inspired Diamond, Indian Kitchen Brand Identity, Five Radial Spice Bowls, Nindova Rasoi Pairs App Icon

### Community 39 - "Rasoi Pairs Session Interface"
Cohesion: 0.29
Nodes (8): Browser Dismissal Surface, Voluntary Intake Surface, Quiet End Card, Rasoi Pairs Session Interface, Semantic Rasoi Board, Deferred iOS Wall, Frozen Wall Agency Contract, Immutable Product Language

### Community 40 - "Quiet Depth plan"
Cohesion: 0.04
Nodes (39): Layer Rasoi and keep replay deliberate, Add tonight-only depth and optional Image Drift, Add the adult Nindova House while preserving the Night Room, Add a fail-closed assessment-readiness contract, Add the bounded Sector Sprint table, Deepen Sector Sprint flight and illustration, Acceptance gates, Availability (+31 more)

### Community 41 - "Rasoi v0.1.0 Highlights"
Cohesion: 0.25
Nodes (8): Continuous Keyboard and Strict Recovery Evidence, Release Evidence and Open Limits, Release Fifteen-minute Hard Ceiling, Checksummed Standalone and Web Bundle, Rasoi v0.1.0 Highlights, Nindova v0.1.0 Rasoi Pairs Release Notes, Strictly Validated Same-tab Resume, Release Twelve-minute Automatic Settle

### Community 42 - "Rasoi Browser Architecture"
Cohesion: 0.29
Nodes (7): Scoped PWA Bootstrap, Rasoi Browser Architecture, PWA and Standalone Distribution Boundary, Shared Rasoi Legality Kernel Architecture, Session Site and Composition Workspace, Shared Rasoi Legality Kernel, Rasoi Non-negotiable Checks

### Community 43 - "Nindova Rasoi Diamond Favicon"
Cohesion: 0.33
Nodes (7): Brass Circular Spice Box, Compact Geometric Legibility, Indigo Brass Cream and Madder Palette, Indigo Rasoi Diamond, Dark Rounded-Square Field, Radial Madder Spice Wells, Nindova Rasoi Diamond Favicon

### Community 44 - "Rasoi Pairs Session Arc"
Cohesion: 0.29
Nodes (7): Universal 343-state Board Guarantee, Voluntary Pair-removal Session Path, Mahjong-solitaire Rule Inspiration, Rasoi Pairs Session Arc, Semantic Safe-pair Hint, Twelve-minute Settle and Fifteen-minute Ceiling, Deterministic Keyboard Focus and Semantic Hint

### Community 45 - "advanceChapter"
Cohesion: 0.18
Nodes (19): advanceChapter(), advanceStoryBeat(), answerChoice(), beginRunnerRoute(), chooseNarratedRoute(), closeHouseAudio(), initialPegs(), discardActiveGame() (+11 more)

### Community 46 - "layered-rasoi.mjs"
Cohesion: 0.33
Nodes (3): open(), root, watchPage()

### Community 47 - "pwa-offline.mjs"
Cohesion: 0.29
Nodes (5): DeniedAudioContext, errors, requests, root, server

### Community 48 - "tile-latency.mjs"
Cohesion: 0.38
Nodes (5): cpuThrottle, elapsedUntil(), measureTarget(), root, tapTile()

### Community 49 - "session/sw.js"
Cohesion: 0.53
Nodes (5): canonicalPrecacheUrl(), matchOwned(), PRECACHE, PRECACHE_URLS, refreshFromNetwork()

### Community 50 - "Nindova Social Preview"
Cohesion: 0.53
Nodes (6): A House of Authored Games for Adults 18+, West Wing Gallery, The Centre Grand Salon, North Wing Night Room, Choose a room. Stay for the pleasure of solving., Nindova Social Preview

### Community 51 - "Privacy and Local State"
Cohesion: 0.40
Nodes (6): Bounded Version 3 Night Record, Scoped Static Offline Cache, Privacy and Local State, Same-origin Static Runtime Boundary, Active Baseline Invariants, Historical Browser-First Build Plan

### Community 52 - "Calm Bounded Pair-removal Promise"
Cohesion: 0.33
Nodes (6): Punjabi-inspired Kitchen Cultural Direction, Enter Pair Settle Dawn Experience, Behavioral Design Evidence Boundary, Calm Bounded Pair-removal Promise, Rasoi Pairs Redesign Plan, Rasoi Redesign Honest Limits

### Community 53 - "getGame"
Cohesion: 0.26
Nodes (16): closeRunnerAtBoundary(), getGame(), drawCurrentRunnerFrame(), mountRunner(), playRunnerStateCue(), prepareRunnerCanvas(), queueRunnerAction(), runnerIsSuspended() (+8 more)

### Community 54 - "compose-build.mjs"
Cohesion: 0.33
Nodes (5): houseOutput, output, root, sessionOutput, siteOutput

### Community 56 - "public-surface.mjs"
Cohesion: 0.33
Nodes (4): errors, output, root, server

### Community 58 - "Sector Sprint Scene"
Cohesion: 0.50
Nodes (5): Code-Drawn Miniature, Fixed Authored City Route, 12 Missed Calls Prompt, Sector 22, Sector Sprint Scene

### Community 59 - "Rasoi Pairs Accessibility"
Cohesion: 0.40
Nodes (5): Rasoi Pairs Accessibility, Accessible Alternate Presentation, Live Semantic Selection and Hint Feedback, Real-device Assistive Technology Limit, Semantic Tile Controls

### Community 60 - "Complete Static Release Surface"
Cohesion: 0.40
Nodes (5): Complete Static Release Surface, Getting Started Guide, GitHub Pages Publication from Main, Nindova npm Workspace, Source and Browser Verification Gates

### Community 61 - "visual-identity.md"
Cohesion: 0.40
Nodes (4): Masala Mound silhouettes, Motion and provenance, Phulkari lattice, Shahi Raat palette

### Community 62 - "Assessment readiness"
Cohesion: 0.40
Nodes (4): Assessment readiness, Required evidence gates, Sequencing, What is implemented

### Community 63 - "house/package.json"
Cohesion: 0.11
Nodes (17): dependencies, @fontsource-variable/geist, @fontsource-variable/newsreader, devDependencies, vite, @fontsource-variable/geist, @fontsource-variable/newsreader, vite (+9 more)

### Community 64 - "Nindova v0.2.0 — Quiet Depth"
Cohesion: 0.40
Nodes (4): Added, Evidence boundary, Improved, Nindova v0.2.0 — Quiet Depth

### Community 65 - "Nindova v0.3.0 — Shahi Mound"
Cohesion: 0.40
Nodes (4): Added, Evidence boundary, Improved, Nindova v0.3.0 — Shahi Mound

### Community 66 - "Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Independently review revised Rasoi Pairs plan for Nindova product contract, timing, state, Dawn, and migration risks, Source Nodes

### Community 67 - "Q: Why does Rasoi Pairs lack Mahjong-like layered challenge and visible replay?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Why does Rasoi Pairs lack Mahjong-like layered challenge and visible replay?, Source Nodes

### Community 68 - "Q: Make the app theme more royal and sophisticated"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Make the app theme more royal and sophisticated, Source Nodes

### Community 69 - "Q: rasoi dawn looks so ugly"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: rasoi dawn looks so ugly, Source Nodes

### Community 70 - "Q: Council coverage review of the adult Nindova House entertainment implementation"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Council coverage review of the adult Nindova House entertainment implementation, Source Nodes

### Community 71 - "Q: Build entertainment first for adults above 18, test it, run a council review, then implement assessment grade."
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Build entertainment first for adults above 18, test it, run a council review, then implement assessment grade., Source Nodes

### Community 72 - "Q: How is Sector Sprint registered, rendered, persisted, completed, tested, and isolated from the Night Room?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How is Sector Sprint registered, rendered, persisted, completed, tested, and isolated from the Night Room?, Source Nodes

### Community 73 - "Q: How is Sector Sprint registered, rendered, persisted, completed, tested, and isolated from the Night Room?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How is Sector Sprint registered, rendered, persisted, completed, tested, and isolated from the Night Room?, Source Nodes

### Community 74 - "Q: How does the polished Sector Sprint connect rendering, state, audio, accessibility, and tests?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How does the polished Sector Sprint connect rendering, state, audio, accessibility, and tests?, Source Nodes

### Community 75 - "serve.mjs"
Cohesion: 0.40
Nodes (4): mime, port, root, server

### Community 76 - "seed-asserted.mjs"
Cohesion: 0.40
Nodes (4): errors, output, root, states

### Community 77 - "Nindova Roadmap"
Cohesion: 0.50
Nodes (4): Assessment-Readiness Contract, Next Hardening, Nindova Roadmap, Real-Device and Human Risks

### Community 78 - "render"
Cohesion: 0.29
Nodes (11): escape(), gameSigil(), render(), renderChoice(), renderChoiceVisual(), renderGallery(), renderGame(), renderHome() (+3 more)

### Community 79 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+8 more)

### Community 80 - "Q: How do the adult House and Sector Sprint connect through house source/core to Night state, public surface, and PWA/offline boundary?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How do the adult House and Sector Sprint connect through house source/core to Night state, public surface, and PWA/offline boundary?, Source Nodes

### Community 81 - "workspaces"
Cohesion: 0.50
Nodes (4): workspaces, apps/house, apps/session, apps/site

### Community 83 - "wall-clock-cap.mjs"
Cohesion: 0.50
Nodes (3): errors, root, server

### Community 87 - "Punjabi and Indian Material World"
Cohesion: 0.67
Nodes (3): Cultural Visual Guardrails, Punjabi and Indian Material World, Theme and Behavior Independence

### Community 88 - "Q: How do Sector Sprint hold-to-lift input, fixed-step flight, lazy illustrated art, deterministic complications, adaptive Canvas quality, audio suspension, narrated fallback, and offline caching connect without changing the House completion contract?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How do Sector Sprint hold-to-lift input, fixed-step flight, lazy illustrated art, deterministic complications, adaptive Canvas quality, audio suspension, narrated fallback, and offline caching connect without changing the House completion contract?, Source Nodes

### Community 111 - "sector-sprint-feel.mjs"
Cohesion: 0.25
Nodes (3): errors, root, server

### Community 112 - "Sector Sprint cinematic game-feel checkpoint"
Cohesion: 0.40
Nodes (4): Authored encounter matrix, Evidence boundary, Sector Sprint cinematic game-feel checkpoint, Verified gates

### Community 113 - "finishGame"
Cohesion: 0.33
Nodes (7): clearChapterTransition(), completeEntertainmentGame(), writeHouseState(), finishGame(), memory(), resumeChapterTransition(), scheduleChapterTransition()

### Community 114 - "Sector Sprint character sheet"
Cohesion: 0.50
Nodes (3): Generation prompt, Provenance, Sector Sprint character sheet

### Community 115 - "Q: How is Sector Sprint's runner state, input, Canvas renderer, audio loop, mobile performance, and reduced-motion route structured?"
Cohesion: 0.50
Nodes (3): Answer, Outcome, Q: How is Sector Sprint's runner state, input, Canvas renderer, audio loop, mobile performance, and reduced-motion route structured?

## Knowledge Gaps
- **517 isolated node(s):** `name`, `version`, `license`, `private`, `type` (+512 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `house.ts` (3× useful, score=2.985400274) _(code changed — re-verify)_
- `sector-sprint.ts` (2× useful, score=1.991290568) _(code changed — re-verify)_
- `sector-sprint.test.mjs` (2× useful, score=1.991290568) _(code changed — re-verify)_
- `house-core.ts` (2× useful, score=1.9891659)
- `Theme and Behavior Independence` (2× useful, score=1.973691895)
- `Rasoi Pairs Session Interface` (2× useful, score=1.950366981)
- `Dawn` (2× useful, score=1.950045856) _(code changed — re-verify)_

**Known dead ends** — questions that led nowhere; don't re-derive.
- "Council coverage review of the adult Nindova House entertainment implementation" -> `Offline PWA and Public Surface`, `pwa-offline.mjs`

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Rasoi Pairs` connect `Rasoi Pairs` to `Visible Free Edge Pairs`, `ADR 0010 Replace the Vista Arc with Rasoi Pairs`, `Calm Bounded Pair-removal Promise`, `Rasoi Pairs Redesign Evidence`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Nindova` connect `Nindova House` to `Rasoi Pairs`, `Nindova Social Preview`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Session` connect `Rasoi Pairs` to `Nindova House`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `version`, `license` to the rest of the system?**
  _517 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `house.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07386363636363637 - nodes in this community are weakly interconnected._
- **Should `session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05894736842105263 - nodes in this community are weakly interconnected._
- **Should `rasoi-core.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07293868921775898 - nodes in this community are weakly interconnected._