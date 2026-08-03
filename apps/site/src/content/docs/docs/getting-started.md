---
title: Getting started
description: Install, run, and verify Nindova locally.
---

Nindova uses an npm workspace with a Vite Session package and an Astro/Starlight site package. Node.js 24 or newer is required.

```sh
npm install --ignore-scripts
npm run dev:session
```

The Session development server binds only to `127.0.0.1`. Run the public site and documentation separately:

```sh
npm run dev:site
```

## Build the composed artifact

```sh
npm run build
npm run preview
```

The root `dist/` folder contains the landing page, `/docs/`, `/play/`, and the portable `nindova.html` file. Generated builds are ignored by Git.

Open `http://127.0.0.1:4173/play/` in an install-capable browser. The manifest and service worker are intentionally scoped to `/play/`; after the first online load, the static Session shell can reopen offline. `nindova.html` is independent and does not install or register a worker.

## Verify before editing behavior

```sh
npm run typecheck
npm run test:unit
npm run test:seed:observe
npm run test:arc
npm run test:portrait
npm run test:self-closing
npm run test:night
npm run test:dawn
npm run test:pwa
npm run test:wall-clock
```

The observational test is not a pass/fail gate. It preserves the supplied script’s evidence shape. The asserted arc is the regression gate.
