# M6 — Browser-first release hardening

## Production wall-clock proof

After the Session runtime moved into the compiled TypeScript graph, `npm run test:wall-clock` rebuilt the composed production artifact, opened `/play/` at 375×812 with reviewer mode absent, and left the Session untouched. The Session ended naturally at 637.062 wall-clock seconds with `sessionElapsed` 636.894, `endReason` `completed`, and no console or page errors. The same page remained in `end/completed` at 900.003 seconds.

This distinguishes the product contract correctly: fifteen minutes is a ceiling, not a target duration. Reviewer-mode tests separately force 900 simulated seconds and require the `production-cap` path.

## Final automated gates

```sh
npm run check
npm test
npm run test:wall-clock
```

The suites cover the Vite-compiled TypeScript/Canvas runtime; unit/type/build checks; the asserted arc; portrait, 200% scale, rotation, virtual-keyboard height, reduced motion, keyboard, semantic controls, pointer cancellation, and target size; autonomous closure; deterministic night and local-state recovery; Dawn still/loop export and URL cleanup; immutable product language; base-path routing; PWA installability, online cache refresh, origin-safe cache cleanup, offline completion, and same-night voluntary replay; plus standalone independence.

## Repository and architecture proof

- The focused commit series preserves one major Must slice per commit.
- The generated `graphify-out/` map includes source, docs, tests, ADRs, and rendered assets. `GRAPH_REPORT.md` is the canonical current node, edge, and community count.
- A scoped graph query traces the standalone Session, deterministic Night state, Dawn exporter, PWA shell, and their local-only boundary.
- Raw extraction diagnostics flag unresolved import targets (mostly external packages, plus a few local asset/style references) as dangling and a small number of same-endpoint edges as collapsed by the undirected export; there are zero missing endpoints and zero self-loops. This is a documented graph limitation, not runtime proof.

## Family-repository references

The repository presentation was checked against Orifold, Dusori, Voyalier, and Codemble. Nindova adopts their strongest structural conventions—trust-first README sections, a separate Starlight documentation surface, explicit privacy and authority boundaries, base-path-safe static hosting, hand-authored navigation, and rendered-product evidence—without borrowing their visual identities.

## Rendered proof

- Session media: 375×812 production portrait.
- Dawn media: 712×446 production canvas render.
- Landing page inspection: 320×568, 375×812, 1280×800, and 1440×900.
- Responsive automation: 320×568, 375×667, 375×812, 414, 768, and 1280 CSS-pixel widths as applicable.
- Hallmark visual gate: 58/58 checks passed.

## Honest boundary

Chromium verifies the rendered browser surfaces, installability criteria, offline operation, and accessibility semantics. A real installed Safari/Android PWA and real-device VoiceOver/TalkBack acceptance remain untested risks. The iOS Wall remains a documented, unshipped native follow-up. No deployment, tag, or release is claimed by this checkpoint.
