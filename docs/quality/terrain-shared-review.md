# Independent TL-10 shared-splash review

Reviewed 2026-10-31 in a separate adversarial agent context against baseline `7668503`. Production code was not edited by this reviewer. Requirements/acceptance/status and `adversarial-review.md` were read; implementation claims were treated as unverified until checked.

## Findings and recommendation

**No blocking source, matrix, report or inspected screenshot discrepancy found. Source/matrix/report and supplied mobile visual evidence PASS. Publication of the tested experimental preview is supported. Formal merge recommendation remains INSUFFICIENT EVIDENCE because reviewer-owned browser execution and physical Safari remain UNVERIFIED.** This is not an unconditional merge approval.

| Requirement | Result | Independent evidence |
| --- | --- | --- |
| TL-10 budget, randomized allocation, caps and equal expected shares | PASS | 20,000 generated variable-count/distance cases satisfy `2 min(W,sqrt(W))`, cap bounds and conservation within numerical tolerance; permutations produce identical allocations. 100,000 eight-way draws show means 0.70632–0.70768 versus expected 0.707107 and unequal real allocations. |
| TL-10 friendly/dead/fringe/blocked exclusion | PASS | Real projectile impacts with additional dead/friendly/exact-edge/outside units preserve the two eligible victims' damage events and RNG state. A ridge-blocked enemy remains at full HP and consumes no allocation RNG. |
| TL-10 pre-HP allocation and overkill | PASS | The same real three-victim impact allocates identical shares/RNG with full HP and with the first victim at 0.001 HP; excess damage is discarded. |
| TL-10 singleton and weak combined fringe RNG | PASS | Original singleton tests independently executed; separate total-falloff 0.5 probe returns exact original caps and unchanged RNG. Actual terrain-shielded singleton retains 2 HP centered damage and unchanged RNG. |
| TL-10 stable order, seeded replay, mirroring | PASS | Independent permutation probes plus executed unit assertions for both models' replay batching and mirrored HP/shots. |
| TL-10 individual comparison preserves legacy mechanics | PASS | Loaded the actual `7668503` simulation source and compared full snapshots for eight encounters at seed 9 after 20 seconds. Outcomes, units, projectiles, statistics, HP and RNG match exactly after removing only added model/allocation metadata. |
| TL-10 UI/model-reset and actual shared crowd browser behavior | PASS (CI evidence); reviewer-owned execution UNVERIFIED | Inspected authored assertions and current-build CI filtered log:132 module checks and106 Chromium browser checks PASS in run41246079329, source dc3d3260648c508150fd5f86fefc79db70464426. Includes actual crowd impact, unequal shares, lower group total, shared/individual switching and seeded reset. Reviewer did not execute browser/server commands. |
| TL-10 fresh strategic matrix and accurate report/baseline labels | PASS | Independently audited all576 unique rows,24 recomputed aggregates,288 paired mirrors (HP tolerance1e-8), cost conservation, settled-zero-projectile/90s timeout invariants, all report percentages, shared replay links and individual40 comparison counts. Archived JSON exactly equals7668503. Findings/counts/loss means match. `evidence/terrain-shared-independent-matrix-results.txt`. |
| TL-10 mobile screenshots | PASS | Independently opened and visually inspected `evidence/terrain-shared-crowd-portrait.png` (390×844) and `evidence/terrain-shared-crowd-landscape.png` (844×390). Shared blast/Blast40 selector, Run/reset/step controls, caption, participants, impact outline, HP and footer remain visible without clipping. Portrait wraps controls coherently; landscape fits one main control row. |
| TL-02 / TL-10 normal Battlefield, bunker, aircraft and Flight School isolation | PASS (source/regression modules) | Runtime diff is confined to Terrain Lab modules/HTML. Normal combat/economy/aircraft/FOB modules and Flight School are unchanged; full unit command independently passes. Browser and physical-device regression are separate evidence gates. |

## Executed evidence

- Independently ran `npm run test:unit`,132 checks, exit 0; raw log: `evidence/terrain-shared-independent-unit-results.txt`.
- Independently ran `node --test tests-unit/terrain-splash.test.js tests-unit/terrain-balance.test.js tests-unit/terrain.test.js`, exit 0.
- Seven additional independent probe groups, exit 0: `evidence/terrain-shared-independent-results.txt`. These exercised the actual shared allocator and injected physical ground-impact projectiles, rather than reimplementing allocation as the oracle.
- Relevant locations: `docs/js/battlefield/terrain/splash.js` (budget and capped weighted allocation), `simulation.js:34` (physical candidate filtering, pre-hit allocation), `scene.js:15` and `scene.js:19` (reset/default selector).

No FAIL established. The outstanding UNVERIFIED items above are evidence limits, not a claim of correct deployment or permission to merge. The reviewer was explicitly instructed not to run browser/server commands because earlier attempts stalled.

## Final source/matrix/report audit

Fresh shared results confirm40-radius clustered rifles8 wins/2 losses/2 mutual outcomes; open11/1; spread12/0; mixed2/10; high0/12; reverse1 attack/3 defense/8 unresolved; identical6/6, each out of12 paired seeds. The findings explain crowd protection, preserved mixed/elevation weaknesses, larger50-radius formation tradeoffs and scheduling/RNG/arrival-order limits. They do not claim full-game economic balance. HTML tables and baseline comparisons independently match raw data. No source or report blocker found.

The earlier low-severity archive-label suggestion is resolved: the original findings now begin with an explicit archived-model banner and state how to select individual damage. Historical text remains clearly contextualized.

Independently re-executed three recorded90-second samples (cluster/reverse/mirror, radius40, seed7). Exact HP, outcome, force economics, elapsed time, projectile counts and shot totals match raw rows, including a real unresolved reverse-slope outcome. All three PASS: `evidence/terrain-shared-independent-replay-results.txt`.

## Final CI and visual inspection

Inspected `evidence/terrain-shared-ci-results.txt`: GitHub run41246079329/job124669694772 records132 module checks and106 browser checks passing (1.2m), tied to source `dc3d3260648c508150fd5f86fefc79db70464426`. This is externally executed CI evidence, distinct from the reviewer’s independently executed CLI checks. Both new crowd screenshots were inspected with the image viewer. The overlapping enemy silhouettes are expected for this fixture; the visible aggregate Red8.8HP and Last hit0.79HP agree with a shared, nonfatal burst against four3HP soldiers. Screenshots establish layout and visible impact; quantitative allocation correctness comes from executable assertions and independent probes. No visual blocker found. No deployment verification is claimed here; publication remains a subsequent action.

Also independently inspected current report viewport captures `evidence/terrain-shared-report-portrait.png` (390×844) and `evidence/terrain-shared-report-landscape.png` (844×390). Both clearly label v0.6/shared damage,576 encounters,12 seeds and40-unit candidate; damage explanation and introductory content wrap legibly within the viewport. Portrait shows the start of the first card; these top-of-page captures do not visually establish every below-fold table row. Those values were independently audited against JSON and HTML as recorded above. No visual blocker in any of the four supplied captures.
