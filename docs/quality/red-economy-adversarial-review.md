# Independent red economy adversarial review

Reviewer independently read AGENTS.md, requirements, acceptance, implementation status, architecture, actual modules and scene/unit diff. Production was not edited. This review does not grant merge or deployment approval.

## Defect found and repaired

**Repaired medium defect — AI-04: purchases continued after the loss-triggered regroup began.** In `docs/js/battlefield/ai/redCommander.js:19`, the original tenth-casualty path established a 12-second regroup and disabled reinforcement, but did not invalidate the cached strategy. The purchase path did not check regroup/reinforce. With a previously selected SUPPORT order and a decision deadline 3 seconds away, the same update bought another rifle for the damaged wave. This violated “stop feeding them, regroup12 seconds.” Original reproduction: `node tests-unit/red-economy-review.test.js`, test “review AI-04 tenth casualty stops support purchases immediately during regroup”: actual purchases 1, expected 0. The implementer now invalidates the decision deadline immediately and holds assembling groups through regroup. Independently reran the unchanged failing reproduction: PASS. Expanded it to verify no ordinary purchases throughout the twelve-second hold and resumed 4-rifle/3-rocket composition: PASS.

## Evidence executed and inspected

- Independently executed default-sandbox `node tests-unit/red-economy.test.js`: 8/8 PASS.
- Independently authored/executed `node tests-unit/red-economy-review.test.js`: 4 PASS after the independently reproduced defect was repaired. Includes rejected factory calls under reserve/cooldown, redirecting already-paid replacement, immediate emergency preemption during cached decision cooldown.
- Inspected raw `/tmp/red-economy-browser-final.log`: 30 Playwright checks PASS after the repair, including 4 economy browser checks, 2 independently authored review probes and existing FOB/combat regressions. Browser execution was performed by the parent runner, not invented as an independent local launch.
- Independently inspected `docs/quality/evidence/red-economy-wave.png`: portrait Supply/income/population/objective/progress and blue/manual/camera controls readable; visibly distinct rifle/rocket wave near HQ. Screenshot alone does not prove arrival or pacing; browser trajectory assertion does.
- Additional unchanged reviewer browser probes: `tests/red-economy-review.spec.js`: both PASS in final raw log. Independently inspected `red-economy-review-390.png` and `red-economy-review-844.png`: portrait and landscape HUD remain legible within viewport; blue controls remain usable. Inspected refreshed `red-economy-garrison.png`: actual red occupied FOB visible with 3 distinct defenders and raised flag. Prior blank test-mode camera screenshot is repaired by immediate jump redraw.

## Per-requirement disposition

| ID | Result | Exact evidence / limit |
|---|---|---|
| EC-01 | PASS | Unit income/cap/overflow conservation; browser actual paid opening and zero starting red troops. |
| EC-02 | PASS | Atomic unsuccessful/invalid factory tests, cooldown spacing and 60 reserve rejection; browser ledger intervals. |
| EC-03 | PASS | Unit cap rejection; browser prolonged HQ emergency population never exceeds 15. |
| EC-04 | PASS | Deterministic commander replay and conservation; browser pause exact snapshot equality/reset 120 and empty ledger/squads. Fixed-step determinism only. |
| EC-05 | PASS | Reviewer browser viewport assertions PASS at 390x844 and 844x390; both HUD screenshots independently inspected, labels legible and blue controls visible/red buttons absent. Physical iPhone execution remains outside this browser evidence. |
| AI-01 | PASS | Opening 3 paid defenders, incoming count, actual occupied FOB; one in-transit replacement; independent already-paid redirect without purchase. |
| AI-02 | PASS | Independent cached-decision emergency preemption and reserve purchase; browser sustained threat/cap check. Independent actual-scene emergency probe PASS: existing gathering members retain IDs, switch defense and move<=47/60 per tick. |
| AI-03 | PASS | Unit ordinary 3R2RO and staffed 2R3RO composition, reserve; browser physical full rally release. Staffed-enemy plan browser execution not separately demonstrated. |
| AI-04 | PASS | Independent cached-SUPPORT tenth-casualty regression now passes; no purchases throughout twelve-second regroup; next wave 4R3RO. Original defect repaired and independently retested. |
| AI-05 | PASS | Source uses current public units/bases, deterministic fixed simulation, 3-second decision cadence plus visible emergency/vacancy interrupts; no future player commands accessed. |
| AI-06 | PASS | Direct no-DOM imports execute; supply owns accounting, strategy pure observation/choice, squads own orders without coordinates/damage, commander composes, UI read-only. Scene injects normal HQ factory and movement ceiling. |
| SQ-01 | PASS | Browser samples every tick: maximum displacement<=47/60 and full 5 members at actual rally; no teleport assignments in squad module. |
| SQ-02 | PASS | Unit joined rifle speed 33; browser trajectory bounded; normal reinforcement membership counted once. Natural combat changes spacing within allowed tactical gap. |
| SQ-03 | PASS | Existing browser mirrored FOB lifecycle/regression suite passes with AI isolated; economy active actual red opening and vacancy/replacement also pass. |
| SQ-04 | UNVERIFIED | Existing rocket/bunker browser regression tests PASS, weapon source unchanged and unit movement ceiling preserves existing stop/fire-walk. Full Flight School tutorial/controls and physical iPhone regressions not executed. Legacy Unity and Flight School source untouched. |

## Recommendation

**INSUFFICIENT EVIDENCE** for whole-feature acceptance while physical iPhone/full Flight School evidence remains. No unresolved blocking production defect established after the AI-04 repair. No whole-feature DONE or merge recommendation.
