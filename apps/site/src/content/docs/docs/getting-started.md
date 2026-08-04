---
title: Getting started
description: Run, build, and verify the Nindova v0.3.0 source release.
---

## Fastest path

Build the current source, then open `dist/nindova.html` in a current browser. The file is self-contained and does not install a service worker. Earlier checksummed builds remain available in the [GitHub release history](https://github.com/udhawan97/Nindova/releases).

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

The build also generates a direct QR for `https://udhawan97.github.io/Nindova/play/`. The pinned GitHub Pages workflow publishes the same static build from `main`; the live URL is browser-verified and physical-device scanning remains a separate verification lane.

## Verify

```sh
npm run check
npm test
npm run test:wall-clock
```

`test:arc` is the current Rasoi regression gate. `test:seed:observe` preserves the rejected original prototype as historical evidence only; it is not a release pass.
