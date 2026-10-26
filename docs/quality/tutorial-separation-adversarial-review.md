# Independent tutorial separation review

2026-10-26. Fresh reviewer context; bounded scope MENU-05 and affected MENU-02/03/04 transitions. Read AGENTS.md, requirements, acceptance, implementation status, review rules, current diff and actual scene/session/UI/range modules. No production files edited.

## Findings

No blocking production discrepancy established. Tutorial now first opens a visibly distinct welcome page; Begin Tutorial alone enters the quiet range. Source guards freeze update, pilot, purchases and camera input in `tutorial-intro`. Reset preserves that mode, End tutorial/Main Menu clear the session, and Begin Tutorial resets again. New Game resets systems, accounts, armies and input before applying any practice flags. Practice removes both opening armies and red provisioning; only the two explicitly permitted lesson purchases can appear, and their movement is capped below the hidden FOB approach region.

Implementation status still describes v1.2.0/old entry behavior at review time; update it with v1.2.1 evidence and publication status before handoff. This is a documentation follow-up, not a proven gameplay defect.

## Evidence

| Requirement / risk | Result | Evidence |
| --- | --- | --- |
| MENU-05 distinct launch/welcome | PASS for source, inspected captures and supplied Chromium checks | Directly inspected `evidence/menu-intro-844.png`, `menu-intro-740.png`, `menu-intro-390.png`: readable safe-practice explanation, Begin Tutorial/Main Menu and menu toggle within viewport; no shared battlefield visible. |
| MENU-05 quiet lesson presentation | PASS for source and inspected captures | Directly inspected `menu-tutorial-844.png` and `menu-tutorial-390.png`: zero troops, blue HQ/pad, persistent Tutorial label and readable instruction card above primary controls. Landscape shows labeled turn marker. Portrait marker is outside the initial horizontal viewport, consistent with flying right to reach it. |
| MENU-05 purchased troops stay inside range | PASS independent pure execution | Independently imported real rifle/rocket creators/updaters and `tutorialSpeedLimit`; ran 10,000 updates for each type at 1/60, 0.1 and 1-second timesteps. Both stop exactly at their 800/760 limits, retain null guardBase, and never reach invisible FOB approach. |
| MENU-02/04 intro/reset/end state | PASS independent pure execution; runtime based on supplied evidence | Independently checked intro has no tutorial state and cannot advance, tutorial restart resets step, end clears state, game clears tutorial, invalid launch mode throws. Source resets held input and accumulator on every start. |
| MENU-05 welcome clock/back/exit, safe empty lesson and normal flags | PASS supplied Chromium; independent browser execution UNVERIFIED | Read actual `/tmp/menu-separation-browser.log`: 10 passed, including MENU-05 frozen 600-step intro, both exit paths, empty 3600-step lesson and fresh 10-unit game with red AI/damage restored; existing session completion/restart/layout, compact UI and touch checks pass. These are parent-run results, not independent browser execution. |
| MENU-03 actual complete practice route | PASS supplied Chromium | Same raw log includes actual-control course through paid purchases, real landing/rearm, completion and fresh live battle. No assertion relies on the reviewer's pure probes as a substitute for the full route. |
| Production normal-URL launch, physical iPhone/Safari and newly published v1.2.1 | UNVERIFIED by reviewer | Reviewer Chromium launch failed immediately with crashpad `setsockopt: Operation not permitted` and SIGTRAP before any page opened. No permission retry or invented result. Existing normal-URL check in supplied suite verifies main menu and absent test API; complete independent production welcome/begin interaction was not executed. Publication must be verified separately by parent. |

## Recommendation

No source blocker found for presenting this fix for user review. **INSUFFICIENT EVIDENCE for unconditional merge**, under the repository review gate: reviewer-owned browser execution, physical Safari acceptance and revised publication remain unverified. No broad unrelated revalidation was attempted or implied; earlier whole-feature reports retain their own limitations. This report grants no merge authorization.
