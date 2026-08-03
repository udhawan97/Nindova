---
title: Night and local state
description: Immutable Night IDs, deterministic Rasoi boards, and safe legacy Dawn migration.
---

## One captured night

Nindova captures one immutable `nightId` when a Session begins. Before local noon, its Dawn date is the current civil date; from noon onward, its Dawn date is the next civil date. The ID also includes the device’s IANA time zone and recipe version.

Crossing midnight, a daylight-saving transition, or changing device zone cannot mutate an active Session. Voluntarily reopening during the same Night ID selects the identical board.

## Deterministic recipe

Recipe version 3 uses a stable seeded generator to permute the nine kitchen motifs over the fixed layered geometry and choose one cloth tone. It never changes the number of tiles, legal rule, effort envelope, cap, or ending. Pure unit tests pin deterministic recipes and exhaustive solvability for Chicago, Kolkata, and a daylight-saving boundary night.

## Long-lived state

Nindova writes one current key: `nindova:night-state:v3`. It keeps only:

- the latest completion’s Night ID, Dawn date, captured zone, board ID, and motif order;
- a safely migrated legacy Dawn completion/memory when present; and
- one optional local “Same time tomorrow?” intention.

Version 1 and version 2 records copy into the v3 union without deleting their source keys. Existing recipe-two Rasoi completions remain valid for Dawn after the recipe-three board upgrade. Interaction timestamps are sanitized out. Missing or corrupt state fails open to an empty local record.

## Ephemeral resume

Same-tab session storage may hold the active board ID, removed tile IDs, and internal boundary timestamps. This exists only to resume a reload and enforce the Session ceiling. Closing the tab abandons the unfinished Session; it does not create a Dawn completion.
