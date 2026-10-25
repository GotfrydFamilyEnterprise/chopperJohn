# Independent rocket and bunker protection adversarial review

Review date: 2026-10-25. Scope: branch `feature/rocket-combat-and-bunker-cover`, approved RC-01..08 and BC-01..05, actual working-tree changes including new combat modules. Reviewer read AGENTS.md, every file in docs/specs/, adversarial-review.md, changed source, and tests; production source was not edited by this reviewer.

## Evidence and causal limits

- Independently executed `node tests-unit/rocket-combat.test.js`: **10 passed**. This establishes pure module behavior, not browser integration.
- Independently authored and executed `node tests-unit/rocket-review.test.js`: **4 passed**. Added exact reload/aim spacing, inclusive bunker-footprint edges for both teams, partial-bunker/no-flag protection, reservation exclusion, chance endpoints, and mirrored ballistic endpoint extremes.
- Independently authored `tests/rocket-review.spec.js`; unchanged tests executed in the implementer browser runner and raw `/tmp/rocket-browser-final.log` independently inspected: **all three passed**. They cover mirrored shooter/target death and airborne infantry non-interception, plus exact repeated 3.7-second launch spacing. Final run after resize/evidence fix: `/tmp/rocket-browser-verified.log`, **20 passed (20.4s)**, independently inspected. Earlier `/tmp/rocket-browser-final.log` also passed 20 tests. This was delegated execution of independently authored probes, not independent browser launching by the reviewer.
- Independently inspected raw `/tmp/rocket-browser.log`: initial suite **16 passed, 1 failed**. BC-03 was a capture-window failure: a bounded 128-event history dropped the early penetration. The same seed and gameplay odds with a shorter 650-tick capture now pass. Independently inspected `evidence/rocket-rifle-cover-trace.json`: 98 total events, 33 covered hits, one 0.5-HP penetration at t=17.1666666667 (ID 10). No probability or seed alteration. Initial precision hypothesis was not the cause.
- Independently inspected `evidence/rocket-team-{0,1}-ascent.png`, `rocket-team-{0,1}-impact.png`, `rocket-cover-team-{0,1}-casualty.png`, and matching flight trace JSON. Ascent images clearly show mirrored upward launcher/projectile orientation and trail. Casualty images show open sandbag/net bunker interiors, two remaining visible defenders, fractional HP bars, and UNDERSTAFFED labels.
- Re-inspected regenerated landscape impact images: help moved upward, and both now visibly show ground flash/ring at the contacted soldier. Independently re-inspected corrected `rocket-team-{0,1}-impact-portrait.png` and `rocket-team-{0,1}-dust.png` after resize synchronization. Both teams now show clear yellow ground flash/ring followed by brown dust and debris around the target feet, above the controls.

## Findings

1. **Resolved — RC-06 landscape overlay and portrait screenshot resize ordering.** Both landscape impacts now show an unobscured ground flash/ring after battlefield.html moves help above the field. The runtime resize listener now resizes and draws immediately; the browser test waits two animation frames before recentering. Corrected portrait impact and dust images for both teams visibly establish the flash-to-dust transition. No remaining defect from these captures.
2. **High acceptance gap — RC-08: full Flight School regression is unverified.** Navigating to index.html does not exercise both-facing cyclic, collective, TURN, momentum, held FIRE, rotors, telemetry, tutorial and landing. Flight School source is unchanged, which reduces change risk but does not satisfy mandatory browser acceptance.
3. **Medium acceptance gap — RC-04: visible distance-dependent miss behavior lacks browser evidence.** Module samples establish spread anchors and broad distribution; screenshots show one 300-unit shot. No executed near/far comparison demonstrates visibly more misses at long range.
4. **Low, resolved in current source — RC-02 reload/aim overlap.** Initially read code subtracted reload dt then added the entire dt to aim at the reload boundary. Current source computes `aimStep = max(0, dt - previousCooldown)` (`combat/weapons.js:68`); the independent 222-tick spacing probe now passes. This is an observed concurrent fix, not a reviewer production edit.

## Requirement outcomes

PASS below is scoped to cited evidence. UNVERIFIED never counts as PASS for the repository completion gate. Severity denotes the remaining discrepancy/gap, not an assertion that unexecuted behavior is broken.

| Requirement | Outcome | Evidence and remaining limits | Severity |
|---|---|---|---|
| RC-01 | PASS | Independent module test covers inclusive 225/500, overlap, behind/friendly/dead filtering and eligible target beyond too-close enemy; raw browser log records both mirrored range-boundary tests passing. Rifle 250 preserved in source and existing combat suite. | — |
| RC-02 | PASS | Module interruption/reload and independent 222-tick spacing pass; browser independent repeat-spacing probe passes at .7 initial/3.7 subsequent launch intervals. Mirrored posture/stopping confirmed by engagement browser assertions and ascent images. Target-change browser branch is not separately exercised; source/module logic resets on ID change. | — |
| RC-03 | PASS | Ballistic equations independently checked in both directions, all anchor/intermediate distances and scatter extremes; old-point/no-homing browser test passes. Independent mirrored airborne interception/both-death probes pass. | — |
| RC-04 | UNVERIFIED | Module 1000-sample scatter/variance tests and independent endpoint tests pass; linear interpolation correct in source. Near/far browser visible miss comparison missing. | medium |
| RC-05 | PASS | Module 2/1/0/outside falloff, both types/no friendly fire pass; browser flight HP loss and independent mirrored shooter+target death/non-interception probes pass. | — |
| RC-06 | PASS | Ascent/trail, landscape flash, and corrected portrait flash/dust for both teams independently inspected; browser pause/reset assertions pass. Launcher/projectile coordinates match source and flight tests. | — |
| RC-07 | PASS | Same-seed module outputs/HP/RNG state match, different seed varies; raw browser log records identical whole-state reset/replay test passing. Source uses seeded stream for scatter/selection/penetration. | — |
| RC-08 | UNVERIFIED | Raw log records mirrored FOB lifecycle/control/navigation suites passing; casualty screenshots inspected. Full Flight School and physical iPhone/Safari absent; landscape help overlap resolved. | high |
| BC-01 | PASS | Independent modules prove reserved/passers unprotected, registered arrived partial bunker protected with flag zero, both footprint directions; browser bunker tests pass. | — |
| BC-02 | PASS | Modules prove one uniform-index shared defender selection, exactly 1/3 HP, no ordinary duplicate hit, inclusive ±105 footprint; browser mirrored shared-hit tests pass and traces inspected. | — |
| BC-03 | PASS | Module 20,000 seeded impacts approximate 5%; exact chance endpoints independently pass. Final browser real-round test passes with 33 covered hits/one .5 penetration; 98-event trace inspected. Source consumes each contacted bullet once; no piercing path found. | — |
| BC-04 | PASS | Module exposed 1 HP rifle/ordinary blast/no friendly fire; browser mirrored colocated unstationed bystander takes 2 HP. | — |
| BC-05 | UNVERIFIED | Module nine thirds kill exactly, release slot/replacement gets protection after arrival; browser shared-hit casualty and old replacement lifecycle pass. Fractional HP visible in inspected images; absorbed-hit/cover-flash visual evidence not yet inspected. | medium |

## Cross-feature analysis and recommendation

The source retains friendly-only FOB registration, separate reservations/arrived slots, bounded entrance movement, stationary distinct posts, bypass, casualty cleanup and mirrored directions. Existing browser lifecycle probes check these in combat isolation. The new rocket minimum can stop entering rocketeers while fighting, consistent with stop-to-aim; protection remains unavailable until physical arrival. Legacy Unity and Flight School files are unchanged in the reviewed diff.

Missing broad cases include simultaneous/out-of-order arrivals, enemy traversal, reset during occupation, full gait-cycle visual regression, browser cover-edge/partial-state matrix, and full Flight School progression. Older or static screenshots cannot establish these temporal behaviors. No live deployment or physical iPhone validation was performed by this reviewer.

**Recommendation: INSUFFICIENT EVIDENCE. Do not merge under the repository gate while mandatory requirements remain UNVERIFIED.** No unresolved production combat failure is established by this review; remaining gaps are visible distance-dependent misses (RC-04), absorbed-hit feedback visual evidence (BC-05), and broad Flight School/mobile regression coverage (RC-08). The user-requested preview does not itself establish deployed behavior; deployment was not independently exercised by this reviewer.
