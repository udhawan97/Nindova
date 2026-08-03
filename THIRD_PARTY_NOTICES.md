# Third-party notices

The composed Nindova website and documentation include these redistributed font files:

- **Geist Variable** — Copyright 2024 The Geist Project Authors. Licensed under the SIL Open Font License 1.1. The complete license is shipped at `/licenses/geist-OFL-1.1.txt`.
- **Newsreader Variable** — Copyright 2020 The Newsreader Project Authors. Licensed under the SIL Open Font License 1.1. The complete license is shipped at `/licenses/newsreader-OFL-1.1.txt`.

Build and development dependencies retain their own licenses in the npm dependency tree and are not part of the standalone Session runtime.

The v0.2.0 build and verification workflow also uses these pinned open-source packages without shipping their code in the standalone Session runtime:

- **qrcode 1.5.4** — direct QR generation. [MIT-licensed source](https://github.com/soldair/node-qrcode).
- **pngjs 5.0.0** — PNG inspection in browser tests. [MIT-licensed source](https://github.com/lukeapage/pngjs).
- **jsQR 1.4.0** — QR decoding in browser tests. [Apache-2.0-licensed source](https://github.com/cozmo/jsQR).

The GitHub Pages workflow pins these GitHub-maintained MIT-licensed actions to full commit hashes: [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), [configure-pages](https://github.com/actions/configure-pages), [upload-pages-artifact](https://github.com/actions/upload-pages-artifact), and [deploy-pages](https://github.com/actions/deploy-pages). GitHub Pages is the external static host; it may retain operational access logs outside Nindova's control.
