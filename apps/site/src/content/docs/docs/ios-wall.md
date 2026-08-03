---
title: Deferred iOS Wall
description: The user-chosen Screen Time concept that is not implemented in this repository.
---

The Wall is a future native iOS precommitment surface. It is not part of the browser Session, PWA, standalone HTML, or public deployment.

## Frozen agency contract

- The person chooses which apps are included; suggested social, video, news, and browser apps are never preselected.
- The person types the nightly time directly rather than having Nindova silently infer or import a sleep schedule.
- The Gate has one calm **Not now** action. Choosing it dismisses the Wall for the rest of that night without guilt or repeated prompting.
- Nindova itself remains manually available later that same night. “Not now” declines the Gate moment; it does not prevent voluntary play.

## Why it is deferred

Native Screen Time behavior depends on Apple Family Controls entitlements, managed settings, distribution approval, and OS-version behavior that cannot be proved by a web implementation. The browser experience must stand on its own before the Wall is built.

No current screenshot, test, or repository artifact should be read as evidence that the iOS Wall ships.
