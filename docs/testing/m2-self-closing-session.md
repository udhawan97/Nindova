# M2 tactile and self-closing checkpoint

> Historical Vista-arc evidence. Superseded for the active product by [ADR 0010](../adr/0010-replace-the-vista-arc-with-rasoi-pairs.md) and [Rasoi redesign evidence](./rasoi-redesign.md).

## Implementation

- Production pacing is the default and enforces a monotonic fifteen-minute cap without displaying a timer.
- Reviewer pacing, evidence, and replay controls require the explicit `?review=1` switch.
- No-input, partial-input, naming-field, held-touch, lost-focus, and cancelled-pointer paths all receive autonomous help and close.
- Snap radius and magnetism only increase while required gesture distance and autonomous waiting only decrease.
- Mean and peak luminance budgets are monotonic after the lamp redistributes focus.
- Procedural ambience remains optional. Fixed authored accents mark lamp, shelf, drawer, crossing, mooring, Handoff, and sign closures.
- A generated, alpha-validated sprite sheet supplies illustrated objects and Visitors; procedural sketches remain the loading fallback. The portable HTML embeds the sheet.
- The room and Vistas now use a Punjabi/Indian visual world: phulkari, carved jali rhythm, terracotta, brass, indigo, marigold, a mustard meadow, and a riverside harbor.

## Evidence

- Browser contracts cover every interruption path and the production/reviewer boundary.
- Desktop arc order and immutable end copy remain unchanged.
- Portrait semantic arcs remain green at 320×568, 375×812, 375×667, and desktop.
- The focal sprite sheet has an RGBA channel and transparent corners; focal art is visible from the source file, multi-file build, and embedded standalone output.
- Built-surface pixel sampling confirmed the lamp redistributed rather than raised luminance: sampled mean moved from 17.82 to 17.52 and sampled peak from 162.89 to 155.75.

## Owner checkpoint

Feel one illustrated object lift and settle, one drawer closure, one meadow crossing or riverside mooring, an untouched act helping itself, the last-light Handoff, and the sign-to-dark ending. The experience should feel culturally grounded and calmer as it progresses, never busier or harder.

The final uninterrupted fifteen-minute wall-clock run remains an M6 gate.
