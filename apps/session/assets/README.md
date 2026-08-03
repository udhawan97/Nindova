# Focal sprite provenance

`focal-sprites.png` is an AI-generated, hand-painted-style source sheet used for the Session's focal objects and Visitors. It was generated in image-generation mode, then processed locally to remove the flat chroma-key background. The runtime keeps procedural fallbacks, so the Session does not depend on the image decoding successfully.

- Final runtime asset: `apps/session/assets/focal-sprites.png`
- Generation mode: new image generation; no referenced images
- Local post-processing: chroma-key background removal only

## Exact generation prompt

> A precise 4 by 3 sprite sheet (four columns, three rows), each cell centered and isolated, hand-painted gouache with subtle Punjabi phulkari embroidery and Indian linocut texture, transparent-ready flat chroma-key magenta background #ff00ff, no shadows crossing cell boundaries. Row 1: tied cream letter with red thread, carved brass key, terracotta kulhad cup, indigo diary with geometric phulkari border. Row 2: carved wooden spindle wound with madder thread, engraved brass pocket watch, gentle Punjabi sheep, bar-headed goose. Row 3: Indian star tortoise, Indian hare, small painted river skiff, modest Indian river ferry. Warm indigo, marigold, madder, terracotta, brass palette. Respectful everyday material culture, no religious symbols, no text, no labels, no extra objects, exactly twelve items.
