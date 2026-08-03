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
| Can a bedtime screen game cause sleepiness or improve sleep onset? | Small laboratory game studies generally found reduced sleepiness or slightly longer sleep-onset latency after stimulating play; no study tested Nindova or a low-arousal Mahjong-solitaire design. | Treat bedtime gaming as a possible arousal and time-displacement risk. | “Makes you sleepy,” “fall asleep faster,” or “improves sleep.” |
| Do display light and bedtime media matter? | Controlled light studies show that evening melanopic exposure can suppress/delay melatonin and lengthen sleep onset; effects vary with dose, duration, timing, prior light, and individual sensitivity. In-bed interactive use is associated with later sleep and less sleep in youth. | Dim, low-melanopic, short, pre-bed use; do not play after attempting sleep. | A dark CSS palette makes a screen sleep-safe or cancels the effect of continued use. |
| Can cognitive distraction help sleep onset? | One 41-person insomnia experiment found shorter self-reported onset after pleasant imagery distraction. A systematic review found that cognitive manipulations can help, do nothing, or harm. Serial diverse imagining has only preliminary conference-level evidence. | Explore a separate, optional screen-away imagery transition as a hypothesis. | Visible tile matching is equivalent to imagery distraction or a validated insomnia technique. |
| Does pair matching or Mahjong solitaire improve memory? | A small trial in older adults with subjective cognitive decline found practice gains on a trained visual pair-matching task, but no transfer to a standardized visual-memory measure. Traditional social Mahjong evidence concerns older adults and repeated multiweek play, not solitaire. | Say the game uses pair recognition, visual search, and planning. | “Improves memory,” “trains your brain,” prevents decline, or transfers traditional Mahjong findings to solitaire. |
| Can match animations be said to increase dopamine? | Dopamine participates in reward learning, and one PET study detected striatal dopamine release during a goal-directed video game. No evidence isolates a tile animation, a “crumple,” or Nindova's feedback. | Test whether deterministic feedback feels clear and satisfying. | “Dopamine hit,” “boosts dopamine,” or any neurochemical benefit claim. |
| Do free, open-source, offline, or QR delivery establish efficacy? | These are distribution, licensing, and architecture choices, not health interventions. | Reduce access friction, make inspection possible, and support local availability/privacy when implemented as stated. | Sleep, memory, dopamine, or safety efficacy. |

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

The clearest avoidable product risk is keeping someone engaged when they otherwise would attempt sleep. The American Academy of Sleep Medicine advises a regular wind-down routine and avoiding sleep-disrupting electronics near bedtime ([AASM sleep guidance](https://aasm.org/resources/pdf/products/howtosleepbetter_web.pdf)). The American Academy of Pediatrics' current policy says to protect children's sleep by avoiding screen exposure for an hour before bedtime and devices in the bedroom ([AAP policy statement](https://publications.aap.org/pediatrics/article/157/2/e2025075320/206129/Digital-Ecosystems-Children-and-Adolescents-Policy)). Nindova should initially be positioned for adults, not children.

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
- Position the research version for adults. Pediatric use requires separate evidence, consent, safeguarding, and age-appropriate testing.

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
