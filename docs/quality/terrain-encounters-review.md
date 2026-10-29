# TL-06 independent adversarial review

Status: UNVERIFIED. Recommendation: INSUFFICIENT EVIDENCE for an independent completion gate. No merge approval.

Scope: fresh review of AGENTS.md, adversarial-review.md, TL-06 requirements/acceptance, implementation status, and changes against 198e9b3. Production source was not edited. Historical FOB/main-game feature checks were excluded from this encounter-only review.

## Findings

- PASS (source inspection): simulation.js computes all movement-target eligibility before moving units, commits movement before acquiring firing targets, preserves hold positions and uses actual angled barrel muzzle coordinates and velocity. Rifle bullets retain physical terrain/body sweeps. No faction-specific winning bonus was found.
- PASS (source inspection): result creation requires zero remaining projectiles and fewer than two live teams; subsequent simulation stepping exits before clock advancement. Per-unit shots, first-shot time and damage metrics derive from physical events. The summary derives team HP/shots/first shot and living count from unit state. Dead units receive explicit DOWN markers.
- PASS (source inspection): scene.js provides fixed twelve-tick 0.1s stepping, quarter/half/normal frame accumulation, scenario query selection, reset via fresh simulation and disables stepping/running at a settled result. These controls are isolated to the terrain lab.
- UNVERIFIED (independent execution): a combined Playwright TL-06 run and independently authored all-twelve-presets array-order/hold/moving-shot/freeze/replay probe did not return output before its tool call was aborted. No executable result is inferred from that attempt. The browser run requested network permission and used /workspace/pw-browsers.
- UNVERIFIED (behavioral acceptance): independently executed mirrored faction outcomes, per-tick array-order invariance, moving-fire/holder invariance, delayed return-bullet elimination, speed equivalence and reset replay therefore remain unproven by this reviewer. Implementer-reported passing runs are supporting evidence, not independent execution.
- PASS (visual inspection, limited): independently viewed terrain-encounter-approach-blue-portrait.png at390×844. Terrain/scenario, Run, both step controls, speed, reset, team HP/shots/first-shot reports, exchange state and visible uphill/downhill rifles fit the portrait viewport. Other encounter/final-result screenshots were not independently inspected.
- UNVERIFIED (deployment/device): this reviewer did not verify a published TL-06 URL or physical iPhone/Safari behavior.

No blocking source discrepancy was established. This is not a behavioral PASS: the independent execution gap is material under the repository completion gate.

## Cross-feature scope

The inspected production diff changes terrain modules, terrain JSON presets and terrain-lab.html. No change to normal battlefield simulation or Flight School was identified in the scoped diff. Full main-game regression execution was not repeated by this reviewer.

Implementer evidence available separately: terrain-encounters-outcomes.json, terrain-encounter-* screenshots, module and browser logs. Their existence does not replace the independent execution items above.
