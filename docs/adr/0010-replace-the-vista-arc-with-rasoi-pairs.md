# Replace the Vista arc with Rasoi Pairs

The original desk, Vista, and Drift sequence did not provide a legible or satisfying mental exercise. Nindova now uses **Rasoi Pairs**: a calm pair-removal game inspired by Mahjong solitaire, built from familiar Indian kitchen objects and Punjabi material craft.

The v0.1.0 board had 36 tiles arranged on three shallow racks. A tile was free when it was exposed at either end of its rack. That geometry is superseded by [ADR 0011](./0011-layer-rasoi-and-keep-replay-deliberate.md), which preserves the verified safe-choice contract while adding true layered occlusion.

The game uses uniform, predictable response—lift, a restrained steel-and-wood sound when enabled, and a soft settle. It adds no scores, counters, streaks, collections, randomized rewards, visible timer, failure state, or performance language. Help identifies a safe pair but never plays for the user. A production Session settles itself by the hard cap whether or not every tile was removed.

Dawn is redesigned with the same system: the previous night's kitchen motifs become a quiet first-light composition. Existing version 1 and version 2 Dawn data is migrated into a legacy completion variant and remains locally available during its original eligibility window.

This decision supersedes the experience-specific parts of ADRs 0001, 0002, 0004, 0005, and 0006. ADRs 0003, 0007, 0008, and 0009 remain in force. The immutable language, Two-Loop Law, local-only privacy boundary, accessibility requirements, and fifteen-minute maximum remain unchanged.
