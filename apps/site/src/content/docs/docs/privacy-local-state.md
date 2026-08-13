---
title: Privacy and local state
description: What Nindova House and the Night Room store, what their offline caches contain, and what never leaves the device.
---

## Runtime boundary

The House and Night Room make same-origin static requests only. They have no account, analytics, app telemetry, advertising, app-controlled remote logging, social SDK, or third-party runtime dependency. A static host may retain operational access logs outside the app's control. Generated Dawn stills and loops remain in-memory blobs until the person explicitly saves or shares them.

## House records

`nindova:house:adult-audience:v1` stores only the local acknowledgement that the visitor is 18 or older. It is audience framing, not identity or date-of-birth verification.

`nindova:house:v2` keeps at most one replaceable completion result per Salon game. Each result is fixed to `mode: "entertainment"` and includes schema, game, and ruleset versions, a local run identifier, completion time, and narrow authored-chapter facts. It contains no answers, errors, move history, reaction timing, percentile, cognitive inference, account, or device identifier. The app prefers a valid v2 record; otherwise it sanitizes valid results from `nindova:house:v1` into memory without deleting that legacy key. A v2 write occurs only after a new completion. The visible Gallery clear action removes both exact House result keys.

The source-only assessment-readiness contract creates no research record and no storage key. Research collection and public cognitive output remain disabled.

`nindova:house:active:v1` in session storage contains the current game, chapter, local run identifier, Lantern cover state, Stack plinth state, Sector Sprint narrated-story beat, or one session-only `touched` boolean used solely to decide whether leaving needs confirmation. It does not count actions or enter the completion record. Lantern and Stack use the active snapshot for same-tab reload recovery. Sector Sprint position, elapsed time, inputs, collisions, and interaction history remain in memory and are never persisted; because persisting a clock would create performance history, any Sector Sprint document reload fails closed to the Salon, clears the active record, records no completion, and explains the boundary exit. The record is discarded when a game ends or the tab session ends. Corrupt or illegal Stack state resets to its authored opening.

## Night Room long-lived record

`nindova:night-state:v3` stores the latest completion facts needed for Dawn, an optional legacy Dawn variant, and the quiet tomorrow intention. It stores no tile-selection history, interaction timing, score, attendance, sleep data, exported file, label typed by the person, or device identifier.

Version 1 and version 2 state is copied into the v3 union and sanitized. The source key is retained as a migration safety measure. Missing, corrupt, unsupported, or unavailable storage fails open without blocking play.

## Night Room same-tab resume

`nindova:active-session:v4` in session storage may contain the validated Night capture, recipe-five board ID, tonight-only board profile, reachable removed-tile state, settlement phase, and internal boundary times. It survives a reload in the same tab and disappears when that tab session ends. Invalid, unreachable, old-recipe, unknown-profile, or impossible phase/reason combinations are discarded; a valid reload during settlement resumes the same quiet closure. The profile is never promoted into completion history. The record is never sent anywhere and never becomes long-lived performance history.

## Offline cache

The `/house/` worker precaches the complete versioned static House asset graph in `nindova-house-v9` so a fresh controlled navigation works with the HTTP cache cleared and the network offline. The `/play/` worker owns the separately scoped Night shell in `nindova-session-v5`. Neither worker can read local storage or cache state keys, Dawn blobs, or share payloads. The standalone `nindova.html` registers no worker.
