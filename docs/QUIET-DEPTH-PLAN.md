# Quiet Depth plan

**Status:** Approved for implementation after evidence review, three-interface comparison, and two-round council review.

## Decision

Extend the v0.2.0 candidate as one descending nightly arc:

1. choose **Gentle stack** or **Deeper stack** for this Session;
2. unstack the 36-tile Masala Mound with the same free-tile rule;
3. receive the same restrained brass-bloom confirmation for every legal pair;
4. reach the immutable end card;
5. choose the primary **Dim and rest** exit or the secondary, optional **Rasoi Image Drift**;
6. reach the same near-black Rest surface with no replay route.

The profiles are tonight-only preferences, not levels, ranks, or ability labels. Both remain available, use the same global Session deadline, have the same ending, and create the same Dawn value.

## Why this direction

The research in [bedtime-game-evidence.md](./research/bedtime-game-evidence.md) does not establish that a screen game makes people sleepy, improves sleep or memory, or creates a useful dopamine response. It does support a conservative product objective: make a chosen screen activity bounded, predictable, low-pressure, and easier to leave.

Three product shapes were compared:

- **A bedtime game shelf** was rejected because browsing or unlocking several activities adds continuation pressure at the moment Nindova should close.
- **A weekly ranking and improvement dashboard** was rejected because puzzle behavior cannot establish memory or sleep improvement, while ranks, streaks, personal bests, and leaderboards are designed to increase comparison and persistence.
- **Unstack → Drift → Dark** was selected because it adds real agency and a fuller ending while progressively reducing visual information and preserving an immediate route to Rest.

The researched alternatives remain documented: a paper-based offloading prompt and a short body-release prompt. Rasoi Image Drift is the first candidate because it reuses familiar board vocabulary and most directly moves attention away from the screen. It remains an unvalidated design hypothesis, not a sleep technique.

## Board profiles

### Gentle stack

- 36 Tiles and nine kitchen motifs, four of each.
- Three authored layers with broader initial availability and more readable overlap.
- The default choice. Its copy describes openness, not ease or low ability.

### Deeper stack

- 36 Tiles and the same nine motifs.
- A separately authored geometry with greater occlusion and fewer immediately useful choices.
- More look-ahead without time pressure, failure, a losing legal move, or a larger payout.

### Shared proof

Each profile independently must prove:

- one complete terminal state and zero dead states;
- every legal choice preserves a route to closure;
- the same legality function drives rendering, semantic descriptions, input, Help, resume validation, and exhaustive verification;
- structural and semantic distinction that does not rely only on color, shadow, motion, sound, or sight; and
- completion within the one production Session boundary.

If a qualifying Deeper geometry cannot be authored and verified, the release blocks. Solvability must not be weakened to ship the selector.

## Match confirmation

The existing **brass bloom** remains predictable confirmation:

- one fixed, low-amplitude 400 ms inward settle and dim ring;
- one optional, locally synthesized tone family, off by default;
- synchronous engine removal that never waits for presentation;
- an opacity-only reduced-motion fallback; and
- no rarity, escalation, combo, confetti, particles, shake, haptic requirement, or randomized variant.

The board-to-dabba contraction uses the same restrained visual language and also receives an opacity-only reduced-motion fallback.

## Rasoi Image Drift

Rasoi Image Drift is the only non-Rest completion option in this release.

- The immutable end-card first line appears before any choice.
- **Dim and rest** is primary.
- **Carry three objects** is secondary and explicitly optional.
- Drift presents three deterministic motifs from the completed board as locally drawn images and visible, screen-reader-readable names.
- Copy invites the person to picture the objects or remember how they feel in the hands, accommodating people who do not form mental images.
- **Skip and rest** is always available.
- Drift collects no answer, accuracy, completion, duration, preference, or health data.
- No input enters Rest rather than starting or prolonging Drift.
- Drift has no link back to play. Another Session still requires a deliberate close and reopen into intake.

## Global closure

The original Session deadline remains global. Board play, settlement, the end surface, optional Drift, and transition to Rest do not reset or extend it. Production play winds down early enough for an untouched Session to reach Rest within 900 seconds. Reviewer timing may compress duration but never state order or outcome.

## No weekly grade

The production app will not add a weekly rank, score, streak, personal best, completion count, attendance calendar, improvement graph, sleep score, memory grade, or disguised wellness metric.

The chosen profile exists only in the same-tab active Session record and deterministic board identity so reload recovery can recreate the board. It is not written into a history. Nindova does not know whether faster, harder, or more frequent play is better for a person.

## Sleep education

The public site and documentation may include one optional, calm, paraphrased sleep fact per reading surface with direct CDC, NHLBI, or AASM attribution. Facts must say that needs vary, avoid frightening consequence catalogues and individual predictions, and never imply that Nindova measures or improves sleep. Health facts do not appear inside the nightly Session or between completion and Rest.

## Open and local boundary

- Keep Apache-2.0 source, build instructions, notices, and corresponding standalone/PWA artifacts.
- Add no runtime API, account, analytics, CDN, hosted font, remote sound, third-party SDK, paid service, or free-tier dependency.
- Draw new visual states with existing CSS, SVG, Canvas, and Web Audio primitives.
- Record any future asset's author, source, modification status, and redistribution license before use. “Free to download” is not a license.

## Implementation slices

1. Research, ADR, terminology, and product-contract amendment.
2. Authored Gentle and Deeper profiles plus exhaustive solver tests and resume migration.
3. Completion contraction, optional Rasoi Image Drift, global deadline, and accessible fallbacks.
4. Browser, responsive, offline/PWA, documentation, claim, provenance, and release evidence.
5. Graphify refresh, final-SHA verification, merge/push to `main`, checksummed artifacts, and the next verified GitHub release.

## Release gates

- Type, unit, build, standalone, PWA/offline, Dawn, resume, corrupt-state, wall-clock, and prohibited-copy suites pass.
- Phone and desktop rendering prove both profiles, optional Drift, Rest, 200% zoom, keyboard flow, visible focus, reduced motion, and muted/audio-denied completion.
- `Not now`, same-night deliberate reopen, and Dawn idempotence remain intact.
- Runtime requests remain static and same-origin; no profile or interaction history is added.
- Source, notices, citations, corresponding artifacts, and checksums come from the exact final `main` SHA.
- Graphify is incrementally refreshed and one scoped query succeeds before publication.
- Release version is selected from current tag/release inventory rather than presumed.

