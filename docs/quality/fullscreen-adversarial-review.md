# Fullscreen adversarial acceptance review

Independent reviewer: separate `/root/fullscreen_review` context, 2026-10-26. Read AGENTS.md, requirements, acceptance, implementation status, adversarial review instructions, tracked diff and new fullscreen module/manifest. Production source was not changed by reviewer.

| Requirement | Result | Evidence and limits |
|---|---|---|
| FS-01 Chromium root fullscreen, exit, synchronized controls, preserved state | PASS (observed runner evidence) | Inspected `/tmp/fullscreen-browser.log`: actual native fullscreen, button exit and browser exit test passed. `fullscreen-active.png` independently inspected: Exit fullscreen, Resume, both budgets and all seven controls visible. Module calls root API directly in click handler and listens for standard/vendor change events. |
| FS-02 unsupported/rejected/standalone handling | PASS (observed runner evidence) | Raw four-test log includes unsupported/rejected/standalone checks passing. Independently inspected `fullscreen-iphone-help.png`: honest browser limitation, complete Safari Home Screen steps, visible Got it dismissal. Module catches rejected API promises and preserves simulation separation. |
| FS-03 portrait/landscape layout | PASS (visual review) | Independently viewed `evidence/fullscreen-controls-390.png`, `fullscreen-controls-844.png`, `fullscreen-active.png` and `fullscreen-iphone-help.png`. Controls are visible, separated and readable; portrait wraps to two rows; landscape fits one row. Dialog fits portrait viewport. |
| FS-03 pause/camera/simulation preservation | PASS (observed final runner evidence) | Actual fullscreen test verifies paused state through enter/exit. Reviewer authored `tests/fullscreen-adversarial-review.spec.js` to independently compare complete deterministic snapshots and pause label through unsupported help/dismissal and actual fullscreen; all five reviewer cases passed in final root runner log `/tmp/fullscreen-final.log`. |
| FS-02 physical iPhone Safari Home Screen launch | UNVERIFIED | No physical-device installation/launch, browser chrome removal, notch/safe-area or icon appearance was observed. Chromium emulation cannot establish these. Manifest and Apple standalone metadata exist. |
| FS-03 broader gameplay regression | PASS (observed runner evidence); manual Flight School UNVERIFIED | `/tmp/fullscreen-all-browser.log`: 43 passed and one vendor exit failure. All 35 preexisting browser tests passed. After the isolated vendor exit fix, `/tmp/fullscreen-final.log` shows all nine fullscreen tests passed (4.7s), including all five independently authored probes. Flight School has no source diff; a full manual Flight School interaction pass was not performed. |

## Findings and independent probes

Resolved medium-severity FS-01 finding: when the standard exit API exists but a vendor fullscreen element is active, the original adapter selected the standard exit API and failed to exit vendor fullscreen. The independent vendor probe exposed this in the 44-test run. Implementer changed `docs/js/battlefield/ui/fullscreen.js:16` to choose the exit API matching the active standard/vendor element. Reviewer read the one-line fix and the final raw nine-test PASS log; vendor enter/exit now passes. No remaining blocking production discrepancy found in inspected source or screenshots. Fullscreen implementation is isolated in `docs/js/battlefield/ui/fullscreen.js`; its only shared-game notification is resize, whose handler clamps camera and redraws without reset. No legacy Unity or Flight School source change was present.

Five reviewer-authored negative/regression cases cover unsupported API with paused state and camera preservation, rejected promise with Escape dismissal and no page errors, standalone bypass, vendor-only enter/exit events, and actual root fullscreen plus browser-driven exit. Reviewer-owned browser invocation stalled in the tool transport and was aborted without returning test results. The reviewer hardened its vendor mock using a writable own property to model vendor state despite Chromium’s read-only prototype getter. Tests were then executed by the root runner; do not label the stalled invocation a successful reviewer-owned execution. Root runner raw logs are `/tmp/fullscreen-all-browser.log` (43 pass, vendor failure) and `/tmp/fullscreen-final.log` (all nine fullscreen cases pass after fix).

Low-priority compatibility uncertainty: manifest supplies an SVG icon and no explicit Apple touch icon. The appearance on a physical iPhone remains unverified; this is not evidence that launch fails.

Evidence screenshots are under `docs/quality/evidence/`. Logs cited above were read directly, rather than relying only on implementer assertions.

## Recommendation

INSUFFICIENT EVIDENCE for unconditional merge. Reviewed desktop Chromium behavior and visual layouts show no blocking defect, but physical iPhone standalone acceptance remains UNVERIFIED. Regression results are now complete across the broader run and targeted post-fix run. Require user iPhone acceptance before treating FS-01..03 as DONE or merging under repository policy.
