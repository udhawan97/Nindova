# Bedtime game evidence brief

> Research status: evidence boundary for a proposed free, open-source, Mahjong-solitaire-inspired bedtime web app. Updated 2026-08-03. This is a targeted evidence review, not a systematic review or clinical recommendation.

## Executive decision

There is **no direct evidence** that a Mahjong-solitaire game, a visible pair-matching game, or Nindova's current experience makes people sleepy, shortens sleep onset, improves sleep, improves general memory, or produces a useful “dopamine effect.” Those outcomes must not be promised.

The evidence does support a narrower design direction: if a person chooses a screen-based activity before bed, reduce light and arousal, prevent unbounded play, avoid variable rewards and time pressure, make stopping effortless, and end by moving attention away from the screen. A game built to those constraints can honestly be described as **a puzzle designed for a calm, bounded wind-down**, not as a sleep or memory intervention.

**Product decision:** use a deterministically solvable stacked layout, restrained and predictable match feedback, and an off-screen ending. Do not promote replay on the completion card. If the person deliberately reopens Nindova later that night, intake may offer **Start another quiet board**; that action starts a separately bounded Session.

Free access and a direct QR destination reduce access friction. Publicly licensed source and corresponding builds make inspection possible. Offline/local operation supports privacy and availability. None establishes health efficacy or guarantees safety.

## Scope and method

This review prioritizes peer-reviewed original human studies, systematic reviews, and guidance from the bodies that own it. It distinguishes:

- direct evidence about the tested activity and population;
- indirect evidence that can inform safer design; and
- hypotheses that Nindova would still need to test.

The searches found no peer-reviewed trial of **Mahjong solitaire** for sleep onset or memory. Absence from a targeted search is not proof that no study exists, but it prevents an efficacy claim.

## Evidence at a glance

| Question | Best available evidence | What it supports | What it does not support |
| --- | --- | --- | --- |
| Why does sufficient sleep matter? | CDC lists 7 or more hours for adults aged 18–60 and 8–10 hours for ages 13–17; NHLBI says sleep deficiency can impair learning, focus, reaction, decision-making and emotional regulation and is linked with chronic health and safety risks. | Put short, attributed sleep-health facts in optional educational surfaces outside the nightly Session. | Scaring, diagnosing, or telling an individual what caused a symptom. Population associations are not personal predictions. |
| Can a bedtime screen game cause sleepiness or improve sleep onset? | Small laboratory game studies generally found reduced sleepiness or slightly longer sleep-onset latency after stimulating play; no study tested Nindova or a low-arousal Mahjong-solitaire design. | Treat bedtime gaming as a possible arousal and time-displacement risk. | “Makes you sleepy,” “fall asleep faster,” or “improves sleep.” |
| Do display light and bedtime media matter? | Controlled light studies show that evening melanopic exposure can suppress/delay melatonin and lengthen sleep onset; effects vary with dose, duration, timing, prior light, and individual sensitivity. In-bed interactive use is associated with later sleep and less sleep in youth. | Dim, low-melanopic, short, pre-bed use; do not play after attempting sleep. | A dark CSS palette makes a screen sleep-safe or cancels the effect of continued use. |
| Can cognitive distraction help sleep onset? | One 41-person insomnia experiment found shorter self-reported onset after pleasant imagery distraction. A systematic review found that cognitive manipulations can help, do nothing, or harm. Serial diverse imagining has only preliminary conference-level evidence. | Explore a separate, optional screen-away imagery transition as a hypothesis. | Visible tile matching is equivalent to imagery distraction or a validated insomnia technique. |
| Can relaxation or cognitive offloading be a post-game layer? | AASM conditionally suggests relaxation therapy for diagnosed adult chronic insomnia; small laboratory studies found favorable effects for progressive muscle relaxation and a five-minute written to-do list. Slow-breathing evidence is stronger for short-term psychophysiological relaxation than for sleep onset. | Test a finite, optional, non-clinical transition that ends off-screen. | That a mini-exercise treats insomnia, works for everyone, or inherits the evidence for a clinician-delivered intervention. |
| Should Nindova add rankings, weekly stats, streaks, or random rewards? | No trial tests these mechanics in a bedtime Mahjong game. Indirect experiments show competition can raise cardiovascular arousal, leaderboards drive social comparison, uncertain rewards increase effort, and streak mechanics are built to increase persistence. A three-patient case series describes sleep-tracker fixation worsening sleep concerns. | Exclude performance comparison and retention mechanics from bedtime play; keep challenge user-chosen and non-evaluative. | That any one metric necessarily harms every user, or that its removal alone improves sleep. |
| Does pair matching or Mahjong solitaire improve memory? | A small trial in older adults with subjective cognitive decline found practice gains on a trained visual pair-matching task, but no transfer to a standardized visual-memory measure. Traditional social Mahjong evidence concerns older adults and repeated multiweek play, not solitaire. | Say the game uses pair recognition, visual search, and planning. | “Improves memory,” “trains your brain,” prevents decline, or transfers traditional Mahjong findings to solitaire. |
| Can match animations be said to increase dopamine? | Dopamine participates in reward learning, and one PET study detected striatal dopamine release during a goal-directed video game. No evidence isolates a tile animation, a “crumple,” or Nindova's feedback. | Test whether deterministic feedback feels clear and satisfying. | “Dopamine hit,” “boosts dopamine,” or any neurochemical benefit claim. |
| Do free, open-source, offline, or QR delivery establish efficacy? | These are distribution, licensing, and architecture choices, not health interventions. | Reduce access friction, make inspection possible, and support local availability/privacy when implemented as stated. | Sleep, memory, dopamine, or safety efficacy. |

## 0. Why sleep matters—and how to say it without fear

The [CDC age table](https://www.cdc.gov/sleep/about/index.html) lists **8–10 hours** for ages 13–17, **7 or more hours** for adults 18–60, **7–9 hours** for ages 61–64, and **7–8 hours** for ages 65 and older. These are population recommendations, not a score that Nindova can calculate for an individual. The [AASM/Sleep Research Society consensus](https://www.aasm.org/resources/pdf/adultsleepdurationconsensus.pdf) says adults should regularly sleep seven or more hours to promote optimal health and notes that individual circumstances vary.

The [NIH/NHLBI health-effects summary](https://www.nhlbi.nih.gov/health/sleep-deprivation/health-effects) says sleep deficiency can impair learning, focusing, reaction time, decision-making, problem-solving, memory, emotional regulation and safety; ongoing deficiency is linked with chronic physical and mental health problems. These are broad health relationships, not proof that one short night causes disease or that an app can prevent it.

**Copy decision:** place one optional, attributed, plain-language fact on the public site or morning reading surface—not between pairs, on the completion card, or as a warning. Prefer “Sleep helps attention, learning, mood and physical health” over a rotating catalogue of frightening disease outcomes. Link to CDC/NHLBI, add “needs vary,” and never infer a user's sleep amount or health state.

## 1. Interactive screen games and sleepiness

The direct evidence does not show that gaming is a reliable route to sleepiness.

- In a randomized laboratory crossover with **seven young adult men**, 2 hours 45 minutes of an exciting computer game increased heart rate, reduced subjective sleepiness and sleep-related theta activity, lengthened sleep latency, and shortened REM sleep relative to low-load tasks. Display brightness changed heart rate but not the measured sleep variables in this very small, late-night protocol ([Higuchi et al., 2005](https://pubmed.ncbi.nlm.nih.gov/16120101/)).
- In a counterbalanced laboratory study of **13 male adolescent evening types**, 50 minutes of a stimulating game produced a statistically significant but small increase in median sleep-onset latency—**7.5 minutes versus 3 minutes** after a documentary—and reduced subjective sleepiness. Sleep architecture did not differ ([Weaver et al., 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2854707/)).
- A repeated-measures cohort of **79 youths aged 11–14** found that screen use during the two hours before bed was not associated with most sleep measures, but interactive screen use **once in bed** was associated with later sleep onset and less total sleep. Gaming estimates were based on only ten participants, so the result is informative but not a general causal estimate ([Brosnan et al., 2024](https://jamanetwork.com/journals/jamapediatrics/fullarticle/2822859)).
- In a laboratory study of **32 healthy young adults** where blue-light effects were excluded, 30 minutes of social-media use did not significantly disturb objective or subjective sleep; progressive muscle relaxation reduced pre-sleep heart rate and improved several sleep measures. This cautions against treating all screen content as biologically identical, while still leaving time displacement as a concern ([Combertaldi et al., 2021](https://pubmed.ncbi.nlm.nih.gov/34627122/)).

These studies are small, use different content and populations, and do not test a calm matching puzzle. They show uncertainty plus plausible downside—not proof that every game harms sleep. Nindova therefore needs its own human study before making a sleep-onset claim.

## 2. Evening light, arousal, and media displacement

### Light

- In a randomized crossover inpatient study of **12 healthy young adults**, reading a light-emitting e-reader for about four hours before bed on five evenings suppressed evening melatonin by about 55%, delayed melatonin onset by more than 1.5 hours, and increased polysomnographic sleep latency by about 10 minutes compared with a printed book ([Chang et al., 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4313820/)). The exposure was much longer than a bounded Nindova session.
- In a study of **72 healthy men**, participants were assigned to one of four luminance groups and each completed balanced low- and high-melanopic conditions. The sleep-latency contrast was significant only at the highest luminance, and melatonin onset differed in three of four groups; dose-response analyses across condition means nevertheless supported greater sleep latency and melatonin disruption with greater melanopic exposure ([Schöllhorn et al., 2023](https://doi.org/10.1038/s42003-023-04598-4)).
- Human circadian responses vary widely: in a controlled dose-response study, some participants showed more than 50% melatonin suppression at 10 lux while another required 400 lux ([Phillips et al., 2019](https://doi.org/10.1073/pnas.1901824116)).

A warm, dim visual system is a reasonable risk reduction, but CSS colors alone cannot determine the light reaching a person's eyes. Actual device brightness, spectrum, viewing distance, exposure duration, prior daytime light, and individual sensitivity matter.

### Cognitive and emotional arousal

Stimulating game studies show reduced subjective sleepiness or small latency changes, but arousal is content- and person-dependent. It should not be reduced to “screens wake everyone” or “calm visuals make everyone sleepy.” For Nindova, challenge should come from quiet spatial planning, not speed, threat, loss, escalating difficulty, competitive comparison, or surprise.

### Time displacement and bedtime boundaries

The clearest avoidable product risk is keeping someone engaged when they otherwise would attempt sleep. The American Academy of Sleep Medicine advises a regular wind-down routine and avoiding sleep-disrupting electronics near bedtime ([AASM sleep guidance](https://aasm.org/resources/pdf/products/howtosleepbetter_web.pdf)). The American Academy of Pediatrics' current policy says to protect children's sleep by avoiding screen exposure for an hour before bedtime and devices in the bedroom ([AAP policy statement](https://publications.aap.org/pediatrics/article/157/2/e2025075320/206129/Digital-Ecosystems-Children-and-Adolescents-Policy)). Nindova's immutable eligibility line remains 13+, but it must not be marketed to adolescents as a sleep or cognitive intervention. Any outcome research should begin with consenting adults; pediatric research would require separate evidence and safeguards.

For persistent insomnia, the evidence-based clinical route is not a game. The AASM recommends multicomponent cognitive behavioral therapy for insomnia (CBT-I) for chronic insomnia in adults; sleep hygiene alone is not recommended as a standalone treatment ([AASM clinical practice guideline](https://pmc.ncbi.nlm.nih.gov/articles/PMC7853203/)). Nindova should never advise a person with persistent sleep difficulty to keep playing or imply that another board is treatment; it should point them toward qualified care without diagnosing them.

## 3. Cognitive distraction and serial diverse imagining

There is a plausible but narrow signal for off-screen imagery—not for visible matching.

- In one experiment, **41 people with insomnia** received imagery-distraction instructions, general-distraction instructions, or no instructions for one night. The pleasant, engaging imagery group reported shorter sleep-onset latency and less distressing pre-sleep cognition than the no-instruction group ([Harvey & Payne, 2002](https://pubmed.ncbi.nlm.nih.gov/11863237/)). It was a small, brief study and relied on an internally generated imagery task.
- A systematic review of pre-sleep cognition concluded that insomnia is associated with worry, planning, monitoring, and cognitive arousal, but experimental strategies including imagery and distraction produced **beneficial, negligible, or detrimental** effects depending on the intervention ([Lemyre et al., 2020](https://doi.org/10.1016/j.smrv.2019.101253)).
- “Serial diverse imagining” or the “cognitive shuffle” has a randomized study reported as a **2016 conference poster**, not a full peer-reviewed trial. It compared serial imagery, structured problem-solving, and their combination in 154 university students with self-reported pre-sleep arousal. The reported improvements were within-person changes from baseline across three active groups; there was no untreated control, so the design could not isolate an intervention effect ([conference abstract](https://www.sleepmeeting.org/wp-content/uploads/2018/10/abstractbook2016.pdf)). An earlier one-page interim conference abstract also did not establish efficacy ([Digdon & Beaudoin, 2015](https://escholarship.org/uc/item/5jx7k12g)). The intervention's creator coauthored both reports, and both disclose an affiliation with the company behind the app. This remains preliminary, non-independent evidence—not validation of a sleep app.

Mahjong-solitaire matching differs materially: the images remain on a luminous screen; the player pursues a coherent goal; and stack planning can increase alertness. It cannot inherit the imagery evidence. A separate optional ending that asks the user to put the phone down and imagine a few neutral, unrelated kitchen objects could be tested, but must be labeled an experiment until evaluated.

## 4. Memory evidence: pair matching is not general memory improvement

The closest direct evidence supports task practice, not broad transfer.

- A 2025 single-blind randomized study assigned **53 adults with subjective cognitive decline** (mean age about 73) to 20 daily sessions of olfactory or visual pair matching. The visual-training arm had only **17 participants**. It improved performance on the trained visual matching task immediately and one month later, but did **not** show transfer to the standardized CANTAB Paired Associates Learning measure. The authors framed the visual condition as a comparator, not proof that one short game improves everyday memory ([Burke et al., 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12238897/)).
- In a six-week randomized online study of **11,430 adults**, people improved on the cognitive tasks they repeatedly practised but not on independent benchmark tasks. The training battery included a card-location matching task; its improvement did not transfer to the closely related paired-associates benchmark ([Owen et al., 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2884087/)).
- A 2024 scoping review found 53 studies of **traditional Mahjong in older adults**, 47 of them observational and six intervention studies. Most intervention programs involved repeated one-hour social play over 12 or 16 weeks, often in people with mild cognitive impairment or dementia. The review calls for more randomized trials and does not establish benefits for Mahjong solitaire ([Tse et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11436455/)).

Nindova's standard visible-tile format primarily uses recognition, visual search, rule use, and spatial planning—not recall of hidden locations. An optional future reveal-and-recall mechanic could be studied as a research hypothesis; even then, the honest claim would be that the task **uses visual recall**, not that it improves memory outside the game.

## 5. Why “dopamine effect” is not supportable

Dopamine is involved in learning, motivation, movement, attention, and reward prediction; it is not a synonym for pleasure or good design. Classic work describes dopamine-neuron activity in relation to changes in predicted reward ([Schultz, Dayan & Montague, 1997](https://pubmed.ncbi.nlm.nih.gov/9054347/)). A small PET study found striatal dopamine release while participants performed a goal-directed video game ([Koepp et al., 1998](https://doi.org/10.1038/30498)). Neither study isolates interface animation, proves that more dopamine is desirable, or connects dopamine release to sleep readiness.

A brief crumble, settle, glow, or soft sound can be designed as **immediate sensory confirmation** and tested for clarity and subjective satisfaction. Calling it a dopamine hit would require direct neurochemical measurement of the exact feature and would still not establish a health benefit. Maximizing reward pursuit would also conflict with the goal of easy stopping.

## 6. Why rankings, streaks and weekly performance are the wrong layer

No study located in this targeted review randomized people to rankings, streaks or weekly game statistics in a pre-sleep Mahjong-solitaire app and then measured sleep. The decision therefore rests on indirect mechanism evidence plus Nindova's stopping objective:

- In an experiment using a car-racing game, competition produced larger increases in heart rate and blood pressure than cooperative or solo play ([Harrison et al., 2001](https://pubmed.ncbi.nlm.nih.gov/11446573/)). It does not prove that a quiet personal best causes the same response, but it makes competitive bedtime framing a poor default.
- Leaderboards are not neutral summaries: experiments explicitly use them to induce social comparison and increase intended behavior ([Zhang, van Horen & Zeelenberg, 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8046219/)). A 2026 randomized trial with 10,000 students found that a leaderboard contest with prizes increased app engagement during the contest and that some engagement persisted afterward ([Palikot et al., 2026](https://link.springer.com/article/10.1007/s11129-026-09311-3)). Those are useful outcomes for education platforms and the opposite of an effortless bedtime exit.
- Streak incentives are designed to increase persistence ([Mehr et al., 2025](https://doi.org/10.1016/j.obhdp.2025.104391)). Nindova should not manufacture a loss that can occur when someone sensibly chooses sleep instead of the app.
- In four experiments, uncertainty about a reward increased time, effort or money invested in pursuing it, under specified conditions ([Shen, Fishbach & Hsee, 2015](https://doi.org/10.1086/679418)). Experiments with loot-box videos found rare randomized rewards produced greater arousal and urge to open another box ([Larche et al., 2021](https://link.springer.com/article/10.1007/s10899-019-09913-5)). Nindova is not a loot-box game, but the evidence supports avoiding surprise payouts, rare animations and variable reward schedules.
- A clinical case series of three patients described sleep-tracker data intensifying preoccupation or unhelpful efforts to perfect sleep ([Baron et al., 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5263088/)). This is low-level evidence and is about sleep metrics rather than puzzle performance, but it reinforces the risk of turning bedtime into a graded optimization task.

**Decision:** do not add a weekly rank, score, personal best, streak, sleep score, improvement chart, achievement, move count or comparative statistic. They conflict with the existing product contract and would make continued use—not restful closure—the measured success.

**Safe version of difficulty choice:** after an ADR updates the current no-levels boundary, offer two stable, non-judgmental board profiles at intake, such as **Gentle stack** and **Deeper stack**. Both must be deterministically solvable, use the same rule, fit the same hard Session cap, carry no unlock, and lead to the same ending. “Deeper” can increase meaningful occlusion and safe look-ahead; it must not add time pressure, failure, hidden randomness or an after-the-fact grade. The choice is a preference for tonight, not evidence of ability or improvement.

## 7. Candidate post-board transitions

Each candidate is optional, finite, deterministic, local/offline, and completable without sound, motion, precise movement or vision. None should appear as another score-bearing “level.” Adding one after the current end card changes the approved one-game/one-exit boundary and requires an ADR plus owner review before implementation.

| Candidate | Exact bounded interaction | Evidence and limitation | Product fit |
| --- | --- | --- | --- |
| **Rasoi Image Drift** — recommended hypothesis | Show three familiar kitchen-object names from the completed board in a fixed order. Then display “Put the phone down. Picture each one somewhere quiet. Stop whenever you like.” The screen dims and closes; no response is collected. | A one-night experiment with 41 people with insomnia found favorable self-reported sleep-onset and cognition results for pleasant imagery distraction ([Harvey & Payne, 2002](https://pubmed.ncbi.nlm.nih.gov/11863237/)); a broader review found cognitive manipulations could help, do nothing or harm ([Lemyre et al., 2020](https://doi.org/10.1016/j.smrv.2019.101253)). This exact activity is untested. | Best fit because it uses the board's existing vocabulary and deliberately moves attention off-screen. Provide **Skip and rest**; never call it a cognitive shuffle or sleep technique. |
| **Shelf Tomorrow** | Offer a single card: “On paper, write the next few things you do not want to carry tonight. Then set the paper down.” No text field, storage, reminder or completion check. | In a sleep-laboratory experiment, 57 healthy adults randomized to write a five-minute future to-do list fell asleep faster than those writing completed activities ([Scullin et al., 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5758411/)). One small study does not establish an app feature, and paper differs from screen typing. | Strong privacy and screen-away fit; weakest “game” fit. The app should not collect sensitive tasks or turn them into tomorrow's obligation list. |
| **Quiet Body Shelf** | Four self-paced text prompts invite the person to notice and gently release jaw, shoulders, hands and legs. Each prompt has **Next**, **Finish**, and **Skip**; no forceful tensing, breath hold or completion measurement. | AASM conditionally suggests relaxation therapy for adults with chronic insomnia, while recommending multicomponent CBT-I more strongly ([AASM guideline](https://pmc.ncbi.nlm.nih.gov/articles/PMC7853203/)). In 32 healthy young adults, 30 minutes of progressive muscle relaxation reduced pre-sleep heart rate and improved several sleep measures relative to a neutral night ([Combertaldi et al., 2021](https://pubmed.ncbi.nlm.nih.gov/34627122/)). Nindova's four prompts would be a much smaller, unvalidated adaptation. | Feasible and accessible as text, but more clinical-sounding and more likely than imagery to be interpreted as treatment. Use ordinary “unclench/let rest” language and a discomfort warning. |

Slow-paced breathing is a possible later research branch, not the first post-board layer. A systematic review found autonomic and subjective-relaxation signals across heterogeneous slow-breathing studies ([Zaccaro et al., 2018](https://pubmed.ncbi.nlm.nih.gov/30245619/)), but this is not direct evidence for sleep onset. Visual pacing also keeps the screen active, and breath instructions can be uncomfortable or inappropriate for some users. If tested, it should use comfortable, unforced breathing, no breath holds, a plain-text alternative, and immediate skip.

## 8. Open-source reference-product scan

This scan extracts mechanics only. It is not permission to copy art, sound, copywriting or layout files; those need asset-level license verification.

| Reference | License / first-party evidence | Worth borrowing | Explicitly reject or quarantine |
| --- | --- | --- | --- |
| [KMahjongg](https://apps.kde.org/en-gb/kmahjongg/) | KDE identifies the app as GPL-2.0+ and links its [source](https://github.com/KDE/kmahjongg) and handbook. | Clear stacked depth, tiles disappearing to expose those below, and selectable authored board layouts. | Do not copy GPL code or per-file assets into Apache-2.0 Nindova without a deliberate compatibility/compliance review. Do not import its competitive framing. |
| [GNOME Mahjongg](https://apps.gnome.org/Mahjongg/) | Official GNOME page and [GPL-2.0 source](https://github.com/GNOME/gnome-mahjongg/blob/main/COPYING). | Easy-to-understand free-tile rule, visibly different starting layouts, and a hint when stuck. | Reject its time objective, hint penalty and fastest-time framing. Reimplement the general game rule independently; do not copy its tiles or code. |
| [Mah](https://github.com/ffalt/mah) | MIT code; the first-party README documents seeded boards, three difficulty levels, Zen mode, local save and optional feedback. | Seeded/replayable layouts, user-selected difficulty, a distraction-reduced mode, local-only state, and explicit effect toggles. | Reject endless random generation, best times, timer and confetti. Its [asset ledger](https://github.com/ffalt/mah/blob/main/src/assets/svg/README.md) mixes CC BY, CC BY-SA, GPL, public-domain and unclear entries; copy no asset without individual clearance and attribution. |
| [Breathly](https://github.com/mmazzarolo/breathly-app) | MPL-2.0 code; its README describes finite guided breathing and discloses commissioned voice lines. | One obvious start, a finite sequence, self-paced technique choice and minimal chrome. | Do not copy code without MPL review or copy its audio/wording; the voice recordings are not offered under the code license. Breathing mechanics are not proof of a sleep effect. |
| [Medito](https://github.com/meditohq/medito-app) | The app is AGPL and free without an account, but Medito's [license page](https://meditofoundation.org/license/) says its meditation content is proprietary/custom licensed. | Free/no-account positioning and a clear separation between app shell and guided content. | Do not copy code, scripts, audio or meditation text. Its production services and licensed content do not fit Nindova's zero-third-party-runtime constraint; treat it only as a product-structure reference. |

## 9. Provenance, licensing and runtime rule

- Keep Nindova under its existing [Apache License 2.0](../../LICENSE). Reimplement general mechanics in the existing codebase; do not paste GPL, AGPL or MPL source into it without a separate legal/compatibility decision.
- Add no runtime API, CDN, account, analytics, ad network, remote audio stream, hosted font, external image, or third-party SDK. The production Session must remain same-origin, static, offline-capable and app-telemetry-free.
- Prefer hand-authored kitchen illustrations and CSS/Canvas effects committed to the repository. Record author, source, modification status and license in `apps/session/assets/README.md`; Punjabi-inspired motifs still require human cultural review before any authenticity claim.
- Keep the current Geist and Newsreader font files under the SIL Open Font License and preserve [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md) plus the shipped license texts. Recommend no additional font.
- Generate the brief match tone with the existing Web Audio code so it has no third-party recording dependency. If a recorded sound is ever added, require original commissioned work with written redistribution rights or a verified CC0 source stored locally; preserve proof and attribution. “Free to download” is not a redistribution license.
- Research papers, government pages and product screenshots are citation sources, not an asset library. Link and paraphrase within quotation limits; do not redistribute figures, screenshots, app copy, meditation scripts or audio merely because they are viewable without payment.
- A free tier is not a durable open-source dependency or an offline guarantee. Any build tool, asset source or library added later needs a pinned version, SPDX-compatible license, notice entry and a build that succeeds without a paid account. No recommended product feature in this brief requires a third-party service.

## Conservative product constraints

### Session and stopping

- Keep every independently started Session bounded, with a hard automatic close within 15 minutes. The cap overrides board completion: if the board remains incomplete, settle it without loss or failure language.
- Fully settle at completion or the hard cap, then make **Put it down** the completion-card action. Preserve the immutable end-card language and do not promote replay there.
- If the person deliberately reopens Nindova later that night, intake may offer **Start another quiet board**. It starts a new independently bounded Session and returns to full settlement afterward. Do not autoplay it, label it “one more,” attach carryover progress, add unlocks or saved-availability cues, or create any other return pressure. A direct completion-card replay control would be a product-boundary change requiring an ADR and user evidence before implementation.
- Preserve **Not now** and same-night return. Allow interruption and local resume without guilt or missed-night language.
- Do not use visible timers, move counts, scores, streaks, levels, achievements, leaderboards, daily obligations, ads, notifications, loot, or variable/random rewards.

### Challenge

- Use genuine stacked occlusion and a solvable removal order so attention and planning are real, while avoiding unwinnable deals. A traditional-style availability rule combines overlap blocking with lateral access; if Nindova uses a simpler documented rule, it should still make overlap consequential and prove every generated layout solvable.
- Offer stable, user-chosen layout styles or stack densities; keep them solvable and non-unlocking, and do not escalate difficulty to retain attention.
- Avoid time pressure, precision gestures, punitive mistakes, loss states, or dramatic warnings.
- Treat “more challenge feels calmer” as a user-research question, not a scientific assumption.

### Match feedback

- Give every correct pair a short, deterministic, low-amplitude response: for example, a quiet tile settle/crumble and gentle opacity fade.
- Keep feedback local to the selected tiles; prohibit strobing, particle bursts, screen-wide explosions, confetti, flashing, camera shake, reward meters, and unpredictable variants.
- Motion, sound, and haptics must be optional and never required. Sound and haptics remain off by default. Reduced-motion mode removes spatial crumble, scale, and rotation and substitutes an immediate state change or brief opacity transition.
- W3C guidance says interaction-triggered nonessential animation must be disableable at WCAG 2.2 AAA and recommends respecting `prefers-reduced-motion` ([WCAG 2.2, SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)). When audio autoplays for more than three seconds, WCAG 2.2 SC 1.4.2 requires a mechanism to pause or stop it, or to control its volume independently of system volume; its informative guidance discourages autoplay generally ([WCAG 2.2, SC 1.4.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-control)).

### Light and transition away from the screen

- Use a dark, warm, low-luminance palette while preserving sufficient text, focus, and control contrast, and ask the user to lower device brightness. Never claim this removes blue-light or circadian effects.
- Do not require the game to be played in bed. Frame it as a short activity before the user attempts sleep.
- After a board, reduce screen information rather than presenting a stimulating results page.
- Offer an optional screen-away close: put the phone face down, then continue with silence or a short user-initiated, auto-ending neutral-imagery audio. This is a design hypothesis, not a sleep treatment.

### Accessibility and trust

- Keep audio, haptics, animation, precise movement, and vision optional for completion.
- Preserve keyboard and screen-reader operation, visible focus, large targets, contrast, zoom, and reduced-motion behavior.
- Keep state local, app-controlled telemetry at zero, and runtime resources static and same-origin. A static host may still retain operational request logs, so do not promise that infrastructure outside the app records nothing.
- Make source available for inspection under an explicit open-source license, publish dependency notices, and provide corresponding build artifacts. Availability of source does not guarantee audit or safety.
- A QR code should resolve directly to the canonical HTTPS app, with no redirect shortener, campaign parameters, third-party resources, analytics, or request for camera permission from the app itself. Print the canonical URL as a fallback.
- Begin any efficacy or outcome research with consenting adults. The existing 13+ product boundary carries no pediatric sleep or cognitive claim; pediatric research requires separate evidence, consent, safeguarding, and age-appropriate testing.

## Claim language

### Allowed when the implementation is true

- “A bounded matching puzzle designed for a short, calm wind-down.”
- “Gives your attention one simple, neutral task before you put the screen down.”
- “Uses pair recognition, visual search, and spatial planning.”
- “Includes dim, muted, and reduced-motion options intended to reduce stimulation.”
- “Free and open source. No account, ads, app telemetry, scores, or streaks.” This is allowed only while an explicit open-source license, public source, dependency notices, and corresponding build artifacts are actually available.
- “Not a sleep treatment, sleep tracker, or test of memory.”

### Not supported

- “Makes you sleepy,” “helps you fall asleep faster,” or “improves sleep.”
- “Treats insomnia,” “based on CBT-I,” or “clinically proven.”
- “Improves memory,” “trains your brain,” “prevents cognitive decline,” or “makes you sharper.”
- “Boosts dopamine,” “gives a dopamine hit,” or “activates the reward center.”
- “Blue-light safe,” “melatonin friendly,” or “screen-safe at bedtime.”
- Any sleep score, sleep-quality prediction, performance grade, or claim about a particular person's physiology.

## Evidence gaps and validation path

Before changing the claim boundary, Nindova would need:

1. A preregistered, adequately powered randomized crossover study of the exact production game, with a credible low-arousal control and a no-screen comparator.
2. Objective sleep-onset measurement—polysomnography or a validated sleep EEG method—plus subjective sleepiness and pre-sleep arousal. Engagement time and actual melanopic light exposure should be measured.
3. Direct comparison of flat versus stacked layouts and subdued versus animated feedback. Define success through match clarity, subjective satisfaction and arousal, voluntary stopping, session continuation, bedtime displacement, and adverse motion responses—not dopamine.
4. A repeat-session experiment to determine whether “another board” causes bedtime displacement even when each board is bounded.
5. A separate multiweek memory study with an active control and independent, untrained memory outcomes. Sleep and memory hypotheses should not be combined into one success claim.
6. Real-device accessibility testing and facilitated adult user research, including people who experience photosensitivity, vestibular sensitivity, or ADHD. Every human study requires prior independent ethics review, informed consent, risk and adverse-event procedures, and research-data governance; vulnerable groups require additional safeguards and appropriate clinical oversight. Research data collection and retention must live in a separate opt-in research build and must not weaken the production app's zero-telemetry, local-state boundary.

Until then, the scientifically honest target is **a satisfying puzzle that is deliberately easier to stop**, followed by a screen-away transition—not a game proven to produce sleep, memory gains, or dopamine.
