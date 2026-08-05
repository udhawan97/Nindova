---
title: Getting started
description: Run, build, and verify the current Nindova House and Night Room source.
---

## Fastest path

Use the [live Nindova House](https://udhawan97.github.io/Nindova/house/) for the current entertainment hub or the [live Night Room](https://udhawan97.github.io/Nindova/play/) for Masala Mound. The [Downloads guide](./downloads/) separates those live surfaces from the tagged v0.3.0 Night Room files and the current source build.

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

The root `dist/` contains the landing page, `/docs/`, `/house/`, `/play/`, and `nindova.html`. Open `/house/` for the installable entertainment hub and `/play/` for the independently installable Night Room. After each worker controls its route following an online visit, its own static shell can reopen offline.

The build also generates a direct QR for `https://udhawan97.github.io/Nindova/play/`. The pinned GitHub Pages workflow publishes the static build from `main`; the current House and Night routes are live. Physical-device QR scanning remains a separate verification lane.

## Verify

```sh
npm run check
npm test
npm run test:wall-clock
```

`test:house` is the Grand Salon browser gate; `test:arc` is the Night Room Rasoi regression gate. `test:seed:observe` preserves the rejected original prototype as historical evidence only; it is not a release pass.
