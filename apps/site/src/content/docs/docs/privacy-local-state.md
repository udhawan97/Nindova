---
title: Privacy and local state
description: What Rasoi Pairs stores, what the offline cache contains, and what never leaves the device.
---

## Runtime boundary

The Session makes same-origin static requests only. It has no account, analytics, telemetry, advertising, remote logging, social SDK, or third-party runtime dependency. Generated Dawn stills and loops remain in-memory blobs until the person explicitly saves or shares them.

## Long-lived record

`nindova:night-state:v3` stores the latest completion facts needed for Dawn, an optional legacy Dawn variant, and the quiet tomorrow intention. It stores no tile-selection history, interaction timing, score, attendance, sleep data, exported file, label typed by the person, or device identifier.

Version 1 and version 2 state is copied into the v3 union and sanitized. The source key is retained as a migration safety measure. Missing, corrupt, unsupported, or unavailable storage fails open without blocking play.

## Same-tab resume

`nindova:active-session:v2` in session storage may contain the validated Night capture, board ID, reachable removed-tile state, settlement phase, and internal boundary times. It survives a reload in the same tab and disappears when that tab session ends. Invalid or unreachable records are discarded; a reload during settlement resumes the same quiet closure. The record is never sent anywhere and never becomes long-lived completion history.

## Offline cache

The `/play/` service worker precaches only its HTML, manifest, and install icon in `nindova-session-v3`. It cannot read local storage and does not cache state keys, Dawn blobs, share payloads, or pages outside its scope. The standalone `nindova.html` registers no worker.
