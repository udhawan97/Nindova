---
title: Getting started
description: Download, run, build, and verify Nindova v0.1.0.
---

## Fastest path

Download `nindova-v0.1.0.html` from the [v0.1.0 GitHub release](https://github.com/udhawan97/Nindova/releases/tag/v0.1.0), then open it in a current browser. The file is self-contained and does not install a service worker.

## Run from source

Nindova uses an npm workspace with a Vite Session package and an Astro/Starlight site package. Node.js 24 or newer is required.

```sh
npm install --ignore-scripts
npm run dev:session
```

The Session development server binds to `127.0.0.1`. Run the public site and documentation separately with `npm run dev:site`.

## Build the complete release surface

```sh
npm run build
npm run preview
```

The root `dist/` contains the landing page, `/docs/`, `/play/`, and `nindova.html`. Open `http://127.0.0.1:4173/play/` for the installable PWA. After one online load, its static shell can reopen offline.

## Verify

```sh
npm run check
npm test
npm run test:wall-clock
```

`test:arc` is the current Rasoi regression gate. `test:seed:observe` preserves the rejected original prototype as historical evidence only; it is not a release pass.
