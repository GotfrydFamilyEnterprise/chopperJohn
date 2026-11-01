# TL-08 independent adversarial review

2026-10-28. Separate reviewer context `/root/height_reach_review`. Reviewed AGENTS.md, requirements/acceptance TL-07/08, implementation status, adversarial-review protocol, actual source and working diff against `225ec82`. No production source edited. Scope is isolated Terrain Lab height-dependent reach; PR12 remains unmerged.

Recommendation: **source and supplied visual evidence PASS; reviewer-owned browser execution UNVERIFIED; INSUFFICIENT EVIDENCE for unconditional merge**. No blocking source or supplied-visual discrepancy found in bounded review.

| Requirement | Status | Independently executed evidence |
| --- | --- | --- |
| TL-08 actual height-dependent feasibility, mirrored860 fixtures | PASS | Own Node probe: height-blue eligibility `[true,false]`, shots `[3,0]` after1200 ticks; height-red `[false,true]`, shots `[0,3]`; each produced2 actual ground impacts. Flat860 eligibility `[false,false]`, zero shots/impacts. |
| TL-08 flat calibration/minimum and closer uphill rejection | PASS | Own flat fixture at224.99 rejected;225 and800 accepted;810 and860 rejected. At700 separation in height-blue, high shooter accepted and low uphill shooter rejected. |
| TL-08 actual muzzle, power/angles/terrain | PASS | Own probes checked34-unit shoulder-to-muzzle distance, speed<=413.6,8–80° elevation and1000 evenly spaced airborne positions per mirrored high shot. Solver uses actual target ground elevation, observed velocity and vertex clearance (`ballistics.js:26–53`); target acquisition calls solver, with no800 cutoff (`simulation.js:13–17`). |
| TL-08 common vertical translation | PASS | Own baseline shifts -350 and+250, with corresponding shooter shift, preserve vx,vy,speed,flightTime within1e-8 in both high fixtures. |
| TL-08 unbounded worsening spread/approximate diagnostic | PASS | Own spread(1000)=130; existing anchors remain5/20/50/66/98. Readout uses1° clear-air sweep (`ballistics.js:12–21`), separate from solver acquisition. Reach increases with drop. UI distinguishes reach≈ from clear/no-clear arc (`scene.js:17`). |
| TL-08 deterministic collision/reload/replay regression | PASS | Reviewer executed `node tests-unit/terrain.test.js`:24 passed,0 failed (3.55s), including lead, terrain collision, per-attempt scattering, mirrored height and replay assertions. Own10s height probes observed physical impacts. No height damage/precision bonus added; damage remains shared weapon tuning. |
| TL-08 caption reservation/mobile screenshots | PASS | On2026-10-29 independently opened all five CI artifact screenshots: `terrain-height-height-blue-portrait.png`, `terrain-height-height-blue-landscape.png`, `terrain-height-height-red-portrait.png`, `terrain-height-height-red-landscape.png`, `terrain-height-flat-landscape.png`. Both actors and in-flight rocket streaks remain visible below captions in both mirrored orientations. Readouts show downhill951/uphill612 at860, mirrored shot counts1/0, and equal-ground reach800/no clear arc/zero shots. Landscape actor labels are small but no relevant participant/projectile is obscured. |
| Public deployment / physical Safari | UNVERIFIED | Outside this source review; no deployment or physical-device execution performed. |

Cross-feature scope: production Battlefield weapon/module files and Flight School were absent from reviewed diff. Existing20 TL-01..07 unit cases passed with four new TL-08 cases. Several older tests still assert the obsolete looser520 speed bound; this is a low-severity coverage limitation, not an observed cap violation: production solver uses413.6 and reviewer explicitly checked that bound on both mirrored high shots.

Follow-up2026-10-29: root supplied GitHub CI artifacts for commit `b9162bb` and reported102 passing browser tests plus the unit step. The five screenshots above were independently inspected, so supplied visual evidence is now PASS. This reviewer did not independently launch the browser suite or verify the CI run over the network; reviewer-owned browser execution remains UNVERIFIED. Public v0.4 deployment was still pending at this review.

The adversarial-review protocol precludes an unconditional independent merge recommendation while reviewer-owned browser execution remains UNVERIFIED. No source or visual blocker is being held open merely because execution evidence is incomplete.
