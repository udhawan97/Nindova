# M1 portrait and accessibility checkpoint

> Historical Vista-arc evidence. Superseded for the active product by [ADR 0010](../adr/0010-replace-the-vista-arc-with-rasoi-pairs.md) and [Rasoi redesign evidence](./rasoi-redesign.md).

## Implementation

- Extended the supplied Canvas state engine with act-specific portrait camera framing while preserving its desktop composition.
- Added native semantic actions for every required step, optional naming, visible focus, state descriptions, and live status output.
- Added safe-area and dynamic-viewport handling, 44-pixel targets, zoom support, rotation handling, reduced-motion behavior, and pointer-cancellation recovery.
- Kept the original debug contract and asserted desktop arc intact.

## Browser evidence

- Complete semantic arc at 320×568, 375×812, 375×667, and 1280×800.
- Browser page scale at 200%.
- Portrait-to-landscape rotation and return.
- Reduced-motion presentation.
- Optional naming with a 375×520 virtual-keyboard viewport.
- Held touch and cancelled pointer without stuck drag state.
- Composed `/play/` route with zero console or page errors.

## Owner checkpoint

On a 375×812 portrait surface, the lamp, optional name, object storage, Vista change, Visitor help, returning light, sign, and quiet ending are all operable without rotating the device. The interaction dock remains reachable and the end card begins at its first line rather than opening mid-scroll.

Real-device VoiceOver and TalkBack acceptance remains pending for the final release gate.
