# Rasoi Pairs redesign evidence

## Pure model

- 36 tiles: four copies of nine kitchen motifs.
- Three racks of twelve positions; only the active lowest/highest slot on each rack is free.
- One legality kernel drives free state, input, help, removal, completion, and exhaustive verification.
- Representative Chicago, Kolkata, and daylight-saving Night IDs each produce 343 reachable states, one terminal state, and zero dead states.

## Rendered Session

- Asserted arc: `intake → play → settling → end` after 18 legal pair removals.
- Responsive inspection and automation: 320×568, 375×812, 414×896, 768×1024, and 1440×900.
- Native tile buttons expose form, free/covered, selected, and settled state; six starting tiles are at least 44×44 CSS pixels.
- Keyboard-only pair removal, 200% zoom, reduced motion, visible focus, and horizontal-overflow checks pass.
- Help identifies two tiles and leaves the board unchanged.
- No-input, partial, and selected-tile paths converge through the same production-cap ending.

## Night, privacy, and return

- Same-tab reload restores the exact board and removed-tile set from ephemeral session storage.
- Same-night voluntary replay selects the same Night ID, board ID, and motif order.
- Version-3 completion is idempotent and contains no interaction timestamps.
- Version-1/version-2 Dawn data copies into an explicit legacy completion variant without pretending it was Rasoi play.
- Browser “Not now” leaves a same-page voluntary return path. No persistence, guilt language, or native-interception claim is added.

## Dawn and distribution

- Dawn uses the stored Rasoi motif order in a first-light kitchen canvas.
- Browser evidence covers captured-zone morning boundaries, PNG download, sharing cancellation, unsupported loop fallback, and supported loop preview.
- The `/play/` worker owns only the v3 static shell cache. Offline closure works with audio construction denied.
- The standalone has the same compiled Night, Rasoi, and Dawn globals without a manifest or service worker.

## Honest limits

Human Punjabi cultural review, real-device VoiceOver/TalkBack, installed Safari/Android proof, and facilitated human experience testing remain unverified. No sleep or dopamine outcome is claimed.
