# Terrain Lab v0.6: shared splash recomputation

TL-10 recomputes576 encounters (8 scenarios ×3 radii ×12 seeds ×2 paired mirrors) using shared randomized damage. Archived individual-damage findings and raw results are separate: terrain-balance-individual.md and evidence/terrain-balance-individual-results.json, from committed baseline7668503. These are12 independent seeds, not24; each pair swaps faction/position while retaining troop roles.

## Damage rule

Only living exposed enemies inside the radius and not terrain-shielded contribute. Let f=1-distance/radius, W=sum(f). Budget=2×min(W,sqrt(W)). Centered victims share2HP for one,2.83total for two,4total for four,5.66total for eight. Shares use f times seeded uniform0.75–1.25 weights, normalize to the budget and cap at the victim's original2f damage. Unused allocation capacity is redistributed before applying HP; overkill is discarded. Equal positions have equal expected shares regardless of unit kind, price or faction. Zero fringe, friendly, dead and blocked soldiers do not dilute shares. Single-target damage and RNG remain unchanged. The selector retains individual damage for comparison; normal Battlefield/bunker/aircraft rules are unchanged.

## Actual outcomes

Counts below are wins out of12 seeds, with two mirrored placements per seed. “Unresolved” means both sides survive at90s; it is not a draw or proven permanent deadlock.

| Encounter | Fielded Supply Blue/Red | Shared25 | Shared40 | Shared50 |
| --- | --- | --- | --- | --- |
| Close12 rifles vs5 rockets |300/300|Rifles12–0|Rifles12–0|Rifles12–0|
| Open approach, same forces |300/300|Rifles12–0|Rifles11–1|Rifles8–4|
| Mixed4 rifles+2 rockets vs4 rockets |220/240|Mixed9 wins,1mutual,2unresolved|Mixed2–10|Mixed2–10|
| Clustered rifles vs5 rockets |300/300|Rifles12–0|Rifles8, rockets2, mutual2|Rifles2, rockets8, mutual2|
| Spread rifles vs5 rockets |300/300|Rifles12–0|Rifles12–0|Rifles11–1|
| Mixed attack vs elevated holding rockets |220/240|Mixed7–5|Mixed0–12|Mixed0–12|
| Mixed attack across reverse-slope cover |220/240|Mixed6 wins,6unresolved|Mixed1, rockets3,8unresolved|Rockets8 wins,4unresolved|
| Identical mixed forces |220/220|Original Blue5,Red1,mutual1,unresolved5|6–6|Original Blue7,Red4,mutual1|

## Interpretation

Shared damage substantially weakens crowd punishment. At radius40, clustered rifles change from0/12 wins under individual damage to8/12 wins under shared damage, with2 mutual eliminations. Open rifles improve from7/12 to11/12 wins. Mixed-force wins fall from6/12 to2/12: damage sharing can also protect a compact expensive rocket group. These combined simulation outcomes are not attributable solely to raw damage: changed casualties and seeded allocation draws change later target/fire/scatter sequences.

Radius50 restores a clearer formation tradeoff under shared damage: clustered rifles win2/12, while spread rifles win11/12. It still preserves close-range rifle victories12/12. This makes50 worth comparing, but it does not justify silently changing the approved40 default. Elevated holding rockets defeat the tested mixed assault12/12 at both40 and50; that position remains a strong defensive advantage needing larger-force/alternative-approach tests.

The current shared40 model is **not established as strategically balanced**. Keep prices25/60, HP, accuracy and firing cadence unchanged while testing the new rule. Candidate next tuning compares shared40 vs50 with more seeds and viable mixed assault formations rather than flattening all win rates or adding hidden faction buffs. The identical-force6–6 sample at40 is a useful control, not proof of fairness; paired reflections retain scheduling/ID roles.

At shared40 the open encounter loses218.8/295.0 Supply on average (rifles/rockets); clustered loses237.5/265.0; spread162.5/300.0. A surviving wounded troop retains full replacement value in this metric, so per-run HP is also retained. Costs import shared production rules. Common240-budget mixed armies explicitly leave20 unspent;300-Supply forces represent accumulated purchases, not an opening bank. All obey15 troops per faction.

## Scope and evidence

These are preassembled ground forces, without live income, purchase timing/cooldown, reinforcement, HQ travel, FOB breach/capture or helicopter/anti-air interaction. They establish changes in the tested encounters, not full-match economic balance. Spacing also changes formation length/arrival timing; high defense combines elevation and holding orders. No blue auto-purchase or production stat change is introduced.

`npm run test:balance` reproduces the shared576-run matrix; set BALANCE_DAMAGE_MODEL=individual for the legacy model. `node scripts/render-terrain-balance.mjs` generates balance-report.html with explicit shared playable links and archived baseline downloads. Raw data: evidence/terrain-balance-results.json. Independent review: terrain-shared-review.md. Validation status and any browser limits are recorded in specs/implementation-status.md.
