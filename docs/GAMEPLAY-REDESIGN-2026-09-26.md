# Nindova: games worth spending time with

Date: 2026-09-26. Status: accepted roadmap. Two-round planning council review complete; no unresolved blockers. The first-delivery checkpoint—shared teaching, Pattern Court construction, and one Sector 22→17 outing—is implemented by [ADR 0022](./adr/0022-deepen-house-play-with-an-authored-chandigarh-outing.md). The remaining briefs are proposals rather than shipped features.

## Decision in one paragraph

Make Chandigarh the flagship adventure, and rebuild the Salon's shallow answer-selection games around things players actually manipulate, plan, and change. Give every game a playable introduction, consequences that remain visible, authored escalation, and an ending earned through understanding. Build and test one small but complete Chandigarh district before producing the larger city. Keep the Night Room's separate sleep-boundary contract. Enjoyment is the goal; neither this plan nor automated tests establish a dopamine increase or guaranteed happiness.

## Evidence and limits

The review began at `02f7c24` with unrelated release edits present. During inspection another activity committed those edits as `7456079` (v0.6.2 preparation). This task did not stage, commit, reset, or edit those files. The gameplay findings below refer to inspected source; the Safari observations used the pre-existing local `dist` build, whose exact build provenance was not established. They are illustrative, not exact-candidate release acceptance.

- Graphify's existing graph routed the review to `salon-catalog.ts`, `classic-studies.ts`, `house.ts`, and the Sector Sprint modules. Its broad query was truncated; direct source supplied the findings.
- All eight Salon definitions and their current mechanics were inspected in source. The Night Room contract and Quiet Depth plan were also read.
- Native Safari inspection covered House entry, Pattern Court's first board, Sector Sprint entry/action surface, and its city-map panel. This was not a complete playthrough of every game, a phone test, or a usability study. Obscura refused loopback access, so Safari was used.
- No `Sector Splendor` name appeared in the searched app, docs, reference, or README. This plan assumes the Chandigarh game meant is **Sector Sprint**, its current catalog name; no rename is implemented.
- Official Chandigarh sources were refreshed for broad setting facts. The direct tourism map PDF and Rose Garden page did not load; indexed map text supports the named locations, but a precise new map must still be checked against a readable authoritative map before production.

### What actually needs changing

| Finding | Current evidence | Design consequence |
| --- | --- | --- |
| Several games ask for recognition instead of sustained play | `apps/house/src/salon-catalog.ts:82` defines five short Pattern Court questions; `:90` defines five arrow-rotation questions; `:98` defines five sequence-recognition questions | Replace selecting an answer with constructing a solution and observing its consequences |
| The classic games are explicitly demonstrations | `apps/house/src/classic-studies.ts:124` onward and ADR 0019: mill-closing placements, single goat/tiger moves, or one sowing turn | Preserve sourced rules, but author multi-turn tactical situations; do not market demonstrations as full matches |
| Instructions exist, but teaching is thin | `house.ts:493`, `:552`, `:643`, and `sector-sprint-table.ts:492` contain prompts, rules, controls, and help; lifecycle `:173` supplies generic wrong-answer copy | The problem is not literally zero instructions: add show–try–explain teaching and specific corrective feedback |
| Increasing quantity substitutes for new decisions in Stack Architect | Catalog uses 2, 3, 4, 5, 6 discs | Retain Hanoi's real planning depth, but stop treating more moves as the sole source of variety |
| Chandigarh is a miniature with repeated tasks | `sector-sprint.ts:2` defines a 1536×1024 world; `:156` has nine marks across three courses; six encounter points and one painted world asset | Larger coordinates alone will not help. Build districts with different spatial problems, interactions, and purposes |
| The world map currently illustrates fiction, not city geography | ADR 0021 and the map's own alternate text explicitly describe a compressed fictional layout | Use a geographically grounded overview and clearly separated fictional playable spaces |
| Prior quality work prioritized presentation | `docs/GAME-QUALITY-PLAN.md` specifies behavior-preserving polish and still contains obsolete lane-runner dimensions/terms | This proposal replaces its next-work priority with gameplay first; reconcile the old roadmap when this proposal is adopted |

Interpretation: the user complaint is consistent with the above mechanics. It is not evidence that every player dislikes every game. Preserve useful art, accessibility, state isolation, and input work; do not throw away the app.

## The new standard for every game

Each table needs six answers visible through play: **What am I doing? How? Why this choice? What changed? What can I try next? What finishes this?**

1. **One-sentence goal:** concrete verbs, such as “Turn the mirrors to light both windows.” Put it beside the board.
2. **A playable first action:** demonstrate one move, let the player repeat it, then change the situation. Existing players can skip or reopen teaching. No mandatory wall of prose.
3. **A useful decision:** choose a route, trade one advantage for another, or plan moves. Every later chapter adds an interaction or combines known rules, rather than merely lengthening the same question.
4. **Readable feedback:** acknowledge input immediately; show the causal change at its location; explain an invalid action precisely. A successful action should alter the board or scene, not only trigger praise.
5. **Recovery:** undo for puzzles, safe nearby resets for action, replayable examples, and progressively explicit optional hints. Failure consumes no currency and deletes no unrelated work.
6. **A satisfying closure:** finish the specific object, encounter, or route, then offer a clean exit. No autoplay, streak, randomized reward, persistent collection, or escalating celebration economy.

Use five authored parts initially as a pacing framework: learn → vary → combine → choose → resolve. A part may contain several meaningful actions. Do not preserve “five clicks” merely because the catalog currently stores five entries. Display chapter/Act position as navigation where useful, never as a score or rank.

### Teaching and visual layout

- Put the playable surface in the first viewport. Pattern Court's inspected desktop layout spends much of that viewport on the title and framing; the redesign should substantially reduce that header during play.
- Keep one current goal, one contextual instruction, and a persistent “How to play” control. Reveal advanced controls only when used. Source/ruleset details remain available without occupying the primary play area.
- Show where an action will land before committing: legal destinations, beam preview, seed route, or jump landing shadow. Pair color with shape/text.
- Phone: thumb-reachable controls, ≥44 CSS-pixel targets, readable scene scale, safe areas, and no horizontal overflow. Desktop: use space for the game, not oversized ceremonial titles.
- Every tutorial, hint, action, and changed state needs a keyboard and semantic equivalent. Animation and audio enrich it; neither is necessary to understand or complete it.

## Chandigarh: an adventure built from the city

Working public title: **Chandigarh: The Long Way Home**. Keep internal `sector-sprint` identity initially for routes and old provenance. Final naming is an editorial choice, not a prerequisite for the first prototype.

**Player promise:** “Explore Chandigarh, master playful movement, outsmart mischievous contraptions, help people, and find your way home.” Keep Gurpreet and Harjit and the homecoming relationship. Give characters purposes beyond handing out interchangeable errands.

### World structure: truthful overview, rich playable districts

Build an original north-oriented city overview with sector outlines, a legend, the player’s current district, and named destinations. Validate relative placement and sector numbers against authoritative reference material. Within it, select a district to enter a deliberately fictional platforming space. Label the two layers “City overview” and “Adventure scene”; compressed travel and invented paths must be clear. Do not place Sector 22's home and market on opposite sides of the city merely to fill the canvas.

Target five authored district outings. Each is independently selectable from the outset, with no unlock chain, persistent completion map, or pressure to visit them all. Each outing contains five encounters and keeps the existing ten-minute foreground boundary. Target roughly 6–9 minutes of ordinary play as an initial design hypothesis; validate with people. A single outing covers one district or a nearby pair, not the whole city under a ten-minute deadline. The whole library offers more play through different outings rather than a larger mandatory errand list.

This is a proposed revision to ADR 0021's one-global-journey contract. Until adopted, production keeps its current route, five encounters, reset behavior, and ten-minute cap. The proposal does not silently extend the timer. If longer continuous campaigns or persistent saves are desired later, they need a separately written House-only timing/storage decision; the Night Room remains ≤15 minutes.

| Outing | Identity and playable depth | Learning through action |
| --- | --- | --- |
| **Sector 22 → Sector 17** | Home/market departure, shaded verandah paths, plaza arrival; lower accessible walkway and an optional platform route; unfold a fictional delivery ramp and resolve a courtyard contraption encounter | Recognize sector signage and the difference between local shopping space and the city-center plaza |
| **Sector 17 plaza** | Fountain-centered space, repeated shop bays and open sightlines; rotate a fictional display mechanism to open a route; use shade and silhouette to navigate | Recognize the plaza's commercial/social role and architectural rhythm |
| **Sector 16 Rose Garden / green connections** | Garden paths and labeled beds, branching low/high routes, an original wind mechanism; restore a fallen interpretation sign with a gardener | Locate Rose Garden in Sector 16; use the map to connect a garden to its urban setting; no invented botanical fact |
| **Rock Garden** | Close passages opening into courtyards; original mosaic workshop; rearrange supplied offcuts into bridges and deflect a toy automaton's projectiles | Understand Nek Chand's work and reuse of discarded materials; never remove or break actual artworks |
| **Sukhna edge** | Long promenade, foothill horizon, land-based wind-and-sail puzzle, return of a fictional borrowed object; end with Harjit | Recognize the lake and its setting; distinguish actual place facts from invented mechanics |

The first shipped world need not include every landmark. Add Capitol Complex, museums, and further neighborhoods only after the first five outings meet the same quality bar. A future Capitol chapter needs architecture research and explicit treatment of fictional access; do not imply that roofs or controlled areas are publicly climbable.

The broad city framework is grounded in the [Chandigarh Administration's planning description](https://chandigarh.gov.in/general-information) and [road hierarchy](https://chandigarh.gov.in/circulation). Rose Garden/Sector 16 and Rock Garden/Sector 1 are supported by indexed text from the [official tourist map](https://chandigarhtourism.gov.in/uploads/map.PDF), pending a readable map check. The reused-materials and courtyard treatment is grounded in [Ministry of Tourism's Rock Garden description](https://www.incredibleindia.gov.in/en/chandigarh/chandigarh/rock-garden). All puzzle devices, antagonists, dialogue, routes, and errands in the table are fictional design proposals.

### Movement and fighting: make actions combine

Use the *qualities* of a good platform adventure: readable jumps, generous input forgiveness, interesting terrain, enemies with understandable behavior, and tools that change how a route is approached. Create original characters, art, movement tuning, layouts, and sound.

Recommended first prototype: a side-on traversal scene entered from the overview. Depth comes from platforms, foreground occlusion, distant architecture, and doors into short courtyard spaces. This makes jump distances and encounters easier to read than adding more tiny sprites to the existing oblique painting. Validate this choice before committing the whole city; keep the current House shell and table boundary.

- Verbs: move, jump, interact, and one context-sensitive scarf action (dash in traversal, deflect at a clearly signaled encounter). Avoid simultaneous three-button requirements on phones.
- Keep spring juttis and scarf tools as authored, session-only abilities. Introduce each safely, vary its use, then combine it with a choice of routes. Tools are given predictably and never earned through grinding.
- Add forgiving jump buffering, edge grace, explicit landing shadows, reliable camera framing, and a “Help me through” action. Tuning values belong in the prototype, not an untested promise here.
- Enemies: original wind-up courtyard toys or loose paper creatures, clearly part of the fictional adventure. Give one a readable patrol and another a slow, telegraphed projectile. Encounters can be bypassed, out-positioned, or resolved with a scarf deflection and jump.
- A finale can have three distinct behavior phases with visible cause and effect, without a health bar or damage number. A mistake returns the player to the current safe encounter point; no lives, score, loot, repeated farming, or lost district progress.
- The fighting must have agency and resistance: observe → choose an approach → act → react to the changed opponent. Removing health bars must not reduce combat to pressing “continue.” Assisted play offers the same meaningful choices as untimed semantic actions.
- Do not use real communities, vendors, police, religious figures, or actual monuments as disposable enemies. This is a creative setting choice, not a claim that fictional combat is forbidden.

### First five-encounter outing: the execution reference

1. **Leave the verandah.** Learn move/jump through a tiny safe space; meet one character who needs a fictional paper display returned. Objective and home route are immediately understandable.
2. **Choose a way through.** A ground route teaches interaction; a raised fictional course teaches jump-and-scarf combination. Both reach the same person without differing rewards.
3. **Handle the courtyard toy.** Its telegraph explains when a deflection works. A second valid solution changes its path. Optional turn-by-turn controls resolve the same encounter.
4. **Reach the plaza.** Match the sector sign to the overview, then operate a display that reveals an unmistakable plaza composition. The player learns location through using it, not an unrelated trivia gate.
5. **Bring the story home.** Return the repaired object, acknowledge the chosen approach, and close the outing. No next-outing prompt on the ending. Other outings are available only after deliberate re-entry from the House.

Preserve ADR 0021’s reduced-motion entry: start in the text-led route when reduced motion is requested, and switch an active adventure to it when the preference changes. The switch preserves the current encounter, completed actions, equivalent choices, and remaining foreground budget; it cannot restart a challenge or extend the boundary. Test both initial preference and an in-flight change.

The boundary always wins over an action on the same tick. Pause, hide, blur, and exit confirmation suspend play and its foreground clock. At the cap, gracefully close as unfinished; never report learning, victory, or full completion that did not occur. A narrated or assisted path has the same objects, place facts, choices, and ending; it does not need to reproduce twitch inputs.

### Art that can support play

Replace the single scenery sheet as the sole world structure with authored scene layers and collision-aligned terrain. Preserve reusable art only where it matches the real place and the new camera. The city needs recognizable silhouettes, believable scale, distinct paving/building materials, local signage checked by a fluent reader, and spaces where people live and work.

For the vertical slice, cap production at one hero movement/action set, two recognizable NPCs, one enemy family with two behaviors, one courtyard finale, one district tile/material kit, and a small optional audio palette. Make each interactive prop visually distinct from decoration. No map text baked into generative scenery; text stays editable and verified. Generated assets, if used later, need manual continuity, perspective, interaction, and provenance review.

### Education content contract

Author each fact as: `factId`, place, short statement, primary source URL, retrieval date, verification status, and which interaction demonstrates it. Keep fiction in a separate field. Include a local, static “About this place” panel with optional source links; no runtime map API or third-party fetch. Sources are research references, not asset licenses.

Recognition, factual recall, and enjoyment are separate outcomes. Ask people what they learned after playing; do not show grades or store cognitive profiles. A Chandigarh resident should review map/layout and tone, and a reader unfamiliar with the city should be able to explain one real fact without confusing a fictional gadget with local history.

## Every other game: concrete redesign briefs

The following are recommended mechanics, not claims of implemented or culturally validated rules. Keep five authored parts and existing access paths while replacing a table's internal interaction one at a time.

| Game | New play loop | Five-part progression | First buildable slice / acceptance |
| --- | --- | --- | --- |
| **Pattern Court** | Place, rotate, and swap inlay pieces to satisfy connected row/column constraints; see the courtyard pattern develop | Complete a line → rotate a motif → reconcile two intersecting lines → solve with a fixed piece → combine constraints in one finished panel | One 3×3 board with click-to-pick/click-to-place, undo, and a precise conflict highlight. Accept multiple valid solutions when rules allow; no answer-string matching |
| **Mirror Forge** | Rotate real mirrors to route a beam to receivers; changes immediately alter the path | One reflector → two turns → obstacle → two receivers → combine routing constraints | One room with two mirrors, one obstacle, and deterministic beam tracing. Keyboard rotation and a text path description must explain the same state. Light is a fictional workshop puzzle, not a scientific optics lesson |
| **Lantern Ledger** | Arrange a procession of distinct objects from remembered order and relational clues, with optional reveal | Rebuild order → place a missing object → reverse a short route → reconcile two relational clues → reconstruct a procession | Replace the four canned answers with movable lantern slots. Identity uses silhouette + label, not only color. Covering is voluntary; sequence replay has no penalty; no memory-health claims |
| **Stack Architect** | Keep genuine disc planning, but teach subgoals and permit undo; use authored intermediate arrangements instead of always starting a larger tower | Learn legality → move a sub-tower → free a buried disc → plan around a fixed goal arrangement → solve a compact combined task | Three-disc partially arranged puzzle, undo, optional “show the next subgoal.” Verify reachability. Avoid making a 63-move six-disc solve the mandatory proof of depth |
| **Navakankari** | Multi-turn placement tactics with an understandable, deterministic opponent response; teach creating a threat versus blocking one | Make a mill → stop a threat → create two threats → anticipate a reply → solve a short tactical position | One sourced placement-only scenario with 2–4 player decisions and branching opponent replies. Explicitly remain a tactical study; later movement/removal/full matches require a separately selected, verified ruleset |
| **Aadu Puli Aattam** | Explore pursuit and containment through a short sequence of legal moves and responses | Legal step/leap → avoid capture → restrict an escape → choose between two threats → finish a containment/capture objective | One sourced movement scenario with several meaningful plies and an undoable reply. Do not invent movement edges or advertise a full traditional match; additions such as setup and victory need rule evidence |
| **Pallanguzhi** | Pick up and sow actual seeds, preview the path, choose among consequences, then continue an authored position | Sowing → board wrap → relay → capture condition → plan a short sequence | One turn where every seed's movement is legible, then one verified continuation. The existing selected ruleset remains the authority; multi-turn opponent scenarios wait until ownership, stopping, and capture rules are documented and tested |
| **Rasoi Pairs / Night Room** | Improve how free/covered tiles and look-ahead are taught; retain the current layered pair-removal arc | Keep Gentle/Deeper shapes, safe pairs, quiet settlement, optional Drift, and Rest | A short reopenable free-tile demonstration plus clearer occlusion/selection feedback, tested against the existing solvability proof. No combat, extra chapter loop, timer extension, scoring, or louder reward ladder |

Before adding any opponent response, the proposed superseding ADR must explicitly revise ADR 0019’s exclusion of opponent simulation. Author bounded, branching deterministic replies for tactical scenarios, with documented player choices and termination; this does not claim full-match AI or complete traditional rules. Existing studies retain their accepted behavior until that change is adopted.

The classic studies should feel like thoughtful playable scenarios rather than single-answer worksheets. Full traditional matches are a possible later direction, not a quick reskin: they need complete variant rules, fair opponent behavior, draw/termination policy, and a separate completion contract. Do not block improvements to today's teaching while that research happens.

## Implementation map and compatibility

- `apps/house/src/salon-catalog.ts`: keep stable IDs and category routes; add per-game goal/tutorial metadata and version new mechanics. Replace fixed answer arrays only for the game currently being rebuilt.
- `house.ts` / `house.css`: prioritize the game viewport; render contextual teaching, explicit help, undo/recovery, semantic controls, and game-specific changed-state feedback.
- `salon-table-lifecycle.ts`: retain its lifecycle ownership; let each redesigned game validate actions and report progress/completion. Stop treating one correct choice as a universal chapter model.
- `classic-studies.ts` / `stack-architect.ts`: reuse verified legality where it applies; add scenario state transitions and solvability/termination fixtures without silently importing rules from another variant.
- `sector-sprint.ts`, `sector-sprint-world.ts`, `sector-sprint-table.ts`: preserve the engine/render/table ownership split. Prototype district data, traversal collisions, encounters, camera and input inside that seam. Replace the old renderer/engine path for this table when accepted; do not maintain a second public game implementation indefinitely.
- `house-state.ts`, `house-session-codec.ts`, `sector-sprint-session.ts`: keep local state boundaries and the latest-result-only Gallery. New completions need the new game/ruleset versions and narrow true facts. Old results remain readable; incompatible active puzzle states get an explicit safe restart, never a false continuation. Chandigarh remains in-memory and fails closed on reload. This plan adds no cross-outing save or progress collection.
- Preserve `window.__ct`; version any changed `window.__house` game diagnostics and update consumers together. Keep five-part completion semantics for tables; update Chandigarh's outing identity under its new ruleset without accumulating per-outing results.
- Keep same-origin static/offline runtime, optional audio, reduced motion, and no telemetry. Reference links load only on explicit user navigation. Never add a map SDK merely to draw the overview.

## Execution order, deliverables, and gates

Effort ranges below are planning allowances for focused work by a solo builder using assistance, not schedule commitments. They exclude recruitment delays and depend heavily on art iteration. Re-estimate after the first playable slice; parallel scheduling is not assumed.

| Phase | Deliverable | Exit gate | Initial allowance |
| --- | --- | --- | --- |
| **0 — Freeze the design contract** | Adopt this plan; write the superseding House/Chandigarh ADR, including ADR 0019’s opponent exclusion; reconcile stale quality-roadmap language; create reference/fact and game-content templates | Five-part/ten-minute outing policy, combat, full-match exclusions, old-state migration, and map fidelity are explicit | 1–2 days |
| **1 — Teach the existing games** | Build the shared rules/example/goal and specific-error pattern for Chandigarh and Pattern Court first (1a); apply it to the remaining six Salon games and bounded Rasoi teaching after the first-delivery checkpoint (1b) | New players can explain the next action unaided; keyboard and phone layouts hold | 3–5 days |
| **2 — Prove Chandigarh fun** | One complete five-encounter Sector 22→17 outing with temporary art, one enemy family, assisted route and a graybox finale | Traversal and encounter choices work without decorative polish; first local-player/novice test; cap closes truthfully | 7–12 days |
| **3 — Make that outing look authored** | Verified overview placement, one district art kit, hero animation, NPCs, readable camera, optional audio | Landmark recognition, phone legibility, frame pacing, offline assets, and equivalent assisted/narrated content pass | 5–10 days |
| **4 — Rebuild the original puzzle tables** | Pattern Court first, then a first-delivery checkpoint with the finished Chandigarh outing; Mirror Forge, Lantern Ledger, and Stack Architect remain subsequent slices | Each passes rules/solvability checks and a short comprehension/enjoyment comparison | 2–4 days per table |
| **5 — Deepen classic studies** | Navakankari, Aadu Puli Aattam, Pallanguzhi; documented variants and meaningful multi-action scenarios | Rules review, state/termination tests, correct disclosures, and teaching acceptance | 3–5 days per table |
| **6 — Expand Chandigarh carefully** | Four remaining outings with distinct verbs/problems and source-backed facts | Each passes the first outing's gate; no repeated ribbon courses disguised with new scenery | 10–20 days |
| **7 — Acceptance and handoff** | Safari phone/desktop, keyboard/screen reader, reduced motion, mute, PWA/standalone regression evidence; refreshed docs and graph | Exact-candidate evidence and owner playthrough; remaining device limits disclosed | 3–5 days |

Execution sequence: 0 → 1a → 2 → 3 → Pattern Court from 4 → **first-delivery checkpoint** → 1b → remaining Phase 4 tables → 5 → 6 → 7. Every delivered slice runs its relevant acceptance checks; Phase 7 is the full-product consolidation, not permission to postpone quality checks. Phase 1’s 3–5 days cover 1a and 1b together.

The rough total is **46–85 focused person-days**, not a weekend graphics pass. Reduce scope by shipping the first Chandigarh outing and one rebuilt puzzle table first; do not dilute all eight games again. Phase 2 is the go/no-go checkpoint for the expensive city expansion. If the prototype remains dull, revise the core actions before commissioning four more districts.

### Testing what matters

**Gameplay and learning:** recruit a small, explicitly consented formative group (suggestion: six adults, including Chandigarh residents, newcomers to the city, and people who benefit from assisted play; groups may overlap). Observe without coaching, then ask about goal clarity, moments of choice, frustration, remembered setting, and whether the ending felt satisfying. Use facilitator notes outside production; no hidden product analytics. This sample can guide iteration, not prove population-wide fun, accessibility, or educational efficacy.

Provisional iteration criteria: most participants identify the goal and first action within about 30 seconds; can explain two genuinely different choices; can describe one true Chandigarh fact and distinguish it from fiction; and prefer the rebuilt interaction to its current counterpart in a counterbalanced comparison. Repeated confusion, boredom, inaccessible controls, or a mistaken geographical belief blocks expansion even if all unit tests pass. Record disagreements rather than average them away.

**Engineering:** meaningful engine tests for legal transitions, alternate valid solutions, recovery, versioned state, bounded opponent behavior, and timeout-vs-completion races. Browser tests for real pointer/keyboard interactions, focus, help, reload, pause, hidden tabs, denied audio, and no external runtime requests. Capture 320/375/414-width phone layouts and desktop, but separately test physical-phone Safari, desktop Safari, touch, screen reader, 200% zoom, and reduced motion.

Use the current `npm run check`, relevant House/browser tests, and separately the Night standalone HTML and composed PWA/offline/base-path tests. Retire obsolete runner-only assertions only when replaced with equivalent new movement and boundary coverage. Measure input-to-render and frame pacing on the same test device before/after; old lane-runner thresholds are historical, so establish an explicit new-scene baseline before setting its release budget. Adaptive quality may reduce decoration, never rules or learning content.

At each approved implementation slice: inspect diff, run relevant checks, refresh Graphify for code changes, capture rendered evidence, review the owner checkpoint, and commit that slice. This planning request does not publish, deploy, tag, or authorize implementing the deferred iOS Wall.

## Next executable task

Adopt the House-only contract changes, then build the **single Sector 22→17 outing graybox**: five encounters, one route choice, one readable combat encounter, one map-linked learning moment, and one real ending. Build and test the graybox with Phase 1a teaching. If it passes the gameplay gate, complete Phase 3’s authored outing, then rebuild Pattern Court for the first-delivery checkpoint. Apply the remaining teaching work in Phase 1b afterward. Judge whether it is enjoyable before spending time on the larger map. The rest of this document remains the ordered backlog, not a mandate to rebuild every game simultaneously.

## Council outcome

Completed two rounds with four actual independent reviewer roles per round: evidence, coverage, risk, and outcome. Round 1: one APPROVE and three APPROVE_WITH_NITS. Round 2: three APPROVE and one APPROVE_WITH_NITS. No unresolved blockers.

Review corrections made the classic-game opponent contract revision explicit, preserved reduced-motion entry and live switching with encounter/time continuity, split shared teaching into Phase 1a/1b, and fixed the first-delivery order to include a polished Chandigarh outing plus Pattern Court. The last editorial correction aligned the next-task paragraph with that order.

Council agreement assesses the quality of this plan, not demonstrated fun or implementation/release authority. Map fidelity, enjoyment, cultural review, and real-device acceptance remain execution gates. See [review record](./GAMEPLAY-REDESIGN-REVIEW-2026-09-26.md).
