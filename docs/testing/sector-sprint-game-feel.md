# Sector Sprint progressive-lane checkpoint

## Authored lane matrix

All gate geometry is deterministic and shares the same logical `960 × 432` stage. The collision hull is `34 × 48` logical pixels and remains inset inside the illustrated lead. Action begins in the middle of three travel lanes. The first gate in every Act holds that lane; every later safe lane is at most one adjacent move away. Pause, hide, and blur suspend the foreground-only table boundary.

| Act | Gates | Gap | Warning | Speed | Move time | Architectural material |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Ghar Wapsi | 5 | 104 px | 1.8 s | 94→104 px/s | 260 ms | Carved sandstone |
| Sabzi Command | 6 | 100 px | 1.6 s | 104→116 px/s | 240 ms | Market timber |
| Baraat Detour | 7 | 96 px | 1.4 s | 116→130 px/s | 220 ms | Hammered brass |
| Monsoon Protocol | 8 | 92 px | 1.15 s | 130→146 px/s | 200 ms | Wet terrazzo |
| Roti Relay | 9 | 88 px | 0.95 s | 146→164 px/s | 180 ms | Phulkari inlay |

Speed rises continuously within every Act and the next Act begins exactly where the previous Act ends. Gate positions come from authored contact times through the same speed integral used by runtime movement, so every Act remains exactly 32 seconds. Each Act leaves at least three seconds after its final gate.

Only a lit architectural face ends interactive Action. Targets, tools, pickups, complications, the road, and the upper scene edge remain harmless presentation. One contact creates one terminal in-memory Action state; it cannot retrigger, advance the Act, persist, or record a completion.

## Verified gates

- `node --test tests/unit/sector-sprint.test.mjs` proves adjacent authored routes, speed continuity, exact four-to-eight-input deterministic completion, 300 ms general warning delay tolerance, an Act V move near the latest valid warning point, fresh-input lane semantics, single buffered-request consumption, settlement state, no-input Action contact, one-hit idempotence, swept collision at maximum speed, compact duo formation, retry duration with five full two-second catch-up reserves, and bounded rendering/tool budgets.
- The unit controller clears all five Acts with four-to-eight lane inputs depending on the authored safe-lane sequence. This establishes a sharp reduction from the superseded continuous-input controller, not representative human difficulty evidence.
- `npm run test:house` verifies native Move up/Move down controls, ignored held/repeated letter and Enter input, pre-frame pointer cancellation and orientation clearing, non-color-only warning text, semantic recovery and focus, retry without a new run identifier, atomic late-retry rejection, optional-audio suspension, 200% reflow, phone/desktop presentation, lane-up/lane-down/impact captures, all five rendered materials, a real Action-route pilot through all five Acts and its curtain call, foreground-only recovery and transition timing, final-Act boundary priority, reload fail-closed behavior, narrated completion, compact storage, same-origin requests, and cold offline House navigation.
- `npm run test:runner-feel` drives the actual lane route under 4× CPU throttling, records the maximum of three observed lane-move-to-render samples, and calculates p95 across 120 sustained frame intervals at 375×812 and 1440×900. The three-sample lane maximum must remain below 150 ms, throttled-phone frame p95 at or below 50 ms, and desktop frame p95 at or below 25 ms.
- Observed timings are emitted in each test log but are not treated as stable repository facts because host scheduling changes them between runs. Acceptance depends on the declared ceilings and sample scopes above.
- `npm run test:pwa` independently verifies the composed PWA path and offline cache behavior. The House build and the standalone Night HTML are not treated as the same surface.

## Recovery and privacy contract

- The 240-second boundary outranks collision or recovery input in the same frame.
- Recovery idle time and retry time consume the existing foreground budget. Hiding, blurring, or pausing suspends it.
- A full Act-I retry is enabled only while five Act durations, five transition delays, five full two-second catch-up allowances, and one millisecond of rounding tolerance remain. Eligibility is recomputed at activation, and the browser gate crosses that threshold before attempting a stale retry.
- Narrated play continues from the current Act while the same boundary remains; copy states that the boundary may close before the curtain.
- Failure reason, obstacle, elapsed time, lane input history, performance samples, and retry state are never written to local or session storage. Reload closes an active Sector Sprint without completion.
- Runtime requests remain same-origin and static. There is no telemetry or human playtest logging in the shipped product.

## Evidence boundary

The automated and rendered checks establish deterministic passability, technical responsiveness, progressive speed, low input count, one-contact behavior, bounded recovery, layouts, and closure behavior in Chromium. They do not establish universally balanced difficulty, equivalence to another game, universally realistic character motion, native Mobile Safari frame pacing, physical-device thermal behavior, real-device assistive-technology meaning, cultural authenticity, or representative adult enjoyment. Those claims require a declared comparative protocol and representative human evidence.
