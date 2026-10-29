# TL-07 independent trajectory review — 2026-10-28

Recommendation: **source and supplied visual evidence PASS; independent browser execution UNVERIFIED**. The blocking shortest-flight defect was corrected and independently rechecked. No remaining source blocker found. An unconditional merge recommendation remains **INSUFFICIENT EVIDENCE** under the review protocol because this reviewer did not execute the browser suite.

Reviewed AGENTS.md, adversarial-review.md, TL-07 requirements/acceptance, implementation status, the diff against 0af8c20, and new ballistics.js/rocket-ridge.json. No production files changed. Scope is the Terrain Lab trajectory work; unchanged main battlefield behavior was not expanded into this review.

## Resolved high severity finding: scatter skipped earlier feasible flights

`docs/js/battlefield/terrain/ballistics.js:26` computes the first search time from nominal target distance, ignoring scatter. Negative scatter toward a Blue shooter shortens the required flight, so the assumed lower bound is not safe. Mirrored positive scatter has the same issue for Red. This contradicts TL-07's shortest feasible sampled trajectory requirement.

Independent bounded Node probe: flat terrain `world={width:1800,baseline:500}`, points `[[0,0],[1800,0]]`, shooter `{x:500,y:500,team:0}`, stationary target `{x:1300}`, error `-98`. Solver returns flight time **1.4730769231s**, speed **476.00176**, elevation **17.28110°**. An independent 1ms analytical sweep finds a clear legal shot at **1.323s**, speed **519.90316**, elevation **13.46173°**, landing at x1202/y500 with the true34-unit muzzle. The solver therefore skips about150ms of valid shorter trajectories. A regression should cover both faction signs of toward-shooter scatter and compare first feasibility using the scattered endpoint. Existing fine-oracle test only uses zero scatter.

Correction independently reviewed: initial search distance now uses the clamped scattered endpoint at t0. Clamping is nonexpansive, so division by maximum launch speed plus absolute target speed remains a valid horizontal lower bound. Re-executed both mirrored witnesses: each now returns **1.3246153846s**, speed **519.35946**, elevation **13.50134°**, exact ground endpoint x1202 (Blue) / x598 (Red). Both pass clearance. The added inward-scatter regression also passes. Finding resolved.

## PASS evidence

- Independently executed `node tests-unit/terrain.test.js` after correction: **20 passed, 0 failed**, 2.402s. Includes range225/800 boundaries, angular tracer vectors, elevated/clear ridge trajectories, lead, unreachable rejection, deterministic batching and inward-scatter regression.
- Source inspection: lab-only225–800 range, extended spread anchors66 at600 and98 at800,520 speed cap,8–80° limits, bounded20ms search and7.8s cap; real34-unit barrel and endpoint equations are internally consistent.
- Terrain clearance checks every crossed linear vertex and muzzle. Between vertices clearance is concave in flight time, so checking segment endpoints excludes an intervening ground penetration. Landing contact itself is intentionally allowed.
- Scattering occurs once per firing attempt; infeasible scattered plans consume ordinary reload. Launch direction is retained150ms. Committed projectile motion does not retarget. Terrain collision still occurs before damage handling.
- New longer Rocket ridge JSON and added uneven/mixed presets use the existing validator/simulation. Participant fitting uses scenario extent with180-unit padding and portrait zoom capped at2; landscape fits the full world.
- Changed runtime files are confined to Terrain Lab; shared production weapon tuning is unchanged in the reviewed diff.

## Visual PASS and browser execution limits

Independently opened and inspected all seven supplied screenshots in `docs/quality/evidence/`: `terrain-trajectory-rocket-approach-blue-portrait.png`, `terrain-trajectory-rocket-approach-red-portrait.png`, both corresponding landscape captures, `terrain-trajectory-bullets.png`, `terrain-trajectory-mixed-result.png` and `terrain-trajectory-800.png`. Both parties fit in portrait and landscape; mirrored launchers point upward along the displayed firing directions, bullets align with uphill/downhill fire, real rocket trails appear over the ridge, and the mixed result shows a dead Blue participant and surviving Red participant with physical damage/shot metrics. Visual criteria visible in these captures PASS. Small participant labels are less readable on portrait captures, but actors and both sides remain visible.

Inspected implementer-owned `/tmp/trajectory-browser-results.txt`: **15 passed (16.1s)**. This is supplied execution evidence, not a reviewer-owned browser run. Per explicit review scope no browser/network process was launched. Independent browser interaction, deployment verification and physical Safari remain UNVERIFIED.

The AGENTS completion gate and review protocol preclude an unconditional independent merge recommendation while reviewer-owned browser execution remains UNVERIFIED. The resolved source finding should not be reported as an outstanding defect.
