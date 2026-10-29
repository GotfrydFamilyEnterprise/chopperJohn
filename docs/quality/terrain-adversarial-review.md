# Terrain Lab independent adversarial review

Reviewed 2026-10-28 in a separate reviewer context, against TL-01–05 and their acceptance table. Scope: new Terrain Lab HTML, terrain modules, level JSON and focused tests on feature/terrain-playground versus feature/base-takeover, including untracked new feature files. No production files changed by reviewer. Historic battlefield acceptance is outside this review.

## Findings

1. **Resolved, TL-01 — required names.** Initial review reproduced acceptance of empty level/scenario names. Corrected `level.js:5` and `:20` now require trimmed nonempty identity/name strings. Reviewer independently re-probed empty and whitespace-only names for both level/scenario: all four rejected. Regression assertions are retained in the reviewer-owned probe.
2. **Resolved, TL-04/TL-05 landscape observation.** Initial supplied landscape screenshots retained portrait zoom2 and cropped rockets while overlapping walking subjects with the caption. Corrected `scene.js:27` resets zoom/center when crossing the500px width threshold. Reviewer independently inspected refreshed `terrain-rockets-landscape.png`: two orange rockets and curved trails are now visible above the ridge, with both rocketeers, scale, caption and controls visible. Refreshed `terrain-walking-landscape.png` separates caption from the soldiers and scale. These images resolve the observed discrepancy; actual reviewer browser rotation remains unverified.
3. **Resolved by source inspection, TL-01 error detail persistence.** `scene.js:14–15` now stores `loadError` separately and gives it precedence in rendered status; installation clears it. The prior one-frame overwrite is removed from this code path. Reviewer browser failure/retry reproduction remains UNVERIFIED.

## Executed evidence

- `node --test tests-unit/terrain.test.js`: exit0. Node reports the file as one passing test; the source contains eight named internal tests. Covers shipped round trips, malformed fields, collision directions, buried muzzle, rifle casualties, launched rockets and deterministic state.
- Reviewer-owned `node docs/quality/evidence/terrain-independent-probe.mjs`: exit0, `INDEPENDENT_GROUPS_PASS 16`. Seven malformed cases rejected (duplicate geometry coordinate, duplicate unit/scenario IDs, invalid team/type/combat flag, nonfinite baseline); three 4800-tick walking runs verify both teams' bounds, <=47/120 displacement, exact ground contact and zero shots. Injected rocket flight crossing actual terrain verifies enemy center2HP damage, friendly immunity, and enemy at24units receives0.08HP. Independent 3600-tick rocket replay matches batches of10 exactly. Four additional independent checks reject empty/whitespace names; output `EMPTY_AND_WHITESPACE_NAMES_REJECTED true`. This final probe and the focused module file were rerun after corrections, both exit0.
- Independently inspected all five supplied images: ridge portrait, walking landscape, rockets landscape, editor390 and editor844. Ridge shows distinct opposing soldiers, amber blocked line and terrain scale. Both editor screenshots keep textarea/actions inside the viewport. Captures are supplied evidence, not a claim of reviewer browser execution.
- Reviewer ran `PLAYWRIGHT_BROWSERS_PATH=/workspace/pw-browsers npx playwright test tests/terrain.spec.js --reporter=line`. It failed before tests: Python HTTP server socket creation raised `PermissionError: [Errno 1] Operation not permitted`. No browser assertion is claimed from that run. A previous additional-network-permission attempt did not return before workspace restart; it supplies no passing evidence.

## Requirement outcomes

| ID | Outcome | Evidence and limits |
|---|---|---|
| TL-01 | PASS (validation), UNVERIFIED (reviewer browser) | Malformed geometry/units, cloning and required-name rejection pass. Browser import/download and failed-fetch recovery not independently run. |
| TL-02 | PASS (simulation), UNVERIFIED (complete visual gate) | Independent 40s samples on all three surfaces pass both directions; hold fixture remains stationary. Refreshed feet/geometry images show clear subjects and caption. No physical Safari validation. |
| TL-03 | PASS (module behavior), UNVERIFIED (reviewer browser) | Executed shipped ridge/valley, muzzle-block and vertical/tangent/reverse sweep assertions. Ridge screenshot shows blocked line and unchanged health. |
| TL-04 | PASS (module behavior and supplied visual flight) | Executed real flights/elevated impact/nonhoming tests and independent exact falloff/friendly immunity probe. Refreshed rocket screenshot visibly shows both rockets and curved trails. Dedicated independent occluded-splash edge cases not established. |
| TL-05 | PASS (determinism/editor layout), UNVERIFIED (full gate) | Independent seeded replay and supplied editor images pass; real controls, async race handling, production no-hook, and public playable deployment not independently executed here. |

## Cross-feature analysis and recommendation

New simulation/rendering is isolated under terrain modules; existing soldier/combat utilities are imported without source modification. Diff inspection showed no changes to Flight School or main battlefield composition. This supports scope isolation, not a full regression pass. Public hosting and physical iPhone acceptance are UNVERIFIED.

**No remaining source blocker established in this bounded review. INSUFFICIENT EVIDENCE** for the complete independently executed browser/public gate. All three reported discrepancies were addressed and rechecked as described above. Reviewer browser execution, public hosting and physical iPhone/Safari remain UNVERIFIED; do not merge automatically. Implementer-reported full/focused browser totals are not relabeled as independently executed results. No historic game feature is added as a new blocker.
