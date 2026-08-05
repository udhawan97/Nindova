# Sector Sprint character sheet

`sector-sprint-characters.png` is the original transparent runtime sprite sheet for Gurpreet and Harjit. The game slices it as five columns by two rows and reuses those authored poses for lane-change anticipation, travel, harmless tool choreography, comic impact, and settlement. If it cannot load, the existing code-drawn lead remains playable.

## Provenance

- Created for Nindova on 2026-08-04 with OpenAI image generation in original-generation mode.
- Background removal used the project-local chroma-key helper; no third-party art asset is embedded.
- The characters, clothing, poses, and props are newly generated for this project and intentionally avoid existing game characters, logos, weapons, and branded level art.
- Included with the repository under its Apache-2.0 project license to the extent applicable.

## Generation prompt

> Create a premium indie 2D game character sprite sheet for an original Chandigarh Punjabi action-comedy game, no existing IP and no resemblance to any known video-game character. One wide sheet with exactly 10 separate full-body character sprites arranged in a clean 5-column by 2-row grid, generous transparent-space gaps, every figure completely inside its own cell with no overlap or cropping. Top row: Gurpreet, an adult Punjabi man in his late 20s, expressive moustache, deep indigo patka, ivory kurta, tailored navy sleeveless jacket, oxblood sneakers, brass-and-phulkari travel satchel, warm funny confident personality. Bottom row: Harjit, his formidable witty mother in her 50s, elegant maroon salwar kameez, deep teal phulkari dupatta, comfortable jutti, brass sabzi basket rig, warm commanding expression. Columns left to right for both characters: 1 upward lane-change anticipation with feet angled and scarf lag, 2 steady forward travel with flowing fabric, 3 harmless comic tool gesture using abstract light ribbons, 4 surprised comic impact/stumble pose, 5 proud settled-lane ready pose. Strong readable silhouette at 96 px, three-quarter side view facing right, consistent body proportions and lighting across all cells. Visual style: sophisticated hand-painted Indian editorial animation, crisp inked contours, layered gouache texture, royal indigo, oxblood, antique brass, muted jade, parchment highlights, tasteful geometric Phulkari accents, premium theatrical polish, playful but not childish. Flat solid magenta chroma-key background #FF00FF filling every unused pixel. No text, no UI, no labels, no logos, no border, no shadows extending into neighboring cells, no photorealism, no weapons, no violence.

The generated source was `1536 × 1024`; the transparent runtime file is kept below the 1.5 MB compressed art budget.
