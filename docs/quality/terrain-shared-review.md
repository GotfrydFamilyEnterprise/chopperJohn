# Independent TL-10 shared-splash review

Reviewed 2026-10-31 in a separate adversarial agent context against baseline `7668503`. Production code was not edited by this reviewer. Requirements/acceptance/status and `adversarial-review.md` were read; implementation claims were treated as unverified until checked.

## Findings and recommendation

**No blocking source discrepancy found in the shared allocation or its simulation integration. Recommendation: INSUFFICIENT EVIDENCE pending final matrix/report and screenshot inspection; reviewer-owned browser execution and physical Safari remain UNVERIFIED.** This is not an unconditional merge approval.

| Requirement | Result | Independent evidence |
| --- | --- | --- |
| TL-10 budget, randomized allocation, caps and equal expected shares | PASS | 20,000 generated variable-count/distance cases satisfy `2 min(W,sqrt(W))`, cap bounds and conservation within numerical tolerance; permutations produce identical allocations. 100,000 eight-way draws show means 0.70632–0.70768 versus expected 0.707107 and unequal real allocations. |
| TL-10 friendly/dead/fringe/blocked exclusion | PASS | Real projectile impacts with additional dead/friendly/exact-edge/outside units preserve the two eligible victims' damage events and RNG state. A ridge-blocked enemy remains at full HP and consumes no allocation RNG. |
| TL-10 pre-HP allocation and overkill | PASS | The same real three-victim impact allocates identical shares/RNG with full HP and with the first victim at 0.001 HP; excess damage is discarded. |
| TL-10 singleton and weak combined fringe RNG | PASS | Original singleton tests independently executed; separate total-falloff 0.5 probe returns exact original caps and unchanged RNG. Actual terrain-shielded singleton retains 2 HP centered damage and unchanged RNG. |
| TL-10 stable order, seeded replay, mirroring | PASS | Independent permutation probes plus executed unit assertions for both models' replay batching and mirrored HP/shots. |
| TL-10 individual comparison preserves legacy mechanics | PASS | Loaded the actual `7668503` simulation source and compared full snapshots for eight encounters at seed 9 after 20 seconds. Outcomes, units, projectiles, statistics, HP and RNG match exactly after removing only added model/allocation metadata. |
| TL-10 UI/model-reset and actual shared crowd browser behavior | UNVERIFIED | Source uses shared by default, explicit individual selector/query, and paused fresh `start()` on either selector. Authored browser tests were inspected but reviewer did not execute browser/server commands. |
| TL-10 fresh strategic matrix and accurate report/baseline labels | UNVERIFIED | Final generated shared matrix/report pending independent audit. Existing v0.5 historical status is clearly dated and is not evidence for v0.6. |
| TL-10 mobile screenshots | UNVERIFIED | Final current-build screenshots pending inspection. |
| TL-02 / TL-10 normal Battlefield, bunker, aircraft and Flight School isolation | PASS (source/regression modules) | Runtime diff is confined to Terrain Lab modules/HTML. Normal combat/economy/aircraft/FOB modules and Flight School are unchanged; full unit command independently passes. Browser and physical-device regression are separate evidence gates. |

## Executed evidence

- Independently ran `npm run test:unit`, exit 0; raw log: `evidence/terrain-shared-independent-unit-results.txt`.
- Independently ran `node --test tests-unit/terrain-splash.test.js tests-unit/terrain-balance.test.js tests-unit/terrain.test.js`, exit 0.
- Seven additional independent probe groups, exit 0: `evidence/terrain-shared-independent-results.txt`. These exercised the actual shared allocator and injected physical ground-impact projectiles, rather than reimplementing allocation as the oracle.
- Relevant locations: `docs/js/battlefield/terrain/splash.js` (budget and capped weighted allocation), `simulation.js:34` (physical candidate filtering, pre-hit allocation), `scene.js:15` and `scene.js:19` (reset/default selector).

No FAIL established. The outstanding UNVERIFIED items above are evidence limits, not a claim of correct deployment or permission to merge. The reviewer was explicitly instructed not to run browser/server commands because earlier attempts stalled.
