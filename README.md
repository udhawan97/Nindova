# Nindova

Nindova is a bounded late-night ritual: put away a small visible set, cross one quiet Vista, follow the last light home, and stop. The Session ends itself. There is no score, streak, account, notification, or sleep grade.

> Nothing to win. Nothing tracked. Nothing you can do wrong.

## Current state

This repository contains the supplied playable concept extended into a portrait-first, semantically operable, self-closing Session. A captured local `nightId` deterministically selects weather, moon, objects, Visitors, and Vista detail, while one versioned local record keeps only the scene facts needed for a meadow Echo, harbor boats, and morning Dawn. During the captured 06:00–11:59 window, Dawn renders the completed Vista at first light and can export a local PNG or capability-appropriate silent three-second loop. The current visual world draws from Punjabi material craft and Indian night landscapes: phulkari geometry, indigo, marigold, terracotta, carved wood, a mustard meadow, and a riverside harbor. The original desktop state order and full asserted arc remain intact. Offline PWA behavior is planned but is not yet claimed as complete.

There is no public deployment yet. The GitHub repository being public does not imply that Pages, a release, or an App Store build exists.

## Repository map

- `apps/session/` — the playable Session, extended directly from the supplied demo with its provenance recorded.
- `apps/site/` — the public landing page and Starlight documentation.
- `docs/` — build plan, decision records, testing evidence, and repository-level documentation.
- `reference/` — immutable copies of the four supplied handoff artifacts.
- `tests/` — unit and browser evidence gates.
- `tokens.css` — portable visual tokens shared by public surfaces.

## Run locally

Requires Node.js 24 or newer.

```sh
npm install --ignore-scripts
npm run dev:session
```

In another terminal, run the site and docs:

```sh
npm run dev:site
```

Build the composed static artifact—landing page, `/docs/`, `/play/`, and standalone `nindova.html`—with:

```sh
npm run build
npm run preview
```

## Verification

```sh
npm run typecheck
npm run test:unit
npm run test:seed:observe
npm run test:arc
npm run test:portrait
npm run test:self-closing
npm run test:night
npm run test:dawn
npm run build
```

The observational test preserves the supplied script’s behavior and is deliberately non-green evidence: it records screenshots and logs state, but it does not assert success. `test:arc` is the actual regression gate.

## Product boundaries

- Local-only state and zero telemetry are product invariants.
- Audio is optional; progress cannot depend on it.
- The Session must remain completable without precision gestures, sight, or haste.
- Anything that makes tonight harder to leave is a bug.
- Punjabi/Indian visual cues must be specific and materially grounded, never generic “exotic” or religious decoration.
- The browser/PWA experience comes first. The proposed iOS Wall is deferred and must not be represented as shipped.

Nindova is a behavioral design study for people aged 13 and up. It is not a sleep tracker, a sleep-performance tool, or a treatment for insomnia. Persistent sleep difficulty deserves evidence-based care such as CBT-I with a qualified clinician.

## Contributing

Read [CONTEXT.md](./CONTEXT.md), [docs/BUILD-PLAN.md](./docs/BUILD-PLAN.md), and the relevant [architecture decision records](./docs/adr/) before changing behavior. Keep commits aligned with the approved Must slices and include rendered-surface evidence for interface changes.

## License

No license has been selected. Public source availability does not grant reuse rights beyond those provided by applicable law.
