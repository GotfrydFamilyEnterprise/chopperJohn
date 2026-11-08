# Cohesion and tactical fixtures: independent adversarial review

Review date: 2026-11-03. Unmerged branch `feature/sergeant-platoons`/PR14; baseline `b8aed58`. This fresh reviewer read `AGENTS.md`, PL-07–10 requirements/acceptance, implementation status, review protocol and production diff. No production source was edited. New execution used offline Node simulation; no network, browser, server, publication or Git mutation was performed.

**Recommendation: INSUFFICIENT EVIDENCE for merge.** No current source blocker is known after the independently verified240-band correction. Final-source geometry/physical probes,648-row matrix integrity,8 exact real-engine replays and108 generated report cards PASS. Four supplied browser captures independently inspected PASS; retreat/regroup captures, final browser execution result and preview publication remain UNVERIFIED at this checkpoint. Physical iPhone Safari remains UNVERIFIED. No merge approval.

## Browser evidence checkpoint

Independently inspected actual supplied captures: [FOB capture](evidence/cohesion-fob-capture.png), [Campaign status](evidence/cohesion-campaign-status.png), [report portrait](evidence/cohesion-report-portrait.png), [report landscape](evidence/cohesion-report-landscape.png): **visual PASS**. Capture clearly shows the captured breached blue FOB and surviving force; its occupancy remains explicitly partial. Campaign's scrollable menu shows the real retreat3/5-ready status and readable60/80 explanation. Report cards, controls and expanded method are readable and fit horizontally in both supplied orientations; three primary seeds, separate mirrors and3/324 discordance are visible. No visual blocker found in these four images.

The separately supplied paths `cohesion-retreat-landscape.png`, `cohesion-regroup-portrait.png` and `cohesion-regroup-landscape.png` did not exist when inspected, so those three visual gates remain **UNVERIFIED**, not PASS. Root's standard HTTP Playwright suite is reportedly running; no final execution result has yet been supplied. This reviewer has not launched a browser.

## Final240-band source execution

- **PASS:** all6825 valid above60%-strength survivor masks produce forward leader orders toward a clear objective at their ideal fighting-role positions. Every bounded role offset is within220; the240 band guarantees at least20 forward slack for any ideal active cohort median. [Executable](evidence/cohesion-final-review-casualty-geometry.mjs), [results](evidence/cohesion-final-review-casualty-geometry.json).
- **PASS:** all216 physical lifecycle cases:36 supported compositions (3–10 soldiers) ×3 doctrines ×2 mirrors. Each executes40s unarmed forward travel,60s physical withdrawal after40% casualties, then10s recovery after restoring only enough fixture members at their physical compact posts to reach80%. HP restoration is negative-case setup, never tactical performance evidence. [Executable](evidence/cohesion-final-review-rosters.mjs), [results](evidence/cohesion-final-review-rosters.json).
- **PASS:** ten physical surviving-cohort regressions (sizes3/4/5/6/10, both mirrors), including the shipped3R2K and valid2R2K Siege rosters after a follower-rifle casualty above the retreat threshold. Every leader advances1320 units in40s with no unwanted retreat. [Executable](evidence/cohesion-final-review-casualties.mjs), [results](evidence/cohesion-final-review-casualties.json).
- **PASS:** re-executed the12 earlier reviewer probes against final source:216 main-controller initial settings; mirrored stationary guards; six-/nine-member physical recovery; exact60/80/min6s; malformed catalog rejection; withdrawal capture suppression; fixed-force accounting; ground-aim interruption/ordinary AA; physical backward stance-foot contact; supplied-world pause; deterministic batching. [Executable](evidence/cohesion-review-probes.mjs), [current output](evidence/cohesion-final-review-probes.json).
- **PASS:** final648-row grid, uniqueness, normal prices, initial values, banks/cap bounds, fixed-force no-refill accounting, legitimate outcomes, settled eliminations and elapsed limits. Independently checked216 controller-start configurations and exactly replayed8 complete final-engine rows: paired equal-mixed/mixed/Independent, staffed-FOB/mixed/Siege, empty-FOB/rocket/Siege and supplied-FOB/rocket/Assault, all seed103. [Executable](evidence/cohesion-final-review-audit.mjs), [results including raw replays](evidence/cohesion-final-review-audit.json).
- **PASS:** independently recalculated all27 encounter/mix groups and108 policy cards embedded in `platoon-tactics-results.html`: separate primary/mirrored outcomes, initial costs, survivor medians, additional spending excluding the shared25, stop/capture medians, breaches and retreat medians. Report generator and detailed study method match source/current data and disclose force grants, unequal force costs, stopping times and policy limitations. [Executable](evidence/cohesion-final-review-report.mjs), [results](evidence/cohesion-final-review-report.json). Browser interaction and mobile rendering remain separate gates.
- Root's combined final158-unit PASS is retained in [cohesion-unit-tests.txt](evidence/cohesion-unit-tests.txt). This reviewer did not rerun that broad suite; the separately executed evidence above is not represented as a reviewer-owned158-run result.

## F7 — high — CLOSED: surviving Siege cohort stalled above retreat threshold

Requirement PL-07/08. The intermediate160-band source (`49a30ee`) combined normal Siege rocket offsets-180/-220 with a leader order clamped within160 of the live follower median. A full valid2R2K Siege platoon stalled after130 units. More importantly, the shipped3R2K group stalled after one follower-rifle casualty despite4/5 combat-ready strength (above the60% retreat threshold).

Physical reproduction: create isolated mixed Siege; remove enemies/bases; disable weapons; step10s; kill `g.slots[0]` rifle; step40s. Blue leader moved880→860 then stopped in`advance`; surviving rifle1086.225, rockets700/660, median700, leader goal860. Both mirrors reproduced the20-unit backward movement and permanent forward stall. There was no engagement or fortification causing it. Exhaustive ideal-slot enumeration found111 affected above-threshold masks; physical full-roster probing found two failures of216. Original failures are preserved in `cohesion-160-band-review-{rosters,casualty-geometry}.json`.

The correction uses a240 leader order band, strictly exceeding the maximum220 role offset. The physical280 capture leash remains. This distance is a documented implementation choice; the user explicitly selected60/80 thresholds, not a fixed leader distance. Independent reprobes now pass all6825 geometry masks,216 physical roster lifecycles and ten casualty cohorts. Final tactical rows/report were regenerated after this correction and independently re-audited. No outstanding source blocker remains from F7.

## Final matrix and report conclusions

Current `platoon-tactics-results.json` contains648 final240-band runs:9 cases ×3 attack mixes ×4 controllers ×3 seeds ×2 paired mirrors. There are **3 outcome-discordant pairs of324**:

| Case / attack mix / controller / seed | Primary outcome | Mirrored outcome |
|---|---|---|
| Rocket-heavy opposition / mixed / Assault /101 | Attack wins | Defenders win |
| Rocket-heavy opposition / rocket-heavy / Siege /102 | Defenders win | Attack wins |
| Supplied FOB / mixed / Siege /101 | Defenders win | Unfinished |

**77 pairs** differ in at least one recorded metric; maximum paired elapsed difference is**76.375s**. The report states current discordance and keeps mirrored results separate. The historical first-divergence trace was not repeated on final rows and cannot prove the cause of these current discordances. Paired mirrors are not six independent seed samples.

Every empty-FOB mix/controller/seed/mirror captures (72/72). No staffed or supplied FOB is captured. Staffed fixed-force cases include68 unfinished and4 attacking-force eliminations; supplied cases include39 eliminations and33 unfinished. Those are force-episode outcomes, not campaign headquarters victories. Equal-mixed primary Spread wins2/3 versus Independent1/3; rocket-heavy attackers against equal mixed defenders favor Assault3/3 versus Independent0/3. Mixed Siege empty-FOB capture median72.0s versus Independent90.8s; rocket-heavy Siege61.5s/Assault62.8s versus Independent69.1s, while Spread73.9s is slower. Grouping delays some otherwise successful smaller-force encounters, and lower spending can reflect leader loss. The report/study preserve these disadvantages. No universal superiority, natural campaign victory or proof that all ground strategies fail is supported.

## Requirement disposition

| Requirement | Status | Evidence / remaining gate |
|---|---|---|
| PL-07 physical cohesion and ordinary combat | Source/module PASS; browser/visual UNVERIFIED | F7 fixed;6825 geometry/216 lifecycle/10 casualty cases and capture/AA/gait probes PASS; actual mobile rendering pending |
| PL-08 retreat60% / resume80% / min6s | Source/module PASS; browser/visual UNVERIFIED | Exact gates and physical recovery PASS; real retreat/regroup captures pending |
| PL-09 same-engine fixtures and usable lab | Data/module PASS; browser/visual UNVERIFIED | Source and216 start configurations PASS; actual controls, responsive layout and production hook absence pending |
| PL-10 controlled economics/report/preview | Data/report numerics PASS; browser/publication UNVERIFIED | Final648 audit,8 exact replays and108 report cards PASS; report interaction/screenshots and actual preview pending |

Cross-feature review: actual-module probes preserve withdrawal capture suppression, ordinary rifle fire-walk, rocket ground-aim interruption and valid priority AA, fixed-force spending and signed backward stance-foot contact. Legacy Independent intentionally differs in rifle fortification hold and is excluded from the main controller-equality claim. Shared Campaign rifle hold is documented as a deliberate new rule, not silently attributed to grouping. Flight School and legacy Unity are absent from production changes. Root unit evidence does not replace browser/screenshots, physical Safari or actual preview verification.

## Historical evidence — never pooled with final240 results

- Initial source`1e38337`, leader80: [cohesion-initial-controlled-results.json](evidence/cohesion-initial-controlled-results.json). Old `cohesion-review-independent-runs.json`, `cohesion-review-matrix-audit.{mjs,json}` and `cohesion-review-mirror-divergence.json` refer to this matrix. Their8 exact replays,3 discordances and46.0167s elapsed difference are historical.
- Intermediate source`49a30ee`, leader160: [cohesion-160-band-results.json](evidence/cohesion-160-band-results.json). `cohesion-160-band-review-{audit,report}.json` preserve the audit,2 discordant pairs,69 pairs with metric differences and103.1s elapsed maximum. Those values do not describe final source.
- Prior reviewer executed152 unit checks plus5 encounter checks in separate logs, not one combined157 run. Closed findings were F1 six-member compact regroup mismatch; F2 mirrored guard indices/crossing; F3 large-roster leader/resume conflict; F4 unsupported fortified composition/nonboolean resupply accepted; F5 obsolete incoming-capture assertion replaced with physical joining contract; F6 supplied-world pause leaked income/purchases. Their closures were independently re-probed against final source.

Final recommendation remains **INSUFFICIENT EVIDENCE for merge** pending actual browser/visual/publication gates and physical Safari acceptance. Source and controlled numerical evidence support proceeding to those release checks.
