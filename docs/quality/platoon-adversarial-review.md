# Sergeant platoons: independent adversarial review

Review date: 2026-11-01. Reviewed working tree on `feature/sergeant-platoons`, based on `8806e6dd115cd79eb0b2b3232856e0bf135d77ae`. This is an independent reviewer context; production code was not edited. Requirements and acceptance PL-01–06, campaign/economy/guard/capture rules, AGENTS.md and the review protocol were read. The implementation narrative was treated as claims to test.

**Current recommendation: INSUFFICIENT EVIDENCE for merge.** Four source discrepancies were found, corrected by the implementer, and independently re-probed as resolved. No open source blocker is currently known. Final browser and publication evidence remain pending. The complete24-case matrix and an independent full-row replay have now been audited.

## Executed evidence

- Reviewer independently executed `npm run test:unit`: **145/145 PASS**, no failures. Full output: [platoon-review-unit.txt](evidence/platoon-review-unit.txt).
- After fixes, reviewer independently executed all11 platoon unit tests: **11/11 PASS**; [platoon-review-revised-unit.txt](evidence/platoon-review-revised-unit.txt). The original full145 suite predates those fixes; final expanded full-suite evidence is pending.
- Ten additional independently written Node probes (rerun after fixes): **10/10 PASS**. Results: [platoon-review-probes.json](evidence/platoon-review-probes.json). These covered no blue spending without explicit sergeant for60s; invalid/failed/capped/two-leader orders; pause/results exact snapshot freeze; replacement cap/funds/uniqueness/disband; guards/reservations/garrison exclusion and FOB bypass; mirrored shared-module purchasing/rally/formation; actual5s capture-to-guard vacancy; incoming rocket stopping sprint for valid helicopter AA; exactly66 units of physical surface travel in1s on the Ridgeline slope with normal33 velocity unchanged; and all three tactics retaining rear leader, distinct rifles ahead of distinct rockets in both directions after100s of isolated formation movement.
- Mirrored module probe configured equal3R2K formations in mirrored positions, manually advanced identical account clocks and moved from common-frame orders: both spent195 and reached matching mirrored breach positions. This proves the shared module under matching inputs, not natural faction equality on asymmetric JSON compositions or helicopter support.
- Capture probe physically stationed a follower at a breached enemy FOB, stepped600 ticks, observed capture at25.000s after starting at20.000s, and observed one25-Supply follower replacement next tick. No capture duration or structure-health reduction was needed.
- Reviewer independently replayed the real480s First assault/Siege seed31 row with neutral physical helicopter inputs and explicit paid sergeant orders. Exact full-row comparison PASS (accounts, stats, metrics, final rosters and bases). Every tick obeyed living cap15, active platoons2, bank0–240, physical rifle speed≤94/rocket≤66; observed max populations14/9 and groups2/2. Red FOB breach113.7417s/capture157.55s; red HQ breach244.2333s; no HQ capture at480s. Evidence: [platoon-review-replay.json](evidence/platoon-review-replay.json).
- Full unit tests additionally preserve deterministic step batching and pre-existing campaign terrain/cover/economy/AA/capture regressions. Unit execution is not browser execution or visual acceptance.

## Findings, independently rechecked after fixes

### F1 — high — CLOSED — PL-03 casualty slots and rally replacements

Location: `docs/js/battlefield/ai/platoons.js:42`.

The near-HQ adoption loop processes every vacant slot after launch. Reproduce: create blue Assault; step10s until launched; kill its joined rifle follower; leave one eligible unassigned advance rifle at rally; step once. The existing rifle is attached, spending delta is0, replacement count remains0. Independent trace: launchedAt5.275, replacement candidate/unit18, adopted5, replacements0.

A second probe killed an adopted rifle at1s while still rallying: a25-Supply replacement was bought, but `replacement:false`, `sprinting:false`, speed47 and replacements0. Replacement status is inferred from launch rather than whether the slot had a casualty. PL-02 allows eligible troops for initial assembly, while PL-03/user scope explicitly requires a normal-price HQ replacement and2× catch-up for each dead/detached follower. The fix restricts adoption to never-vacated initial slots and flags every casualty as a replacement. Independent rerun: spare18 remains unassigned, new HQ unit19 costs25 and replacements increments1. Rally casualty independently moves94/s with replacement/sprint true and replacements1. **PASS after fix.**

### F2 — high — CLOSED — PL-01 red field saving priority

Location: `docs/js/battlefield/campaign/world.js:92`, `docs/js/battlefield/ai/platoons.js:47`.

Reproduce on fresh First assault: kill the red opening garrison rocket; set red bank30; step once. Legacy commander chooses GARRISON and cannot afford its60-Supply rocket, but the subsequent automatic sergeant transaction spends25, leaving5.0416667. Ledger confirms one paid rifle leader while garrison need remains outstanding. Active platoon recruitment has the same independent spending path.

The fix communicates outstanding defense purchases through `fieldRecruitmentBlocked` and gates both new leaders and followers. Independent identical rerun now preserves30.0416667, spent0, no field leader. Revised unit assertion also confirms the eventual first purchase is the60-Supply garrison rocket. **PASS after fix.**

### F3 — medium — CLOSED — PL-03 capture-approach sprint

Location: `docs/js/battlefield/campaign/world.js:105`.

Reproduce with launched unjoined blue rifle replacement, leaderx1420, replacementx1670, breached red FOBx1950; disable weapons. Desired replacement slot is1860. Next tick reports `sprinting:true`, `joined:false` but advances47 units/s, the ordinary rifle speed rather than94. `rifleAssaultBase` replaces the movement distance with ordinary capture speed while retaining the2× indicator. The capture movement branch now retains the incoming noncombat multiplier. Independent identical rerun observes93.999999999996 units/s with sprint true and unchanged normal velocity47. **PASS after fix.**

### F4 — medium — CLOSED — JSON wave validation

Locations: `docs/js/battlefield/campaign/definition.js:33`, `docs/js/battlefield/ai/platoons.js:22`.

Battlefield validation accepts1 rifle+1 rocket; sergeant creation rejects it because the leader's rifle must leave at least one follower rifle. A map accepted by the loader can therefore make both blue sergeant creation and red field creation silently fail. Existing two maps use valid2+/1+ recipes. The validator now requires2+ rifles including the leader. Reviewer independently executed the new invalid-map assertion; validation rejects at load with the follower-composition explanation. **PASS after fix.**

## Requirement status

| Requirement | Status | Evidence / remaining gap |
| --- | --- | --- |
| PL-01 | PASS for executed assertions | Shared prices, cap, invalid/failed orders, two-leader limit, saving priority and map composition validation PASS. |
| PL-02 | PASS for source probes; partial visual evidence | Physical rally/common-frame orders/no guard theft/mirrored formation/capture handoff PASS. Field captures show rear leader and rifles ahead; full three-tactic visuals pending. |
| PL-03 | PASS for executed assertions; sprint visual pending | Funds/cap/unique paid queue/rally casualty/capture sprint/disband/pause/result/AA probes PASS. |
| PL-04 | PARTIAL | Four captures inspected; main deployment controls fit both orientations, rank/status/dropdown visible. Implementer three-browser-test log inspected PASS; reviewer browser and sprint capture pending. |
| PL-05 | PASS for executed source assertions; browser UNVERIFIED | Actual overlapping rifle duel terminates in six shots; old cover/capture tests PASS. Lab uses the same initial barrel sweep. No20/6/5s rule change found. |
| PL-06 | UNVERIFIED | Initial failed formation trial is disclosed. Complete24-case matrix/accounting audit PASS and one480s replay matches exactly. All24 runs remain unfinished; reviewer browser/sprint capture and actual preview publication are pending. |

## Cross-feature scope and limitations

Cache changes account for most touched module files. Flight School/legacy Unity were not edited. The existing pure-world default remains `platoons:false`; the Campaign UI explicitly opts in. First assault's blue wave changes from2R1K to3R2K while red remains2R1K, and Ridgeline is3R2K for both; final comparison must disclose this composition asymmetry and different controller spending schedules. No claim of fair mirrored natural combat follows from shared modules.

Reviewer independently inspected all four `platoon-{field,menu}-{portrait,landscape}.png` captures: no deployment-control overlap or clipping; chevron rank visible; portrait dropdown/status readable. Landscape menu is scrollable, with next-platoon controls below the initial fold; its interaction awaits browser confirmation. These captures do not show a sprinting replacement. The implementer's `/tmp/platoon-browser.txt` records3/3 browser PASS and no page error assertion failure; that is supplied evidence, not reviewer-owned execution.

Per parent task instructions, reviewer browser/server commands remain paused until the full suite is finished. Reviewer-owned browser execution, sprint visual, actual deployment and physical Safari are **UNVERIFIED**, not PASS. Automatic merge remains unauthorized.


## Completed strategy-matrix audit

Reviewer independently audited all24 rows (both maps ×3 seeds ×4 blue controllers,480s each): unique complete combination coverage; bank/income/spending reconciliation within1e-6; cap15 and active leaders2 in final rows; structure bounds20/6; capture follows a real breach; real event times within run duration; no helicopter rounds. [Audit evidence](evidence/platoon-review-matrix-audit.json). The per-tick bounds claim belongs to the separately replayed Siege31 run, not every matrix row.

All24 runs are **unfinished**, with zero HQ captures. They do not establish a winning or balanced strategy. Independent and Siege each capture an enemy FOB in6/6 runs; Assault1/6; Spread0/6. Siege breaches the enemy HQ in4/6; all other blue controllers0/6. Independent blue spends1815–2180, Siege1865–2465, Assault2495–2520 and Spread2490–2520. Controllers therefore differ in formation, composition and spending; these are bounded natural-play outcomes, not equal-spending causal estimates.

The empty breached red HQ in Siege31 was specifically challenged: it had been breached at244.23s, red living0 at480s and blue living13, yet no capture. A second independent replay retained final units: all four rifle followers were recent paid incoming replacements at x2165/1695/753/283, physically sprinting94/s; leaders correctly parked at1940 and rockets at2120/2170. Nobody occupied the HQ interior. An additional isolated fully joined Siege squad captures an empty breached HQ normally. Thus this trace supports ongoing rifle attrition and transit at cutoff, not an observed permanent capture-order defect. [Final-state diagnostic](evidence/platoon-review-final-state.json).
