# Group the Grand Salon and add sourced classic rule studies

The Grand Salon now presents five category doors instead of five direct table doors:

1. **Pattern & Line** — Pattern Court and Navakankari.
2. **Turn & Trap** — Mirror Forge and Aadu Puli Aattam.
3. **Count & Carry** — Stack Architect and Pallanguzhi.
4. **Memory & Sequence** — Lantern Ledger.
5. **Motion & Route** — Sector Sprint.

This supersedes the five-table navigation established across [ADR 0013](./0013-add-the-adult-nindova-house.md) and [ADR 0015](./0015-add-the-bounded-sector-sprint.md), but it does not change the Night Room or the Two-Loop Law. The Salon has eight games, each with exactly five authored chapters or tactical studies. Category routes use `#door/<category>` and table routes use `#game/<game>`, while `/house/` and unknown fragments return to the Grand Salon.

The three additions are intentionally described as **authored tactical rule studies**, not complete traditional matches, definitive reconstructions, simulations of an opponent, or pan-Indian rules. Each table shows its named source, documented scope, included mechanics, and omissions inside the play surface.

## Selected rulesets and boundaries

### Navakankari

The table uses the documented 24-intersection board and the placement idea of closing a line of three pieces. Its five positions ask for one mill-closing placement. Movement, removal, flying, repetition, and victory are omitted.

Primary source: Gotad, Ambekar, and Chaudhury, *Gamesmen and Board Game-Designs from Vadnagar*, **Heritage: Journal of Multidisciplinary Studies in Archaeology**, volume 12 (2024), pp. 989–990, section “Navakankari.” <https://www.heritageuniversityofkerala.com/JournalPDF/Volume12/31.pdf> (retrieved 2026-08-05).

### Aadu Puli Aattam

The table uses the 23-point board documented by the Indian Heritage Centre, adjacent movement along a drawn line, and a tiger's collinear leap over one goat. Its five positions each ask for one legal goat step or tiger move. Placement order, repeated-position restrictions, five-capture victory, goat immobilisation victory, and a full opponent are omitted.

Primary source: Indian Heritage Centre, *Aadu Puli Aatam* printable rules, sections “Set Up,” “How to Play,” and “How to Win.” <https://www.indianheritage.gov.sg/en/-/media/ihc2023/education/downloadable-resources/pdf/aadu-puli-aatam---printable.pdf> (retrieved 2026-08-05).

### Pallanguzhi

The table uses two rows of seven pits and one exact authored turn at a time. The traversal is fixed anti-clockwise: lower row left-to-right, then upper row right-to-left. A turn lifts a non-empty lower pit, sows one seed per pit, immediately takes a pit when a deposit makes exactly four, and relays from the next occupied pit. When the next pit is empty, it captures the following occupied pit and continues from the next cup containing seeds; two empty pits end the turn. Multi-round refilling, rubbish pits, and winner totals are omitted.

Primary source: IIT Bombay D’Source, *Pallankuzi*, section “How to Play.” <https://dsource.in/resource/indian-games/board-games/pallankuzi> (retrieved 2026-08-05).

## Product and state constraints

- The studies are deterministic, finite, local-only, and carry no score, streak, rank, visible timer, collection, randomized reward, telemetry, assessment claim, or social comparison.
- The House Gallery moves to `nindova:house:v2`. Reading is copy-on-write: the app prefers a valid v2 record, otherwise sanitizes valid entries from `nindova:house:v1` into memory. The legacy key is not deleted automatically. A v2 write occurs only after a new completion; an explicit Gallery clear removes both exact keys.
- Existing v1 results for the original five games remain readable. New results carry schema 2 while keeping the `entertainment-1` ruleset provenance because no existing table mechanic changes.
- The new rules engine is a pure module shared by runtime rendering and tests. Canonical board points, drawn lines, chapter fixtures, and deterministic move functions must not diverge across those surfaces.

## Deferred candidates

Pachisi, Chaupar, and Gyan Chaupar are deferred because faithful chance and, for Gyan Chaupar, religious or moral specificity need a separate product decision. Ganjifa and Chaturanga are deferred until Nindova selects and documents one named, defensible ruleset. Deferral is a fit and evidence decision, not a claim that these traditions are inauthentic.

## Evidence boundary

Automated checks establish board cardinality, canonical line fixtures, unique authored answers, sowing order, relay and capture behavior, safe storage migration, five-door/eight-game navigation, completion boundaries, responsive containment, reduced-motion behavior, and offline availability. They do not establish ethnographic completeness, universal regional agreement, historical priority, representative cultural reception, or human enjoyment.
