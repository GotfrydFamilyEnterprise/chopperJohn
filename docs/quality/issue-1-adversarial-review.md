# Issue 1 independent adversarial review

Reviewer context: separate agent, independently read AGENTS.md, all docs/specs files, review contract, production diff, unit rendering and FOB source. Final independent review; browser execution limitation remains. Implementer assertions are not treated as execution evidence.

## Gate: INSUFFICIENT EVIDENCE — do not merge

Independent browser execution has not returned results: two isolated Playwright command attempts stalled before returning a session and were externally aborted after 577 seconds (first combined read/run) and 213 seconds (second isolated run). No browser PASS is claimed. Seven supplied screenshots have now been independently inspected; static visual findings are recorded below. This is an evidence blocker, not a reported assertion failure.

## Traceability

| Requirements | Implementation | Independent test/evidence | Actual result / reviewer outcome |
|---|---|---|---|
| SYS-01,03; BF-01..05 | battlefieldScene.js, battlefield.html, index.html | Browser/mobile/navigation pending | UNVERIFIED, mandatory |
| SYS-02 | git diff limited to browser/docs/test infrastructure | Source diff | PASS for reviewed diff; legacy untouched |
| SYS-04; CB-03 | browser production diff | No vehicles/rocket damage/capture additions in reviewed diff | PASS scope |
| SYS-05 | Accepted behavior preservation | No independent regression execution | UNVERIFIED, mandatory |
| FL-01..09 | docs/index.html | No independent flight control/tutorial browser tests | UNVERIFIED, mandatory regression coverage |
| AN-01..04 | units/soldierCommon.js | Numerical stance/continuity test | PASS numerical subset; UNVERIFIED full animation |
| RI-01..06 | rifleman.js, battlefieldScene.js | Existing tests not independently executed | UNVERIFIED |
| RO-01..05 | rocketeer.js, battlefieldScene.js | Existing tests not independently executed | UNVERIFIED |
| BF-06, FOB-01..10 | forwardBase.js, battlefieldScene.js | See individual core matrix below | Module/static subsets PASS; browser UNVERIFIED |
| CB-01,02 | battlefieldScene.js | Combat/range/front/friendly-fire probes pending | UNVERIFIED |
| QA-01 | battlefieldTest deterministic hook, tests | Repeat execution not independently observed | UNVERIFIED |
| QA-02 | this independent review | Fresh source/spec review performed; execution incomplete | PARTIAL / UNVERIFIED |

## Gait source concern retracted after independent numerical check

Initial source reading incorrectly attributed CYCLE_DISTANCE to swing amplitude. Actual swing uses stanceTravel, giving continuous contact transitions. Independent numerical assertion confirms stance world coordinate invariance and continuity at phase .60. No gait defect is established; full-cycle visual behavior remains UNVERIFIED.

## Pending adversarial cases

Enemy rejection; three rifles without rocket; simultaneous/out-of-order arrivals; reset mid-entry; reservation casualty cleanup; mirrored life cycles; exact range boundaries and behind-target rejection; no friendly fire; rocket HP/damage exclusion; close muzzle collision; stationary phase and gait cycle; pause/pan/spawn/reset/navigation; complete Flight School regression. Browser-level checks remain UNVERIFIED; executed module-level cases are listed below.

## Final static visual inspection

Independently opened with view_image: evidence/team-0-empty.png, team-0-stage-1.png, team-0-stage-2.png, team-0-occupied.png, team-0-vacancy.png, team-1-occupied.png, team-1-replacement.png. Images are supplied artifacts; their creation/causal state transitions were not independently executed.

- **FOB-01 PASS (static visual only):** mobile images show staggered layered sandbag frontage, four visible support posts, open interior and porous crossing mesh with camouflage patches. Three distinct bodies remain visible behind the frontage in both occupied images.
- **FOB-09 PASS (static visual clarity only):** empty, 1-rifle, rifle+rocket, occupied, vacancy and replacement images clearly differentiate visible staffing and label counts. Blue occupied has three distinct defenders; red occupied/replacement mirror direction and color. Occupied flag appears above roof; partial and vacancy images show no flag.
- **FOB-02..08,10 remain UNVERIFIED behaviorally:** still images cannot prove initially empty startup, entry continuity, arrival-dependent counting, flag animation timing, bypass, casualty causality, enemy rejection or symmetric simulation.
- **SYS-01/BF-04 remain UNVERIFIED behaviorally:** all images have legible mobile deployment/pause/reset/navigation controls without obvious viewport clipping, but touch targets and actual actions were not independently exercised.

Final recommendation remains **INSUFFICIENT EVIDENCE — do not merge**, because mandatory behavioral criteria remain UNVERIFIED. Static visual acceptance does not replace missing independent execution.

## Independent pure module execution

Executed `node tests-unit/adversarial.test.js` locally without network or browser. Two mirrored FOB cases cover enemy rejection, simultaneous reservations not counted as arrivals, third-rifle rejection with no rocket, three distinct posts, full staffing, further rocket rejection, casualty reservation/slot cleanup and replacement. These establish pure module logic only; scene wiring remains UNVERIFIED. A third test checks stance invariance and transition continuity. `node --test` process isolation failed in this sandbox before reporting individual assertions; direct node execution runs the node:test suite normally.

| Core ID | Source / independent evidence | Final outcome |
|---|---|---|
| FOB-01 | forwardBase.js; seven inspected images, especially team-0-empty/occupied | PASS static visual |
| FOB-02 | createBase; team-0-empty | UNVERIFIED startup behavior; static empty image confirmed |
| FOB-03 | assignDefender/advanceDefender; tests-unit/adversarial.test.js both factions | PASS module reservation/arrival/distinct posts; UNVERIFIED browser entry |
| FOB-04 | refreshOccupation; independent module tests; team-0-stage-1/2 | PASS module partial/full states; UNVERIFIED scene wiring |
| FOB-05 | occupied; independent module tests; partial/occupied images | PASS module composition; UNVERIFIED animated flag timing |
| FOB-06 | assignDefender rejects further qualifying units; independent module tests | PASS module rejection; UNVERIFIED forward bypass motion |
| FOB-07 | releaseDeadDefenders; independent module tests; vacancy/replacement images | PASS module vacancy/replacement; UNVERIFIED combat/flag causality |
| FOB-08 | assignDefender opposing-team rejection; independent module tests | PASS module rejection; UNVERIFIED enemy browser traversal |
| FOB-09 | inspected staged, occupied, vacancy and replacement images | PASS static visual clarity; UNVERIFIED animated observation |
| FOB-10 | mirrored independent module tests; team-1 occupied/replacement images | PASS module symmetry/static mirrored visuals; UNVERIFIED scene movement |
