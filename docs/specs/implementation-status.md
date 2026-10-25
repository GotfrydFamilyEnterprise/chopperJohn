# Implementation status at repository handoff (2026-10-25)

| Area | Existing code | Status |
|---|---|---|
| Flight School | `docs/index.html` | User accepted v0.4 feel; automated browser regressions not verified |
| Separate battlefield | `docs/battlefield.html` + JS modules | Implemented scene; no tested visual acceptance |
| Infantry animation | `units/soldierCommon.js`, `rifleman.js`, `rocketeer.js` | User reported latest gait looks good; no screenshot regression suite |
| Rifle engagement/projectiles | `battlefieldScene.js` | Code exists; actual hit/HP behavior not independently browser-tested |
| FOB appearance | `bases/forwardBase.js` | Code attempts sandbags/roof/camo; user specifically reports appearance doesn't satisfy requirement |
| FOB empty on load | `baseCommon.js` | Code intends zero slots; requires behavioral verification |
| FOB arrival and guard posts | `battlefieldScene.js`, `forwardBase.js` | **KNOWN DEFECT**: direct coordinate assignment, no physical entering/occupation animation |
| Full lineup + flag | same | **UNVERIFIED / USER REPORTS NOT WORKING**; must show staged arrival and flag timing |
| FOB bypass and defender replacement | same | Intended code exists but unverified end-to-end |
| Red/blue symmetry | same | Not tested |
| Test infrastructure | none found in docs directory | Missing |
| GitHub Pages build and cache | `master/docs` | Previously served playable versions; latest deployment and browser behavior unverified |

**Important**: Code presence is not completion. User's latest report states that the FOB does not look as requested and occupation/flag is not observed. Treat FOB milestone as BLOCKED regardless of source structure.

## Historical implementation notes
- Flight School initial tutorial, then pitch/collective and animated turn; dedicated TURN fixed mobile Safari double-tap; angled rapid fire and v0.4 rotor dynamics/inertia/telemetry.
- Battlefield prototype initially had two distant HQs, two FOBs with tap-to-deploy garrisons, and two infantry kinds. Requirements changed: NO FOB garrisons; arriving HQ troops occupy it.
- Refactor split rendering into soldier and base modules.
- Gait evolved from bouncing sliding feet toward distance-driven planted-foot/swing behavior; user approved latest visible gait.
- v0.4 battlefield source changes introduced sandbag imagery, slot bookkeeping, rifle bullets but were not proven with browser tests. Camera jump and querystring versioning were added as debugging conveniences, not fixes to occupation.
- User requested Codex mobile workflow and a separate adversarial completeness review.

## Handoff priority
1. Document and lock feature behavior.
2. Run/establish browser test harness and reproducible failures.
3. Rebuild FOB entry/state/renders against acceptance evidence in a PR.
4. Independently review for cross-feature regressions.

## Issue #1 branch validation (2026-10-25)

Status: **PARTIAL — independent review and mobile acceptance gate remain open.** Historical handoff table above describes the pre-repair baseline.

- FOB-01/09: porous camouflage mesh on posts, open interior, sandbags drawn in front of defenders. Fourteen inspected phone-viewport captures are under `docs/quality/evidence/`.
- FOB-03/04/05/07: reservations are separate from physically arrived slots; bounded movement into distinct posts; explicit lifecycle state and casualty cleanup. Flag eligibility depends only on arrived posts.
- FOB-06/10: both factions' browser lifecycle tests verify bypass, stationary guards, casualty vacancy, and replacement.
- CB-01: swept projectile collision and browser assertion of visible rounds and opposing rocket infantry HP reduction.
- QA-01: Playwright with fixed 1/60 second steps and combat isolation. Seven implementer tests passed on repeated local Chromium runs, including identical full HQ-arrival traces. See `docs/quality/browser-testing.md` and `docs/quality/issue-1-audit.md`.
- CI: initial Ubuntu latest run failed during browser dependency setup, before tests. Runner pinned to supported Ubuntu 24.04; corrected [CI run 40235560961](https://github.com/GotfrydFamilyEnterprise/chopperJohn/actions/runs/40235560961) passed on commit 448d3db (seven tests).
- Physical iPhone/Safari, latest deployed GitHub Pages behavior, full Flight School progression, and all cross-feature acceptance requirements are not established by the seven implementer tests. No claim of DONE or merge approval.

The fresh-context adversarial review report supplies the per-requirement acceptance matrix, additional independent test results, and remaining blockers. User mobile acceptance is required before merge or Issue #1 closure.
