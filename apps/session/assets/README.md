# Session asset provenance

The current Rasoi Pairs motifs are code-native SVG fragments in `src/session.ts`. Their visible names and accessible names are derived from the same motif registry in `src/rasoi-core.ts`; the game no longer depends on generated focal raster art.

`nindova-icon.svg` is the hand-authored install icon used by the PWA manifest and offline shell. Its indigo, madder, and marigold geometry follows the repository token system and contains no external artwork or font.

The earlier AI-generated object/Visitor sprite sheet remains recoverable in Git history but was removed from the active repository when ADR 0010 replaced the Vista arc.
