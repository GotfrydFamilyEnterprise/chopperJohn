# Feature acceptance cases (must be executed in a browser)
Tests should advance simulation deterministically and capture screenshots. This file is an acceptance CONTRACT, not evidence they currently pass.

| ID | Scenario | Required observation |
|---|---|---|
| SYS-01 | Load both scenes on mobile viewport | No runtime errors, navigable links, usable controls |
| FL-01..09 | Fly, pitch both facings, TURN, shoot, complete tutorial | Controls and flight behavior retained |
| BF-01..05 | Open battlefield; pan; spawn both teams; pause/reset | Two HQs/two FOBs, separate scene, correct unit spawn |
| AN-01..04 | Record one full gait cycle marching and halting | Two-segment knees; stance foot world x invariant within tolerance; no doubled bobbing |
| RI-01..06 | Observe rifle unit across empty-field march and encounter | Low carry then shoulder, slowed fire-walk, shots collide and change HP |
| RO-01..05 | Observe rocket unit march and encounter | Back carry then stops/shoulders; approved RC firing and area damage |
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

## Rocket and cover acceptance

| ID | Scenario | Required observation |
|---|---|---|
| RC-01 | Both teams at 224.99, 225, 250, 600, 600.01 and behind | Correct inclusive firing bands, 25 overlap; no friendly/dead target |
| RC-02 | Aim, change/loss of target, fire, reload | No early launch; upward posture; stopped unit; 3-second reload then new aim |
| RC-03/04 | Near and far shots against stationary then moving targets | Physical ascent/descent, no homing, one sampled moving intercept plus scatter; ±5/20/50/66 at 225/350/500/600 |
| RC-05 | Center, half-radius, edge, outside, friendly and both enemy types | 2/1/0/0 HP damage; no friendly fire; shooter/target death does not erase rocket |
| RC-06 | Pause/reset midflight; phone screenshots | No motion while paused; complete reset; visible rocket trail and ground blast |
| RC-07 | Repeat seeded combat twice | Identical shots, impact coordinates, chosen defenders, HP and RNG state |
| BC-01 | Reserved/entering/stationed/partial/understaffed states | Only physically stationed defenders protected |
| BC-02 | Repeated rocket impacts at a staffed bunker | One living random defender loses exactly 1/3 HP per blast; no triple application |
| BC-03 | Seeded rifle impacts at bunker versus exposed target | 5% independent half-HP penetrations; ordinary exposed damage remains 1 HP |
| BC-04/05 | Bystander outside cover; protected casualty and replacement | Normal area damage outside; no friendly fire; no phantom survivors; vacancy/flag and replacement rules retained |
| RC-08 | Full existing FOB suite, mobile controls/navigation and both scenes | No regression; red/blue symmetry; separate Flight School retained |

| RC-09 | Both directions, moving toward/away and stopped targets; lose target mid-aim | Lead follows observed motion and solved flight time; no lead when stationary; autonomous lock/reacquire; no homing |
| RC-10 | Reload normal starting wave, no spawn clicks; use Follow rockets then pan/jump/reset | Both teams fire within first minute, launch/impact visible on phone, cumulative count updates, follow exits on manual camera control, reset restores empty FOBs |
