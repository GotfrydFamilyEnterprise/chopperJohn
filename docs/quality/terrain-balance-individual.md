# Terrain Lab v0.5: ground-force balance findings

**Archived individual-damage model (commit7668503). The current playground defaults to shared damage. These findings describe the earlier model; choose Each soldier or `?damage=individual` to replay it.**

TL-09 experiment: **576 actual encounters**, using12 seeds, two mirrored placements, eight scenarios and three blast radii. All runs use the real1/120-second Terrain Lab engine and stop at a settled elimination result or90 simulation seconds. Mirrors are paired symmetry checks, not additional independent seeds. The sample is an initial tuning sweep, not proof of universal balance.

These measurements use the **current per-soldier splash model**: every enemy at the blast center can receive2HP. Shared randomized group damage is a separate proposal and is not included in these results.

## Recommendation

Keep **40-unit radius** as the playground candidate, with unchanged2HP center damage and linear falloff. Keep rifle25/rocket60 prices, HP, range, accuracy, aim and reload unchanged. Normal Battlefield still uses its accepted25-unit blast and existing bunker/aircraft rules. This experiment does not change production balance.

At40, expensive rockets are effective against tightly packed troops and exposed approaches, while dispersed rifles and close-range pressure remain useful. At50, rockets become substantially stronger in the open without an increase in purchase price. At25, the pure rifle force wins all twelve sampled open approaches. This is a reason to try40, not a rule that every matchup must be50/50.

## Measured outcomes

Counts below are wins in12 independently seeded scenarios; the mirrored placement gives the same outcome for every recorded pair. Original force roles remain the same when the physical colors/positions are mirrored. “Unresolved” means both sides survive at90 seconds, never a draw or victory.

| Encounter | Fielded Supply, original Blue / Red | Radius25 | Radius40 | Radius50 |
| --- | --- | --- | --- | --- |
| Close rush:12 rifles vs5 rockets |300 /300|Rifles12–0|Rifles12–0|Rifles12–0|
| Open approach: same forces |300 /300|Rifles12–0|Rifles7–5|Rifles2–10|
| Mixed screen:4 rifles+2 rockets vs4 rockets |220 /240|Mixed10 wins,2 unresolved|Mixed6–6|Mixed4–8|
| Clustered rifles vs5 rockets |300 /300|Rifles7, rockets2, mutual3|Rockets12–0|Rockets12–0|
| Spread rifles vs5 rockets |300 /300|Rifles12–0|Rifles12–0|Rifles12–0|
| Mixed attack vs elevated holding rockets |220 /240|Mixed7–5|Mixed1–11|Mixed0–12|
| Mixed attack across reverse-slope cover |220 /240|Mixed6 wins,6 unresolved|Rockets4 wins,8 unresolved|Rockets7 wins,5 unresolved|
| Identical mixed forces |220 /220|Original Blue3, Red4, mutual2, unresolved3|Original Blue8–4|Original Blue6, Red5, mutual1|

At40, the open300-vs300 encounter loses an average275 Supply on each side. Close-range rifle attacks lose56.3 Supply on average while eliminating300 Supply of rockets. Clustered rifles lose all300 while rockets lose40. Spread rifles lose172.9 while eliminating300 of rockets. These are casualty replacement costs; a badly wounded survivor retains its full purchase value in this metric. Raw remaining HP is retained separately.

## Strategic interpretation

- **Rifles keep the close-range role.** Lead riflemen start inside the225-unit rocket minimum, although rear rifles can initially remain eligible rocket targets. Greater blast size does not remove this weakness.
- **Spacing matters.** At40, clustered rifles lose every sampled encounter while spread rifles win every one. Wider spacing also lengthens the formation and delays rear arrivals, so this compares real formation tradeoffs rather than assigning a hidden defense bonus.
- **Mixed forces remain viable.** A rifle screen plus rockets splits the flat sampled encounters6–6 despite costing20 less than the opposing rocket force. That unspent20 does not fight or generate reinforcements here.
- **Elevated rocket defense is very strong.** The mixed attack loses11 of12 at40. This scenario combines elevation and a holding order; it does not isolate height alone. A frontal force of this size should not be assumed sufficient. Alternate routes, staggered/spread approaches and a larger paid assault need further tests before integrating terrain into normal battles.
- **Cover can prolong fighting.** Eight of12 reverse-slope encounters remain unresolved at40 after90 seconds. Surviving rocketeers and minimum-range/forward-only targeting can also prolong encounters. Do not label all unresolved cases permanent deadlocks: some still have targets or committed shots. The projectile audit records outstanding shots at the cutoff.
- **Mirroring checks faction symmetry, not global fairness.** Every recorded pair preserves outcome, HP, time and costs after swapping positions/colors. The identical-force control still varies across seeds and original unit roles. Twelve seeds do not justify tuning a faction bonus to force an exact tie.

## Economy and scope

A rocketeer costs2.4 riflemen. At5 Supply/second, replacing a rifle represents5 seconds of income and a rocket soldier12 seconds. Shared production prices are imported directly by the benchmark, and every force obeys the15-unit faction limit. The300-Supply forces represent accumulated purchases, not the120 opening balance or240 bank cap. The220-vs240 tests use a common240 budget with an explicit20 reserve on the mixed side.

These are **preassembled infantry encounters**. The experiment does not simulate live income, purchase cooldowns, travel from headquarters, reinforcements, free opening troops, base breach/capture, helicopter fire or anti-air allocation. It cannot establish full-game economic balance or AI competence. No costs or income have been changed, no blue auto-purchasing has been introduced, and no automatic merge/integration is authorized.

Next economic tests should use the actual shared purchase transactions to compare replenishment and sustained front movement, then add FOB and helicopter objectives separately. Preserve the current role contrast instead of increasing rocket damage or reducing rifle costs solely to flatten the percentages above.

## Reproduction and evidence

- `npm run test:balance` executes all576 encounters with12 seeds and90s limits. `BALANCE_CASE`, `BALANCE_SEEDS`, `BALANCE_SECONDS`, `BALANCE_OUTPUT` allow bounded repeat experiments.
- `node scripts/audit-terrain-balance.mjs` replays unresolved rows and asserts their exact HP/time/cost state before recording outstanding projectile counts. Settled rows have zero shots by the engine's result gate.
- `node scripts/render-terrain-balance.mjs` generates the mobile results page from recorded JSON. The page links to runnable level/scenario presets at radius40.
- [Raw runs and aggregates](evidence/terrain-balance-individual-results.json), [module checks](evidence/terrain-balance-unit-results.txt), [browser checks](evidence/terrain-balance-browser-results.txt), [independent review](terrain-balance-review.md).
