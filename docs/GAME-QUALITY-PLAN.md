# Nindova game quality plan

**Status:** Active studio-quality roadmap. Sector Sprint's motion foundation and the first two bespoke Grand Salon table passes are implemented in the current candidate; remaining tables continue one behavior-preserving slice at a time.

## North star

Every game should feel like a distinct, authored table inside the same private House: immediately legible, materially specific, responsive on first contact, and satisfying to finish. Sector Sprint should feel like a hand-directed Chandigarh storybook theatre rather than a generic endless runner.

Quality is not measured by the number of effects. A large-studio result comes from coherent art direction, animation timing, input response, sound, accessibility, performance, and repeated device review all agreeing with one another.

## Product boundaries

- Keep the Two-Loop Law, the fixed five-part structure, local-only state, zero telemetry, same-origin static runtime, and existing foreground boundaries.
- Do not add scores, streaks, ranks, currencies, achievements, unlock trees, missed-play language, randomized rewards, visible timers, or variable-ratio feedback.
- Put satisfaction inside the action: anticipation, readable cause and effect, tactile material response, character expression, authored praise, and a clean curtain call.
- Sound, animation, sight, and precision remain optional. Reduced motion and the complete narrated Sector Sprint route remain first-class paths.
- Decorative complexity may scale down. Rules, collision, copy, order, outcome, and completion provenance may not.

## Quality pillars

### 1. Input and motion

- Keep game truth deterministic and fixed-step where it already is.
- Interpolate presentation between simulation steps so 60 Hz, 90 Hz, and 120 Hz displays do not expose simulation stair-stepping.
- Give every movement an authored envelope: anticipation, travel, settle, and a brief residual material response.
- Prefer transform and opacity for DOM motion. Keep canvas effects bounded and render-only.
- Make the first visible response occur in the same or next display frame, then verify the repository's declared latency ceilings under CPU throttling.

### 2. Visual hierarchy

- The playable object and next decision must dominate. Decorative labels, framing, and lore remain secondary.
- Each table gets one signature visual system, not a common skin with different icons.
- Materials need light direction, edge treatment, wear or grain, contact shadow, and a restrained specular response.
- At phone widths, preserve the playable object before supporting prose. At desktop widths, use negative space to make the table feel staged rather than stretched.

### 3. Intrinsic feedback

- Correct actions receive immediate local feedback at the point of contact.
- Chapter closure receives one deterministic, game-specific curtain bloom and authored line.
- Incorrect choices explain and reset without shame, loss framing, or escalating spectacle.
- Sector Sprint tools, pickups, and complications remain harmless choreography with no inventory or reward economy.

### 4. Character and world

- Sector Sprint keeps Gurpreet and Harjit large enough to read their pose and relationship at normal phone distance.
- Each Act needs a distinct silhouette, atmosphere, foreground material, and lighting grade while remaining recognizably Chandigarh-inspired.
- Cultural direction stays grounded in documented Punjabi and Indian materials and everyday objects. Sacred, nationalistic, festival-collage, and generic exotic cues remain excluded.

### 5. Sound and tactility

- Build a small authored cue family: selection, placement, lane travel, tool, contact, Act close, and curtain call.
- Use locally synthesized or project-owned audio only. Cap voices and stop them on pause, hide, blur, exit, narration, or boundary closure.
- Treat sound as reinforcement, never instruction. Every cue keeps a visible and semantic equivalent.
- Consider native haptics only in a future native surface; do not simulate vibration or make it part of browser completion.

## Per-game art briefs

| Game | Signature | Motion focus | Completion response |
| --- | --- | --- | --- |
| Pattern Court | Hand-set stone and brass inlay | Staggered placement and missing-piece settle | The final inlay warms once, then rests |
| Navakankari | Incised sheesham board with weighted pieces | Piece lift, legal-point halo, firm placement | The closed line receives a restrained brass trace |
| Mirror Forge | Optical instrument in darkened metal | Deliberate ring turn with inertia-free settle | Rings align and hold a single reflected highlight |
| Aadu Puli Aattam | Carved board with distinct goat and tiger weight | Source-to-destination line illumination | The resolved passage is traced once |
| Stack Architect | Turned wood plinths and lacquered discs | Lift, traverse, contact compression, settle | The completed tower receives a vertical light pass |
| Pallanguzhi | Carved wood, deep pits, polished seeds | Seed lift and bounded anti-clockwise sowing path | The final pit gathers a quiet warm reflection |
| Lantern Ledger | Individually shaped lanterns and colored glass | Ordered ignition, cover draw, reveal | The held procession returns in one even glow |
| Sector Sprint | Chandigarh storybook theatre with expressive riders | Interpolated travel, pose blending, lane anticipation, impact hold | Act-local marquee and final House arrival |

## Production phases

### Phase A — Sector Sprint vertical slice

1. Add render-only fixed-step interpolation and expose diagnostic evidence without changing `window.__house` state.
2. Increase rider presence, remove duplicated HUD competition, and strengthen lane-marker readability.
3. Deepen modernist city layers and architectural gate thickness within existing quality tiers.
4. Re-run unit, browser feel, Safari desktop, and phone viewport checks.

**Exit gate:** deterministic routes and collision tests remain unchanged; input latency and frame-pacing ceilings pass; reduced motion still routes to narration; Safari screenshots show a clear rider, lane, and next passage at a glance.

### Phase B — Shared House feedback system

1. Give every table a local press/selection response and a game-specific deterministic chapter bloom.
2. Normalize timing vocabulary: micro response, action response, chapter response, curtain call.
3. Verify keyboard focus, 200% zoom, muted audio, and reduced motion for every table.

**Exit gate:** all eight tables have distinct signatures without new persistent state or new completion conditions.

### Phase C — Bespoke table animation passes

Work one game at a time in behavior-preserving slices. For each table: storyboard the signature action, implement it, test source truth, review phone and desktop captures, then commit that table before starting the next.

Recommended order: Sector Sprint, Stack Architect, Lantern Ledger, Pattern Court, Mirror Forge, Pallanguzhi, Navakankari, Aadu Puli Aattam.

#### Phase C implementation ledger

- **Sector Sprint — vertical-slice implementation and desktop Safari acceptance complete in the current candidate.** Render-only interpolation, richer authored city layers, stronger rider presence, and deterministic local feedback are implemented, and the automated latency/frame ceilings pass. A fresh visible Safari run confirmed the Action stage, lane control, illustrated riders, and one-contact boundary on the exact candidate. Physical iPhone and human feel review remain Phase E evidence gates.
- **Stack Architect — bespoke action pass complete in the current candidate.** The selected top disc lifts from its real plinth, a brass datum arc traces the legal source-to-destination traverse, and the destination disc compresses before settling. The board now reads as a cabinetmaker's rosewood instrument at phone and desktop widths; a fresh visible Safari run confirmed the truthful first-to-second-plinth lift and placement. Saved state, legality, chapter order, completion, keyboard operation, and reduced-motion behavior are unchanged.
- **Lantern Ledger — bespoke action pass complete in the current candidate.** Individually shaped glass lamps now ignite in authored order along a numbered brass ledger rail, resolve into one even-glow reading, and disappear behind a two-panel velvet screen before the answer becomes available. A fresh visible Safari run confirmed the procession, velvet cover, and answer gating. Visible sequence truth, reveal, reload/restore, chapter order, keyboard operation, and reduced-motion completion are unchanged. Automated phone, tablet, desktop, full-House, and PWA gates pass; physical-phone Safari acceptance remains a Phase E evidence gate.
- **Next slice: Pattern Court.** Storyboard hand-set inlay placement, missing-piece settle, and the single final warmth response before implementation; preserve its fixed authored pattern, answer truth, chapter order, and reduced-motion path.

### Phase D — Audio direction

Create a compact cue sheet and loudness budget, then implement optional cues table by table. Test denial, mute, rapid input, pause, backgrounding, and audio-context recovery independently.

### Phase E — Physical-device and human review

- Test the declared iPhone floor in Safari for sustained Sector Sprint play, touch latency, thermal behavior, text size, and orientation changes.
- Run representative adult play sessions for clarity and enjoyment. Do not infer enjoyment from automated completion.
- Obtain Punjabi cultural review before making stronger authenticity claims.
- Run screen-reader and switch-control review on actual target devices.

## Performance and evidence budgets

- Preserve the `960 × 432` Sector Sprint logical stage, DPR cap of 2, bounded particles/projectiles/voices, and adaptive high/balanced/quiet tiers.
- Keep the existing runner acceptance ceilings: lane move-to-render below 150 ms, throttled-phone p95 frame interval at or below 50 ms, and desktop p95 at or below 25 ms.
- Treat those ceilings as regression floors, not the final feel target. Physical-device review should aim for visually even pacing with no repeated long-frame clusters.
- Capture phone and desktop surfaces for every game at 320, 375, 414, 768, and 1440 CSS pixels; inspect descendant overflow, focus, console output, and same-origin requests.
- Verify the standalone Night HTML and the House PWA independently.

## Studio operating model

The work needs these capabilities even if one person performs several roles sequentially:

- Art direction and visual development
- 2D character animation and motion design
- Technical art and Canvas performance engineering
- Interaction/gameplay engineering
- Sound design and audio implementation
- Accessibility QA
- Cultural review
- Physical-device performance QA

Maintain an art bible, motion timing sheet, cue sheet, performance ledger, and capture board. A change is complete only when source tests, rendered evidence, and product-contract review agree.

## Full-roadmap definition of done

- The next action is readable in under one glance without relying on color alone.
- Input has immediate visible acknowledgment and motion settles cleanly.
- Each game's screenshot is recognizable without its title.
- Effects reinforce cause and effect but never obscure controls or create an extrinsic reward loop.
- Reduced motion, keyboard, screen reader, mute, offline, and boundary behavior remain complete.
- Before the full roadmap is called studio-ready, fresh Safari phone/desktop evidence and automated gates pass from the exact candidate tree. Candidate slices may leave the physical-phone portion explicitly in Phase E.
