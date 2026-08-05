# Sector Sprint cinematic game-feel checkpoint

## Authored encounter matrix

Every encounter is deterministic. Times are derived from fixed world positions on the 32-second Act path; pause, hide, and blur suspend the shared foreground clock. Temporary effects reset at each Act boundary and never enter local or session storage.

| Act | Authored encounter window | Movement showcase | Act-local tool and allowlisted target | Temporary-effect gate | Transformation and collision presentation | Narrated equivalent |
| --- | --- | --- | --- | --- | --- | --- |
| Ghar Wapsi | x 760–3420 · 6.0–26.8 s | Variable leap, air step, street dash, low vault | Phone Pulse · missed calls, lists, puddles | Phulkari Guard · x 1665 · 13.1 s | A focused reply flare resolves phone noise; Guard folds one collision into the road pattern; otherwise one cosmetic stumble | Lamps, movement line, Phone Pulse, Guard, and gate arrival are stated across three city beats |
| Sabzi Command | x 690–3290 · 5.4–25.8 s | Low vault and close dash | Bargain Burst · price tags, produce baskets, lists | Chaa Overdrive · x 1610 · 12.6 s | A widening cone settles a group; Overdrive adds a third lane and piercing transformation; collision is one cosmetic recoil | Mandi entry, wide bargain action, and exact-change exit are stated |
| Baraat Detour | x 720–3390 · 5.6–26.6 s | Air step above ribbon and aerial stomp | Dhaaga Arc · streamers, route bubbles | Monsoon Lift · x 1705 · 13.4 s | A piercing returning arc opens only loose abstractions and passes harmlessly around the celebration | Layered streamers, side lane, Lift, and no-contact passage are stated |
| Monsoon Protocol | x 650–3340 · 5.1–26.2 s | Lifted air line and stomp landing | Umbrella Wave · puddles, lists, route bubbles | Phulkari Guard · x 2315 · 18.2 s | A rising arc transforms rain interference and can lift trajectory; collision/Guard behavior remains presentation-only | Lit rain sheets, wave transformations, and dry-side arrival are stated |
| Roti Relay | x 690–3360 · 5.4–26.4 s | Duo dash and final three-lane action | Ghar Flare · all seven allowlisted inanimate kinds | Chaa Overdrive · x 1805 · 14.2 s | Three coordinated lanes become five under Overdrive; Gurpreet and Harjit are the source of the action and can never be targets | Mixed reminders, mother/son choreography, and the final pool of lamplight are stated |

## Verified gates

- `node --test tests/unit/sector-sprint.test.mjs` proves four distinct movement expressions plus contextual vault, five distinct tool grammars, three deterministic temporary effects, allowlisted target classes, presentation-only collisions, exact 32-second closure, and explicit effect budgets.
- `npm run test:house` completes the five-Act action and narrated routes, inspects every Act at 375×812, verifies 320px and desktop layouts, touch targets, keyboard controls, pause/blur/hidden suspension, the 240-second boundary, compact active storage, reduced motion, audio closure, same-origin requests, and cold offline House navigation.
- `npm run test:runner-feel` measures six samples each for Leap, Dash, and Tool from the input event to the first Canvas frame tagged with that action at 375×812 under 4× CPU throttling. It also measures 120 sustained frame intervals under that profile and at 1440×900. The gate requires action p95 below 150 ms, throttled frame p95 at or below 50 ms, and desktop frame p95 at or below 25 ms.

## Evidence boundary

The automated and rendered checks establish deterministic mechanics, technical responsiveness, bounded effects, layouts, and closure behavior in Chromium. They do not establish equivalent native Mobile Safari frame pacing, real-device assistive-technology meaning, cultural authenticity, an AAA production label, or representative adult enjoyment.
