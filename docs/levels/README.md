# Terrain Lab level files

Open `terrain-lab.html` to try these levels separately from Battlefield. This is an experimental heightfield format, not yet the main game's level loader. The lab shares infantry statistics, gait, weapon constants and seeded RNG; terrain targeting/flight adapters are isolated under `js/battlefield/terrain/`.

Each JSON file supplies the full terrain and initial experiments. Four walk-and-fire presets add red/blue holding high ground against an approaching opponent, plus uneven approaches with either faction nearer. These use ordinary rifle health, speed, range and damage; there is no automatic height bonus. There are no hardcoded hill shapes in the simulation or renderer. Use **Level JSON** to edit, import, apply or download a level. Applying starts a fresh paused experiment. It does not overwrite the repository file or save automatically. To add a shipped level, add its JSON here and its option in `terrain-lab.html`.

```json
{
  "schemaVersion": 1,
  "id": "my-hill",
  "name": "My hill",
  "description": "A hill between two soldiers",
  "seed": 31,
  "world": {"width": 1200, "baseline": 500},
  "terrain": {"points": [[0, 0], [480, 0], [600, 100], [720, 0], [1200, 0]]},
  "scenarios": [{
    "id": "rifles",
    "name": "Rifle cover",
    "description": "Try raising and lowering the hill.",
    "combat": true,
    "units": [
      {"id": 1, "team": 0, "type": "rifle", "x": 480, "mode": "hold"},
      {"id": 2, "team": 1, "type": "rifle", "x": 720, "mode": "hold"}
    ]
  }]
}
```

- Coordinates use world units. Terrain is `[x, elevation]`; positive elevation rises, negative creates a depression. Rendered ground y equals baseline minus elevation. Points connect with straight segments.
- `schemaVersion` must be 1; seed is an unsigned 32-bit integer. Width is 600–5000; baseline 250–700.
- Supply 2–200 strictly x-ordered terrain points spanning exactly 0 to width; elevation −150 to 250, ground y at least 80, absolute slope at most 1. No cliffs, overhangs or caves in this first format.
- Supply 1–12 uniquely identified scenarios, each with a name, boolean `combat` flag and 1–24 units. Unit IDs must be unique integers within the scenario, team 0/1, type `rifle`/`rocket`, x 40 to width−40, mode `walk`/`hold`. `combat:false` disables acquisition/firing for movement-only experiments.
- Unsupported fields are discarded. Bad JSON, invalid geometry, duplicate IDs and unsupported versions produce an error before changing the running level. Import files are limited to 100 KB. Textarea editing and selection remain available on phones.

The baseline is faintly drawn for reference. Green dotted lines mean unobstructed eye-to-eye geometry; amber means terrain intervenes. A green line does not assert a target is in range or that a muzzle is clear. Rifle range stays 250 forward. Rockets use 225–600 forward, aim 0.7 seconds, reload 3 seconds, gravity 240, existing scatter anchors and observed horizontal motion lead. They may target obscured ground positions in this experiment, then fly unguided until hitting the first surface. Splash is enemy-only, radius 25, up to 2 HP with linear distance falloff and terrain occlusion. No bunker cover roll applies in this terrain-only lab.

Experiments start paused. **Run**, **+1 second**, and **Reset** use fixed 1/120-second steps and the JSON seed. Choose ¼, ½ or normal speed to change playback only; +0.1s advances12 fixed ticks. The team readout shows actual remainingHP, shots and first-shot simulation time. Moving rifles slow to42% speed while engaging; holding rifles stay at their initial point. Terrain can interrupt sight and stop bullets after a shot. Outcome is declared only when the last opposing soldier is dead and all in-flight projectiles resolve, so return fire can produce mutual elimination. Finished experiments freeze until Reset. Sight/zoom/pan never consume RNG. No economy, bases, helicopter or victory are simulated here. These need later terrain integration stories; the production battlefield retains flat ground.

Next useful decisions: how much of a body must be visible to acquire a target; whether rocketeers require spotters for indirect fire; how steep slopes affect speed; prone/crouched stances; whether blast can wrap over a crest; and where buildings/pads can be placed. Test geometry first before changing campaign balance.

Direct comparison links can select a preset with `?scenario=crest-red`, `crest-blue`, `approach-blue` or `approach-red`. They start paused and expose no test controller without `?test`.
