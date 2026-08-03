---
title: Privacy and local state
description: What Nindova stores, what the offline cache contains, and what never leaves the device.
---

## Runtime boundary

The Session makes same-origin static requests only. It has no account, analytics, telemetry, advertising, remote logging, social SDK, or third-party runtime dependency. Generated Dawn stills and loops exist only as in-memory blobs until the person explicitly saves or shares them; temporary object URLs are revoked after replacement, cancellation, closing Dawn, or leaving the page.

## One bounded record

Nindova writes `nindova:night-state:v2` in browser local storage. It keeps only:

- the last completed Session facts needed to determine Dawn;
- one meadow Echo;
- up to five harbor boats; and
- an optional local “Same time tomorrow?” intention for the completed `nightId`.

The intention sends no notification and requests no notification permission. Repeating it in the same night is idempotent. Completing a later night clears the earlier intention.

Version 1 migrates once to version 2, preserving its bounded scene memory and removing the old key. Missing, corrupt, unsupported, or unavailable state fails open to an empty local scene. No counts, labels typed during a Session, timing metrics, sleep data, exports, or attendance history are stored.

## Offline cache

The service worker is scoped to `/play/`. Its versioned precache contains the Session HTML, local engines, manifest, icon, and focal sprite sheet. It never receives or caches local storage, generated blobs, share payloads, or pages outside its scope. A newly installed worker becomes active after the previous Session tabs release the old worker; cache activation removes older Nindova shell versions deterministically.

The standalone `nindova.html` embeds its engines and focal sprites and does not register a service worker.
