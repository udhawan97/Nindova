# NINDOVA — Brand Guide
Version 1.0 · August 2026 · License for all assets: CC0-1.0 (original work, this repository)

## Identity
Nindova is an open-source bedtime game around a calm, layered Indian-kitchen matching experience ("Masala Mound"). The identity: **the kitchen has settled after the final pair.** Royal Punjabi depth — phulkari geometry, jewel color — with no arcade energy, no wellness clichés, no decorative overload.

## The mark — Phulkari lattice ("jugalbandi")
Nine diamonds on a 48×48 grid (half-diagonal 5, centers at 24±15.6 / 24±7.8 diagonals).
Every color appears **exactly twice**, mirrored — matched pairs, the game's mechanic made still — and saffron settles at center.
- N + S — Majith #9A3A42 · E + W — Neelam #3A4A9E · NE + SW — Gulabi #C4638A · NW + SE — Malai #EFE1C4 (swap to Raat #150D20 on light backgrounds) · Center — Kesari #E0A64B
- Pairing is carried by **position and color together**, never color alone.
- Reduced-detail variant (favicon, ≤24 px): **quincunx** — 5 diamonds (half-diagonal 7), cream pair omitted so it reads on light and dark without an outline.
- Monochrome: all nine diamonds `currentColor` (nindova-mark-monochrome.svg).

## Wordmark
Custom geometric caps — **no font dependency**: cap height 24, stroke 3.4, tracking 9 (see src/wordmark.src.svg). Renders identically everywhere; never retype in a system font inside logo files.
UI/body text uses the system stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Optional display serif for long-form storytelling: Georgia stack.

## Palette — Shahi Raat (royal night)
| Token | Hex | Role | Contrast |
|---|---|---|---|
| --nv-raat | #150D20 | night background | — |
| --nv-surface | #211A33 | raised night surface | — |
| --nv-malai | #EFE1C4 | text neutral / paper | ≈14:1 on Raat (AAA) |
| --nv-kesari | #E0A64B | primary accent | ≈8.5:1 on Raat (AA) |
| --nv-gulabi | #C4638A | highlight | ≈4.9:1 on Raat (AA) |
| --nv-neelam | #3A4A9E | sapphire, decorative/large only on Raat | ≈2.6:1 |
| --nv-majith | #9A3A42 | madder, decorative/large only on Raat | ≈2.3:1 |

Light mode: Malai paper, Raat text; kesari darkens to #8A6420 for AA. Full variables: `apps/site/public/brand/nindova-tokens.css`.
Neelam/Majith never carry meaningful text on Raat — decorative shapes and ≥24 px display only.

## Clear space & minimum sizes
- Clear space around mark and lockups: **one diamond** (1/5 of mark width) on all sides.
- Minimum sizes: full 9-diamond mark 24 px; quincunx below that (16 px OK); horizontal lockup 96 px wide; stacked 64 px; wordmark cap-height 12 px.

## Motion
Stepped frames only (`steps(1,end)` / discrete) — a handmade stop-motion cadence, ≤9 frames, always returning to a long rest. The animated landing-page and README lockups follow the supplied seven-second icon study: mirrored diamonds arrive in four pairs, saffron closes the center, and a soft radial glow breathes behind the completed lattice before the sequence repeats. The in-Session header uses a shorter one-shot stitch entrance so gameplay never carries a continuous decorative loop. Static lockups remain the default for the footer, favicons, and product controls. Under `prefers-reduced-motion`, the completed logo appears immediately and the glow is removed; a brief opacity-only match state change may remain. Motion never signals score, streak, or reward.

## Icon family (Masala Mound motifs)
48×48, flat `currentColor` fills, no strokes thinner than 3, silhouette-first, one knockout detail max. Objects: belan, chakla, tawa, chimta, katori, tiffin, masala dabba, chai glass, pressure cooker. Icons are distinguished by shape, never color alone.

## Incorrect usage
- Don't stretch, rotate, outline, or add shadows/gradients to the mark.
- Don't recolor pairs individually or break the two-of-each-color rule.
- Don't place the 9-diamond mark on busy imagery — use the tile (Raat rounded square) version.
- Don't use the cream (NW/SE) pair on light backgrounds — use the light variant.
- Don't set the wordmark in a font; use the drawn letterforms.
- No Gurmukhi lettering without verified Punjabi language + cultural review.

## Design rationale — three concepts explored
1. **Quiet Dabba** — masala-dabba one breath from closed; strongest closure story, but nearest to generic "pot," and the least distinctive silhouette.
2. **Joṛi (paired katoris)** — two matching bowls settling rim-to-rim; calm perfect symmetry, but drifts toward lens/eye at 16 px.
3. **Woven N** — two-ply diagonal passing the uprights, phulkari rhythm without borrowed pattern; strong favicon, but letterforms are a crowded field and it carries the least kitchen warmth.
**Selected: Phulkari lattice** (evolved from the abstract mark: stitch-fill diamond × pair-matching): nine diamonds colored in matched pairs. It encodes the mechanic (pairs), the craft reference (phulkari darning rhythm as structure, not decoration), and the royal palette — while degrading gracefully to the quincunx at favicon size.

## Comparison (5 = best)
| Criterion | Dabba | Joṛi | Woven N | Lattice ✓ |
|---|---|---|---|---|
| Cultural fit | 4 | 3 | 4 | 5 |
| Bedtime fit | 5 | 4 | 3 | 4 |
| 16 px legibility | 4 | 3 | 4 | 3* |
| Distinctiveness | 3 | 3 | 4 | 5 |
| Implementation ease | 4 | 4 | 3 | 4 |

*Served by the quincunx reduced variant at ≤24 px — see favicon assets. Chart: concept-comparison.png.

## Final refinements applied
- Cream pair swaps to Raat ink on light backgrounds (light variants shipped).
- Quincunx reduced variant created for 16–24 px.
- Wordmark drawn as paths (no font requests, identical rendering).
- Icon/tile surfaces use the Raat rounded-square container for self-contained contrast.

## Sources & licensing
All geometry, letterforms, icons, and images are **original to this project** and dedicated under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/); no stock, no third-party icon packs, no fonts embedded or fetched. Inspiration only (no assets copied or redistributed): phulkari textile geometry (traditional Punjabi craft form), Chandigarh's modernist sector-grid planning, brushed-steel and brass kitchenware forms. Gurmukhi lettering intentionally not included pending human Punjabi review.
