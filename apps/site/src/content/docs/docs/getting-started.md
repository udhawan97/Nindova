---
title: Getting started
description: Run, build, and verify the current Nindova House and Night Room source.
---

## Fastest path

Build the current source, then open `http://127.0.0.1:4173/house/` for the entertainment hub. `dist/nindova.html` remains the self-contained Night Session and does not install a service worker. Earlier checksummed builds remain available in the [GitHub release history](https://github.com/udhawan97/Nindova/releases).

## Run from source

Nindova uses an npm workspace with Vite House and Session packages plus an Astro/Starlight site package. Node.js 24 or newer is required.

```sh
npm install --ignore-scripts
npm run dev:house
npm run dev:session
```

The development servers bind to `127.0.0.1`. Run House, Night Session, and the public site separately with `dev:house`, `dev:session`, and `dev:site`.

## Build the complete release surface

```sh
npm run build
npm run preview
```

The root `dist/` contains the landing page, `/docs/`, `/house/`, `/play/`, and `nindova.html`. Open `/house/` for the installable entertainment hub and `/play/` for the independently installable Night Room. After each worker installs online, its own static shell can reopen offline.

The build also generates a direct QR for `https://udhawan97.github.io/Nindova/play/`. The pinned GitHub Pages workflow publishes the same static build from `main`; the live URL is browser-verified and physical-device scanning remains a separate verification lane.

## Verify

```sh
npm run check
npm test
npm run test:wall-clock
```

`test:house` is the Grand Salon browser gate; `test:arc` is the Night Room Rasoi regression gate. `test:seed:observe` preserves the rejected original prototype as historical evidence only; it is not a release pass.
