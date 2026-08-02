---
title: Architecture
description: Browser-first boundaries for the Session, site, PWA, and Dawn.
---

The build starts from the supplied standalone Canvas demo and extracts modules only when an approved Must slice touches the behavior. This keeps each change reviewable and avoids a parallel rewrite.

## Workspace

- **Session** — Vite and TypeScript package that preserves the fixed state machine, Canvas stage, interactions, sound, and `window.__ct` evidence hook.
- **Site** — Astro landing page and Starlight documentation.
- **Composition** — one static root artifact containing the site, `/docs/`, `/play/`, and portable `nindova.html`.

## Planned boundaries

- **Core** owns state order, clocks, decay, fallbacks, and closure.
- **Stage** owns procedural environment, composition, focal sprites, and luminance.
- **Interaction** owns pointer and semantic equivalents, focus, and status output.
- **Night** owns `nightId`, deterministic recipes, and quiet local memory.
- **Dawn** owns morning eligibility, rendering, and local export.
- **Browser** owns standalone output, PWA shell, service worker, and install/update behavior.

The same source of truth must drive the portable HTML and the multi-file PWA. The site may explain the experience but cannot claim a capability that the shipped Session has not proved.
