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

## Supply and AI acceptance

| ID | Browser/module scenario | Required observation |
|---|---|---|
| EC-01..04 | Start, accrue, purchase, wait, hit cap, kill unit, pause/reset |120 start,5/s,240 cap;25/60 costs,2s spacing,15 cap; auditable conservation, no free red troops |
| EC-05 | Phone and landscape HUD; blue deployment |Supply/objective/progress legible; red automatic, blue manual |
| AI-01 | First12s, staff FOB, kill defender |Exactly2 rifle+1 rocket bought for opening; count incoming; one replacement, physical arrival |
| AI-02 | Enemy near red HQ while preparing group |Defensive objective; release existing squad, paid emergency purchases obey limits |
| AI-03/SQ-01..02 | Ordinary and staffed-enemy-FOB plans |Correct composition/cost,60 reserve, physical rally before release, bounded movement and coordinated march |
| AI-04 | Kill field members/groups repeatedly |Count incoming support, then12s regroup and bounded larger wave; no repeated tiny feeds |
| AI-05..06 | Repeated replay, source import boundaries |Same decisions, public observations only; isolated resource/strategy/orders/UI layers |
| SQ-03..04 | Existing FOB/rocket suite with AI isolated; natural opening with AI active |Preserved guard posts, damage, leading, ranges and both scenes |

## Shared economy acceptance (supersedes red-only opening/UI expectations)
| ID | Scenario | Required observation |
|---|---|---|
| EC-06 | Start both factions; advance with combat off; purchase manually; population cap | Five free soldiers per side (3 rifles,2 rockets), empty FOBs, equal independent120 accounts; identical later purchase limits, no free button deployment or economic cross-debit |
| EC-07 | Mirror garrison/assault/emergency/loss scenarios | Same decisions, costs, timings and bounded mirrored movement; both automatic commanders active |
| EC-08 | Pause/reset, repeat seed/commands, phone/landscape screenshots; natural rockets | Both budgets frozen/restored, legible separate HUDs, paid buttons/cooldown, deterministic replay; natural rocket fire for both sides within60 seconds |

| ID | Scenario | Required observation |
|---|---|---|
| FS-01 | Enter actual Chromium fullscreen by button; exit by button and browser API | Root is fullscreen, all controls retained; label/pressed state synchronized; state preserved |
| FS-02 | Remove fullscreen API; reject promise; simulate standalone | Honest dismissible help, Home Screen steps; no unhandled rejection; standalone does not request fullscreen |
| FS-03 | Phone portrait/landscape screenshots, pause/reset/deployment after toggle | Usable control layout, canvas matches viewport, same simulation state; existing gameplay suite passes |


## V1 priorities and isolated interaction acceptance
| ID | Scenario | Required observation |
|---|---|---|
| AA-PRIORITY | Ground firefight, helicopter arrives during aim/reload; then leaves/dies/unreachable | Lone eligible rocket switches immediately, full new0.7s aim, shared reload retained; rifles keep ground targets; existing rockets remain unguided |
| AA-GROUP |2/3/4/5/6 launchers with mixed threats; lose one threat, lose member/capability, separated clusters |1/1,2/1,3/1,3/2,4/2 split where capable; stable assignments, legitimate fallback, no free shots or guard movement |
| QA-H02 | Independently gate flight/troops/weapons/projectiles/damage/repair/commanders | Frozen selected subsystem while others run; no fixture-only PASS substituted for actual ordinary play |
| V1-NATURAL | Actual joystick flight from blue pad into ordinary battle | Paid red launcher fires ballistic anti-air; hull damage, visible committed flight/bursts; no hidden spawn dependency |

Detailed H/HG/AA assertions, boundary cases and screenshot checklist remain in `v1-helicopter-plan.md`. Evidence must be recorded separately; this table is not a PASS claim.

| UI-01/02 | Landscape844×390,740×360 and portrait390×844; open menu, deploy both types, fire/turn, pause/reset/fullscreen/camera | Only compact HUD, flight controls and icon deployment visible while closed; unobscured center; no overlapping primary targets; readable costs and strategy details on demand; menu dismissal and released held input; camera fits pad/aircraft with reclaimed bands |

| BAL-01 | Normal opening,120s without clicks, manual purchases/cooldown/cap, pause/reset | Blue buys zero infantry and earns income; red provisions; explicit purchases alone add blue infantry; reset restores manual default |
| BAL-02 | Destroy at low/high balance,599/600ticks, insufficient funds then accrue, pause/reset | No early/free replacement, exactly90 charge once on confirmed spawn; ledgers reconcile, cap/cooldown unchanged, full hull/ammo |
| BAL-03 | Hold fire15s then empty, park/off-pad/moving/dead/paused, resume fire | Exactly120 rounds, no negative ammo;30/s parked rearm, capped120, physical shots preserve old damage/cadence; HUD usable in landscape |
| BAL-04/05 | Sustained/brief/friendly/dead/out-of-area aircraft; simultaneous ground fight; repeated seed | Paid bounded red response and expiry; rifle screen retained; air launch timestamps separated while individual full aim/reload and ground behavior remain |
| UI-03 | Long press FIRE/TURN/deployment/menu; simultaneous joystick+fire; normal menu navigation | No selected text or gameplay context menu; button actions and held firing preserved; no stuck controls; inspect CSS WebKit protection and actual browser long press |

| MENU-01/04 | Normal URL and deterministic menu entry; portrait/landscape; wait thenNewGame | Menu version/copyright visible, no ticking or hidden pilot/spending, clean five-unit/120 accounts; no accumulated-time catch-up |
| MENU-02 | End game/tutorial while firing, paused, destroyed or midflight; restart both modes repeatedly | Correct dropdown action returns to menu, controls cleared, dialogs closed, no simulation advance, fresh next start; Reset restarts current mode |
| MENU-03 | Actual stick/turn/fire/deployment through all6 practice goals; pad return/refill; finish/end/restart | Goals advance on real state; safe red/no damage only in tutorial, normal prices/cooldown, clear step text; completing offers freshgame/mainmenu; livebattle restoresAI/combat/damage |
| MENU-05 | Click both normal live-URL menu buttons, touch+keyboard; intro pause/wait/back/exit; begin practice thennewgame | New Game startslivebattle, Tutorial firstshowsdedicatedwelcome withnoflightclock/army; actualpractice hasTutoriallabel, turnmarker andzeroarmies untilpurchases; Endtutorialavailablefromintro/lesson; no practiceflagleaks |

| CAP-01/02 | FOB nineteen/twenty and HQ five/six hostile rocket blasts, friendly/high blasts, rifle/heli bullets, real rocket flight/empty base aim | Only valid rockets lower defenses, no early breach, finalblastcovered/nextdamageexposed;20-point FOB/6-point HQ reset and true2D/friendly filters |
| CAP-03/04 | Both teams, intact/breached/contested, rocket-only, capturer death, physical approach, ownership/recapture |5s hold only rifle, no teleport, paused contest/no-speedstack; slotcleanup, firstcapturer realpost, newfriendlygarrisons |
| CAP-04 | Friendly rifle rebuild19.99/20s; enemy interruption/rocket reset; no builder | No early protection, correct reset, one full restore; no new income/troops |
| CAP-05/06 | Both HQ victories, simultaneous captures, holdFIRE/pause/reset/menu; phone screenshots, tutorial | Result freezesallclocks/inputs, correctwinner/draw, freshrestart; readablebaseprogress, tutorialunchanged |

## Terrain playground acceptance
| IDs | Experiment | Expected evidence |
|---|---|---|
| TL-01 | Fetch three examples; edit/import/download; malformed geometry/version/units; failed fetch and retry | Validated JSON round trip, actionable errors, no partial state replacement |
| TL-02 | Both directions over corners/hills/valleys, 1/120 samples | Ground contact, bounded surface movement, no shots in walking experiment; phone/landscape screenshots |
| TL-03 | Ridge rifles vs valley rifles; visible eyes but buried muzzle; vertical/tangent/reverse sweeps | Ridge no acquisition/damage; valley real casualties; earliest soil contact stops physical bullets |
| TL-04 | Real scattered rocket flights, elevated endpoint, target move after launch | Terrain collision, committed trajectory, enemy-only splash, no main-game rule change |
| TL-05 | Replay/reset/run/pause/step/editor/zoom/pan and layouts, normal entry | Same-seed state identity, paused clocks, controls in viewport, no production test hook |

| TL-06 | Both crest-holding directions and asymmetric walk/fire on all3 terrains; swap faction/array order; real bullets, first-shot/state/HP/result metrics | Holders do not move; walkers slow/fire only on acquisition and can lose targets behind crest; bullets resolve actual terrain/body contact; mirrored ridge result reverses without hardcoded bonus; no premature win while return fire in flight; frozen outcome/reset replay |
| TL-06 | Quarter/half/normal playback,0.1s/1s steps, direct scenario URL; phone/landscape result/readouts | Same simulation-time behavior regardless of playback speed; controls/readouts fit and remain usable; no test-hook leak |
