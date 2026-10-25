# Feature acceptance cases (must be executed in a browser)
Tests should advance simulation deterministically and capture screenshots. This file is an acceptance CONTRACT, not evidence they currently pass.

| ID | Scenario | Required observation |
|---|---|---|
| SYS-01 | Load both scenes on mobile viewport | No runtime errors, navigable links, usable controls |
| FL-01..09 | Fly, pitch both facings, TURN, shoot, complete tutorial | Controls and flight behavior retained |
| BF-01..05 | Open battlefield; pan; spawn both teams; pause/reset | Two HQs/two FOBs, separate scene, correct unit spawn |
| AN-01..04 | Record one full gait cycle marching and halting | Two-segment knees; stance foot world x invariant within tolerance; no doubled bobbing |
| RI-01..06 | Observe rifle unit across empty-field march and encounter | Low carry then shoulder, slowed fire-walk, shots collide and change HP |
| RO-01..05 | Observe rocket unit march and encounter | Back carry then stops/shoulders; no invented rocket damage |
| FOB-01 | Screenshot an empty FOB at phone viewport | Sandbags, roof supports, camo net, open visible interior |
| FOB-02 | Reload battlefield, inspect both FOBs | Empty, no soldiers/flag, no FOB garrison buttons |
| FOB-03 | Advance first rifleman | Moves through approach to inside guard position (no teleport), one slot filled |
| FOB-04 | Advance first rocketeer | Correct separate rocket slot; partial state; no flag |
| FOB-05 | Advance second rifleman | Three distinct physically occupied posts; flag rises only AFTER third arrived |
| FOB-06 | Advance fourth rifleman and second rocketeer | They pass occupied FOB and continue towards enemy |
| FOB-07 | Kill one defender | Slot released, flag lowers / state no longer OCCUPIED; replacement arrives and flag re-raises |
| FOB-08 | Move enemy unit across friendly FOB | Does not register as guard or capture it |
| FOB-10 | Repeat full cycle for red FOB | Same results with mirrored movement |
| CB-01 | Arrange two enemy riflemen 200 units apart | Rifle shots visibly traverse space; HP decreases; eventual casualty |
| CB-02 | Exercise FOB arrival with combat disabled | Occupancy test independent of combat |
| QA-01 | Run tests twice with fixed seed/timestep | Identical state transitions; inspect screenshots |
| QA-02 | Adversarial review with independent agent | Each relevant requirement has passing test+visual evidence or explicit blocking defect |

## Required lifecycle trace
UNCLAIMED (0/3, flag down) -> ASSEMBLING (1/3, flag down) -> ASSEMBLING (2/3, flag down) -> OCCUPIED (3/3, flag rises). On casualty -> UNDERSTAFFED (2/3, flag lowers) -> OCCUPIED only after new arrival reaches post.

## Reporting
Every PR must provide a requirements traceability table: ID, implementation path, test name, actual result, screenshot/evidence, reviewer outcome. `UNVERIFIED` does not count as PASS.
