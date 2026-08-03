# Graph Report - Nindova  (2026-08-02)

## Corpus Check
- 76 files · ~89,427 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 648 nodes · 945 edges · 50 communities (41 shown, 9 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c20167ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Session Package Configuration
- Debug Contract Types
- Dawn Export Core
- Night State Core
- Session Runtime
- Night and Dawn Runtime
- Session State Transitions
- Assistance and Light Model
- Session Audio and Visitors
- Pointer and Object Flow
- Session and Vista Rendering
- Tactile Interaction Flow
- PWA Service Worker
- TypeScript Configuration
- Session Compatibility Types
- Site Package Configuration
- Docs Content Collection
- Landing Page Entry
- Root Workspace Package
- Supplied Demo Test
- Build Composition
- Seed Observation Harness
- Preview Server
- Dawn Browser Test
- Night Memory Test
- Portrait Accessibility Test
- Offline PWA Test
- Asserted Arc Test
- Self Closing Browser Test
- Production Wall Clock
- Color Contrast Tests
- Dawn Core Unit Tests
- Night Core Unit Tests
- Reference Integrity Tests
- Product Contract Docs
- Self Closing Design
- Night Memory to Dawn
- Portrait Accessibility Decision
- Browser First Delivery
- Release Docs and Visual Guardrails
- Two-Loop Law
- Seed Baseline and Arc
- Bedtime Research
- Illustrated Focal Sprites
- App Icon Artwork
- Window Mark Artwork
- Punjabi Dawn Artwork
- Portrait Session Artwork

## God Nodes (most connected - your core abstractions)
1. `update()` - 27 edges
2. `ClosingTimeDebug` - 20 edges
3. `scripts` - 19 edges
4. `draw()` - 16 edges
5. `clamp()` - 15 edges
6. `rnd()` - 14 edges
7. `updateVista()` - 12 edges
8. `releasePointer()` - 12 edges
9. `Documentation index` - 12 edges
10. `Illustrated Focal Sprite Sheet` - 12 edges

## Surprising Connections (you probably didn't know these)
- `User-Chosen Unguilted Wall` --semantically_similar_to--> `Between-Session Return System`  [INFERRED] [semantically similar]
  docs/adr/0003-keep-the-wall-user-chosen-and-unguilted.md → reference/nindova-master-brief.md
- `Asymmetric Vista Memory` --semantically_similar_to--> `Between-Session Return System`  [INFERRED] [semantically similar]
  docs/adr/0004-use-asymmetric-vista-memory.md → reference/nindova-master-brief.md
- `Fifteen-Minute Session Cap` --semantically_similar_to--> `Bounded Self-Ending Session`  [INFERRED] [semantically similar]
  docs/adr/0005-cap-the-real-session-at-fifteen-minutes.md → reference/nindova-master-brief.md
- `Browser and PWA Before iOS Wall` --semantically_similar_to--> `Browser Front Door`  [INFERRED] [semantically similar]
  docs/adr/0007-ship-browser-and-pwa-before-the-ios-wall.md → reference/nindova-master-brief.md
- `Monotonic Assistance and Light` --semantically_similar_to--> `Decay-Driven Assistance`  [INFERRED] [semantically similar]
  docs/testing/m2-self-closing-session.md → reference/nindova-demo.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Bounded Session Decision and Proof** — reference_nindova_master_brief_two_loop_law, reference_nindova_demo_fixed_session_state_arc, docs_adr_0005_cap_the_real_session_at_fifteen_minutes_fifteen_minute_session_cap, docs_testing_m2_self_closing_session_autonomous_interruption_recovery, docs_testing_m6_release_hardening_production_wall_clock_proof [INFERRED 0.95]
- **Browser-First Artifact Boundaries** — docs_adr_0007_ship_browser_and_pwa_before_the_ios_wall_browser_and_pwa_before_ios_wall, docs_adr_0008_separate_the_public_site_from_the_session_artifact_public_site_and_session_separation, docs_testing_m5_site_docs_offline_pwa_offline_pwa_boundary, docs_testing_m5_site_docs_offline_pwa_pwa_and_standalone_independence, docs_testing_m6_release_hardening_honest_release_boundary [INFERRED 0.95]
- **Night Memory to Morning Dawn** — docs_adr_0004_use_asymmetric_vista_memory_asymmetric_vista_memory, docs_testing_m3_deterministic_nights_one_key_local_memory, docs_testing_m3_deterministic_nights_idempotent_same_night_replay, docs_testing_m4_dawn_keepsake_local_dawn_export, reference_nindova_master_brief_morning_dawn_reward [INFERRED 0.95]
- **Everyday Material Objects** — apps_session_assets_focal_sprites_tied_papers, apps_session_assets_focal_sprites_brass_key, apps_session_assets_focal_sprites_terracotta_cup, apps_session_assets_focal_sprites_embroidered_book, apps_session_assets_focal_sprites_red_thread_spool, apps_session_assets_focal_sprites_brass_pocket_watch [INFERRED 0.85]
- **Animal Visitors** — apps_session_assets_focal_sprites_sheep, apps_session_assets_focal_sprites_goose, apps_session_assets_focal_sprites_patterned_tortoise, apps_session_assets_focal_sprites_rabbit [INFERRED 0.95]
- **Indigo Terracotta Brass and Madder Material Palette** — apps_session_assets_focal_sprites_brass_key, apps_session_assets_focal_sprites_terracotta_cup, apps_session_assets_focal_sprites_embroidered_book, apps_session_assets_focal_sprites_red_thread_spool, apps_session_assets_focal_sprites_brass_pocket_watch, apps_session_assets_focal_sprites_painted_rowboat [INFERRED 0.75]

## Communities (50 total, 9 thin omitted)

### Community 12 - "Session Package Configuration"
Cohesion: 0.17
Nodes (11): name, version, private, type, scripts, build, dev, typecheck (+3 more)

### Community 5 - "Debug Contract Types"
Cohesion: 0.09
Nodes (4): SessionState, SessionObjectSnapshot, ClosingTimeDebug, Window

### Community 7 - "Dawn Export Core"
Cohesion: 0.13
Nodes (14): DawnLocalParts, DawnEligibility, RecorderConstructor, RecordLoopOptions, LOOP_TYPES, localParts(), eligibility(), chooseLoopType() (+6 more)

### Community 4 - "Night State Core"
Cohesion: 0.09
Nodes (34): Vista, NightCapture, NightRecipe, NightState, StorageLike, WEATHER, MOONS, OBJECTS (+26 more)

### Community 0 - "Session Runtime"
Cohesion: 0.03
Nodes (44): canvas, PACING, objects, slots, pointer, motes, motionPreference, nightRecipe (+36 more)

### Community 13 - "Night and Dawn Runtime"
Cohesion: 0.14
Nodes (14): select(), dawnNow(), recordNightCompletion(), FOCAL_SPRITES, vistaDisplayName(), storedCount(), refreshDawnAvailability(), openDawn() (+6 more)

### Community 2 - "Session State Transitions"
Cohesion: 0.20
Nodes (19): lerp(), easeOut(), beginDrift(), updateDrift(), updateReturn(), stopVistaAudio(), lightLamp(), closeNameBox() (+11 more)

### Community 38 - "Assistance and Light Model"
Cohesion: 0.15
Nodes (19): clamp(), easeInOut(), pace(), assistanceEnvelope(), arcClosureProgress(), lightEnvelope(), lightBudgetAt(), portraitFocus() (+11 more)

### Community 16 - "Session Audio and Visitors"
Cohesion: 0.17
Nodes (15): rnd(), startNight(), buildSlots(), makeObjects(), initAudio(), plink(), weatherScale(), initRain() (+7 more)

### Community 19 - "Pointer and Object Flow"
Cohesion: 0.33
Nodes (9): dist(), toScreen(), openNameBox(), nearestFreeSlot(), beginSettle(), settleNextAutonomously(), pickObject(), releasePointer() (+1 more)

### Community 10 - "Session and Vista Rendering"
Cohesion: 0.13
Nodes (24): drawFocalSprite(), drawFocalSpriteOn(), draw(), drawRoom(), drawWindow(), drawSign(), drawShelves(), rnd2() (+16 more)

### Community 14 - "Tactile Interaction Flow"
Cohesion: 0.18
Nodes (13): authoredAccent(), sfxSettle(), sfxDrawer(), sfxSign(), vistaTap(), beginCross(), beginSettleEntity(), sfxHop() (+5 more)

### Community 35 - "PWA Service Worker"
Cohesion: 0.53
Nodes (5): PRECACHE, PRECACHE_URLS, canonicalPrecacheUrl(), matchOwned(), refreshFromNetwork()

### Community 6 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, target, module, moduleResolution, lib, ES2024, DOM, DOM.Iterable (+10 more)

### Community 17 - "Session Compatibility Types"
Cohesion: 0.18
Nodes (10): extends, ./tsconfig.json, compilerOptions, strict, noImplicitAny, strictNullChecks, useUnknownInCatchVariables, noEmit (+2 more)

### Community 8 - "Site Package Configuration"
Cohesion: 0.11
Nodes (17): name, version, private, type, scripts, build, dev, typecheck (+9 more)

### Community 3 - "Root Workspace Package"
Cohesion: 0.05
Nodes (38): name, version, private, type, packageManager, engines, node, workspaces (+30 more)

### Community 36 - "Build Composition"
Cohesion: 0.40
Nodes (4): root, output, siteOutput, sessionOutput

### Community 23 - "Seed Observation Harness"
Cohesion: 0.22
Nodes (8): root, tempParent, output, sourcePath, seedPath, disposablePath, portable, child

### Community 42 - "Preview Server"
Cohesion: 0.50
Nodes (3): root, port, mime

### Community 30 - "Dawn Browser Test"
Cohesion: 0.33
Nodes (5): root, output, server, errors, completion

### Community 26 - "Offline PWA Test"
Cohesion: 0.29
Nodes (5): root, server, DeniedAudioContext, errors, requests

### Community 31 - "Asserted Arc Test"
Cohesion: 0.33
Nodes (4): root, output, errors, states

### Community 43 - "Production Wall Clock"
Cohesion: 0.50
Nodes (3): root, server, errors

### Community 33 - "Color Contrast Tests"
Cohesion: 0.47
Nodes (5): root, token(), luminance(), ratio(), bodyPairs

### Community 1 - "Product Contract Docs"
Cohesion: 0.05
Nodes (66): Nindova contributor guidance, Nindova domain language, Nindova repository overview, Focal sprite provenance, Session HTML shell, Accessibility documentation, Architecture documentation, Dawn documentation (+58 more)

### Community 22 - "Self Closing Design"
Cohesion: 0.25
Nodes (9): Hybrid Procedural Illustration, Hybrid Procedural and Composed Audio, Fifteen-Minute Session Cap, M2 Tactile and Self-Closing Checkpoint, Autonomous Interruption Recovery, Monotonic Assistance and Light, Authored Focal and Audio Accents, Decay-Driven Assistance (+1 more)

### Community 24 - "Night Memory to Dawn"
Cohesion: 0.32
Nodes (8): User-Chosen Unguilted Wall, Asymmetric Vista Memory, M3 Deterministic Nights and Quiet Memory Checkpoint, Deterministic Night Recipe, One-Key Local Memory, Idempotent Same-Night Replay, Notification-Free Return Intention, Between-Session Return System

### Community 39 - "Portrait Accessibility Decision"
Cohesion: 0.50
Nodes (4): Portrait-First Session, M1 Portrait and Accessibility Checkpoint, Semantic Portrait Operation, Pending Real-Device Assistive Technology

### Community 21 - "Browser First Delivery"
Cohesion: 0.27
Nodes (10): Browser and PWA Before iOS Wall, Offline PWA Boundary, Supplied Handoff Artifacts, Handoff Provenance, Codex Kickoff Protocol, Nindova Master Brief, Browser Front Door, iOS Ritual (+2 more)

### Community 18 - "Release Docs and Visual Guardrails"
Cohesion: 0.20
Nodes (11): Public Site and Session Separation, Punjabi and Indian Material World, Cultural Visual Guardrails, Theme and Behavior Independence, M5 Website Docs and Offline PWA Evidence, PWA and Standalone Independence, Installed-Device PWA Risk, M6 Browser-First Release Hardening (+3 more)

### Community 29 - "Two-Loop Law"
Cohesion: 0.33
Nodes (6): M4 Dawn Keepsake Checkpoint, Local Dawn Export, Export Failure Resilience, Two-Loop Law, Morning Dawn Reward, Ryan Rigby and Przybylski 2006

### Community 15 - "Seed Baseline and Arc"
Cohesion: 0.17
Nodes (12): Supplied Seed Baseline, Observational Evidence Limit, Asserted Arc Regression Gate, Observational Test Limitation, Nindova Concept Demo, Fixed Session State Arc, Procedural Canvas and Audio, Dual Pacing Profiles (+4 more)

### Community 40 - "Bedtime Research"
Cohesion: 0.50
Nodes (4): Bedtime Displacement Problem, Kok et al. 2026 Sleep Study, Bourke et al. 2026 JAMA Pediatrics Study, Hill et al. 2022 Meta-Analysis

### Community 11 - "Illustrated Focal Sprites"
Cohesion: 0.19
Nodes (13): Illustrated Focal Sprite Sheet, Tied Papers, Ornate Brass Key, Painted Terracotta Cup, Indigo Embroidered Book, Red Thread Spool, Engraved Brass Pocket Watch, Sheep Visitor (+5 more)

### Community 25 - "App Icon Artwork"
Cohesion: 0.38
Nodes (7): Nindova App Icon, Indigo Rounded-Square Background, Madder Diamond Field, Marigold Diamond Border, Four Phulkari-Like Diamond Motifs, Warm Standing Lamp Motif, Glowing Lamp Orb

### Community 28 - "Window Mark Artwork"
Cohesion: 0.40
Nodes (6): Nindova Window Favicon, Dark Rounded-Square Background, Warm Four-Pane Window, Cream Window Frame, Four Dark Window Panes, Marigold Window Sill

### Community 20 - "Punjabi Dawn Artwork"
Cohesion: 0.24
Nodes (10): Punjabi Dawn Meadow Vista, Madder and Marigold Decorative Border, Repeating Diamond Trim, Blue-to-Marigold First-Light Sky, Glowing Morning Sun, Rolling Green Meadow, Scattered Orange Wildflowers, Rustic Wooden Fence (+2 more)

### Community 9 - "Portrait Session Artwork"
Cohesion: 0.13
Nodes (18): Portrait Nindova Session View, Warm-Dark Study Interior, Rainy Four-Pane Window, Crescent Moon, Mustard Meadow Window Preview, Phulkari-Like Diamond Trim, Hanging Circular-Motif Sign, Dim Amber Lamp Glow (+10 more)

## Knowledge Gaps
- **213 isolated node(s):** `name`, `version`, `private`, `type`, `build` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ClosingTimeDebug` connect `Debug Contract Types` to `Session Runtime`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Nindova Master Brief` connect `Browser First Delivery` to `Bedtime Research`, `Seed Baseline and Arc`, `Self Closing Design`, `Night Memory to Dawn`, `Two-Loop Law`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Debug Contract Types` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Dawn Export Core` be split into smaller, more focused modules?**
  _Cohesion score 0.1286549707602339 - nodes in this community are weakly interconnected._
- **Should `Night State Core` be split into smaller, more focused modules?**
  _Cohesion score 0.09246088193456614 - nodes in this community are weakly interconnected._
- **Should `Session Runtime` be split into smaller, more focused modules?**
  _Cohesion score 0.02631578947368421 - nodes in this community are weakly interconnected._