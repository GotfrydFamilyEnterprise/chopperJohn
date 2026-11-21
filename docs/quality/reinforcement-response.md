# Issue42: leader survival under reinforcement pressure

Scope: PL-07/08/10 and AI-05. An opt-in research rule, not a new normal-game doctrine. PR41 is merged; its reserve680 policy remains the comparator. This story studies survival and capture separately. No initial-price, income, HP, damage, firing-rate,20/6 breach,5s capture,60/80 regroup,2× replacement or aircraft rule changes.

## Diagnosis and bounded rule

A supplied reserve680 trace at seed1001 places the leader at1227 and four launchers clustered at1207. Enemy rocket splash reduces leader3HP to0.17 before the first breach at85.84s. At191.5s he dies, disbanding the group and stopping paid replacement orders. New defenders and rebuilding prolong the fight; the original failure is not simply a missing rifle screen against advancing infantry.

The candidate uses public current positions only: when a live enemy rocketeer is ahead within1000 units during unsafe-FOB bombardment, order the leader behind the median of **physically joined** friendly launchers. Incoming replacements are excluded. The existing cohort240 order band, physical movement and280 leash still bound that order. No teleport or evasion of a committed projectile is added. Dead, friendly, rearward or farther launchers do not trigger the rule; retreat/regroup orders retain priority. No resupply flag, seed, account balance, future purchase or hidden decision enters the policy.

Two training gaps were explored:80 and140. Their forward launcher slots must exceed the desired rear gap; corrected pairs are120–160 and180–220 respectively, preserving the existing220 slot bound. Capture rifles retain reserve680's−180/−220 slots. The initial140-gap/80–160-launcher combination stalled before engagement and is rejected/archived. A meaningful travel regression now checks geometric slack and actual forward progress in both directions before sampling combat.

## Development and frozen protocol

Development used supplied training seeds3001–3004 and their paired mirrors. Corrected rear140 preserved all four primary leaders with zero complete-force eliminations; reserve680 lost all four and suffered four eliminations. None captured. Rear80 preserved two primary leaders. Post-breach screen and push prototypes also produced no captures and worse attrition; they are archived development artifacts, not shipped policies. Do not hide these failures or call staying alive a win.

Only **rear140** was frozen for the survival hypothesis before validation. Fresh seeds6001–6020 compare reserve680/rear140 on ordinary3R2K, prepared3R4K and supplied3R4K, both faction directions:240 battles. Same real Campaign engine, paid HQ preparation, guards, weapons and240s total horizon. Each policy gets identical paid assembly before activation. The frozen candidate is not retuned against validation rows. Mirrors are paired sensitivity checks, not40 independent trials. See the original `monte-carlo-assaults.md` for the shared fixture/accounting contract and why single-wave/flat-layout results are not full Campaign balance.

Primary outputs: actual captures and95% Wilson intervals; leader survival; living non-sergeant capture rifles; force elimination/timeouts; full replacement-value survivors and actual Supply spending. Report stopping-time differences when captures end early. Lower spending due to a dead leader is not efficiency. Any surviving force still unable to capture is unfinished. A survival benefit alone cannot justify claiming an attack-success improvement or activating the policy globally.

## Reproduce

```sh
node tests-unit/platoon-monte-carlo.test.js
MC_CASES=supplied MC_POLICIES=reserve680,rear80,rear140 MC_SEEDS=4 MC_START=3001 MC_PHASE=screen node scripts/platoon-monte-carlo.mjs
MC_POLICIES=reserve680,rear140 MC_SEEDS=20 MC_START=6001 MC_PHASE=holdout node scripts/platoon-monte-carlo.mjs
```

Raw rows, diagnosis and development prototypes stay outside Git; `MC_OUTPUT` selects their path. The runner additionally records `leaderAlive` and `captureRiflesAlive`, and summary counts distinguish missing metrics in old data. Final results, checks and independent review are appended only after execution. New browser UI and physical Safari are outside this opt-in research story; ordinary defaults retain standard CI regression coverage.

## Independent adversarial review (2026-11-21)

A separate reviewer read the requirements, acceptance contract, implementation status, actual source diff and completed raw holdout. PL-07/08/10 and AI-05: **offline PASS, no blocking source discrepancy found**. Independently executed all9 focused tests; compared168 orders against the actual merged `d05fa01` implementation across both factions and six phases with normal/default and reserve680 policies; and checked10 additional exact1000/1000.001-distance, overlap/rear and stationed-launcher exclusions. All passed. Incoming exclusion, withdrawal priority, ordinary physical travel and geometric forward slack are covered by the focused tests. Source inspection confirms only the opt-in runner sets the new gap; normal game activation and economic/combat rules are unchanged.

The reviewer audited all240 unique expected holdout rows, recomputed summaries and paired capture differences, checked the frozen training-artifact hash, and reconciled480 account ledgers containing3768 purchases against prices, cooldown, balances, income/overflow, population cap and initial roster costs. Fixed cases contain no replacement purchases. Capture endpoints match actual capture times; unfinished rows reach the240s cutoff. Audit evidence is in `independent-negative-probes.json` and `independent-data-audit.json` beside the raw artifacts.

The supplied result remains **0/20 captures per policy in each direction**. Rear140 leaves20/20 primary and19/20 mirrored leaders alive versus1/20 each for reserve680, while median attacker spending rises from315 to585/615. That is survival with additional paid replacement spending, not demonstrated capture improvement or efficiency. Ordinary primary captures fall from4/20 to3/20; prepared primary captures rise from17/20 to18/20. These bounded results do not establish general superiority. The comparison measures the complete positioning package, including changed launcher slots; it does not isolate the leader-gap mechanism. Survival is measured at each trial's stopping time, which can differ after captures.

Browser behavior, screenshots, preview publication and physical Safari were not executed in this independent review and remain **UNVERIFIED**. Recommendation: retain this as an opt-in research result; no normal-game activation or release-acceptance claim. Full PL-10 release approval still requires its browser/visual/public-preview gates.

## Fresh validation results

All240 battles completed. Twenty fresh seeds per case/policy plus paired mirrors; never pool the mirrors into40 independent samples. Baseline is reserve680; candidate is the **rear140 positioning package**, including both leader rear gap and changed launcher slots. This study does not isolate the effect of the gap alone.

| Case | Baseline capture, primary / mirror | Candidate capture, primary / mirror |
|---|---|---|
|Ordinary3R2K|4/20 /3/20|3/20 /3/20|
|Prepared3R4K|17/20 /17/20|18/20 /19/20|
|Supplied3R4K|0/20 /0/20|0/20 /0/20|

Ordinary candidate capture15% has95% Wilson interval5.2–36.0%; prepared90%/95% has69.9–97.2%/76.4–99.1%; supplied0% has0–16.1%. The baseline's85% prepared result on these fresh seeds differs from the earlier study's100%/95%; neither small sample is a universal win rate. Paired capture changes are−5/0 percentage points ordinary,+5/+10 prepared,0/0 supplied. Those are observed paired differences, not confidence intervals or proved superiority.

| Case | Baseline live leaders, primary / mirror | Candidate live leaders | Baseline force eliminations | Candidate force eliminations |
|---|---|---|---|---|
|Ordinary|3/20 /3/20|20/20 /20/20|9/20 /8/20|0/20 /0/20|
|Prepared|11/20 /9/20|20/20 /20/20|0/20 /0/20|0/20 /0/20|
|Supplied|1/20 /1/20|20/20 /19/20|13/20 /13/20|0/20 /1/20|

Supplied median living capture rifles rise0→2 in both directions; median survivor replacement value rises0→315. Supplied spending also rises315→585 primary and315→615 mirrored because a surviving leader keeps buying normal-price replacements. These figures are at each run's own stopping time: old eliminated waves often end earlier; surviving candidate timeouts continue to240s. This is a survival/capacity result, **not** proof of better economic efficiency or capture success. Ordinary candidate17/20 timeouts per direction also show the cost of preserving a force unable to finish. Prepared candidate capture median114.4/115.3s is slower than baseline109.9/109.8s; median survivor value315 versus290 is full unit price, not HP value or refunded Supply.

The reinforced-FOB capture problem remains unresolved: both candidates breach, but this package does not secure takeover. Keep it experimental; do not enable it globally or declare T6 complete. The next small decision is how to exploit the preserved force with appropriately timed suppression/coordination, rather than rewarding survival-only tuning. Helicopter cooperation is already tracked in issue26; a playable tactical promotion still needs its own browser/visual/user acceptance.

## Verification and artifacts

Implementer final10 focused tests PASS; existing13 platoon tests PASS. Fresh reviewer independently executed the original9 focused tests, compared168 default/old-policy orders and10 negative/boundary probes, and audited240 rows/480 ledgers/3,768 purchases. The later comparator-baseline reporting helper was checked separately with pure assertions and the independent paired audit; it does not enter simulation jobs. No broad matrix was rerun for that reporting-only fix.

Original holdout SHA256: `d0ae039b3adaabaef3eb50190f9764fa3891cbae365d7f7dff3f5b5d22ea2c7f`. Its paired section was empty under the older Siege-only output selector; `comparison-summary.json` recomputes the correct reserve680 pairs without changing any raw row. The runner now defaults to Siege when selected, otherwise the first selected policy, with an explicit validated `MC_BASELINE` override. Diagnosis, failed development variants, corrected training, frozen settings, raw validation and audit logs remain downloadable artifacts outside Git. Final standard CI is linked on the PR; no new UI, preview, physical Safari or global policy activation is claimed.
