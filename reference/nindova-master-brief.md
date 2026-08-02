# NINDOVA — Master Brief

**For:** Codex (implementation partner) · **Owner:** UD · **Author:** Claude (design/evidence lead)
**Attached:** `nindova-demo.html` — the playable seed. Extend it; don't rewrite it blind.

---

## 0. How to work this brief

1. Read everything. The constraints are evidence-backed decisions, not style preferences.
2. **Interview UD before writing code** — the exact questions are in §12. Each question: 3–4 labeled options with one-line trade-offs.
3. Propose a Must / Should / Could plan. Get sign-off. Build in small slices; after each slice, tell UD exactly what to touch to feel the difference.
4. Keep the `window.__ct` debug hooks working and the automated arc test green at every step.

**The one-line test for every change you propose:**
> Does this make the **next touch** more satisfying, or does it make the user want **one more session**? First → ship. Second → cut. Unsure → ask.

---

## 1. The product in one paragraph

Nindova is a bedtime game for night owls, late-night coders, and doomscrollers — anyone who *means* to sleep and keeps not going. One ~10-minute nightly session that starts genuinely pleasant and deliberately decays toward nothing: you arrive in a dark study and light the lamp, put the day's objects away, pass through the window into tonight's vista where a procession of animals crosses a fence (or boats come in to moor), follow a single light until it stops needing you, turn the sign, and the app ends itself. It never mentions sleep. It never scores, streaks, or counts. Browser is the front door; iOS is the ritual.

**Positioning line:** *Nindova doesn't make you sleepy. It stops hiding how sleepy you already are.*

This is a portfolio-grade build: every design decision must be defensible out loud, with the receipt attached.

---

## 2. The user and the problem (the receipts)

- Going to bed later than intended happens on **54% of nights**; **99% of people** did it at least once in two weeks (Kok et al. 2026, *Sleep*, actigraphy). This is everyone, not a disordered few.
- The cost is **~55 minutes of sleep per delayed night, and it is not recoverable** — wake time is socially anchored and doesn't shift (Kok 2026).
- The #1 self-reported cause is **losing track of time (32.6%)**, ahead of "me time" (20%). The villain is the *unbounded session*, not the stolen day.
- Mechanism decomposition: screens' only robust within-person effect on sleep is **later bedtime** (Bourke et al. 2026, *JAMA Pediatrics*, 25 studies). Light costs 0–10 min; arousing content 3–8 min; **displacement costs up to ~75 min**. Nindova attacks displacement and pays the small light tax knowingly (with real brightness decay to shrink it further).
- Night owls: **eveningness is the single largest correlate of bedtime procrastination** (z = .43, Hill et al. 2022 meta-analysis). Nindova narrows the intention–behavior gap; it must **never promise to change anyone's chronotype**.

---

## 3. The Two-Loop Law (non-negotiable, verbatim)

> **Two loops, never mixed. In-session: satisfaction — weight, sound, closure, "I did something." Between-session: pull — ritual, curiosity, structure, "I want to be there again." Anything that makes tonight's session harder to leave is a bug, even if it doubles retention.**

Why the in-session "dopamine hit" framing is banned: variable reward at 11:30pm is arousal machinery — it rebuilds the thing the product exists to replace. The feeling UD wants ("oh wow, I did something") is **competence + closure**, and the games research says that's the stronger lever anyway: competence predicted continued play and post-play wellbeing (vitality β = .37), while achievement-hunger predicted *worse* post-play mood (Ryan, Rigby & Przybylski 2006). Deliver the drawer-thunk, never the slot machine.

---

## 4. Hard constraints (in-session)

1. No scores, points, streaks, timers, levels, achievements, unlocks, or counters — visible or hidden-then-revealed.
2. No variable/random **rewards**. Nightly content *variety* is fine; unpredictable *payout* is not.
3. Difficulty never increases. Effort decays monotonically within every session.
4. No sleep-related words, tracking, or performance framing in-session (Spiegelhalder 2012: attention to sleep performance is itself insomnogenic).
5. No fail states. Every gesture succeeds or is gently returned.
6. Arousal budget: warm dim palette; overall brightness only ever decreases during a session; no flashes, shake, fast motion, or loud/sudden audio.
7. One-finger interaction, thumb-reachable, phone-in-bed ergonomics.
8. The session always ends itself. The end screen never asks for anything tonight.
9. Audience: designed simple enough for anyone; **rated 13+; marketing voice targets adults** — night owls, late coders (melatonin suppression in young children is saturated at 5–40 lux — Hartstein et al. 2022; never market for kids' bedtime).
10. Footer language everywhere it fits: behavioral claims only — "earlier stopping," never "better sleep" (the closest analogue RCT, n=495, was null on sleep outcomes — Vazzaz 2026). Not a treatment for insomnia; persistent difficulty → CBT-I with a clinician.

---

## 5. The night loop — session architecture

```
ARRIVE            dark study, rain, unlit lamp        touch: light the lamp
ACT I   Desk      put the day's objects away          drag → shelf/drawer; tap → optionally NAME it
                  (Scullin 2018 PSG: naming specific open loops sped sleep onset ~9 min, d=0.63)
PASSAGE           camera drifts through the window    no interaction; fog
ACT II  Vista     the procession                      touch lets each one across; NO counting anywhere
                  meadow: changing animals over a fence (serial diverse imagery via the
                  specificity principle — Harvey & Payne 2002)  ·  harbor: boats to moorings
                  intervals stretch → they cross themselves → the last one settles for the night
ACT III Drift     one warm light follows your finger  lag grows until it stops needing you
CLOSE             back to the study, turn the sign    lamps die → dark → end card
```

- Decay drives everything: snap radius, magnetism, auto-fit, patience, dimming, audio levels.
- Two pacing profiles ship: reviewer cut (~5 min) and real (~15 min). Session length is a design constant, not a user-tunable engagement dial.
- Nightly remix (see §6): what varies is content; **the path never varies**. No menus. One pre-commitment choice max (the window).

---

## 6. The return system — between-session pull (all four are in scope)

| Driver | Spec | Receipt |
|---|---|---|
| **The Wall** (iOS only) | Daytime setup ("2pm contract"): user picks bedtime + apps to close at it. At the chosen hour those apps gate to Nindova. The gate has exactly **one "not now" affordance** and no guilt copy. | Allcott et al. 2022 RCT: 78% kept self-set limits, −22 min/day. Grüning et al. 2023 (preregistered): option-to-dismiss was the strongest component (d > 0.66); added friction contributed nothing; persuasive messages did nothing; stacked features did worse. Simple wins. |
| **Tonight's window** | Nightly remix: vista weather, moon phase, species mix, object set all reshuffle. Curiosity is the pull — "what's outside tonight?" | Headspace remixes sleepcasts nightly so users can't track progress or feel they missed anything. Variety ≠ variable reward. |
| **The room remembers** | Quiet, non-numeric persistence: last night's settled animal is still by the fence; moored boats accumulate (cap ~5 visible, oldest fade into fog). **Nothing is ever lost by skipping a night. Nothing is countable.** | Memory, not metric. Loss-aversion-free by construction. |
| **Same time tomorrow** | One soft line on the end card ("same time tomorrow?" — single tap, sets the next night's gentle open). Never a push notification guilt loop. | Daily implementation intentions beat one-off (Sezer et al. 2025, registered report). |

**The morning dawn (v1, and the only place reward lives):** opening Nindova before noon shows *last night's vista at dawn* — the meadow lit gold, the boats at first light — composed as a beautiful, shareable still (save/share as image). All delight-energy, screenshots, and organic growth live here, where reward can't cost sleep. No notification asks you to come look.

---

## 7. Platform strategy — browser and iOS, thought together

- **One core:** TypeScript + Canvas 2D session engine (the current file is the seed). Deterministic nightly seed (date-based) drives the remix so browser and iOS render the same "tonight."
- **Browser = the front door.** Free, zero-install, instantly shareable link; PWA-installable. Honest limits: no app blocking, no system brightness control, no real haptics on iOS Safari. The browser is the *taste*.
- **iOS = the ritual.** Capacitor wrapper for v1 (one codebase), with native capability plugins:
  - **FamilyControls / DeviceActivity / ManagedSettings** → the Wall. ⚠️ Note: FamilyControls distribution requires Apple's entitlement approval — apply early; it's the schedule's long pole.
  - **CoreHaptics** → the verb (drawer-thunk, hop-patter, sign-swing). This is where "juice" becomes physical.
  - Notification suppression during/after session; system brightness ramp; Shortcuts + Focus integration ("Sleep Focus opens Nindova"); a widget showing tonight's window preview.
- **Funnel:** browser session → end card's single quiet line: "make it a ritual" → App Store.
- Android: explicitly out of v1; note the equivalent (UsageStatsManager/Digital Wellbeing) differs enough to be its own project.

---

## 8. Metrics — behavioral only, with anti-metrics

- **Primary:** % of sessions ending before the user's stated intended bedtime; trend in self-reported bed-to-sleep-attempt gap (one-tap weekly check-in, never nightly — nightly sleep interrogation is the Pokémon Sleep mistake).
- **Health of the wall:** % of gate encounters where the user enters Nindova vs. dismisses (dismissal is allowed and unguilted; we just measure).
- **Anti-metrics — never optimized, reported only to be watched downward:** session length, sessions per night (should be 1), late-night reopens.
- **Never claim** "sleep better," "cure insomnia," or clinical outcomes. If UD later wants a real efficacy claim, the path is a 2-week diary pilot against an active control — design available on request.

---

## 9. V1 scope (locked by UD)

**In:** one arc; two vistas (meadow, harbor) with nightly remix; deep polish pass on the core verbs (tactility + finale ceremony first); morning dawn; the Wall on iOS; both pacing profiles; minimal room-remembers; browser + Capacitor iOS.
**Out (explicitly):** more vistas, kids mode, Android, accounts/cloud sync, social anything beyond dawn-image share, subscriptions/paywalls (portfolio-first; if it ships commercially later, the aligned model is one-time purchase — subscriptions pressure engagement mechanics and fight the thesis).

---

## 10. What exists — technical map of `nindova-demo.html`

- Single self-contained file: vanilla JS, Canvas 2D, procedural Web Audio (filtered-noise rain, crickets, water laps, all sfx synthesized — no assets anywhere).
- Virtual 1200×750 space, uniform scale + letterbox; `toV()` / `toScreen()` convert coordinates.
- States: `intake → arrive → play → wipe → approach → vista → drift → return → sign → dark → end`.
- Desk act: `makeObjects()` (10 procedural object sketches), `buildSlots()` (5 shelf gaps + 3 animated drawers), decay-driven snap/magnetism/auto-fit, tap-to-name via `#nameBox`, per-label fade.
- Vista act: `spawnEntity()` procession controller with two skins (8 animal silhouettes / 4 boat types), no-repeat species bag, patience decay → self-crossing, final-entity settle; `drawMeadow`/`drawHarbor`; window-tap toggles `vistaChoice` with in-glass preview.
- Drift: lag-following light; `return` hands back to the study for the sign.
- Pacing: `PACING.compressed` (~5 min) / `PACING.real` (~15 min) — labelFade, decayTime, vistaTime, driftTime, darkHold, wipeNeed.
- Debug hooks on `window.__ct`: `lightLamp, nameObject, storeNext, setDecay, finishWipe, vistaTapNext, setVistaT, finishDrift, tapSign, setVista`, plus state/entity getters.
- Automated arc test: `test-demo.mjs` (Playwright) drives the full session and screenshots every phase; keep it passing.

---

## 11. Proposed build phases (refine in your plan)

1. **Refactor** the single file into modules with a bundled single-file output for the browser demo (keep the zero-dependency deploy).
2. **Juice pass** on the core verbs — priority order: object pickup/settle weight → drawer glide+thunk → hop/moor feel → wipe & sign ceremony → per-object micro-behaviors (mug steam, watch tick that stops when stored).
3. **Remix system** — date-seeded nightly variation (weather, moon phase, species/object sets) + room-remembers persistence (localStorage in browser; App Group storage on iOS).
4. **Morning dawn** — dawn renderer over the persisted scene + share/save image.
5. **Capacitor shell** — haptics, brightness, notifications; **start the FamilyControls entitlement application immediately**; the Wall ships behind it.
6. **Hardening** — perf on older phones, reduced-motion path, VoiceOver on DOM surfaces, offline PWA.

---

## 12. Interview UD before coding — ask exactly these

1. **Art direction:** keep/polish the current procedural warm-dark canvas · illustrated sprite upgrade · commission an artist later — trade-offs on cost, feel, and timeline.
2. **Audio:** stay fully procedural · add composed ambient loops · hybrid (procedural bed + composed accents).
3. **The Wall's shape:** which apps get suggested for blocking by default; bedtime typed by user vs. read from iOS Sleep Schedule; what the single "not now" screen looks like.
4. **Room-remembers depth:** exactly what persists and for how long before fading.
5. **Dawn share format:** still image only · subtle looping live-photo-style clip.
6. **Real-pacing length:** 12 / 15 / 20 min, and whether Act III may extend silently if the user is still touching (I recommend a hard cap regardless — cite King 2013 dose effects).
7. **Anything in the current file you'd change first** — name it, with options.

Then: Must/Should/Could plan → sign-off → slices.

---

## 13. Language that must survive every rewrite

- "Nothing to win. Nothing tracked. Nothing you can do wrong."
- The end card's first line: "The session is over. That's the point."
- The disclaimer: behavioral outcomes, 13+, not a treatment for insomnia, CBT-I referral.
- Never: sleep scores, streak language, "you missed a night," dopamine-marketing copy.
