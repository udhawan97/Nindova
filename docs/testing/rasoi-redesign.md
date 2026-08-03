# Rasoi Pairs redesign evidence

## Pure model

- 36 tiles: four copies of nine kitchen motifs.
- Three overlapping layers: 24 base Tiles, 8 middle Tiles, and 4 top Tiles. A Tile is free only when uncovered and open on at least one horizontal side.
- One legality kernel drives free state, input, help, removal, completion, and exhaustive verification.
- Representative Chicago, Kolkata, and daylight-saving Night IDs each produce 382 reachable states, one terminal state, and zero dead states.

## Rendered Session

- Asserted arc: `intake → play → settling → end` after 18 legal pair removals.
- Responsive inspection and automation: 320×568, 375×667, 375×812, and 1440×900, with retained 414×896 and 768×1024 coverage.
- Native tile buttons expose form, free/covered, selected, and settled state; six starting tiles are at least 44×44 CSS pixels.
- Keyboard-only pair removal, two full touch journeys through every newly exposed layer, 200% zoom, reduced motion, computed visible focus, action reachability, and horizontal-overflow checks pass.
- Help identifies two tiles and leaves the board unchanged.
- A legal pair leaves through a bounded, computed-visible deterministic brass bloom; reduced motion uses opacity only. Settled board screenshots and the decreasing warmth token verify that the mean board luminance does not increase after a pair leaves.
- No-input, partial, and selected-tile paths converge through the same production-cap ending.

## Night, privacy, and return

- Same-tab reload restores the exact board and removed-tile set from ephemeral session storage. Active clocks are bound to the captured Night instant; future-corrupt and rollback cases fail safe or still close at the boundary.
- Same-night voluntary replay selects the same Night ID, board ID, and motif order.
- The completed Session offers a screen-away handoff with no route back into play; browser evidence closes the page, opens a new page in the same profile, and completes the second touch Session without multiplying Dawn.
- Version-3 completion is idempotent and contains no interaction timestamps.
- Version-1 legacy Dawn data copies into an explicit legacy completion variant without pretending it was Rasoi play. A literal v0.1.0 recipe-two completion passes storage restoration, Dawn eligibility, and Dawn rendering under recipe three.
- Browser “Not now” leaves a same-page voluntary return path. No persistence, guilt language, or native-interception claim is added.

## Dawn and distribution

- Dawn uses the stored Rasoi motif order in a first-light kitchen canvas.
- Browser evidence covers captured-zone morning boundaries, PNG download, sharing cancellation, unsupported loop fallback, and supported loop preview.
- The `/play/` worker replaces a seeded v3 cache with the v4 static shell without clearing local storage. Offline closure works with audio construction denied.
- The standalone has the same compiled Night, Rasoi, and Dawn globals without a manifest or service worker.
- Automation decodes the rendered QR to the shared proposed canonical URL and fetches both redistributed OFL license texts from the composed site. Public hosting and a physical-device scan remain unverified.

## Honest limits

Human Punjabi cultural review, real-device VoiceOver/TalkBack, installed Safari/Android proof, and facilitated human experience testing remain unverified. No sleep or dopamine outcome is claimed.
