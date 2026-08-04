# Session asset provenance

The current Masala Mound silhouettes are original CC0-1.0 artwork from the Nindova Silhouette design review. The canonical source files live in `assets/motifs/`; compact copies are inlined in `src/session.ts` so the standalone Session keeps its one-file, no-request contract. Their visible and accessible names are derived from the motif registry in `src/rasoi-core.ts`.

`nindova-icon.svg` remains the portable vector fallback. The PWA also ships the original CC0-1.0 brand kit's 192px, 512px, and maskable PNG marks through the manifest and offline shell.

The earlier AI-generated object/Visitor sprite sheet remains recoverable in Git history but was removed from the active repository when ADR 0010 replaced the Vista arc.
