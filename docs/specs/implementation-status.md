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

## Compact battlefield interface — 2026-10-26

UI-01/02 implemented on PR8 feature branch. Rifle/rocket SVG deployment icons with visible costs sit beside FIRE/TURN; secondary controls, Flight School and full strategic details are in the top-right disclosure. A slim HUD retains faction supply/population and hull. Camera bands reclaim the previous large strategy/tool rows, prioritizing landscape. Menu open releases held inputs; outside tap, Escape and actions close it; keyboard controls respect focused UI.

Validation:77 module checks passed. Full browser run64 passed with one portrait fixture failure (outside tap incorrectly landed within the menu); corrected coordinate and focused run4 passed, covering65 distinct checks overall. No failed production assertion remains. Raw logs: `evidence/compact-module-results.txt`, `compact-regression-results.txt`, `compact-ui-results.txt`. Screenshots inspected at844×390,740×360 and390×844. Physical Safari remains UNVERIFIED. Independent review report: `docs/quality/compact-ui-adversarial-review.md`.

Released private preview: https://chopperjohn-fob-preview.earthyluck64.chatgpt.site/battlefield.html?v=1.0.1 . Native deployment succeeded, id `appgdep_6adf5d9cd9108191be77f184f181ad9e`, exact Sites source `46b36f2863a13c1dc38d6e8cbdf1eca01377a05b`. GitHub Pages has not changed; gameplay PR still requires user acceptance before merge.

## V1.1 manual blue, helicopter logistics and touch controls — 2026-10-26

BAL-01..05/UI-03 implemented on feature/manual-blue-and-air-balance. Blue never provisions infantry automatically; its income/cap/opening remain identical, explicit troop buttons charge normally. Helicopter replacement is a separate automatic90-supply transaction after10s minimum; insufficient funds hold the destroyed state.120 ammo,8rps,30 rounds/s parked rearming with FIRE released; repair/flight/damage unchanged. Red responds to sustained visible aircraft with paid rockets while restoring a minimum rifle screen. Stable-ID air ranks stagger launches0.22s without steering existing rockets.

Touch controls suppress text selection/WebKit callouts, context menus and dragging. Actual1200ms two-touch Chromium hold retains8shots/s and joystick lift, no selected text, released fire, usable TURN/menu. Physical Safari remains UNVERIFIED.

Validation:84 module checks pass (77 previous+7 new); full real-browser suite70 passed in1.3m. Raw logs: evidence/balance-module-results.txt and balance-browser-final-results.txt. The earlier regression log retained68 passes and one test-fixture failure (reset intentionally disables AI; corrected by explicit redAI(true)); final suite is clean. Independent reviewer found rifle-screen and unstable-rank edge cases; both corrected and independently re-probed. Report: docs/quality/air-balance-adversarial-review.md. No confirmed source blocker; physicalSafari and reviewer-owned browser execution UNVERIFIED. Landscape/portrait HUD screenshots and balance-response-trace.json are recorded separately.

Public Sites preview v1.1.0 published for mobile acceptance; GitHub Pages remains v1.0.1 until this branch is accepted and merged. No merge authorization inferred.

## V1.2 main menu and battlefield tutorial — 2026-10-26

MENU-01..04 implemented on feature/main-menu-and-tutorial. Production and deterministic `?test&menu` enter the main menu; no simulation clocks run until New Game/Tutorial. New Game resets all prior combat, budgets, army, inputs, practice flags and progress. End game/tutorial in the dropdown discards the session and returns home, releasing pilot and pan capture/keys, closing menus/dialogs and stopping clocks. Reset restarts the active mode. Version1.2.0 is sourced from session/version.js; menu displays ©2026 Ilya Gotfryd.

Separate pure sessionFlow/tutorial modules own mode and observable goals; sessionMenu owns presentation. Tutorial uses real physics/input/projectiles/paid deployment and pad services in safe practice (enemy troops/AI and damage disabled), then explicitly starts a clean normal battle. Six goals cover lift, movement, turn,8 rounds, both troop purchases and parked rearming. Actual pointer-handler flight completes the whole course without coordinate patches. Training permits one purchase of each soldier only during its deployment step. Existing Flight School and Unity source unchanged; standalone manifest now opens the main menu rather than forcing rocket-camera view.

Validation:88 module checks pass; full74 browser checks pass (1.2m), with final five session/touch checks also passing after capture-release/render refinements. Evidence: menu-module-results.txt, menu-browser-results.txt, menu-final-ui-results.txt, menu-tutorial-flight.json and menu-*.png. Root inspected main portrait/landscape, practice instructions and completion screenshots. An initial automated landing controller asymptotically hovered just above the ground; using real downward input to make contact corrected the test without changing flight physics. Legacy combat fixtures explicitly begin in game mode only under `?test`; normal production starts were also tested with no test controller.

Independent review: docs/quality/main-menu-adversarial-review.md. Physical iPhone/Safari remains separately UNVERIFIED; no automatic merge. Public v1.2.0 preview is prepared for user acceptance; GitHub Pages remains the previously mergedv1.1.0 until accepted merge/publication.

Public preview publication verified: Sites source8623cca4ce24e8b67f78ed59522237bd1dff5e16, savedversion12, deploymentappgdep_6adfbf2563f48191b184510c2c9716f4 succeeded. URL: https://chopperjohn-fob-preview.earthyluck64.chatgpt.site/battlefield?v=1.2.0 . Audience remains public; no sign-in required. Publication is separate from PR merge and physical-device acceptance.

## V1.2.1 distinct tutorial entry and quiet range — 2026-10-26

User reported both menu choices appeared to lead to the game, then clarified they had not checked the instruction card. A direct Playwright probe of the public v1.2.0 normal URL independently confirmed New Game had live-mode UI and Tutorial had Lift off/End tutorial/no red HUD, with no runtime errors. The routing states were distinct, but the shared battlefield presentation made the distinction too weak.

MENU-05 now routes Tutorial first to a dedicated frozen welcome screen. Begin Tutorial explicitly starts a labeled practice range with blue HQ/pad, altitude guide and turn marker, no opening armies or visible combat FOBs/enemy HQ, no enemy AI or damage. Only the lesson's explicit two purchases add troops; they stop at800/760 before hidden FOB approach regions. Intro has working Main Menu/End tutorial and preserves mode on reset; New Game retains ordinary armies/AI/damage. Version and changed modules are cache-busted at1.2.1.

Validation:88 module checks passed;10 focused browser checks passed, including distinct frozen intro, both intro exits, empty one-minute practice, complete actual-control lesson, normal game restoration, portrait/landscape, compact layout and long-press/multitouch. Raw logs: separation-module-results.txt and separation-focused-results.txt. Full prior74-test run remains attributed to v1.2.0; it is not a new75-test full-run claim. Screenshots: menu-intro-844/740/390.png, separation-training-844/390.png and separation-complete.png. Fresh independent reviewer inspected intro/practice captures and independently executed range/flow probes; no source blocker. Report: docs/quality/tutorial-separation-adversarial-review.md. Reviewer-owned browser and physical Safari remain UNVERIFIED.

## V1.3 rocket breach, rifle takeover and HQ victory — 2026-10-27

CAP-01..06 implemented on feature/base-takeover. Both FOBs and headquarters have6 defense points, damaged only by physically reaching enemy rocket explosions. Fortified empty buildings are autonomous ground-rocket targets. Existing FOB cover persists through the breaching blast, then occupants become exposed. Live free riflemen physically approach and hold breached interiors5s; enemy infantry contest, lost capturers reset progress, rockets/heli cannot capture. Ownership/flag and garrison bookkeeping change without moving/converting soldiers.20s uncontested owner-rifle rebuilding restores defenses; enemy rockets/builder loss/contests reset it. No new supply or spawn bonus. HQ capture shows Victory/Defeat (simultaneous opposite captures draw), freezes clocks/input and offers freshgame/menu. Tutorial remains safe and distinct; blue remains manual.

Pure takeover, assault orders and status rendering modules are separate from composition/UI. Red commander observes zero/multiple owned FOBs and base-specific incoming garrisons. Navigation labels now use West/East FOB because ownership can change. Changed shared module dependencies and version are cache-busted at1.3.0.

Validation:98 module checks passed. Full browser suite82 passed (1.3m); eight focused takeover checks passed after correcting zero-progress contested/owner labels (83 distinct browser checks across the runs). Browser assertions include real six-shot rocket flights against empty FOBs, mirrored bounded physical capture, exact5/20s holds, contest/loss resets, bullet/cover distinctions, both HQ results, frozen clocks, reset/draw/exit/tutorial. Source status rounding received an EPS-only display correction; no mechanic changed. Logs and screenshots/traces are under evidence/takeover-*.

Fresh independent review: docs/quality/takeover-adversarial-review.md. Six independent probe groups passed;11 screenshots independently inspected. One missingCONTESTED label at0progress found and corrected, independently re-probed. No remaining production source blocker. Reviewer-owned Chromium execution was blocked at launch; physical iPhone/Safari and full independent browser rerun remain UNVERIFIED. No automatic merge; prepare public playable review version and PR, with GitHub Pages staying on previously mergedv1.2.1 until user acceptance.

Public v1.3.0 review build published successfully: Sites source79e0d4c9e58a937ac7953e71af423ac80ad0252b, savedversion13, deploymentappgdep_6adfff96c7788191ad62d36e86306a90. Audience preserved public. Play: https://chopperjohn-fob-preview.earthyluck64.chatgpt.site/battlefield?v=1.3.0 . PR11 remains unmerged for user review; GitHub Pages stillv1.2.1.

## V1.3.1 outpost durability adjustment (CAP-01/04/06)
Both FOBs now require20 hostile reaching rocket explosions; HQs remain6. Shared defense capacity drives initialization, fallback, rebuild, status denominator and compact pips. Capture/contest/rebuild timing and infantry cover damage are unchanged. Menu help and version updated.

Validation:98 module checks passed; nine focused takeover browser tests passed. Full regression83 passed with one stale menu-version expectation failing; expectation updated to1.3.1 and focused retry passed, yielding84 distinct passing browser checks across runs. Evidence: outpost-*-results.txt, outpost-nineteen-hits.png and refreshed takeover screenshots/traces. Physical Safari remains UNVERIFIED. Independent review: docs/quality/outpost-durability-review.md.

Public review deployment succeeded: version14, source6d253310c727a9e73cf313fae7605d7a7ecb6aa0, deploymentappgdep_6ae0210f6238819181053a9ce7bd29bc. Play https://chopperjohn-fob-preview.earthyluck64.chatgpt.site/battlefield?v=1.3.1 . PR11 stays unmerged for user review; GitHub Pages remains the previous merged version.

## Terrain Lab v0.1 — separate JSON levels (TL-01..05)
User approved all three experiments in one isolated playground. Added terrain-lab.html, three versioned JSON levels (ridge/valley/bumps), pure level validator, shared heightfield geometry, fixed-step terrain combat/movement simulation and mobile renderer/controller. Editor supports apply/import/download; standard scenarios are walking-only, stationary rifle cover and rockets over cover. Geometry blocks rifle sight, bullets and splash; rockets use elevated ballistic endpoints and collide with first ground contact. Portrait zoom and orientation refitting keep experiments visible. No deliberate cover-seeking, economy/base/helicopter integration or normal battlefield changes.

Validation:106 module assertions passed (98 existing +8 terrain); after required-name correction focused8 passed again. Full browser suite89 passed (84 existing +5 terrain), then final focused6 passed after name/orientation/error corrections and one new stale-fetch/error regression, yielding90 distinct passing browser tests across runs. No claim of one full90-test run. Screenshot evidence inspected: terrain-ridge-portrait, terrain-walking-landscape, terrain-rockets-landscape and editor390/844. Raw logs: evidence/terrain-*-results.txt. Fresh reviewer executed16 independent probe groups and module checks, inspected screenshots, found empty names/cropped flight/error-detail overwrite; all corrected and re-reviewed. No remaining source blocker established. Reviewer browser execution and physical Safari remain UNVERIFIED: see quality/terrain-adversarial-review.md.

Release preparation on feature/terrain-playground stacked on feature/base-takeover (PR11 unmerged). Publish a separate Terrain Lab route in the existing public review host; no merge or GitHub Pages update authorized.

Terrain Lab publication verified 2026-10-28: saved version15, sourcee192cfe8086323c2105bcebce69d5f953b5c8a0a, deploymentappgdep_6ae172c5de988191b507f0d9c237d3ce succeeded. Canonical returned host https://chopperjohn-fob-preview.deanforward.chatgpt.site ; public HTML at /terrain-lab?v=0.1.0 contains Terrain Lab and scene.js?v=0.1.0, verified without sign-in. Prior earthyluck64 host also returned the updated page at verification time. PR12 https://github.com/GotfrydFamilyEnterprise/chopperJohn/pull/12 remains unmerged, stacked on PR11. GitHub Pages unchanged.

## Terrain Lab v0.2 uneven walk-and-fire encounters (TL-06)
Added four JSON presets per terrain: red/blue hold high ground against a walking rifleman, and uneven two-sided approaches with blue/red nearer. Both walking and stationary soldiers actually acquire/fire uphill/downhill; firing barrel matches projectile direction. Two-phase movement/weapon scheduling removes array-order targeting bias. HP, shot counts, first-shot times, casualty markers, and survivor/mutual-elimination readouts derive from actual simulation. Results wait for remaining projectiles and freeze until Reset. Added quarter/half/normal playback,0.1s step, direct scenario links and fresh JSON revalidation. No deliberate cover-seeking AI or normal battlefield changes.

Validation:111 module checks passed (13 terrain).11 focused Terrain Lab browser checks passed. Full95-check browser run passed94 with one unchanged headquarters test timing out during font-wait screenshot; focused retry of that exact test passed, yielding95 distinct passing browser checks across runs. Do not claim a single clean95 run. Per-case actual traces: evidence/terrain-encounters-outcomes.json,12 cases; screenshots terrain-encounter-* show uphill/downhill firing, uneven approaches, and settled result in portrait/landscape. Root inspected screenshots. Logs: terrain-encounters-*-results.txt. Fresh independent review recorded separately in quality/terrain-encounters-review.md; source review/browser-execution limits remain explicit. No automatic merge.

V0.2 public publication succeeded: saved version16, source3f3615a56f640359d1dbbad8111eef080456d0b7, deploymentappgdep_6ae2464a452c8191b662a710b13f4713. Play https://chopperjohn-fob-preview.deanforward.chatgpt.site/terrain-lab?v=0.2.0&scenario=crest-red . PR12 updated/unmerged. Encounter reviewer source review and portrait visual inspection PASS with no source blocker found; reviewer-owned execution returned no results before abort and remains UNVERIFIED, so no unconditional independent completion/merge claim. Physical Safari also UNVERIFIED.

## Terrain Lab v0.3 angular bullets,800-unit rockets and variable clear trajectories (TL-07)
Bullet streaks now align with actual velocity. Playground rockets select225–800 instead of600; scatter anchors extend to800±98. New isolated ballistics module searches shortest feasible sampled flight under520 speed,8–80° upward launch, true34-unit barrel, terrain-vertex2-unit clearance and7.8s cap, leading current movement and applying one scatter sample per attempt. Launcher angle agrees with shot and persists briefly at launch. First-terrain collision and unguided motion remain. New1800-unit Rocket ridge JSON includes mirrored uneven rocket approaches, crest holders, mixed rifle/rocket approaches and800-unit exchange; original terrains add uneven rocket approaches. Participant camera framing adapts to extent.

Validation:118 module assertions passed (98 existing +20 terrain). Final15 Terrain Lab browser checks passed after the solver correction (16.8s), covering previous scenarios plus actual angled tracers, both uneven rocket directions,800-range firing/mixed damage and seeded resets. No unchanged main-game browser suite repeated for this isolated lab change. Logs: evidence/terrain-trajectory-all-module-results.txt and terrain-trajectory-browser-final-results.txt; seven new trajectory screenshots. Independent review found an unsafe search lower bound ignoring inward scatter; corrected and independently rechecked both mirrored witnesses. Independent20 module tests and all seven supplied screenshot inspections PASS. Reviewer-owned browser execution/public deployment and physical Safari remain UNVERIFIED; no unconditional merge approval. See quality/terrain-trajectory-review.md. PR12 remains unmerged.
