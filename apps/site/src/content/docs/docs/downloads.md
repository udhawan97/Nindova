---
title: Downloads
description: Choose the live House, installable Night Room, tagged standalone file, static archive, or source build without guessing.
---

## Start in a browser

- **[Enter Nindova House](https://udhawan97.github.io/Nindova/house/)** — the current live Grand Salon and Gallery, published from `main`. It can be installed from a supporting browser after the first online visit.
- **[Visit the Night Room](https://udhawan97.github.io/Nindova/play/)** — the current live Masala Mound Session and its separately scoped offline PWA.

Both are static web applications. They have no account, analytics, advertising, or third-party runtime service. A static host may keep ordinary access logs outside Nindova's control.

## Tagged v0.3.0 files

The latest published tagged release is **[v0.3.0 — Shahi Mound](https://github.com/udhawan97/Nindova/releases/tag/v0.3.0)**. It packages the Night Room release that predates Nindova House.

| File | Use it when | What is included |
| --- | --- | --- |
| [Standalone HTML](https://github.com/udhawan97/Nindova/releases/download/v0.3.0/nindova-v0.3.0.html) | You want one portable file | Night Room only; no service worker or install step |
| [Static web archive](https://github.com/udhawan97/Nindova/releases/download/v0.3.0/nindova-web-v0.3.0.zip) | You want to host the v0.3.0 site and Night PWA yourself | Landing page, docs, Night PWA, and standalone file from that tag |
| [SHA-256 checksums](https://github.com/udhawan97/Nindova/releases/download/v0.3.0/SHA256SUMS.txt) | You want to verify either download | Published digests for the HTML and ZIP |

The tagged archive does **not** contain the later Grand Salon or Gallery. Use the live House or build the current source for those surfaces.

## Verify a tagged download

Place the downloaded file and `SHA256SUMS.txt` in the same folder, then run the command for that file:

```sh
# Standalone HTML
grep ' nindova-v0.3.0.html$' SHA256SUMS.txt | shasum -a 256 -c -

# Static web archive
grep ' nindova-web-v0.3.0.zip$' SHA256SUMS.txt | shasum -a 256 -c -
```

The release contains ordinary HTML and ZIP files, not a signed or notarized native application. Your browser may ask you to confirm an HTML download. Nindova has no background native updater: tagged files update only when you replace them, while the live PWAs update their static caches after a successful online visit.

## Build the current House and Night Room

Current source requires Node.js 24 or newer:

```sh
git clone https://github.com/udhawan97/Nindova.git
cd Nindova
npm install --ignore-scripts
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/house/` for the House, `/play/` for the Night Room, `/docs/` for documentation, or `dist/nindova.html` for the current standalone Night file.

There is no native macOS, Windows, Linux, iOS, or Android installer in this repository. Desktop and mobile support is through a modern browser or PWA. The native iOS Wall remains deferred.
