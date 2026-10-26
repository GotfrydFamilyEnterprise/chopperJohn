# Main menu and tutorial independent adversarial review

Review date: 2026-10-26. Scope: MENU-01..04, affected BAL-01..03/UI-03/FS behavior. Independent reviewer read AGENTS.md, requirements, acceptance, implementation status, adversarial-review instructions, actual working diff and new session/UI modules. No production files were edited by this reviewer.

## Findings

No unresolved production blocker established by completed checks. A source-level MENU-02/04 discrepancy was reported during review: canvas panning cleared its pointer ID without releasing physical pointer capture when ending a session. Final source adds `releasePan()` at battlefieldScene.js:160 and calls it on both start and end. Pilot release also explicitly releases stick/fire captures. Source correction is verified; reviewer-owned browser reproduction could not execute.

The initial implementer actual-flight test failed to finish landing. Inspection of its flight controller and subsequent correction show the requested target approached ground from above asymptotically; final controller asks for a point below ground to cause a real touchdown. No aircraft physics was changed for that test. The final browser log and completed-course screenshot supply completion evidence, not an independent reviewer flight execution.

## Acceptance evidence

| Requirements | Result | Evidence and limits |
| --- | --- | --- |
| MENU-01 menu/version/copyright/layout | PASS | Independently inspected `evidence/menu-main-390.png` and `menu-main-740.png`: New Game, Tutorial, v1.2.0 and exact © 2026 Ilya Gotfryd visible, buttons in viewport, readable portrait/landscape presentation. Source freezes update in menu and prevents commands. Supplied `menu-browser-results.txt` includes normal URL and clean-state checks. |
| MENU-02 return/reset/cleanup | PASS for source and supplied Chromium evidence; independent runtime UNVERIFIED | Scene clears units/projectiles/effects, releases pilot and canvas captures, clears test input/accumulator, closes menu/dialog and resets every start. `tests/session-menu.spec.js` checks held keys, end while paused, frozen menu and clean repeated starts; supplied browser log passes. Reviewer browser invocation stalled at tool permission layer and was aborted, so no result is claimed from `/tmp/menu-independent.mjs`. |
| MENU-03 goals and safe practice | PASS for module/source/visual and supplied Chromium evidence; independent whole flight UNVERIFIED | Reviewer executed `node --test tests-unit/session-flow.test.js`, exit 0. Goals use real altitude/position/completed turn/cumulative post-instruction shots/paid ledger/parked full-ammo state. Practice removes red troops, disables red provisioning/damage, retains flight/gun/pad and normal purchase path. New Game resets normal systems and AI. Supplied actual-control route test passes; independently inspected `menu-tutorial-complete.png`: completion offers New Game and Main Menu, full ammo, controls and dropdown remain visible. |
| MENU-03/04 mobile controls/readability | PASS for inspected Chromium captures; physical Safari UNVERIFIED | Independently inspected `menu-tutorial-740.png` and completion landscape capture: tutorial text stays above primary controls, useful step/help, dropdown visible. Portrait main-menu copy and copyright readable. Existing CSS selection/callout protection and touch guard installation retained. Supplied final UI log includes held touch regression. |
| MENU-04 module isolation/defaults/no production bypass | PASS for source/module inspection | Pure flow/tutorial/version modules; sessionMenu owns presentation; scene owns reset/safety. Only explicit `?test` starts legacy game fixtures; `?test&menu` and ordinary production enter main menu. Production has no test controller. Menu controls hidden/inert, pilot permission and command/update guards prevent play. Reset clears accumulated fixed-step time; frame delta capped. |

## Regression and provenance

Final supplied raw evidence: `evidence/menu-browser-results.txt` records 74 browser tests passed; `evidence/menu-module-results.txt` records 88 module checks passed; `evidence/menu-final-ui-results.txt` records five focused UI/touch tests passed after capture/render-cache corrections. These are implementer-run logs independently read by the reviewer, not reviewer-owned browser executions. Tests exercise existing economy, combat, helicopter, menu and fullscreen coverage. Final focused checks cover changed UI after the full suite. No legacy Unity or separate Flight School source appears in the feature diff.

No new browser/network call was made after the implementing agent requested bounded finalization. Full Flight School progression, physical iPhone/Safari long press/safe areas, and reviewer-owned live browser session remain UNVERIFIED. Historical unrelated visual acceptance gaps are not closed by this feature.

## Recommendation

**INSUFFICIENT EVIDENCE for unconditional merge.** No confirmed remaining source blocker; feature is suitable for the requested mobile preview review. Independent screenshot/source/module checks passed and supplied browser regressions are green, but independent runtime and physical iPhone acceptance remain open. This report grants no merge authorization.
