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

Status: **PARTIAL — independent browser review and mobile acceptance gate remain open.** Historical handoff table above describes the pre-repair baseline.

- FOB-01/09: porous camouflage mesh on posts, open interior, sandbags drawn in front of defenders. Fourteen phone-viewport captures (seven independently inspected) are under `docs/quality/evidence/`.
- FOB-03/04/05/07: reservations are separate from physically arrived slots; bounded movement into distinct posts; explicit lifecycle state and casualty cleanup. Flag eligibility depends only on arrived posts.
- FOB-06/10: both factions' browser lifecycle tests verify bypass, stationary guards, casualty vacancy, and replacement.
- CB-01: swept projectile collision and browser assertion of visible rounds and opposing rocket infantry HP reduction.
- QA-01: Playwright with fixed 1/60 second steps and combat isolation. Seven implementer tests passed on repeated local Chromium runs, including identical full HQ-arrival traces. See `docs/quality/browser-testing.md` and `docs/quality/issue-1-audit.md`.
- CI: initial Ubuntu latest run failed during browser dependency setup, before tests. Runner pinned to supported Ubuntu 24.04; corrected [CI run 40235560961](https://github.com/GotfrydFamilyEnterprise/chopperJohn/actions/runs/40235560961) passed on commit 448d3db (seven tests).
- Physical iPhone/Safari, latest deployed GitHub Pages behavior, full Flight School progression, and all cross-feature acceptance requirements are not established by the seven implementer tests. No claim of DONE or merge approval.

The fresh-context adversarial review report supplies the per-requirement acceptance matrix, additional independent test results, and remaining blockers. User mobile acceptance is required before merge or Issue #1 closure.

### Independent adversarial outcome

See `docs/quality/issue-1-adversarial-review.md`: three independently authored module tests passed; seven screenshots inspected. FOB-01 appearance and FOB-09 static clarity PASS. Independent browser execution stalled at the tool layer, so browser wiring, full Flight School regressions, and physical iPhone acceptance remain UNVERIFIED. Recommendation: **INSUFFICIENT EVIDENCE — do not merge**. The initial gait concern was retracted after a numerical continuity test.


## Approved rocket combat and bunker protection (v0.6)

PR #2 gameplay was accepted by the user and merged. The new rocket/cover feature is on a separate branch, not merged. RC-01..08 and BC-01..05 supersede the earlier aim-only rocket restriction.

- Implemented 225–500 target range, upward muzzle alignment, 0.7-second uninterrupted aim, 3-second reload, analytic ground-directed arcs, seeded ±5/20/50 scatter, 25-unit radius and linear 2-HP exposed damage.
- Physically stationed defenders receive one shared 1/3-HP rocket hit per bunker blast, or 5% chance of a 0.5-HP rifle penetration. Entering/bypassing infantry remain exposed. No friendly fire.
- Validation: **20 Playwright checks passed** in Chromium at phone/landscape viewports; **17 module checks passed**, including 14 independently executed new combat/review tests and 3 existing module checks. Logs/screenshots/traces are under `docs/quality/evidence/rocket-*`.
- Independent reviewer authored three browser probes, executed unchanged in the browser runner, and independently inspected raw logs and ascent/impact/dust/casualty images. Initial one-tick reload defect and landscape overlay/screenshot resize issues were repaired.
- Review: `docs/quality/rocket-adversarial-review.md`. RC-04 visible near/far miss comparison, BC-05 active absorbed-hit visual evidence and full RC-08 Flight School/physical iPhone regression remain UNVERIFIED. No unresolved production combat defect established; overall recommendation INSUFFICIENT EVIDENCE. Do not describe the whole acceptance gate as passed.
- Private Sites preview published successfully: https://chopperjohn-fob-preview.earthyluck64.chatgpt.site/battlefield.html?v=0.6 . Publication confirms hosting, not physical iPhone acceptance.


## v0.6.1 — natural firing, autonomous goals and moving-target lead

The user reported no visible rocket fire, then requested farther range, autonomous targets and leading moving enemies. User explicitly selected **600 units**. The unshipped 750-unit tuning assumption is superseded; current engagement band225–600 retains rifle overlap25. Precision anchors225±5/350±20/500±50 extend to600±66.

- Reproduced v0.6 root cause in ordinary initial HQ wave: **zero launches in180 seconds**, because its rocket soldiers all staffed distant FOBs. With two extra manual deployments, first launch42.5167s. Raw evidence: `evidence/rocket-no-fire-diagnosis.txt`.
- Added one assault rocket soldier per side from HQ, alongside the bunker-bound rocket. Initial FOBs remain empty and occupation unchanged. Current normal wave fires first at41.0s, both factions verified, without manual spawns.
- Moving-target goal prediction uses previous-tick actual ground velocity and solves the intercept/ballistic time together. Stationary targets receive no lead. Eligible goals remain locked through aim; dead/out-of-band/friendly/behind targets are rejected and autonomously reacquired. Flight remains unguided after launch.
- Added opt-in Follow rockets view, visible launch count, predicted aim marker and aiming/reloading/guarding/advancing labels. Fit origin/impact to phone screen, retain impact briefly, and exit follow on manual pan/arrow/FOB jump. Link: `battlefield.html?v=0.6.1&view=rockets`.
- Validation: **24 browser tests passed** at confirmed600, **26 module checks passed**. Independent reviewer executed new math/target probes, authored browser follow/control tests, and inspected raw final logs, mirrored moving-target screenshots and ordinary-wave trace. See `docs/quality/rocket-natural-play-adversarial-review.md` and `evidence/rocket-leading-*`.
- All new firing/leading/follow checks PASS; overall acceptance remains PARTIAL for previously documented near/far visible-miss comparison, absorbed-hit visual capture and full Flight School/physical iPhone regressions. No new merge authorization; PR3 stays unmerged.
