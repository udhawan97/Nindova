# Layered Rasoi plan

**Status:** Approved implementation plan for the next Nindova candidate.

## Outcome

Replace the three flat racks with **Masala Mound**, a 36-tile, three-layer pair-removal board. The board should ask for visual search and spatial planning while preserving Nindova's promise that a legal choice cannot produce failure. Add one authored match response that feels clear and satisfying, then hand the person toward rest. Make another same-night Session possible only through a deliberate return to the intake.

Nindova remains a bounded wind-down game, not a treatment or a performance tool. The evidence review in [bedtime-game-evidence.md](./research/bedtime-game-evidence.md) does not support claims that this exact game makes people sleepy, improves sleep, improves general memory, or produces a beneficial dopamine response.

## Experience sequence

1. **Enter:** voluntarily begin or choose “Not now.” Either path can return to intake later that night.
2. **Read the mound:** a Tile is free when no active Tile overlaps it from a higher layer and its left or right side is open.
3. **Pair:** select two matching free Tiles. Covered and side-blocked Tiles remain visible but quiet.
4. **Brass bloom:** the matched pair moves slightly inward and compresses into one dim brass ring before settling. The response is deterministic, local, brief, and optional through reduced motion and sound controls.
5. **Close:** completion or the production cap reaches the same end card. “Dim and rest” is primary. “Back to Nindova” is secondary.
6. **Return deliberately:** the intake can start another identical board for the same Night ID. Each start is a new bounded Session; the end card never promotes “one more.”

## Board contract

### Geometry

- Base: 24 Tiles in four rows of six.
- Middle: 8 Tiles in two offset rows of four.
- Top: 4 Tiles in one offset row.
- Coordinates use a half-Tile grid so overlaps are data, not a visual approximation.
- Layer and coordinate data belong to the shared Rasoi kernel and are exposed through the existing `window.__ct` debug contract.

### Availability

A remaining Tile is free only when:

- no remaining Tile on a higher layer overlaps its footprint; and
- at least one same-layer horizontal side is open.

The same function drives rendering, semantic descriptions, pointer and keyboard input, Help, active-session validation, and exhaustive verification.

### Solvability

The authored motif kernel is mapped through the nightly deterministic motif order. Exhaustive search must prove:

- 36 Tiles and nine motifs appearing four times each;
- 28 initially covered or side-blocked Tiles, 6 free Tiles, and 3 legal pairs;
- exactly 382 reachable states;
- one terminal state and zero dead states; and
- every legal choice from every reachable state retains a path to closure.

Nightly variety may remap motifs but cannot change geometry, effort, path count, duration, or outcome.

## Feedback contract

The **brass bloom** is the only emphatic moment. It is a 360–440 ms inward settle with a small, dim ring at the pair midpoint and the existing soft two-note sound when sound is enabled. It must not flash the screen, shake the board, scatter particles, randomize an effect, award a token, or display performance language.

Reduced motion uses a short opacity change with no translation or scale. Engine state changes synchronously so the visual response cannot delay input validation, session closure, persistence, or `window.__ct` evidence.

## Rest and replay contract

The end card keeps the immutable first line: “The session is over. That's the point.” Its primary action opens a nearly dark, optional screen-away handoff: put the phone down, close the eyes, picture one ordinary kitchen object, and let it go. This is an unvalidated product hypothesis, not CBT-I or a sleep treatment.

The secondary “Back to Nindova” action returns to intake. Intake may start another Session. There is no Replay button, board counter, escalating variation, reward, missed-night language, or pressure to continue. Same-night Sessions remain deterministic and idempotent for Dawn.

## Visual system

### Tokens

- Soot: `#09080d` — page and rest background.
- Midnight indigo: `#171b38` — board field.
- Aged brass: `#c99745` — focus, bloom, and selected detail.
- Atta ivory: `#e7d6b8` — Tile face and primary text.
- Madder: `#78363a` — restrained textile accent.
- Steel blue: `#7894a4` — selected kitchen-form accents.

Display type remains a quiet locally available old-style serif; interface text stays in the system sans family. Punjabi and Indian character comes from specific kitchen forms, brass, steel, wood, indigo, and restrained phulkari-inspired geometry—not novelty typography or sacred imagery.

### Phone wireframe

```text
Nindova                         sound off

              Masala Mound
       Match equal Tiles that are free.

       [base mound fills the width]
          [middle overlap]
             [top]

              quiet status
             [Find a pair]
```

### Desktop wireframe

```text
Nindova                                                   sound off

                         Masala Mound
               Match equal Tiles that are free.

          +---------------------------------------+
          |       centered three-layer mound      |
          |       quiet textile field around it   |
          +---------------------------------------+
                         quiet status
                         [Find a pair]
```

### Self-critique

- The layer structure must read without relying on drop shadows alone; overlap, vertical offset, z-order, brightness, and semantic state all need to agree.
- The bloom can become stimulating if it is large or bright. Keep it inside the board, below full Tile luminance, and uniform for every pair.
- A dark palette does not make the screen biologically safe. Documentation must still encourage low device brightness and the screen-away ending without making blue-light claims.
- “More play” can undermine stopping. Support it through a neutral return to intake, not a promoted continuation action.

## Open access

- License source and documentation under Apache License 2.0.
- Keep the built Session static, same-origin, account-free, ad-free, and telemetry-free.
- Add a direct, non-tracking QR route only for the canonical HTTPS `/play/` URL, with the URL printed beside the code.
- Keep local development and the standalone HTML fully usable when no public Pages deployment is enabled.

## Acceptance gates

- Unit tests prove geometry, availability reasons, determinism, migration, reachability, and zero dead states.
- Browser tests prove overlap/z-order, keyboard access, semantic descriptions, synchronous match state, visible brass bloom, reduced-motion fallback, rest handoff, return to intake, same-night voluntary replay, and cap preservation.
- Rendered checks cover 320×568, 375×667, 375×812, and 1440px desktop without horizontal scroll or hidden actions.
- Standalone HTML and composed PWA pass independently, including offline and same-origin request checks.
- One production wall-clock Session closes within fifteen minutes.
- Graphify is refreshed and queried before publication.
- A two-round, four-reviewer council finds no unresolved blockers before the result is handed off.

## Explicitly out

Scores, streaks, levels, visible timers, countdowns, collections, randomized rewards, screen shake, confetti, sleep grades, memory grades, claims of dopamine release, claims of improved sleep or general memory, clinical positioning, notifications, accounts, analytics, ads, and the deferred iOS Wall.
