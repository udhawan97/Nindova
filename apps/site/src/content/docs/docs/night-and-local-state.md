---
title: Night and local state
description: Immutable night IDs, deterministic Punjabi and Indian scene recipes, and quiet Echo memory.
---

## One captured night

Nindova captures one immutable `nightId` when a Session begins. Before local noon, its Dawn date is the current local civil date; from noon onward, its Dawn date is the next local civil date. The ID also records the device’s IANA time zone and recipe version.

Crossing midnight, a daylight-saving transition, or changing the device zone cannot mutate an active Session. Reopening Nindova for the same Dawn date and captured zone selects the same night.

## Deterministic recipe

The versioned seeded recipe selects weather, moon, five desk objects, meadow species order, harbor boat order, and small Vista color details. It never changes the path, required effort, cap, or ending.

Published parity vectors in the unit suite pin the PRNG output and representative recipes for `America/Chicago` and `Asia/Kolkata` so a future native core can match the browser.

## Quiet memory

Nindova writes one local key: `nindova:night-state:v1`. The schema keeps only:

- the last completed Session facts required by Dawn;
- one meadow Echo; and
- up to five harbor boats, with the oldest removed only when another completed harbor Session adds one.

Skipped nights do not age or mutate either memory. Replaying the same `nightId` is idempotent: it cannot add another Echo, boat, completion, or return marker.

Missing state starts empty. Corrupt, stale, unavailable, or unsupported state fails open to a fresh local scene without blocking the Session. No count, history, collection, attendance, or missed-night language is shown.
