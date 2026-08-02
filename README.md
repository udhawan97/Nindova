# Nindova

Nindova is a bounded late-night ritual: put away a small visible set, cross one quiet Vista, follow the last light home, and stop. The Session ends itself. There is no score, streak, account, notification, or sleep grade.

> Nothing to win. Nothing tracked. Nothing you can do wrong.

## Current state

This repository is at the browser-first foundation stage. It contains the supplied playable concept demo unchanged, an asserted browser arc, a Vite/TypeScript Session package, and an Astro/Starlight website and documentation shell. Portrait-first interaction, deterministic nightly memory, Dawn, and offline PWA behavior are planned but are not yet claimed as complete.

There is no public deployment yet. The GitHub repository being public does not imply that Pages, a release, or an App Store build exists.

## Repository map

- `apps/session/` — the playable Session. Its initial `index.html` is an exact copy of the supplied demo.
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
npm run build
```

The observational test preserves the supplied script’s behavior and is deliberately non-green evidence: it records screenshots and logs state, but it does not assert success. `test:arc` is the actual regression gate.

## Product boundaries

- Local-only state and zero telemetry are product invariants.
- Audio is optional; progress cannot depend on it.
- The Session must remain completable without precision gestures, sight, or haste.
- Anything that makes tonight harder to leave is a bug.
- The browser/PWA experience comes first. The proposed iOS Wall is deferred and must not be represented as shipped.

Nindova is a behavioral design study for people aged 13 and up. It is not a sleep tracker, a sleep-performance tool, or a treatment for insomnia. Persistent sleep difficulty deserves evidence-based care such as CBT-I with a qualified clinician.

## Contributing

Read [CONTEXT.md](./CONTEXT.md), [docs/BUILD-PLAN.md](./docs/BUILD-PLAN.md), and the relevant [architecture decision records](./docs/adr/) before changing behavior. Keep commits aligned with the approved Must slices and include rendered-surface evidence for interface changes.

## License

No license has been selected. Public source availability does not grant reuse rights beyond those provided by applicable law.
