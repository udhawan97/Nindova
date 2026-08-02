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

## Verify before editing behavior

```sh
npm run typecheck
npm run test:unit
npm run test:seed:observe
npm run test:arc
```

The observational test is not a pass/fail gate. It preserves the supplied script’s evidence shape. The asserted arc is the regression gate.
