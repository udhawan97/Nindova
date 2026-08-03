---
title: Accessibility
description: Native tile controls, text labels, keyboard completion, and alternate presentation in Rasoi Pairs.
---

Rasoi Pairs uses native HTML buttons for every tile. The drawing, visible name, accessible name, free/covered state, selected state, and settled state come from the same motif registry and board kernel.

## Operable rule

- Free tiles are the only tiles in the keyboard tab order.
- Each tile announces its kitchen form and whether it is free, covered, selected, or settled.
- Selection and removal work with pointer, touch, keyboard, switch-style activation, and programmatic semantic control.
- All tile and toolbar targets are at least 44 by 44 CSS pixels.
- Live status text describes selection, mismatch, match, help, wind-down, and closure.
- Visible text names mean recognition does not depend on the illustration.

Audio is off by default and optional. Animation is decorative. Precision movement and vision are not required.

## Alternate presentation

The release is browser-verified at 320×568, 375×812, 414×896, 768×1024, and 1440×900. It covers 200% page scale, reduced motion, keyboard pairing, target size, visible focus, and horizontal-overflow checks.

Real-device VoiceOver and TalkBack acceptance remains an untested release limitation. Automated semantic checks are not a substitute for that human proof.
