# Chandigarh playground acceptance

The current Sector Sprint is defined by ADR 0021, replacing the lane route. `npm run test:runner-feel` retains its historical command name but now tests the actual exploration game.

## Required evidence

- No-input stability; release stops walking; pointer cancellation and blur clear controls and destinations.
- Every landmark is connected by the authored navigation mesh. Buildings, beds and water remain solid. Tap travel finds a legal route.
- Jump elevation, spring-pad bounce, power-up jump height/airtime/dash reach, obstacle bumps and airborne ribbon collection have meaningful unit checks.
- Browser traversal earns all three course props through real movement and jump input, meets Harjit and returns home. No test hook teleports the player or grants props.
- Narrated route and guided help can complete the same story without precision or visual interpretation. Pause keeps narrated choices available.
- Early home, boundary closure and reload do not create a false completion. New provenance is 2.0.0; legacy 1.0.0 remains readable.
- Desktop 1440×900 and phones 375×812 and 320×568 render without horizontal overflow. Action targets remain at least 44×44 CSS pixels.
- Three active 120-frame samples per viewport under 4× CPU throttling have a median sampled p95 budget below 35 ms. All raw intervals, individual sample p95 values and the worst sample are retained; the median reduces single-run host contention noise without discarding outliers. DPR is capped at 1.75, reducing to 1 if sustained slow frames warrant it. Frame rates and visual quality remain device dependent.
- Both original environment and character art decode from the first offline House cache. All runtime requests stay same-origin and static. Standalone Night HTML and the Night PWA remain independent regression journeys.

Generated evidence stays in ignored `artifacts/chandigarh-redesign/`. Headless browser evidence does not prove physical Mobile Safari performance, thermal behavior, VoiceOver usability, cultural reception or subjective fun. The tool could not capture native Safari during this redesign; do not label other engines as Safari acceptance.
