# Rebuild Sector Sprint as a Chandigarh playground

Status: Accepted for v0.6.0 by the owner's explicit complete-redesign, exploration, power-up, integration and release request on 2026-09-10. Supersedes the Sector Sprint gameplay, timing and fixed-order clauses of ADRs 0015–0018 and 0020. Other House games and the Night Room contract remain unchanged.

## Concept review before planning

The previous runner offered little agency and its panels dominated the city. A two-round concept review compared a connected miniature city, a cycling route and illustrated postcards. The connected city was selected for deliberate movement, revisitable places and a meaningful homecoming. The owner then rejected a conversation-heavy implementation and asked for Mario-like power-ups and exploration. The final direction retains the original Chandigarh setting and adds actual jump/dash traversal, spring pads, moving obstacles, airborne ribbons and three small courses. It uses no Mario or Pokémon characters, assets, names in the product, or copied levels.

## Final behavior

- One connected, original painted Chandigarh world. Arrow/WASD movement stops on release; tap-to-walk uses a bounded authored navigation mesh. Space/J jumps, Shift/K dashes; all have touch controls. Elevation affects obstacle and ribbon interactions, with a grounded shadow showing landing position.
- Spring juttis increase jump height, the monsoon scarf extends dashes, and a paper-wing pin extends airtime. These deterministic, reusable power-ups affect this session only. No random reward or retained collection.
- Market ribbons, garden petals and courtyard chimes can be explored in any order. Finishing each small traversal course puts an ordinary errand prop in the bag. Bumps preserve progress. Optional guided help provides the same prop without requiring precision.
- Meet Harjit by Sukhna after the three errands; she joins the walk home. Returning home completes the fifth encounter. An early homecoming remains available and records no full completion.
- A text-led route delivers the same encounters, errand objects and ending without visual interpretation, motion, precision or sound. Reduced motion enters that route; changing the preference switches an active exploration to it.
- Ten foreground-active minutes replace the runner's 240 seconds. Pause, hidden tabs, window blur and an exit confirmation suspend the clock, movement and sound. Boundary enforcement precedes interaction completion. Reload closes the journey without resuming a clock or claiming completion. Paused narration remains operable.
- Game provenance becomes `2.0.0`. Existing `1.0.0` results remain readable and accurately labeled; only a completed new journey replaces the previous result. Position, ribbons, power-ups, bag, choices and timings remain in memory.

## Ownership and performance

`sector-sprint.ts` is the pure world/navigation/action engine, `sector-sprint-world.ts` draws the scene, and `sector-sprint-table.ts` retains the five-operation House protocol. The old lane engine is replaced, not loaded beside the new game. `window.__ct` is unchanged; `window.__house.runner` exposes `mechanicsVersion: 2` with the new snapshot for browser evidence.

The original 1536×1024 world is a local WebP, precached for the first offline walk. Canvas draws only the view, bounded people/particles and interactive objects. DPR is capped at 1.75 and can reduce to 1 on sustained slow frames. Navigation runs only on destination input, never each frame. No new runtime dependency, network service or telemetry is added.

Setting facts and fictional interpretations are separated in [the research brief](../research/chandigarh-homecoming.md). This is a compressed fictional map, not accurate geography or navigation. Visual quality and fun are design goals; no AAA production or local-player approval is claimed. Automated frame and interaction evidence cannot establish real-device or subjective enjoyment parity.
