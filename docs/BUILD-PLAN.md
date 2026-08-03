# Nindova Build Plan

**Status:** Historical browser-first baseline, completed. The experience-specific arc is superseded by [ADR 0010](./adr/0010-replace-the-vista-arc-with-rasoi-pairs.md) and the [Rasoi Pairs redesign plan](./REDESIGN-PLAN.md). The immutable language, privacy boundary, accessibility floor, Two-Loop Law, and fifteen-minute maximum remain active.

## Delivery boundary

This build ships the browser, installable PWA, public website, documentation, and local return system. The iOS Wall is deliberately deferred by [ADR 0007](./adr/0007-ship-browser-and-pwa-before-the-ios-wall.md); this build must not present it as implemented or verified.

## Delivery contract

- Extend the supplied playable seed in small, behavior-preserving slices; do not replace it with a parallel rewrite.
- Keep one fixed bounded arc with meadow and harbor as deterministic Vista variants, never rounds or levels.
- Keep a TypeScript + Canvas 2D core and produce both a portable self-contained `nindova.html` and a separately tested PWA wrapper derived from the same core.
- Preserve `window.__ct` and the full desktop arc after every slice; new portrait and state tests add coverage rather than replace it.
- Preserve the Two-Loop Law: satisfaction inside the Session, pull only between Sessions.
- Keep all state local, audio optional, sharing user-initiated, and Required Actions possible without audio, precision gestures, or sight.
- Treat Punjabi material craft and Indian night landscapes as the shared visual world: specific, contemporary, and non-religious by default. Keep localization separate from visual theming.
- Make zero telemetry a product-wide invariant: no analytics, event metrics, advertising, remote logging, or third-party runtime requests from the Session, Dawn, PWA, site, or sharing flows.
- Commit after every Must slice. Push the verified commit series to `main`; authorization does not include a release, tag, App Store submission, or manual deployment.
- End every slice with an exact owner checkpoint describing what was verified, what to touch, and what should feel different. Continue automatically when the gate passes; pause only for a failed gate or genuine product decision.

## Must

### M0 — Establish the public repository, public surfaces, and proven seed baseline

- Initialize Git on `main`; verify the authenticated GitHub account and that `udhawan97/Nindova` does not collide with an existing repository; create it as **public**, configure `origin`, and verify local/default branch names. Do not enable Pages or another deployment here.
- Add the root README and repository guidance, and preserve all four supplied handoff artifacts by copying rather than moving them into `reference/`: `codex-kickoff.md`, `nindova-master-brief.md`, `nindova-demo.html`, and `test-demo.mjs`. Treat `codex-kickoff.md` as a planning reference, not runtime input.
- Before executing supplied code, inspect the demo, test, and dependency declarations; reject filesystem mutation outside designated artifacts, shell execution, credential access, and non-local network access. Pin dependencies in a lockfile, disable lifecycle scripts where compatible, and run the observational test from a disposable copy with screenshots restricted to a designated output directory.
- Before changing seed behavior, make only the observational arc test's file target/output directory portable, run it, and record exactly what it proves. It suppresses a missing end card and logs rather than asserts, so it cannot make the seed “green.” Then add a separate asserted arc covering state order, final `end`, required end-card copy, zero console/page errors, screenshots, and the `window.__ct` contract; only that asserted arc becomes the per-slice regression gate.
- Create a minimal workspace: a Vite/TypeScript Session package plus an Astro/Starlight public site and docs. Compose the site, docs, and `/play/` PWA into one build artifact while retaining the standalone HTML output.
- Use neighboring repositories only for proven conventions: semantic design tokens, a custom product landing page beside calm documentation, real rendered product media, explicit limitations, base-path/offline integration tests, restrained motion, and 320px-through-desktop verification. Do not copy their visual identities.
- Add reproducible root commands for development, type checking, building, unit tests, browser arcs, and production preview.
- Keep the verified 375×812 landscape-strip defect as the first failing portrait fixture rather than accepting it as the new baseline.
- Add repository hygiene before the first commit: ignore dependencies, builds, browser profiles, `.playwright-cli/`, temporary exports, and generated evidence; review the staged inventory; scan it for credentials, personal absolute paths, and unintended artifacts.

**Commit:** `chore: establish Nindova baseline and repository surfaces`

**Owner checkpoint:** Run the untouched seed through arrival, lamp, one stored object, Vista, Drift, sign, and end card; open the initial README, landing page, and docs index.

### M1 — Make the complete Session portrait-first and semantically operable

- Add act-specific portrait compositions for intake, arrival, study, passage, meadow, harbor, Drift, return, sign, dark, and end while preserving the current desktop composition and state engine.
- Support safe areas, dynamic viewport height, rotation, pointer cancellation, either-handed one-thumb use, and targets of at least 44×44 CSS pixels; no Required Action may depend on multi-touch or precision dragging.
- Remove the viewport zoom prohibition and verify every Required Action at 200% zoom.
- Add semantic DOM equivalents for every Required Action and essential state, with visible focus, keyboard operation, non-visual status output, and real-device screen-reader acceptance criteria.
- Make reduced motion a complete alternate presentation in Must scope, not a later copy-polish task.
- Add browser arcs at 320×568, 375×812, 375×667, and desktop, plus rotation, virtual-keyboard, reduced-motion, zoom, held-touch, and pointer-cancellation cases.

**Commit:** `feat: make the nightly arc portrait-first and accessible`

**Owner checkpoint:** On a portrait phone, enter, light the lamp, name and store an object, change the window, help a Visitor, follow the light, turn the sign, and reach darkness without rotating the device.

### M2 — Make every touch satisfying and every state self-closing

- Improve pickup weight, drag response, snap/magnetism decay, drawer glide and thunk, shelf settle, hop/mooring feel, wipe, Drift Handoff, and sign ceremony in that order.
- Add illustrated focal sprites for objects and Visitors while retaining procedural environments, lighting, weather, and motion.
- Keep procedural ambience adaptive and interaction-gated; add authored closure accents that never block progress when muted, denied, or unavailable.
- Give every act calm decay-driven default progress so no-input, partial-input, naming-field, held-touch, lost-focus, and cancelled-pointer paths all reach the quiet ending within the 15-minute production cap. The internal monotonic clock exists only to enforce closure and is never displayed.
- Define testable assistance envelopes: snap radius and autonomous help may only increase; required gesture distance and waiting may only decrease.
- Define a testable light envelope: lighting the lamp redistributes warm focus without increasing the full-frame luminance budget, and mean/peak scene luminance then never increases through the ending.
- Keep reviewer mode hidden behind an explicit debug/test switch; it preserves order, path, decay direction, and closure outcome. Test the compressed arc after every slice, add deterministic clock-driven cap tests, and run one wall-clock 15-minute browser Session before completion.
- Replace production replay/evidence controls with the required quiet ending and preserved language; review controls remain test-only.

**Commit:** `feat: complete the tactile self-closing session`

**Owner checkpoint:** Feel one pickup and drawer closure, one crossing or mooring, the autonomous fallback from an untouched act, the final light Handoff, and the sign-to-dark ending.

### M3 — Add deterministic nightly variety and quiet memory

- Capture one immutable `nightId` when a Session starts. Its Dawn date is the current local civil date before noon and the next local civil date at or after noon; record the IANA time zone and recipe version with it so crossing midnight, DST, or changing zones cannot mutate an active Session.
- Use `nightId` to deterministically select weather, moon, object set, species mix, and Vista details; content varies, path, effort, duration, and payout do not.
- Publish browser parity fixtures for the PRNG and representative `nightId` vectors so a future iOS core can render the same night.
- Persist only local scene facts needed for Echoes and Dawn in a versioned schema with safe recovery from missing, stale, or corrupt state.
- Keep one meadow animal for the next completed Session; keep up to five harbor boats and fade the oldest when another arrives; skipped nights do not age either memory.
- Make voluntary replay within the same `nightId` idempotent: it cannot add an Echo or boat, change the closure outcome, extend or reset Dawn, or create another return marker. Replay is reached only by voluntarily opening Nindova again, never promoted on the end card.
- Expose no count, history, missed-night state, achievement, collection, or attendance language.

**Commit:** `feat: add deterministic nights and quiet memory`

**Owner checkpoint:** Compare two fixed `nightId` fixtures, cross midnight without the active scene changing, then return to see the correct uncounted Echo.

### M4 — Ship Dawn as the only reward-bearing surface

- Make Dawn eligible only from 06:00 through 11:59 on the captured `nightId` Dawn date, evaluated in the IANA zone captured at Session start even if the device later travels or changes zones. Before 06:00, after noon, after a skipped day, or without a completed Session, show no stale Dawn reward.
- Render the completed Session's Vista at first light without a notification or nighttime prompt.
- Export a still image and a subtle silent three-second loop using capability-appropriate browser formats; a failed clip export must leave the still and Dawn usable.
- Keep save/share explicit, local-first, and telemetry-free. Strip unnecessary metadata and delete temporary share files after completion or cancellation.
- Test completion before/after midnight, reopen before 06:00, the valid morning window, noon expiry, skipped nights, clock/zone changes, corrupt state, export cancellation, and unsupported clip encoding.

**Commit:** `feat: add the local morning Dawn keepsake`

**Owner checkpoint:** During the valid morning window, open Dawn, save the still, preview the loop, cancel and retry sharing, and verify no Session metrics appear.

### M5 — Ship the website, documentation, and installable PWA

- Build a custom warm-dark landing page that explains the bounded arc, uses real rendered Session media, preserves the positioning and behavioral claim limits, and leads to one clear `/play/` action. Keep documentation reading surfaces calmer than the marketing page.
- Create docs for getting started, product contract, nightly arc, accessibility, privacy/local state, architecture, testing, known limitations, research receipts, roadmap, and the deferred iOS Wall.
- Structure the README around the experience, at-a-glance capabilities, play/run instructions, privacy, architecture, verification commands, roadmap, limitations, contribution, and license facts; never advertise an unverified capability.
- Add install metadata, icons, service worker, offline shell, and deterministic update behavior. Test the standalone HTML and the multi-file PWA independently.
- Verify resume before completion, reopen after completion, optional same-night voluntary replay, late-night reopen, muted/audio-denied operation, state migration, corrupt-state recovery, cold load, offline load, base-path routing, and service-worker scope.
- Add the quiet “Same time tomorrow?” end-card action. In the browser it records a local intention and prepares the next eligible Session when the user voluntarily returns; it sends no notification, creates no urgency, and is idempotent within a `nightId`.
- Keep runtime privacy testable: same-origin static requests only, zero third-party runtime requests, no service-worker caching of local state or share payloads, and prompt revocation/deletion of temporary export URLs/files.
- Keep motion to a few authored moments, stop off-screen work, provide a static reduced-motion experience, avoid fake device chrome and fabricated metrics, and verify no horizontal scroll from 320px upward.

**Commit:** `feat: ship the Nindova website docs and offline PWA`

**Owner checkpoint:** Read the landing page and docs at phone and desktop widths, install the PWA, complete one offline Session, voluntarily reopen Nindova later that night, and return during the valid Dawn window.

### M6 — Final hardening, knowledge graph, and public proof

- Run unit/type/build gates, deterministic cap tests, one wall-clock 15-minute Session, desktop and portrait arcs, keyboard/focus/status checks, real-device screen-reader checks, 200% zoom, reduced motion, offline/PWA tests, local-state recovery, and Dawn export tests.
- Assert the immutable language in production surfaces: “Nothing to win. Nothing tracked. Nothing you can do wrong.”; “The session is over. That's the point.” as the end-card first line; behavioral-only/13+/not-treatment/CBT-I language; and the absence of prohibited sleep-performance claims.
- Inspect the rendered 1440px desktop, 375×812, 375×667, 320×568 Session, 320px website, standalone HTML, and installed PWA rather than treating source/tests as shipped-surface proof.
- Build the first Graphify graph after modular code exists, run a scoped architecture query, and update it before the final build and push.
- Confirm every Must slice has one focused commit, no unrelated files, and a recorded owner checkpoint. Re-review the staged/final tracked inventory and scan for credentials, personal paths, browser profiles, build outputs, and unintended evidence. Push the verified series to the public `origin/main`; do not claim a live deployment unless its public URL is separately observed.

**Commit:** `test: harden and verify the browser-first release`

**Owner checkpoint:** Complete the reviewer cut on the standalone HTML and installed PWA, compare the same deterministic night, and inspect the final public-site build locally.

## Should

- Add restrained object micro-behaviors such as mug steam and a watch tick that stops when stored.
- Expand the authored accent family so drawer, crossing, mooring, and sign share one sonic identity without randomized payout.
- Refine screen-reader copy, focus styling, and contrast after baseline semantic operation is proven.
- Add additional real rendered media and one restrained cinematic site story without adding runtime-heavy motion libraries.
- Prepare a Family Controls feasibility note and entitlement checklist without shipping, marketing, or simulating the Wall as complete.

## Could

- Add an artist-ready sprite manifest so focal art can be replaced without changing Session logic.
- Add more deterministic weather and species variants that do not alter difficulty, duration, or reward.
- Add a portfolio evidence page outside the nightly Session for research receipts, architecture, verification artifacts, and known limits.
- After a new owner checkpoint, revisit a Capacitor shell, optional user-configured Focus/Shortcuts, Core Haptics, temporary downward-only brightness control, and the iOS Wall. Native work must fail open, preserve privacy, and pass entitled real-device proof before it can re-enter V1.

## Explicitly out

- More Vistas, a second arc, rounds, levels, visible timers or countdowns, children’s positioning, Android, accounts, cloud sync, social feeds, subscriptions, paywalls, scores, streaks, achievements, counters, sleep scores, sleep-quality or performance predictions, missed-night framing, sleep tracking, and clinical efficacy claims.

## Module boundaries

- **Session core:** fixed state machine, production/reviewer clocks, decay, autonomous fallbacks, transitions.
- **Stage:** procedural environment, portrait/desktop compositions, focal sprite rendering, luminance budget.
- **Interaction:** pointer gestures, semantic action equivalents, focus/status layer.
- **Sound:** procedural ambience and authored accents behind an optional capability.
- **Night:** `nightId`, deterministic recipe, Echo persistence.
- **Dawn:** eligibility, morning renderer, local export/share.
- **Browser:** standalone build, PWA wrapper, service worker, install/update behavior.
- **Site:** landing page, documentation, shared public facts and rendered media.

Modules are extracted only when a Must slice touches the corresponding behavior. The portable HTML remains self-contained; the installable PWA and public site remain explicit multi-file artifacts built from the same source of truth.
