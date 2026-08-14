# Deepen House boundaries and browser evidence

> **Status:** Accepted for v0.4.3. This decision changes module ownership, not product behavior, storage schemas, authored content, or the House/Night boundary.

The House had four shallow coordination seams: route changes were spread across History, hash, exit-dialog, scroll, and focus functions; the Grand Salon shell directly mutated table-kind state; Sector Sprint exposed a wide operation surface to the shell; and browser journeys repeated preview, Chromium, failure-capture, and teardown infrastructure.

Nindova deepens those seams behind four local modules:

1. `house-navigation.ts` owns a complete destination transaction: route parsing and writing, History depth, requested and cancelled exit destinations, consent, game teardown, scroll restoration, and focus return.
2. `salon-table-lifecycle.ts` owns opening, restore, meaningful-progress policy, kind-specific interaction, chapter advance, focus policy, runner synchronization, and active-table persistence.
3. `sector-sprint-table.ts` owns the production browser protocol around the pure Sector Sprint engine. The House consumes only `start`, `view`, `afterRender`, `setExitSuspended`, and `close`.
4. `tests/browser/evidence-harness.mjs` owns local preview startup, Chromium launch, contexts, capability adapters, console/page failure capture, request capture, and fail-clean teardown that attempts every owned resource. Journey files retain only product setup and assertions.

These interfaces are deliberately local. They do not introduce a framework, dependency, service, shared global event bus, generalized router, or test mock server. The House shell still composes markup and presentation. The state store and codecs remain separate authorities for schema validation and browser storage.

## Preserved product constraints

- House route fragments, browser Back/Forward behavior, explicit unfinished-table consent, cancelled-destination scroll, and deterministic focus return remain intact.
- All eight Salon tables keep the same authored order, answers, restore behavior, completion provenance, and one-result-per-game Gallery policy.
- Sector Sprint keeps its five ordered Acts, three lanes, progressively faster fixed route, complete narrated route, foreground-only 240-second boundary, and boundary precedence over completion or recovery.
- Pause, page hide, window blur, and explicit exit suspend movement, transition time, and optional sound. Reload still fails closed with no completion.
- Sector Sprint timing, failure, input, and coordinates remain unpersisted. Sound, sight, animation, and precision movement remain optional; reduced motion begins on the complete narrated route.
- Browser evidence still exercises the actual static product. Capability adapters may substitute unavailable browser capabilities but may not fulfill routes, invent server responses, suppress product errors, or mock away product behavior.
- The standalone Night HTML and installable PWA remain independent journeys. Same-origin static request capture and zero-app-telemetry assertions remain explicit.

## Evidence boundary

Architecture assertions prevent the House shell from reacquiring lifecycle and navigation internals and prevent journey files from reacquiring browser infrastructure. Direct unit coverage exercises the cancelled-exit transaction. The full rendered House and browser matrix remains the behavioral authority.

Automation cannot prove that a module boundary is permanently optimal. Future changes may reshape an interface when current source evidence shows a deeper one, but must preserve the product constraints above and update this decision or supersede it explicitly.
