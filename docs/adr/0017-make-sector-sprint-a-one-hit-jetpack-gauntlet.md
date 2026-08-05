# Make Sector Sprint a one-hit jetpack gauntlet

> Superseded on 2026-08-05 by [ADR 0018](./0018-replace-sector-sprint-altitude-control-with-progressive-lanes.md). This file remains the historical record of the short-lived continuous-altitude design.

Sector Sprint keeps its fixed five authored Acts but changes the Action route from optional movement theatre into a deterministic one-hit jetpack gauntlet. The lead begins with a 900 ms ignition hover, then flies under constant gravity. Holding the stage or Pulse control applies bounded upward thrust; release preserves inertia and lets gravity pull the lead down. The simulation remains fixed at 60 Hz. Vertical speed is capped in both directions, and the same authored geometry is used at every render-quality tier.

Each Act contains a fixed set of paired architectural faces. Passage count rises from eight to twelve, gap height tightens from 132 to 116 logical pixels, and cadence tightens from about 3.0 to 2.2 seconds. The forgiving `34 × 48` logical collision hull remains inset inside the illustrated lead. Swept collision checks the whole movement segment so a delayed frame cannot tunnel through a face. The earliest contact wins, with stable obstacle identifiers breaking exact ties. Road, ceiling, and the lit inner faces are the only lethal geometry; comic targets, tools, pickups, and complications are harmless choreography.

One lethal contact creates an idempotent in-memory Action failure. It records one neutral reason, releases held input and optional audio, empties active tool objects, freezes Act/world/action time, and cannot create an Act completion or Gallery record. The presentation is a brief jetpack sputter and held curtain, not injury or death. There is no health, life count, checkpoint, score, timer, failure history, randomized retry, reward, or persisted failure state.

The recovery surface offers three semantic choices. A full Action retry begins at Act I inside the same table and run identifier and never resets the 240-second foreground boundary. Retry eligibility is recomputed when activated and requires the five nominal Act durations, all five authored transitions, the engine's full two-second catch-up allowance for every Act, and one additional millisecond of rounding tolerance. If too little foreground time remains, the retry is disabled with calm non-timer copy. Narrated play may continue from the current Act while the same boundary remains; the copy states that the boundary may close before its final curtain. The Grand Salon exit records nothing. Idle recovery and Act-transition time consume the foreground boundary, while pause, hide, blur, and exit confirmation continue to suspend it. The 240-second closure is checked before Action physics and remains armed through transitions, so it outranks collision, recovery input, or final completion at the boundary.

Architectural faces share an unmistakable illuminated edge and notch silhouette across sandstone, market timber, hammered brass, wet terrazzo, and phulkari-inlay treatments. Texture density adapts without altering geometry. The project-owned Gurpreet and Harjit sheet is drawn at a scale aligned with the collision hull, with bounded velocity pitch, pose blending, restrained squash/stretch, scarf or bag lag, and a visible jetpack plume. Duo Acts place both riders in one compact family-craft formation around the same forgiving collision hull instead of drawing a second exposed rider outside it. Reduced motion removes pitch, lag, drift, and nonessential effects; the complete narrated route remains available without motion, precision, sight, or sound.

This decision deliberately supersedes the following narrower clauses:

| Earlier source | Superseded clause | Replacement |
| --- | --- | --- |
| ADR 0015 | Action input is optional and cannot affect success | Action flight requires clearing deterministic geometry; Narrated remains the complete no-precision route |
| ADR 0015 | Player collisions are presentation-only and Phulkari Guard absorbs one | Only architectural faces, road, and ceiling end Action once; comic objects never collide with the player |
| ADR 0015 | Sector Sprint has no failure loop | One bounded, non-persistent Action wipeout and recovery choice exists; there are still no lives, health, scores, checkpoints, rewards, or endless retries |
| ADR 0016 | Held thrust is absorbed by a safe ceiling and input changes choreography only | Ceiling contact is lethal; pulse timing controls Action traversal |
| ADR 0016 | This decision adds no failure | The idempotent Action failure defined here is allowed |
| `CONTEXT.md` and prior UI/tests | No input completes Action and every action is optional | No input and continuous hold both wipe Action; Narrated preserves no-precision completion |

Everything else in ADR 0015 and ADR 0016 remains in force: five fixed 32-second Acts, the 240-second foreground-only table boundary, deterministic authored order, original nonhuman target allowlist, local static runtime, zero telemetry, compact active storage, reload fail-closed behavior, bounded Canvas/audio budgets, same-origin requests, and the Night Room Two-Loop Law.

Automated controller traces establish deterministic passability and 100 ms decision-phase tolerance; they do not establish human difficulty equivalent to another game. Shipped copy therefore describes a tight one-hit jetpack gauntlet, not “Flappy Bird-hard” or universally realistic. Comparative difficulty requires a declared matched human benchmark and representative play evidence.
