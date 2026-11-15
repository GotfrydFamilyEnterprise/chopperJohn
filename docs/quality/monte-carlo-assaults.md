# Monte Carlo assault policy study — issue40 (PL-10)

This is an opt-in research policy and a reproducible real-engine study, stacked on the separately unmerged paid-fixture PR35. Default production doctrines are unchanged. The user authorized investigating rules that improve assault success; this study does not automatically enable a candidate in the game.

## Desired outcomes, declared before holdout evaluation

| Situation | Initial design target | First-story coverage |
|---|---|---|
| Equal-cost open battle, useful doctrine choice |60–70% attacker wins|Not evaluated here|
| Five-person3R2K attack on a staffed FOB |20–40% captures|Ordinary case:195 attacking Supply|
| Prepared seven-person3R4K attack on a staffed FOB |55–70% captures|Prepared case:315 attacking Supply|
| Prepared assault with useful limited helicopter support |75–85% captures|Not evaluated here; future issue26 study|
| Continuous paid garrison replacements |Defense should remain useful; no automatic superiority target|Supplied seven-person case reports its own outcomes/costs|

These are starting product goals, not measured results or permission to force success. The defender's2R1K costs110 plus its fortification advantage; this is not an equal-cost field fight. A viable defense/counterstrategy must remain. Higher success cannot hide excessive spending, slow completion, reckless casualties or stalled games. Helicopter and terrain conclusions require their own small studies. No actor gets extra HP, accuracy, damage, fire rate or income.

## Policy and experiment

Candidate reserve policies keep the sergeant600/640/680 units behind an unsafe FOB, capture rifles180–220 behind him and rockets80–160 ahead (interpolated for larger rosters). They hold rifle commitment while defenses remain or a living owner is within the58-unit capture interior. After breach and clearance, normal physical capture/formation orders resume. This tests a context-specific alternative to sending the rifle screen first. It does not change225 minimum/height-dependent trajectories, weapon statistics,20 defense hits,5s capture, normal AA,60/80 retreat or ordinary paid recruitment. A suppressed rocket group can still lose/withdraw; a surviving sergeant still cannot capture.

All trials use the actual Campaign world, shared platoon controller and paid HQ fixture. Both accounts start120, earn5/s to240, pay25/60, respect2s spacing/15 cap, and receive no initial free infantry in this fixture. Initial attackers physically assemble identically under every policy before its experimental orders activate; defenders physically staff the FOB. Report preparation time and full paid spending, without adding initial value again. The supplied case permits normal same-type replacements; leader loss cancels platoon resupply. It is a single-wave episode, not an entire campaign or symmetric replacement policy.

Success means actual ownership transfer by240 simulation seconds, including preparation. Breach without capture, elimination/mutual and unfinished timeouts are distinct. This is one flat layout with a fixed force composition per case. The Monte Carlo distribution varies combat RNG only; it does not yet randomize terrain, human decisions or economy. Identical seeds/configurations match starting conditions across policies; changed event scheduling consumes RNG differently, so individual shots do not retain identical random draws.

Screen: prepared attack, seeds201–208, three reserve spacings and both paired faction directions. A prior32-run2-seed diagnostic also checked ordinary/current-Siege cases; it is exploratory only. Select once using prepared primary capture count, then surviving value, then capture duration; use mirrors to inspect sensitivity, not to double the sample. Freeze the selected spacing before any holdout results. Holdout: seeds1001–1020 for ordinary/prepared/supplied, current Siege versus the frozen candidate, and paired faction mirrors. Do not tune the candidate after looking at those results.

Each summary reports capture proportion and95% Wilson interval. Zero observed wins is not zero true probability. Mirror rows have their own intervals and paired policy changes, never treated as twice as many independent seeds. Paired improvements count seeds that switch from failure→capture and vice versa; do not subtract two independent-sample confidence bounds and call that a paired interval. Critical decisions need wider fresh samples if uncertainty remains too large. This first holdout meets issue27's20-seed minimum but does not establish a universal balance guarantee.

## Reproduce and inspect

```sh
node tests-unit/platoon-monte-carlo.test.js
MC_CASES=prepared MC_POLICIES=reserve600,reserve640,reserve680 MC_SEEDS=8 MC_START=201 MC_PHASE=screen node scripts/platoon-monte-carlo.mjs
# Freeze one candidate, then use disjoint holdout seeds:
MC_POLICIES=siege,reserve680 MC_SEEDS=20 MC_START=1001 MC_PHASE=holdout node scripts/platoon-monte-carlo.mjs
```

The holdout command's candidate name is updated to the frozen choice before execution. `MC_OUTPUT` chooses the raw artifact path (default OS temporary directory); `MC_SECONDS` and `MC_WORKERS` control the stated horizon and1–8 independent workers. Rows sort deterministically, and `complete` distinguishes a partially saved run. Raw matrices/logs stay outside Git. Screening, holdout findings, actual verification and independent review follow below when executed; no results are invented from targets.

## Frozen selection

Prepared training seeds201–208 selected **reserve680** before holdout:7/8 primary captures and median315 surviving Supply, versus reserve6007/8 and290; reserve6406/8 and290. The chosen mirror also captured7/8 (median302.5 surviving value). These are selection data, not final success estimates. The240s holdout settings are frozen in the raw artifact selection record; no retuning on1001–1020 is allowed.

## Independent adversarial review —2026-11-15

Fresh reviewer independently ran all six focused Monte Carlo assertions: **PASS**. PL-10/QA-01 source and data review found no blocking discrepancy for this opt-in research story. Exact comparison against base `9eecaef` passed336 ordinary-policy orders plus slot goals across all three doctrines, both factions, intact/breached objectives and breach/capture/retreat/regroup. Candidate activation occurs after identical paid assembly; the shared capture interior58, FOB20 defenses,5s capture and60%/80% withdrawal rules remain intact. No production source was changed by the reviewer.

The frozen screening SHA and48 expected training rows match; the reserve680 tie-break recomputes correctly. Final holdout is explicitly complete at240 unique jobs (20 disjoint seeds per case/policy/direction), with all4,596 purchase entries independently audited for25/60 prices,2s spacing, bank/population bounds, paid totals and conservation including overflow. Preparation precedes combat; captures follow breach plus the required hold; unfinished rows stop at240s. All12 summary groups and six paired-change rows independently recompute, with directions kept separate. One complete worker result (`prepared/reserve680/1001/primary`) replayed exactly, including accounts and capture116.833s. Actual four-worker completion and unique job coverage pass; no worker throughput/scaling claim is made.

The findings support a narrow tactical hypothesis, with material limits: ordinary captures rise0→5/20 in each direction, while candidate ordinary survivors are lower; prepared captures rise0→20/20 primary and0→19/20 mirror, exceeding the initial55–70% design target rather than establishing balanced difficulty. The lone prepared mirror timeout is seed1001. Supplied reserve680 captures0/20 in both directions and loses all attackers12/20 in each direction, versus Siege3/20 primary and1/20 mirror eliminations. Siege alone captures supplied mirror seed1007 (112.717s). Thus the candidate is unsuitable for an unconditional production replacement; the supplied failure and prepared balance overshoot remain research findings, not hidden successes or implementation blockers. Zero-win groups retain nonzero95% Wilson upper bounds; mirrors do not increase the independent seed count.

PL-10/QA-01 scoped research evidence: **PASS**. Existing-game default order regression: **PASS within the checks above**. Physical iPhone Safari, rendering/UI/browser release, aircraft support, terrain variety, equal-cost field battles and full-campaign balance: **UNVERIFIED / unmeasured here**. No gameplay activation, deployment, universal-superiority or unconditional release/merge recommendation follows from this review; those wider gates remain **INSUFFICIENT EVIDENCE**.

## Fresh holdout results —240 completed battles

Twenty independent seeds1001–1020 per case/policy, plus their paired faction mirrors. Both policies receive the same paid starting roster and240s horizon. Counts below are primary / mirror, never a pooled40-seed claim.

| Case | Current Siege captures | Reserve680 captures | Candidate95% Wilson interval, primary / mirror |
|---|---|---|---|
|Ordinary3R2K,195 Supply|0/20 /0/20|5/20 /5/20 (25% /25%)|11.2–46.9% /11.2–46.9%|
|Prepared3R4K,315 Supply|0/20 /0/20|20/20 /19/20 (100% /95%)|83.9–100% /76.4–99.1%|
|Prepared with paid garrison replacements|0/20 /1/20|0/20 /0/20|0–16.1% /0–16.1%|

Every0/20 result has a95% upper bound16.1%, not a proved zero underlying chance. Prepared capture median is108.6s primary/109.3s mirror, including40.9s paid preparation. Both fixed-force policies spend315; candidate median surviving replacement value is290 versus240 for Siege. That is full unit price, not remaining HP/refund. Ordinary candidate captures have median103.0/104.6s but preserve less median value:97.5/75 versus145/145 for Siege, and suffer6/7 complete eliminations versus0/0. Attack success carries an attrition cost.

The ordinary25% point estimate fits the proposed20–40% band, but its interval is too broad to call that target calibrated. Prepared100%/95% substantially exceeds the proposed55–70% band; no hidden buffs were used, but this is a balance question, not automatic acceptance. Favorable static-defense results do not generalize to reinforced bases.

**The supplied counterexample is serious:** candidate eliminates its entire attacking force12/20 times in each direction, compared with Siege3/20 primary and1/20 mirror. Candidate median surviving value is0/0 versus150/120. Its median spending is only315/315 versus565/527.5, largely because leaders die and recruitment stops. Lower spending is not economic efficiency here. All supplied cases breach; the unresolved job is surviving and securing capture under reinforcement pressure. No post-holdout tuning was performed to hide this failure.

Paired capture improvements are+25 percentage points ordinary,+100 prepared and0 supplied in the primary direction; mirrors are+25,+95 and−5. These are observed paired changes, not paired confidence intervals. With20 seeds per direction, additional fresh sampling is required for tight estimates (roughly100 independent trials for about±10 percentage points near50%, conditional on this configuration). No result establishes terrain/general campaign balance or theoretical ground-only impossibility.

## Evidence and next small story

- New6 focused checks PASS; existing13 platoon,6 encounter and4 paid-fixture checks PASS. An initial test inspected a deliberately killed/detached follower's null order; it was corrected to inspect the living leader's withdrawal order. No production workaround was made.
- Independent review records336 exact default-order/slot comparisons, one full deterministic candidate replay and all240 rows/4,596 paid transactions checked. Mirrors, disclosure and fixed/supplied accounting were audited separately.
- Holdout raw SHA256: `8d0b29d5412e51b52e5c2dd477a7cf4de2438f1dd09000d6a392c23798396fca`; training48-row SHA256: `bec3137c33d6e84c2f873dc55173d00e4b955c55b410a2b2c11311b0f69dd309`. Raw JSON and logs are downloadable workspace artifacts, excluded from Git. No new browser UI/visual claim is made; final default-regression CI is recorded on the PR.

Recommendation: retain reserve-and-clear as an **experimental context-specific option**, not the global AI doctrine. The next small strategy story should respond to observable incoming enemy troops, protect the leader/capture force against reinforcement pressure and validate on fresh seeds. Never select a policy by peeking at the fixture's hidden `resupply` flag or seed. Keep the60/80 rules and economic symmetry; aircraft support and terrain require separate studies. Promotion to a playable selectable tactic needs its own browser/visual acceptance and user-reviewed release.
