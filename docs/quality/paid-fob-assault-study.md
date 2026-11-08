# Paid FOB assault baseline — issue #34

Scope: QA-01 / PL-10. A small isolated harness for #25; no production combat, tactics, UI, map, defense or damage changes. It imports the real Campaign engine, platoon lifecycle and Supply transactions. Existing v2.2 fixtures and648-row results are retained unchanged.

## Method

Both factions begin with120 Supply and zero free soldiers. Every initial soldier is purchased at its HQ, respecting25/60 prices,5/s income,240 bank,2s spacing and15 living cap. They physically walk to rally/the FOB. The defender initially has no stationed units; its2R1K garrison is physically ready before the attack launches in these probes. Ordinary combat remains active throughout preparation.

Attackers assemble the same paid formation before their selected controller takes over. Independent releases those soldiers as ordinary infantry; Siege uses the existing formation, leader vulnerability and60/80 retreat rules. This controls paid initial assembly, not all role advantages: the independent fifth rifle can capture, whereas a living sergeant cannot. Fixed-force runs stop recruitment after assembly. Supplied runs pay for same-type HQ replacements; leader loss cancels platoon recruitment while the independent roster continues. Those policy differences are deliberate and reported, not hidden equal-spending assumptions. No follow-on leader/wave, helicopter or natural campaign victory is modeled.

Times include recruitment. Five soldiers3R2K cost195 and launch at16.5833s; seven3R4K cost315 and launch at40.9417s. Defender initial value/cost is110. All initial cost is already in reported spending: never add initial value to spending again. Timeout means unfinished, not draw or proved stalemate. Capture means actual ownership transfer; breach alone is not victory. Troops and projectiles remain governed by the original world.

## Small exploratory probe

16 runs: two mixes × two controllers × fixed/supplied × seed101 and its paired faction mirror,240s maximum. One primary seed and its mirror are not two independent samples. These are diagnostics, not a balanced-game claim. Every run was unfinished with no capture at240s.

| Attack | Policy | Replacements | Breach seconds, primary / mirror | Attacker spending, primary / mirror |
|---|---|---|---|---|
|3R2K|Independent|Fixed|170.41 /170.41|195 /195|
|3R2K|Siege|Fixed|— /—|195 /195|
|3R4K|Independent|Fixed|132.83 /124.83|315 /315|
|3R4K|Siege|Fixed|87.83 /87.83|315 /315|
|3R2K|Independent|Supplied|167.85 /167.34|845 /845|
|3R2K|Siege|Supplied|225.48 /225.48|445 /445|
|3R4K|Independent|Supplied|121.18 /121.18|865 /865|
|3R4K|Siege|Supplied|85.62 /85.05|615 /490|

Larger forces can breach sooner but that does not guarantee a surviving capture rifle. In the primary fixed3R4K Siege trace, both follower rifles were already dead at breach and the nearly dead sergeant subsequently died; four surviving rockets cleared the defenders but could not capture. The supplied defender spending and several other results differ between mirrors; deterministic replay does not imply color symmetry. Lower spending may reflect disbanding or stalled recruitment, not efficiency. Tactical fixes, larger seed studies and tuning belong in subsequent small stories.

## Reproduce and validate

```sh
node tests-unit/fob-assault-study.test.js
FOB_MIXES=3:2,3:4 FOB_CONTROLLERS=independent,siege FOB_MODES=fixed,supplied FOB_SECONDS=240 node scripts/fob-assault-benchmark.mjs
```

Raw output defaults to the OS temporary directory (`chopperjohn-fob-assault-results.json`); `FOB_OUTPUT` overrides it. Seed, mix, policy, duration and mirrored selection can be overridden with the documented `FOB_*` variables in the short script. Raw matrices, logs and screenshots are not added to this PR. The recorded16-row raw probe SHA256 is `ee71f4e0e016d1a7931f3f6e957491635b7329c5c385edea6f27fa549d6a4e9c`.

Four focused tests cover real paid/physical assembly and identical starts in both directions, ledger/income/cooldown reconciliation, unaffordable versus funded replacements, fixed-force casualty behavior, pause, exact batching/replay and malformed inputs. Browser screenshots are inapplicable to this Node-only harness; no browser-facing page imports it. Existing production browser acceptance remains separate. CI and independent-review results are recorded below when actually completed.
