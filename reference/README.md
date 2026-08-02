# Supplied handoff artifacts

These files are byte-for-byte copies of the inputs supplied on 2026-08-02. They are evidence and design references, not package runtime inputs.

| File | SHA-256 |
| --- | --- |
| `codex-kickoff.md` | `9c3ddbd9b5e6d788a44c731443436d9260d8c32a908d41d5c013870e546ce758` |
| `nindova-master-brief.md` | `ff24d91a8f1948c0554e6f091ea8559e1b2296fcb26c593fe62ca5255e077b6c` |
| `nindova-demo.html` | `140c0e128be8e89dcd203c503ddc619c77cc0f732954631836b09f573f7791bf` |
| `test-demo.mjs` | `336938b426b4dc3ddb1f270213753b94353baa61bc024c9dccfe61a910e60ed1` |

The executable test was inspected before use. It launches Playwright, loads a local file, and writes screenshots; it does not invoke a shell, access credentials, or make network requests. Its end-card wait suppresses timeout failure, and it logs instead of asserting, so it is retained as observational evidence only.
