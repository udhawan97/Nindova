# Rasoi Pairs redesign evidence

## Pure model

- 36 tiles: four copies of nine kitchen motifs.
- Gentle uses 24/8/4 Tiles across three layers; Deeper uses 20/10/4/2 across four. A Tile is free only when uncovered and open on at least one horizontal side.
- One legality kernel drives free state, input, help, removal, completion, and exhaustive verification.
- Representative Chicago, Kolkata, and daylight-saving Night IDs each produce 382 Gentle and 510 Deeper reachable states, one terminal state per profile, and zero dead states. Deeper's first three steps each present at least four free candidates and two unmatched decoys around one legal crown pair.

## Rendered Session

- Asserted arc: `intake → play → settling → end`, with optional `end → drift → rest`, after 18 legal pair removals.
- Responsive inspection and automation: 320×568, 375×667, 375×812, and 1440×900, with retained 414×896 and 768×1024 coverage.
- Native tile buttons expose form, numbered layer, free/covered, selected, and settled state; all starting free tiles are at least 44×44 CSS pixels.
- Keyboard-only pair removal, two full touch journeys through every newly exposed layer, 200% zoom, reduced motion, computed visible focus, action reachability, and horizontal-overflow checks pass.
- Help identifies two tiles and leaves the board unchanged.
- A legal pair leaves through a bounded, computed-visible deterministic brass-and-peacock bloom; reduced motion uses opacity only. Settled board screenshots and the decreasing warmth token verify that the mean board luminance does not increase after a pair leaves.
- No-input, partial, and selected-tile paths converge through the same production-cap Rest boundary.

## Night, privacy, and return

- Same-tab reload restores the exact profile, board, and removed-tile set from ephemeral version-4 session storage. Active clocks are bound to the captured Night instant; old, unknown-profile, future-corrupt, and rollback cases fail safe or still close at the boundary.
- Same-night voluntary replay selects the same Night ID; deliberately reselecting the same profile yields the same board ID, geometry, and motif order.
- The completed Session makes Rest primary and offers one optional, response-free Image Drift with no route back into play; browser evidence closes the page, opens a new page, reselects the same profile, and completes the second touch Session without multiplying Dawn.
- Version-3 completion is idempotent and contains no interaction timestamps.
- Version-1 legacy Dawn data copies into an explicit legacy completion variant without pretending it was Rasoi play. A literal v0.1.0 recipe-two completion passes storage restoration, Dawn eligibility, and Dawn rendering under Night/Dawn record recipe three.
- Browser “Not now” leaves a same-page voluntary return path. No persistence, guilt language, or native-interception claim is added.

## Dawn and distribution

- Dawn uses the stored Rasoi motif order in a first-light kitchen canvas.
- Browser evidence covers captured-zone morning boundaries, PNG download, sharing cancellation, unsupported loop fallback, and supported loop preview.
- The `/play/` worker replaces a seeded v3 cache with the v5 static shell and local install icons without clearing local storage. Offline closure works with audio construction denied.
- The standalone has the same compiled Night, Rasoi, and Dawn globals without a manifest or service worker.
- Automation decodes the rendered QR to the shared canonical URL and fetches both redistributed OFL license texts from the composed site. The deployed route, service-worker control, same-origin requests, and offline reload are browser-verified; a physical-device scan remains unverified.

## Honest limits

Human Punjabi cultural review, real-device VoiceOver/TalkBack, installed Safari/Android proof, and facilitated human experience testing remain unverified. No sleep or dopamine outcome is claimed.

## Production wall-clock receipt

On 2026-08-03, the final candidate's `npm run test:wall-clock` exercised the production application without reviewer acceleration. The Session reached `end` at 722.341 seconds through the `production-cap` path, reached `rest` by 900.001 observed seconds, and reported no console or page errors.
