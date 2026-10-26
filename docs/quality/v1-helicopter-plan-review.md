# Independent V1 helicopter planning review

2026-10-26. **DESIGN REVIEW ONLY — CHANGES REQUIRED before implementation.** Reviewed AGENTS.md, requirements/acceptance/implementation status, adversarial-review instructions, rocket historical/natural-play reviews, the V1 plan, and existing ground weapon rules in `docs/js/battlefield/combat/weapons.js`. This report challenges the plan against the latest user decisions supplied to the reviewer. No production source or scene changes, gameplay tests, browser runs, deployment checks or screenshots were performed. **All future gameplay validation below is NOT RUN / UNVERIFIED.** Screenshots are not expected for this document-only review.

## Re-review of revised plan

The revised draft resolves the original stale-rule contradictions: H-04/HG-03 now record 100 hull, direct20/nearby5, accepted controls, machine gun only, 8 rounds/s and exposed1 HP. H-05 and dedicated V1-11 explicitly add approved parked-pad repair, while V1-NATURAL requires ordinary player-control engagement. Story numbering and delivery gates now consistently reach V1-13. No gameplay correctness is established by these document repairs.

## Remaining blocking decisions

- **AA-06 / H-HULL:** direct20 versus first-entry proximity remains unresolved. Immediate first-entry detonation at25 prevents routine physical direct hits. The physical-direct20/otherwise-closest-approach-within25-for5 contract is a proposal awaiting the user, not an approval. Define physical shapes, boundary inclusion, closing/receding behavior, event time and one-event precedence once selected. Never apply both20 and5.
- **H-REPAIR:** repair is approved; rate (5/s versus2/s) is pending. Parking speed/pad tolerances, firing while parked, repair/respawn cost, full-hull replacement and infantry-cap exclusion remain proposals where not separately approved.
- **AA-FUSE / AA-INTERCEPT:** radial600 expiry is clearly proposed, replacing the earlier curved-path600 proposal. It avoids the automatic path-length shortening, but a trajectory can cross the radial boundary and return before its predicted intercept; reject such roots. Exact range geometry, launch tuning, scatter fallback and remaining defaults still need acceptance before implementation.

## Small consistency corrections still needed

1. Ballistic item2 still says “new600-path fuse”; replace with the selected maximum-reach policy to agree with radial proposal item9.
2. V1-05 calls gun cadence/speed/lifetime/damage approved, although only cadence/damage are approved; 680-unit/s speed and1.2-second lifetime remain proposed.
3. V1-10 requires full-hull replacement while section2 correctly marks it proposed; preserve that qualification until accepted. V1-11 should say “selected repair rate” rather than “approved repair rate” while the answer is pending.
4. Story-only test IDs `H-CONTRACT`, `HG-MUZZLE`, `HG-CADENCE`, `AA-LIFETIME` and `H-PAD` need explicit matrix mappings or their own rows. These are named test families, not an executed test count. H-PAD can map to H-REPAIR; AA-LIFETIME to AA-FUSE; muzzle/cadence to their gun assertions. No test count or PASS claim should be inferred from the matrix.

## Future assertions to retain or strengthen — all NOT RUN

- **AA-COLLISION / AA-BLAST2D:** independent moving-hull distance for pitched/turning aircraft, apex crossing, tangency, complete envelope traversal in one step, terrain/range ties, launch already inside/receding, and a replacement at the same location after target death. If closest approach is selected, test stationary relative motion, multiple close passes and expiry before receding.
- **AA-INTERCEPT / AA-FUSE / AA-SCATTER:** verify radial boundary crossing before a later intercept, vertical apex/return, overhead/behind/descending targets, alternate roots, unreachable scattered solutions and exact RNG consumption. The cross-track sample is an aiming error, not necessarily the final physical miss distance. Retain independent numerical oracles and no-homing comparisons only until each run's first legitimate detonation.
- **V1-NATURAL:** retain actual controls, normal troop spawning and commander operation; synthetic firing alone previously hid the natural-wave no-fire defect. Controlled zero-scatter paired runs establish evasion causality; a lucky natural miss does not.
- **H-REPAIR / H-RESPAWN:** exact pad/speed boundaries, fractional steps, full hull, moving/airborne/off-pad aircraft, firing and damage while parked, lethal hit, pause/reset and unique replacement lifecycle. Assert no dead-aircraft revival and no duplicate respawn; old rockets remain independent and interact with live replacement geometry under the selected policy.
- **HG-COVER / HG-SWEEP / HG-CADENCE:** same-time overlapping enemies, projectile starting inside a hull, terrain-before-soldier ordering and accumulated8/s timing across pause/death/reset. Preserve contacted-defender10%/1HP, rifle5%/0.5 and ground shared-blast1/3HP. Existing ground damage is horizontal-only; keep new true2D airburst policy separate.
- **V1-REGRESSION / EC-06..08:** disabled-helicopter replay preserves ground RNG/outcomes; active combat can change outcomes through actual aircraft damage and target choice. Assert selected repair/respawn policy does not accidentally generate or debit Supply, and retain paid deployments/caps/cooldowns, five free opening troops, both commanders and physical FOB replacement.

Keep historical Flight School, absorbed-hit feedback, visible near/far scatter and physical iPhone gaps open until fresh evidence closes them. No screenshots are required to review this planning document; future visual gameplay gates still apply.

**Recommendation:** document corrections remain small, but implementation must wait for pending choices and acceptance of remaining proposed defaults. All gameplay requirements remain NOT RUN / UNVERIFIED; no merge or implementation acceptance is implied.

## Final documentation corrections

The implementer corrected the remaining600-path wording to selected maximum-reach fuse, marked projectile speed/lifetime and full-hull respawn as proposed, and added explicit matrix entries for H-CONTRACT, HG-MUZZLE/HG-CADENCE, AA-LIFETIME and H-PAD. This records documentation changes only; pending user decisions and future executable validation remain open.

## Subsequent user decisions

After this planning review, the user explicitly selected physical direct hits or closest-approach near-miss bursts within25 units, and5 hull/s repair while landed and stationary on the pad. Those two design questions are now resolved in the plan. The earlier pending findings above describe the reviewed draft; they are not current blockers. Other labeled tuning proposals remain proposals. No gameplay implementation, tests or independent behavioral approval are asserted by this documentation update.
