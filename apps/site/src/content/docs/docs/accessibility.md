---
title: Accessibility
description: Semantic actions, portrait composition, and alternate presentation in the Nindova Session.
---

Nindova keeps Canvas as its atmosphere, not as its only interface. Every action required to finish the nightly arc also has a native HTML control with a visible focus state, a keyboard path, and a short non-visual status update.

## Required actions

- Light the lamp.
- Put the next object away; naming it remains optional.
- Change the window.
- Clear the dust.
- Help the next Visitor.
- Let the returning light continue.
- Turn the sign and close the room.

Targets are at least 44 by 44 CSS pixels and remain within thumb reach in the verified portrait layouts. Required progress does not rely on precise dragging, multi-touch, sound, or sight.

## Alternate presentation

The Session provides act-specific portrait framing rather than shrinking a desktop canvas into a narrow strip. It supports safe areas, dynamic viewport height, rotation, held-touch cancellation, and browser zoom. When reduced motion is requested, camera movement snaps and ambient particle activity is reduced.

## Current evidence

Automated browser coverage exercises the complete semantic arc at 320×568, 375×812, 375×667, and desktop sizes. It also covers 200% zoom, rotation, a shortened virtual-keyboard viewport, reduced motion, held touch, and pointer cancellation. Real-device VoiceOver and TalkBack acceptance remains a release gate, not a claimed capability.
