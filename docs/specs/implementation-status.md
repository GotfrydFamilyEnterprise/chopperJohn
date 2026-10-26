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


## v0.7 — red Supply economy and strategic squads

User accepted and merged PR3, then approved the red economy and requested proper code isolation. New feature is on `feature/red-supply-and-strategy`; it is not automatically merged.

- Red starts with 120 Supply and no free troops. HQ earns 5/s to a 240 cap. Rifle costs 25, rocket 60; every deployment observes a 2-second cooldown and 15-living-unit cap, including incoming troops and garrisons. Blue remains manual.
- Separate pure modules own Supply transactions, public observation/strategy, squad readiness/movement and commander composition. A separate UI adapter renders status. Scene only injects spawn, ticks the controller and applies speed limits. See `docs/quality/red-economy-architecture.md`.
- Priorities: HQ defense, FOB staffing/replacement (including already-paid incoming units), wave gathering, support for active squads and rocket-heavy bunker assaults. Wave purchases retain 60 Supply; emergencies may spend it. Actual troops walk to rally before release, and rifles march at the slowest joined unit's speed. Loss adaptation waits 12 seconds and strengthens future groups.
- Validation: **30 browser checks passed**, including two unchanged independently authored emergency/HUD probes; **38 module checks passed**. Existing FOB/rocket behavior passed with the commander isolated in fixtures. Normal-game checks keep paid red provisioning enabled. Raw logs, transactions, rally traces and portrait/landscape screenshots are in `docs/quality/evidence/red-economy-*`.
- Independent review found a regroup/cached-order purchase on the triggering tick; fixed by immediate strategy reevaluation and a rally hold. Independent regression confirms no purchases through the full regroup interval, then a stronger next wave. The original blank test-mode FOB camera capture was repaired by immediate redraw.
- Review: `docs/quality/red-economy-adversarial-review.md`. New economy/AI/order checks PASS; broad Flight School/physical iPhone acceptance remains UNVERIFIED. No claim that all historical acceptance gaps are resolved. No merge without new user approval.

## v0.8 — shared faction economy and equal free opening

User requested identical economy for both sides, then explicitly retained five free soldiers per faction (3 rifles+2 rocketeers). EC-06..08 supersede the historical red-only/free-blue imbalance. Both accounts start120, earn5/s, cap240, charge25/60, share a2-second per-faction cooldown and15-living cap; all later manual/AI units use the same transaction. The same commander/strategy/squad core handles mirrored factions. Both accounts/objectives and priced disabled controls are visible.

Validation:35 Chromium Playwright checks passed (34 full suite plus1 forced-event negative probe);40 module checks passed, including independently authored mirrored emergency/formation probes. Raw logs and fresh phone/landscape screenshots are `docs/quality/evidence/shared-economy-*`. Both phone orientations inspected; both factions naturally fire rockets within60s. Historical evidence preserved under original paths, current regression captures under `shared-economy-regression/`. Independent review recorded separately; full Flight School progression and physical iPhone/Safari remain UNVERIFIED. No automatic merge.

Private Sites preview v0.8 successfully published via native deployment `appgdep_6adeb053f53881919e4691b1261d1229` from source `2b50f0f18a12b1f293fc8cff9dcbb6d193a2d020`: https://chopperjohn-fob-preview.earthyluck64.chatgpt.site/battlefield.html?v=0.8.0&view=rockets . Publication is separate from the gameplay PR and does not assert GitHub Pages deployment.

## v0.8.1 — fullscreen control
User accepted merging PR5; GitHub Pages v0.8 was verified live. FS-01..03 add a view-only Fullscreen/Exit fullscreen button beside Pause, native root fullscreen with navigationUI hide, browser-exit synchronization, honest unsupported/blocked help, standalone manifest and Apple launch metadata for Safari Home Screen play. No gameplay, Flight School or legacy Unity behavior changed.

Validation:35 preexisting browser regressions passed. Nine targeted fullscreen checks pass, including five independent reviewer probes executed in root's runner. A vendor-only negative probe found exit API-family selection; repaired to match the active standard/vendor element and reran all9 successfully. Fresh portrait/landscape/native-fullscreen/help screenshots independently inspected. Logs are `evidence/fullscreen-regression-results.txt` (initial43PASS/1FAIL) and `evidence/fullscreen-final-results.txt` (corrected9PASS). Reviewer-owned browser invocation stalled; actual physical iPhone standalone launch, browser chrome removal and safe-area appearance remain UNVERIFIED. Independent review: `docs/quality/fullscreen-adversarial-review.md`.

Sites preview v0.8.1 native publication succeeded (deployment appgdep_6adecd3a0bcc8191ac18ab5c6171720b), with a subsequent vendor-exit repair publication tracked in PR. This feature remains on a separate branch pending user acceptance; GitHub Pages stays on mergedv0.8 until this PR is merged.

## V1 helicopter — planning only
User requested a full story and test plan before introducing the helicopter. See `docs/specs/v1-helicopter-plan.md`: confirmed enemy-only fire,10%/1HP helicopter penetration of stationed FOB defenders, rockets-only aircraft attacks, current-velocity leading, inherited distance scatter and maximum-range explosion. User subsequently selected ballistic arcs, any-direction aiming,10-second respawn and proximity detonation. User also selected100 hull,20 direct/5 nearby rocket damage, parked helipad repair, and the machine-gun-only/8rps/exposed1HP baseline. User confirmed direct hull impacts or closest-approach bursts within25 units, plus5 hull/s repair while landed and stationary on the pad. Precise collision shapes, range metric and launch tuning remain proposed defaults. No aircraft gameplay code, scene changes, new test results or deployment are asserted by this planning work.

## V1 helicopter implementation — 2026-10-26

**IMPLEMENTED / REVIEW PENDING**, separate feature branch; planning PR #7 merged. H-01–05, HG-01–03 and AA-01–06 are implemented in isolated aircraft, interception, projectile, weapon, allocation, camera and input modules. Both economy accounts and five-soldier openings remain unchanged.

Rocket groups reserve approximately two thirds for reachable aircraft and one third for ground threats (rounded, retaining one ground role when feasible); single launchers prioritize aircraft. Capability and valid targets override quotas. Typed changes restart aim but preserve reload; committed shots never steer.

Executed evidence: 77 module checks pass; full browser run 59 pass plus targeted 17 pass (61 distinct browser checks overall, including two independent reviewer probes). Raw outputs are in `docs/quality/evidence/v1-module-results.txt`, `v1-browser-full-results.txt`, and `v1-browser-review-results.txt`. Deterministic fixtures isolate flight, troops, weapons, projectiles, damage, repairs and economy. Actual joystick flight from the pad produced enemy AA launch at 14.1 seconds and a proximity hit at 15.7 seconds. Screenshots/traces are under `docs/quality/evidence/v1-*`.

Independent review: `docs/quality/v1-helicopter-adversarial-review.md`; no confirmed production blocker. Physical iPhone/Safari play, full visual evasion/destruction/repair sequence and complete Flight School tutorial remain UNVERIFIED. Existing Flight School source and Unity directories are unchanged. No unconditional completion or merge claim.
