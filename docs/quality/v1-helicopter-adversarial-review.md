# Independent V1 helicopter acceptance review

Reviewer: separate adversarial agent, 2026-10-26. Production files were not edited by this reviewer. Read AGENTS.md, requirements, acceptance, implementation status, V1 plan, review instructions and actual combat/flight/allocation source. Latest user authorization supersedes historical planning-only status and approves build defaults and immediate aircraft priority with grouped allocation.

## Findings and recommendation

No reproducible blocking production discrepancy established. **INSUFFICIENT EVIDENCE for unconditional merge**: physical iPhone/Safari and the complete visual combat/evasion checklist remain unverified. This does not prevent presenting the reviewable build/PR for user acceptance. No merge authorization is inferred.

The reviewer's attempted browser tool call stalled before its command persisted. This is not a browser test pass. Two reviewer-owned browser negatives are now in `tests/v1-independent-review.spec.js` for execution unchanged in the root runner; results must be appended after actual execution.

## Executed evidence

- Reviewer independently authored and executed four negative module probes in `tests-unit/v1-independent-review.test.js`: fine/coarse closest-approach event equivalence; initial receding-envelope/direct contact and single resolution; dead parked repair/timer protection; disconnected faction/capability allocation. All four passed. Raw `/tmp/v1-independent-unit.log` was subsequently rerun by root; the original reviewer execution used `node --test` over both module files and passed.
- Independently inspected raw root runner output `/tmp/v1-all-browser.log`: **59 passed** in Chromium. This is evidence inspected by reviewer, not independently launched browser execution. `/tmp/v1-unit-final.log`: **32 passed** new implementation module checks. Root also reports 40 historical and four reviewer module checks; those numbers are distinct from the 32.
- Independently viewed `evidence/v1-controls-390.png` and `evidence/v1-controls-844.png`: readable Supply and hull status, distinct visible controls, landed helicopter/pad and infantry. Portrait pilot is above controls; landscape keeps controls within viewport. These screenshots establish those layouts, not touch reliability on physical Safari.

## Requirement matrix

| Requirement | Result | Evidence and limits |
|---|---|---|
| H-01 start/pad; H-05 parked repair | PASS | Flight/repair source, module negatives, root H-START/PAD/REPAIR browser assertions; inspected both layouts. Footprint is entire 64-unit hull within 180-unit pad, horizontal stationary tolerance5. |
| H-03 respawn/pause; H-04 hull/direct/proximity | PASS | Root lifecycle and isolated exact20/5 browser assertions; reviewer dead repair/timer and single-event module negatives. Separate paused pending-respawn browser negative awaits runner result. |
| HG-03 exposed1HP/8rps, accepted flight controls | PASS | Root gun/actual-touch/source-VM parity checks and subframe shot birth assertions, 32-module log. Physical phone handling remains separate below. |
| HG-01/02 independent10% and physical cover | PASS | Actual-contact cover browser test and deterministic threshold/statistical module checks; source protection checks actual registered arrival. Existing rifle5%/0.5 path retained. |
| H-02 enemy-only gun, both infantry types | PASS | Swept earliest physical enemy contact, friendly filtering, wrong-height negative; root browser HG-TEAM/SWEEP. No structural damage path added. |
| AA-01 enemy rockets only | PASS | Faction/eligibility source and negatives; rifles retain ground-only projectile path. Ground rockets are swept against aircraft without steering. |
| AA-02 current2D lead, ballistic nonguided flight | PASS | Independent-source inspection of quartic, muzzle geometry and immutable analytic position; root oracle/evasion tests. Earlier reviewer inspected production roots independently of root narrative. |
| AA-03 scatter | PASS | One RNG sample at launch, inherited interpolation anchors, fallback without resampling; root threshold/anchor assertions. |
| AA-04 radial600 expiry | PASS | Immutable muzzle radial polynomial root; root actual range-browser fuse and module boundary checks. Curved distance is not substituted. |
| AA-05 any direction/stationary guard | PASS | Shoulder pivot geometry/air launcher angle source; root guard and ordinary anti-air browser checks. No guard coordinate mutation introduced by aim. |
| AA-06 closest approach/direct precedence | PASS | Reviewer coarse/fine, initial receding and direct negatives; bounded curved substeps and root exact direct20/near5 checks. Direct threshold includes2-unit projectile radius. |
| Latest immediate aircraft priority / grouped roles | PASS | Typed lock resets aim; shared cooldown. Same-faction connected clusters240 gap, rounded2/3 air with ground reservation and capability fallback. Root n2/n3/n6 browser assertions; n1..6 modules. Reviewer disconnected capability negative passed. |
| Airburst true2D / no friendly splash | PASS | Source box distances, root high-airburst negative and friendly hull filtering. Ground cover blast remains shared1/3, separate from gun penetration. |
| Isolation/deterministic replay | PASS | Root systems projectile/damage gates, repeated scripted input replay, split seeded aircraft RNG; production rendering does not consume gameplay RNG. |
| FOB/economy/ground/fullscreen regression | PASS | Inspected raw59-pass full browser log, existing lifecycle/economy/fullscreen suites included. Source keeps original ground combat modules and equal accounts. |
| Mobile portrait/landscape visual layout | PASS | Two images directly inspected by reviewer; actual multitouch test exists in root passing suite. |
| SYS-02/SYS-03 Flight School/legacy isolation | PASS | Module additions isolated under battlefield; root Flight School VM parity checks. Full tutorial walkthrough is not established. |
| QA-H01 full visual checklist and physical Safari | UNVERIFIED | No physical iPhone Home Screen/fullscreen run, full Flight School tutorial walkthrough, or independently inspected full protected-hit/evade/destruction/repair screenshot sequence. Root natural actual-joystick firing assertion supports natural anti-air, not every visual case. |
| Published preview / GitHub Pages | UNVERIFIED | Hosting was not validated by reviewer in this review. Root should report publication separately after verification. |

No mandatory behavior is marked FAIL. Remaining UNVERIFIED items are acceptance evidence gaps, not an invented source defect. Historical plan/status wording should be updated to describe implemented-but-review-pending work accurately before PR handoff.

## Root runner follow-up (2026-10-26)

The two reviewer-authored browser probes were executed unchanged by the root runner and passed, alongside 15 implementation browser checks: 17 passed in 9.1 seconds. Final module run: 77 checks passed (40 historical, 33 V1, four independent). Raw durable logs accompany this report in `evidence/v1-*-results.txt`. These are root execution results, not a new independent browser invocation. Physical Safari and full visual checklist remain UNVERIFIED. Additional planned guard/evasion browser checks did not persist after an interrupted tool request and are not counted.
