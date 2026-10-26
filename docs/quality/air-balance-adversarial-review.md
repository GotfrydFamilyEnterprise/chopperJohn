# Independent manual-blue and air-balance review

Reviewer: separate acceptance-review agent, 2026-10-26. Read AGENTS.md, requirements BAL-01..05 and older EC/AA contracts, acceptance, implementation status, source diff and tests. No production edits made.

**Recommendation: INSUFFICIENT EVIDENCE for the complete acceptance gate.** No unresolved source defect established after the two corrections below. Physical iPhone/Safari, deployed behavior and a fresh independent end-to-end browser run remain UNVERIFIED. Publication is not evidence of those checks.

## Findings and corrections

- **Medium, BAL-04, corrected:** `ai/strategy.js` originally selected AIR_DEFEND only with fewer than three rockets. Three rockets plus one rifle bypassed the required rifle-screen restoration. Independent reproduction returned PREPARE. Current predicate includes fewer than two rifles; independently rerun probe returns AIR_DEFEND.
- **Medium, BAL-05, corrected:** `combat/rocketAllocation.js` originally ranked air shooters by horizontal order. Crossing two positions within the same group changed delays despite unchanged membership and capability. Stable ID ordering now preserves both delays; independent rerun passes.

## Acceptance matrix

| Requirement | Result | Evidence and limits |
|---|---|---|
| BAL-01 manual blue | PASS source/recorded Chromium; independent browser UNVERIFIED | Scene initializes/resets blue AI false and separately accrues income without a blue deployment callback. Inspected `tests/air-balance.spec.js` normal120s assertion: five blue units, zero spending,240 supply; manual cooldown/pause/reset covered. Implementer raw `evidence/balance-core-results.txt`:4 passed. Independent browser attempt was interrupted at tool layer before execution; no independent browser PASS claimed. |
| BAL-02 paid replacement | PASS module/source/recorded Chromium | Independently executed seven balance module tests;599/600 ticks, insufficient funds then90 supply, exactly one charge/ledger entry, null factory unchanged, troop cooldown preserved. Scene disables free physics respawn and charges only support-confirmed replacement; flight/commander gates block charge. Pause exits before updates. Inspected core browser log and assertions. |
| BAL-03 ammo/rearm | PASS independent module/source/visual | Independent gun probes at1/120,1/60,1/30,.25,1s all spawn exactly120 rounds and end at0. Existing executed module checks cover30/s,cap120,held FIRE,motion/off-pad/death. Source rearm uses same pad predicate as repair; damage/flight equations unchanged. Inspected empty/rearm screenshots. |
| BAL-04 paid response/screen | PASS independent threshold/module/source; browser independently UNVERIFIED | Executed balance modules cover exposure2s,quiet6s,friendly/dead filtering and paid60 rocket accounting. Corrected screen case independently passes. Source retains HQ/FOB priority, counts living/incoming troops and uses ordinary purchaseUnit costs/cooldown/cap. Root core Chromium log records paid response/replay PASS. |
| BAL-05 stagger/AA regression | PASS independent module/source | Executed module test observes three staggered launches after full aim. Independent crossing probe passes correction. Delay added only to air threshold;3s shared reload, ground update path, planning/scatter and committed flight unchanged. Existing AA quota allocation preserved. |
| UI-03 touch selection/callout | PASS source and recorded Chromium; physical Safari UNVERIFIED | CSS sets user-select:none and -webkit-touch-callout:none on html/body. Installed touchGuards cancels contextmenu/selectstart/dragstart on gameplay controls without cancelling pointerdown/up/move. Root raw touch log:1 passed,1200ms CDP simultaneous touch,8 shots,joystick,TURN/menu/release. Reviewer did not independently execute that browser test. |
| Full browser/deployment/iPhone gate | UNVERIFIED | Root broad log initially68 passed/1 failed; later focused core log4 passed. Final full rerun was still in progress at handoff. These logs must not be added as if all were distinct independent runs. No deployed check or physical Safari execution performed by this reviewer. |

## Visual inspection

Independently opened `balance-manual-blue.png`, `balance-pad-rearm.png`, `balance-air-response.png`, `balance-empty-ammo.png`, `balance-waiting-supply.png`. Landscape HUD and deployment/fire/turn controls are legible and separated; rearm image shows Ammo30 +30/s with concurrent repair. Portrait menu exposes manual blue,120 rounds,+30/s and90/10s help; red occupied bunker/air rocket are visible. Static screenshots cannot establish timing, touch behavior or paid accounting.

## Evidence and regression scope

- Reviewer executed `node tests-unit/air-balance.test.js`:7 passed (`/tmp/air-balance-independent-module.log`). Also independently executed existing V1 review module file successfully with node test runner.
- Independently authored and executed corrected screen,stable-rank and multi-timestep ammo probes: `evidence/balance-independent-review-probes.txt`.
- Read root-run `evidence/balance-core-results.txt` and `evidence/balance-touch-results.txt`; attribution retained above.
- No changes to Flight School or Unity assets observed. Older symmetric-commander tests must explicitly enable blue AI; the normal game must retain manual default. Existing legacy EC-07 automatic-blue text is superseded by BAL-01.
- No new runtime defect established by source review; natural firing, FOB lifecycle, all existing input controls and physical Safari still require the final recorded browser/mobile evidence before claiming the complete feature DONE or recommending merge.
