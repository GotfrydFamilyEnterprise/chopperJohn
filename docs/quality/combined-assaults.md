# Issue44 — matched combined-force assaults

This is an opt-in research fixture, not a new playable menu choice or an enabled Campaign policy. Existing Campaign sergeants remain unchanged. A whole force may capture: losing one platoon or leader does not end the assault while other attackers remain.

## Question and protocol

At the same initial4R4K/340 Supply, compare one eight-person platoon, two four-person platoons, and one four-person platoon plus four independent support troops. Every leader counts as a25-Supply ordinary3HP rifleman and cannot capture. The layouts therefore have3/2/3 capture-eligible rifles. Grouping, formation geometry, leader count and capture-rifle count form a treatment package, not a pure leader-bonus experiment.

All purchases follow RRRRKKKK at HQ;120 starting Supply,5/s income,240 bank,25/60 prices,2s cooldown and15 cap are unchanged. Spawn at550, rally at650, target FOB1950 and defending HQ2350 on the flat2800-unit map; paired mirrors reverse all coordinates. Two defending rifles and one launcher cost110 and walk to their actual guard posts. This is an outnumbered-garrison test, not an equal-Supply duel. No opening grants, aircraft, hidden buffs, teleporting or forced victories are used.

All platoons use the opt-in rear140 positioning package from PR43 and normal60/80 retreat/regroup. Independent support uses existing physical squad gathering before ordinary advance. Coordinated release waits for all eight to physically assemble; staggered release sends each complete component separately. In supplied runs, normal paid platoon vacancies and independent support/defender replacements continue; leaders are not recreated. Acquisition has priority and everyone shares their side's normal account/cooldown/cap. Replacement expenditure may differ and is reported.

Corrected validation uses ten seeds7001–7010, both directions, three layouts, two release modes and fixed/supplied forces:240 battles. The240s cutoff includes payment, assembly and travel. Success is actual whole-force FOB ownership transfer; unfinished is never a draw. Mirrors are robustness checks on the same seeds, not additional independent samples.

An initial matrix exposed an unintended one-tick launch difference between single-component release labels. Both now use the same pre-step readiness gate; exact world/result invariance is tested for both mirrors and replacement settings. The original matrix is archived as `protocol-bug-original.json`. The corrected matrix reruns the same seeds/settings, without combat tuning; it is not a newly independent holdout.

## Results

Each cell is primary/mirror, each out of10. Capture times are medians among successes only, including preparation.

| Fixed garrison | One8 | Two4 | Platoon4 + independent4 |
| --- | --- | --- | --- |
| Coordinated captures |9/10 /10/10|10/10 /10/10|7/10 /7/10|
| Coordinated capture seconds |117.1 /117.2|117.0 /114.7|128.1 /127.3|
| Staggered captures |9/10 /10/10|8/10 /8/10|5/10 /4/10|
| Staggered capture seconds |117.1 /117.2|105.2 /105.1|108.8 /110.2|

Every fixed-force row spent340 vs110; every run breached; all failures were unfinished rather than force elimination. Coordinated two-group capture differs from the one-group control by one extra primary success and zero mirror successes. The ten-seed95% Wilson interval for10/10 is72.2–100%; for9/10 it is59.6–98.2%. These samples do not establish general superiority or a calibrated target probability. Earlier staggered successes are faster conditional on winning but less reliable; they are not an overall efficiency gain.

**Supplied defense: all layouts/releases captured0/10 in each direction.** Every run breached and remained unfinished at240s, with no whole-force wipe. Zero out of10 has a95% Wilson upper limit of27.8%, not proof that capture is impossible.

| Supplied attacker spending at cutoff | One8 | Two4 | Platoon4 + independent4 |
| --- | --- | --- | --- |
| Coordinated median Supply |640 /610|670 /610|780 /732.5|
| Staggered median Supply |640 /610|730 /700|810 /835|

Verdict: synchronized small platoons are a promising fixed-garrison option. Merely splitting the force does not solve takeover against continuous replacements. Independent support and early departures can increase attrition without producing captures. This story provides the comparison fixture and evidence; it does not complete T6, justify global activation, or prove terrain/helicopter/campaign balance.

## Reproduction and evidence

```sh
npm run test:unit
npx playwright test tests/combined-assault.spec.js
CA_START=7001 CA_SEEDS=10 CA_SECONDS=240 CA_WORKERS=4 \
  CA_PHASE=corrected-validation CA_OUTPUT=/tmp/combined-assault.json npm run test:combined
```

Raw JSON/ledgers and development/failure logs stay outside Git in `/workspace/combined-assault-artifacts/`. Corrected matrix SHA-256: `ff0632f55943e8c0f7c1041d3ae70e9dceb2421dd754704b82128a144ccf0999`. The runner records all24 stratified summaries and16 paired comparisons, not just favorable arms. Inherited `maxLeaderGap` samples the first active platoon only and is not an all-group measurement.

| Requirement/check | State | Evidence |
| --- | --- | --- |
| PL-01/02/03/07/08, paid/physical groups and normal defaults | PASS | Full178 module assertions, including six new combined-study tests; initial purchases at HQ, payment/cooldown, mirror assembly, replacement costs, pause/batching and exact one-component invariance |
| PL-10, combined-force outcomes and honest accounting | PASS | Corrected240-row matrix; fixed/supplied split, whole-force endpoint and real capture regression; independent corrected-data audit:480 accounts and6,259 transactions PASS |
| QA-01, current-source browser execution | PASS | Three Playwright tests, one per layout, both directions, real240s Campaign engine outcomes; `browser-real.log`:3 passed |
| QA-01, rendered diagnostic evidence | PASS | Implementer inspected generated `combined-assault-{one,two,support}-landscape.png`: real infantry, guards, projectile arcs and actual defense/breach state visible; these are research captures, not a new playable UI |
| Broad browser regression and final CI | UNVERIFIED | Pending PR CI; no success inferred from source or earlier PRs |
| Physical iPhone play / production activation / reinforced-base balance | UNVERIFIED | Not established or claimed by this research story |

Independent fresh-context review executed28 initial tests and12 additional failure probes. After the scheduling correction, the reviewer independently passed all six corrected focused tests, audited all240 rows/480 accounts/6,259 transactions, recomputed24 summaries and16 paired differences, verified all40 single-component label pairs, and exactly replayed two corrected full rows. The reviewer inspected all three screenshots and the3-PASS browser log and reviewed this report. Corrected source/data/documentation/focused browser evidence are PASS with no source blocker. Full review/probe/replay logs remain in the external artifact directory. Broad final browser/PR CI remains the completion gate; no merge recommendation or deployment is inferred before it passes.

The next bounded gameplay experiment should expose these presets in the existing lab, then test an explicit capture-window tactic against paid reinforcements. Keep that change separate from this research PR; do not add hidden damage or free troops to force a win.
