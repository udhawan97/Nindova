# Nindova

Nindova is a bounded late-night ritual: put away a small visible set, cross one quiet Vista, follow the last light home, and stop. The Session ends itself. There is no score, streak, account, notification, or sleep grade.

> Nothing to win. Nothing tracked. Nothing you can do wrong.

## At a glance

- One fixed portrait-first arc with semantic controls and a hidden fifteen-minute production cap.
- Deterministic Punjabi and Indian night world: phulkari geometry, indigo, brass, terracotta, mustard meadow, and riverside harbor.
- Local-only Echo memory and morning Dawn still or silent three-second loop.
- Quiet “Same time tomorrow?” intention with no notification or scheduled prompt.
- Two independent browser artifacts: an installable offline PWA at `/play/` and a self-contained `nindova.html`.
- No account, analytics, telemetry, advertising, remote logging, sleep score, or attendance history.

## Current state

This repository contains the supplied playable concept extended into a portrait-first, semantically operable, self-closing Session. A captured local `nightId` deterministically selects weather, moon, objects, Visitors, and Vista detail, while one versioned local record keeps only the scene facts needed for a meadow Echo, harbor boats, a quiet return intention, and morning Dawn. During the captured 06:00–11:59 window, Dawn renders the completed Vista at first light and can export a local PNG or capability-appropriate silent three-second loop. The original desktop state order and full asserted arc remain intact. The composed `/play/` build is installable and browser-verified offline; the portable HTML remains independent and service-worker free.

There is no public deployment yet. The GitHub repository being public does not imply that Pages, a release, or an App Store build exists.

## Repository map

- `apps/session/` — the playable Session, extended directly from the supplied demo with its provenance recorded.
- `apps/site/` — the public landing page and Starlight documentation.
- `docs/` — build plan, decision records, testing evidence, and repository-level documentation.
- `graphify-out/` — generated architecture graph, interactive HTML, and audit report.
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

Open `http://127.0.0.1:4173/play/` for the installable build, `/docs/` for the product and implementation contract, or download `dist/nindova.html` for the standalone artifact. Installation availability depends on browser and platform support.

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
npm run test:pwa
npm run test:wall-clock
npm run build
```

The observational test preserves the supplied script’s behavior and is deliberately non-green evidence: it records screenshots and logs state, but it does not assert success. `test:arc` is the actual regression gate.

## Privacy

The Session makes same-origin static requests only. Browser local storage contains one bounded version-2 record: the last completion facts needed by Dawn, one meadow Echo, up to five harbor boats, and the optional local return intention. Version 1 migrates once. Labels typed during the Session, interaction timing, generated exports, and sleep data are not persisted.

The `/play/` worker precaches only the static Session shell. It cannot see local storage and does not cache generated Dawn blobs or share payloads. The standalone registers no worker.

## Product boundaries

- Local-only state and zero telemetry are product invariants.
- Audio is optional; progress cannot depend on it.
- The Session must remain completable without precision gestures, sight, or haste.
- Anything that makes tonight harder to leave is a bug.
- Punjabi/Indian visual cues must be specific and materially grounded, never generic “exotic” or religious decoration.
- The browser/PWA experience comes first. The proposed iOS Wall is deferred and must not be represented as shipped.

Nindova is a behavioral design study for people aged 13 and up. It is not a sleep tracker, a sleep-performance tool, or a treatment for insomnia. Persistent sleep difficulty deserves evidence-based care such as CBT-I with a qualified clinician.

## Roadmap and limitations

The browser Session, Dawn, standalone, offline PWA, public page, and documentation are implemented in source. The production Session has been observed through natural closure and the full fifteen-minute ceiling. Broader installed-device proof on Safari and Android plus real-device VoiceOver and TalkBack acceptance remain explicit hardening work. The iOS Wall requires a separate entitled native build and is not shipped.

See the [roadmap](./apps/site/src/content/docs/docs/roadmap.md), [known limitations](./apps/site/src/content/docs/docs/known-limitations.md), and [deferred iOS Wall contract](./apps/site/src/content/docs/docs/ios-wall.md).

## Contributing

Read [CONTEXT.md](./CONTEXT.md), [docs/BUILD-PLAN.md](./docs/BUILD-PLAN.md), and the relevant [architecture decision records](./docs/adr/) before changing behavior. Keep commits aligned with the approved Must slices and include rendered-surface evidence for interface changes.

## License

No license has been selected. Public source availability does not grant reuse rights beyond those provided by applicable law.
