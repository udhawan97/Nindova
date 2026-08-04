---
title: Night and local state
description: Immutable Night IDs, deterministic Rasoi boards, and safe legacy Dawn migration.
---

## One captured night

Nindova captures one immutable `nightId` when a Session begins. Before local noon, its Dawn date is the current civil date; from noon onward, its Dawn date is the next civil date. The ID also includes the device’s IANA time zone and recipe version.

Crossing midnight, a daylight-saving transition, or changing device zone cannot mutate an active Session. Voluntarily reopening during the same Night ID returns to intake; reselecting the same profile selects its identical deterministic board.

## Deterministic recipe

The Night capture and Dawn record use recipe version 3. Its stable seeded generator produces a board ID and motif order; it also retains a cloth token for compatibility, although the current Session does not render that token. The layered board geometry and legality kernel have their own recipe version 5. Neither recipe changes the tile count, legal rule, cap, or ending. Pure unit tests pin deterministic Night recipes and exhaustive board solvability for Chicago, Kolkata, and a daylight-saving boundary night.

## Long-lived state

Nindova writes one current key: `nindova:night-state:v3`. It keeps only:

- the latest completion’s Night ID, Dawn date, captured zone, board ID, and motif order;
- a safely migrated legacy Dawn completion/memory when present; and
- one optional local “Same time tomorrow?” intention.

Version 1 and version 2 records copy into the v3 union without deleting their source keys. Existing recipe-two Rasoi completions remain valid for Dawn after the recipe-five board upgrade. The active version-4 same-tab record adds only the chosen board profile needed to restore exact geometry. Interaction timestamps and profiles are excluded from long-lived history. Missing or corrupt state fails open to an empty local record.

## Ephemeral resume

Same-tab session storage may hold the active board ID, removed tile IDs, and internal boundary timestamps. This exists only to resume a reload and enforce the Session ceiling. Closing the tab abandons the unfinished Session; it does not create a Dawn completion.
