# Independent v0.6.1 natural-play and leading review

2026-10-25. This addendum supersedes the previous review's no-predictive-lead/500-range assumptions. User requested farther engagement, autonomous targeting and leading moving opponents, then selected exactly **600 units maximum**. Current source/spec agree on 225–600; scatter extends the existing slope from ±50 at 500 to ±66 at 600. Provisional 750 was superseded before publication; its earlier timing is not current evidence.

Reviewer independently read changed combat, scene, soldier and HTML source, updated requirements/acceptance/decisions, new tests and raw diagnostic/results. No production edits were made by the reviewer.

## Root-cause evidence

Independently inspected `/tmp/rocket-natural-diagnostic.log`. The previous v0.6 unmodified starting wave fired zero rockets over 180 simulated seconds: both rocket soldiers occupied their own FOBs at x1120/2480, outside range. The same diagnostic with extra deployed rockets recorded 52 launches, first at 42.5167 seconds. This corroborates the user report. Earlier synthetic test passes were insufficient to establish natural gameplay.

## Independent challenge and current results

- Independently executed `node tests-unit/rocket-leading.test.js`: 7/7 pass, both teams with toward/away/stationary motion and target lock/reacquisition.
- Added two probes to `tests-unit/rocket-review.test.js`, adapted after user selected 600; independently rerun **6/6 pass**. Covers ballistic endpoint/mirror symmetry at 225/350/500/550/600 and ±47/19.74 observed speeds; rejects behind/friendly/dead/too-close/600.001 locked targets and reacquires eligible fallback at 600.
- Numerical sweep across gameplay speeds found no meaningful intercept convergence error. Velocity comes from actual preceding-tick displacement, rather than nominal marching speed. Prediction commits at launch; airborne update does not consult target position. Subsequent target motion changes may still produce misses.
- Authored `tests/rocket-follow-review.spec.js`, executed unchanged by implementer's browser runner. Independently inspected final `/tmp/rocket-leading-browser-600-final.log`: **24 passed (22.2s)**, including the independent natural-wave camera/reset probe, mirrored 600 boundaries, leading, existing FOB/cover, repeat aim/reload, non-interception/death and deterministic replay checks. This is delegated execution of independent tests, not independently launching a browser by the reviewer.
- The first 600 run had 22 passes/two moving-target-fixture failures. Independently confirmed cause: target red x2400 lies within its FOB2480 catchment and walks toward post2437, increasing the initial 600 gap and correctly cancelling aim; blue x1200 mirrors this toward1163. Corrected open-field fixtures place blue shooter1400/target2000 and red shooter2200/target1600. Signed observed-velocity assertions now prove actual approach at−47/+47 rather than incidental bunker-entry motion. No production fix was used to mask these failures.

## Browser traces and visual evidence

Independently inspected current `evidence/rocket-leading-team-{0,1}.png` and corresponding JSON. Both images show mirrored airborne projectile/trail, reloading shooter and ground crosshair. Traces show target velocities −47/+47 and solved moving intercepts at1862.1399956/1735.5233642 respectively. These synthetic scenes establish leading behavior but are not substituted for natural play.

Separately inspected current `rocket-opening-follow.png` and its trace. The normal initial wave, with the deliberate extra HQ assault rocket per side and **no deployment clicks**, first launches at **41.0 simulated seconds**. Both factions launch, and six cumulative launches occur by 51.5 seconds. The opening screenshot shows two airborne rockets, both shooters, and a two-launched count. The independent follow probe proves both launch/impact endpoints within 390px, pause snapshot equality, reset clears counter/projectiles/aim/goal/posts and restores four HQ rockets, and keyboard/toggle/FOB navigation works. The natural test also verifies pointer interaction exits follow.

These are deterministic Chromium executions through the production scene in test mode, not physical iPhone acceptance, wall-clock real-time replay, or independent deployment verification. Zoom-to-fit makes soldiers smaller on a phone; usability should be assessed on the user's device.

## Outcomes

| Requirement | Outcome | Evidence / remaining limits | Severity |
|---|---|---|---|
| RC-01 extended range | PASS | Confirmed 600 source/spec, independent eligible 600/reject 600.001 probe, mirrored browser boundaries. | — |
| RC-03/09 leading/autonomous targets | PASS | Module matrix, signed ±47 browser fixtures/traces, locked invalid-target reacquisition, existing no-homing/death/non-interception regressions. | — |
| RC-04 extended scatter | UNVERIFIED | Continuous 5/20/50/66 anchors present; prior near/far visible miss comparison remains absent. | medium |
| RC-10 natural initial-wave fire | PASS | Current 600 normal wave fires both factions, first 41s; trace/count and visible two-projectile screenshot independently inspected. | — |
| RC-10 follow/camera/reset | PASS | Independent probe passes endpoint bounds, pause/reset/manual controls; count/status/crosshair/flight visible in images. | — |
| RC-08 / BC invariants | UNVERIFIED | Current 24 browser regressions pass including mirrored lifecycle/cover and reset; full Flight School/physical mobile and prior absorbed-hit visual-feedback evidence remain absent. | high |

## Recommendation

**INSUFFICIENT EVIDENCE for the whole repository completion gate**, retaining prior RC-04 near/far visual comparison, BC-05 absorbed-hit visual feedback and full RC-08 Flight School/mobile gaps. The specific no-fire natural-opening defect is independently corroborated before and verified repaired after in deterministic Chromium at the confirmed 600 setting. No unresolved leading-math or camera/reset defect established. Physical-device user acceptance and independently verified preview deployment remain unverified.
