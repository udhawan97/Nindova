# Sector Sprint one-hit jetpack checkpoint

## Authored corridor matrix

All passage geometry is deterministic and shares the same logical `960 × 432` stage. The collision hull is `34 × 48` logical pixels and remains inset inside the illustrated lead. The opening face begins at world x 620, leaving more than 1.8 seconds of visible reaction after the 900 ms ignition hover. Pause, hide, and blur suspend the foreground-only table boundary.

| Act | Passages | Gap | Approximate cadence | Architectural material | Lead |
| --- | ---: | ---: | ---: | --- | --- |
| Ghar Wapsi | 8 | 132 px · 2.75× hull height | 3.0 s | Carved sandstone | Gurpreet |
| Sabzi Command | 9 | 128 px · 2.67× | 2.8 s | Market timber | Harjit |
| Baraat Detour | 10 | 124 px · 2.58× | 2.6 s | Hammered brass | Gurpreet and Harjit |
| Monsoon Protocol | 11 | 120 px · 2.50× | 2.4 s | Wet terrazzo | Gurpreet and Harjit |
| Roti Relay | 12 | 116 px · 2.42× | 2.2 s | Phulkari inlay | Gurpreet and Harjit |

Only the road, ceiling, and paired architectural faces are lethal. Targets, tools, pickups, and complications remain harmless and have a different silhouette. One contact creates one terminal in-memory Action state; it cannot retrigger, advance the Act, persist, or record a completion.

Before ADR 0017, Action had no lethal clearance or passage cadence: no input completed every Act and contact tolerance was effectively unbounded. The new measurable envelope is 2.75× to 2.42× hull-height clearance, 3.0 to 2.2 seconds between passage decisions, bounded `-560/+760 px/s` vertical speed, and six passing 100 ms controller phases. This comparison establishes tighter authored flight, not human-equivalent difficulty to another game.

## Verified gates

- `node --test tests/unit/sector-sprint.test.mjs` proves one-hit idempotence, swept collision, harmless comic targets, deterministic passage inventory, gap and cadence tightening, gravity/thrust caps, opening reaction window, no-input and continuous-hold wipeouts, compact duo formation, retry duration with five full two-second catch-up reserves, and bounded rendering/tool budgets.
- The unit controller evaluates input every 100 ms, clears all five Acts, and still clears with each of six decision-phase offsets. This is a deterministic passability and tolerance gate, not representative human difficulty evidence.
- `npm run test:house` verifies the semantic recovery surface, first-focus behavior, touch targets, pointer cancellation, keyboard thrust, one status message, retry without a new run identifier, atomic late-retry rejection, optional-audio suspension, 200% reflow, 320/375/414/desktop presentation, rise/fall/impact captures, all five rendered materials, foreground-only recovery and transition timing, final-Act boundary priority, reload fail-closed behavior, narrated completion, compact storage, same-origin requests, and cold offline House navigation.
- `npm run test:runner-feel` drives the actual corridor with a deterministic pulse controller under 4× CPU throttling, measures six pulse-to-render samples, and samples 120 dense-corridor frame intervals at 375×812 and 1440×900. Pulse p95 must remain below 150 ms, throttled-phone frame p95 at or below 50 ms, and desktop frame p95 at or below 25 ms.
- The latest 2026-08-05 complete test-matrix rerun measured pulse-to-render p95 at 21.4 ms, throttled-phone frame p95 at 34.9 ms, and desktop frame p95 at 16.8 ms. All three clear the declared ceilings.
- `npm run test:pwa` independently verifies the composed PWA path and offline cache behavior. The standalone House and composed PWA are not treated as the same surface.

## Recovery and privacy contract

- The 240-second boundary outranks collision or recovery input in the same frame.
- Recovery idle time and retry time consume the existing foreground budget. Hiding, blurring, or pausing suspends it.
- A full Act-I retry is enabled only while five Act durations, five transition delays, five full two-second catch-up allowances, and one millisecond of rounding tolerance remain. Eligibility is recomputed at activation, and the browser gate crosses that threshold before attempting a stale retry.
- Narrated play continues from the current Act while the same boundary remains; copy states that the boundary may close before the curtain.
- Failure reason, obstacle, elapsed time, input history, performance samples, and retry state are never written to local or session storage. Reload closes an active Sector Sprint without completion.
- Runtime requests remain same-origin and static. There is no telemetry or human playtest logging in the shipped product.

## Evidence boundary

The automated and rendered checks establish deterministic passability, technical responsiveness, fixed difficulty geometry, one-hit behavior, bounded recovery, layouts, and closure behavior in Chromium. They do not establish difficulty equivalent to Flappy Bird, universally realistic character motion, native Mobile Safari frame pacing, physical-device thermal behavior, real-device assistive-technology meaning, cultural authenticity, or representative adult enjoyment. Those claims require a declared comparative protocol and representative human evidence.
