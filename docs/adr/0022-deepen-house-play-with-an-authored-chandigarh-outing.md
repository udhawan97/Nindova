# Deepen House play with an authored Chandigarh outing

Status: Accepted for v0.7.0 by the owner's explicit request on 2026-09-26 to implement the council-reviewed gameplay redesign, push it, and create a release.

## Decision

The first redesign release replaces Pattern Court's answer-selection chapters with five construction puzzles and turns Sector Sprint's existing Chandigarh playground into **Chandigarh: The Long Way Home**, a more directed five-encounter outing from Sector 22 to Sector 17.

This is the first delivery checkpoint from `GAMEPLAY-REDESIGN-2026-09-26.md`, not a claim that every planned table or district has been rebuilt. The remaining game briefs stay roadmap work.

## Shared teaching contract

Every Salon table shows a concrete goal, a short way to begin, and reopenable help beside the playable surface. Invalid actions explain the relevant rule. Help never spends a resource, changes a Gallery result, or requires sound, motion, sight, or precision.

Pattern Court now asks the player to place, swap, undo, and reset hand-set inlay pieces. Its five authored boards add one constraint at a time. A deterministic assist places one correct piece and remains available without penalty. Completion still requires all five authored chapters and stores only the existing narrow latest-completion fact.

## Chandigarh outing

The public title becomes **Chandigarh: The Long Way Home** while the stable internal `sector-sprint` ID remains for routes and old results.

The outing keeps the existing ten foreground-minute boundary, fail-closed reload, pause/hidden/blur suspension, same-origin static runtime, and in-memory action state. Its five encounters are:

1. leave the Sector 22 verandah and learn movement;
2. choose the shaded street or raised sign route;
3. resolve a fictional wind-up courtyard toy through a telegraphed scarf deflection or an assisted bypass;
4. align a sector wayfinder and enter the Sector 17 plaza;
5. return the repaired paper display and close the outing.

The city overview separates sourced place facts from invented adventure mechanics. It is an orientation diagram, not navigation. No real person, institution, monument, community, police officer, or religious figure is an enemy.

Reduced motion begins on the complete text-led route. Changing to reduced motion during an active action route switches to that route with the current encounter progress, choices, and remaining foreground budget intact. The narrated path makes the same route and encounter decisions without movement, timing, sound, visual interpretation, or precision input.

## Boundaries

- The five-part House completion contract, latest-result-only Gallery, local state, and zero telemetry remain unchanged.
- There are no scores, health bars, lives, currencies, unlocks, random rewards, achievements, streaks, or visible countdowns.
- A mistake returns to the current safe encounter state and removes no completed progress.
- The Night Room, its two immutable lines, Two-Loop Law, fifteen-minute cap, Rasoi profiles, Dawn, and deferred iOS Wall are unchanged.
- This decision does not add opponent simulation to the classic studies and does not supersede ADR 0019's classic-game restriction.
- Automated completion, screenshots, and timing checks do not establish human enjoyment, learning, geographical fidelity, cultural reception, or physical-device accessibility.

## Architecture and migration

`pattern-court.ts` owns Pattern Court's pure puzzle state and rules. `salon-table-lifecycle.ts` owns its chapter lifecycle and persistence, and `house.ts` renders its semantic board.

The Chandigarh pure state remains in `sector-sprint.ts`; its browser protocol remains in `sector-sprint-table.ts`; `sector-sprint-world.ts` remains render-only. Versioned result validation accepts historical game versions, while new completions record the new version. Incompatible active Pattern Court state restarts that chapter safely. Chandigarh action coordinates and foreground time remain intentionally non-restorable.

The existing Graphify graph must be refreshed before the tag. Standalone Night HTML and composed PWA/House builds remain independent release gates.
