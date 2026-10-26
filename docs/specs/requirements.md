# ChopperJohn requirements baseline (from game-design discussion, 2026-10-25)
This is the source of truth for intent, **not** an assertion that the implementation currently works. Refer to acceptance.md and implementation-status.md. Decisions are grouped as agreed behavior, not guesses about future gameplay.

## Overall product
- [SYS-01] Browser-playable 2D side-scrolling game, usable on iPhone, served from GitHub Pages in `docs/`.
- [SYS-02] Existing Unity project is historical and must remain untouched.
- [SYS-03] Maintain **separate Flight School** and **Battlefield** scenes, accessible from each other.
- [SYS-04] Evolution toward helicopter action integrated with tug-of-war side-scrolling battlefield/base defense is a future goal, not yet an implemented requirement.
- [SYS-05] Iterate on verifiable gameplay instead of broad speculative features; preserve previous accepted behavior.

## Flight School, existing accepted flight-feel baseline v0.4
- [FL-01] Left virtual stick changes pitch relative to facing (right-facing: right nose down/left nose up; left-facing: left nose down/right nose up) and collective (up increases lift/down decreases).
- [FL-02] Explicit TURN button performs visible approximately 420ms turnaround; do not rely on Safari double tap. Preserve world-space momentum when facing changes.
- [FL-03] Held FIRE produces rapid repeat shots angled along body/nose pitch with inherited aircraft velocity. Maintain correct muzzle alignment and target hit detection.
- [FL-04] Main rotor spinning visual and spinning tail rotor.
- [FL-05] Independently controlled cyclic rotor tilt leads slower fuselage pitch.
- [FL-06] Rotor-aligned thrust, neutral hover when level, tilt-dependent vertical lift loss and forward descent if collective is insufficient.
- [FL-07] Meaningful horizontal and vertical inertia; don't regress flight handling without explicit agreement.
- [FL-08] Optional flight telemetry, showing pitch, rotor angle, velocity, altitude and collective, hidden by default.
- [FL-09] Preserve tutorial progression: controls/maneuver, climb, navigate, hit three targets, return and land; preserve restart and desktop controls.

## Battlefield and factions
- [BF-01] A separate horizontally pannable battlefield, with blue and red main headquarters widely separated.
- [BF-02] Two forward operating bases (FOBs), one on each side, separate from the headquarters.
- [BF-03] Infantry only: **no tanks**. Only rifleman and rocket-launcher soldier for now.
- [BF-04] Deploy infantry from the faction's main base. Keep visible deployment controls, pause/reset and panning.
- [BF-05] Soldier orientation agrees with faction marching direction; units continue forward unless combat or assigned to a FOB.
- [BF-06] Later units pass a fully staffed friendly FOB rather than all stopping there.

## Shared stick-figure animation
- [AN-01] Stick-figure side profiles have articulated hips, **knees**, ankles and visible feet.
- [AN-02] Normal step animation: **planted foot remains stationary in world coordinates** while it bears weight and propels the body forward; other foot rises slightly, knee bends, and swings forward. Avoid foot skating.
- [AN-03] Forward/backward step extent must be balanced, not exaggerated forward. Avoid double-time bobbing; body movement subtle.
- [AN-04] Walking cycle follows actual horizontal movement speed; stationary guards do not march in place.

## Rifleman
- [RI-01] While marching, rifle carried **below chest**, not shouldered.
- [RI-02] In firing range rifle rises to shoulder; rifleman can continue advancing at slower speed and firing.
- [RI-03] Engagement distance baseline **250 world units** in front (not behind).
- [RI-04] Riflemen **actually fire visible shots**, with hits reducing enemy HP and eventually causing casualties; agreed prototype baseline 3 HP, 1 damage/shot, 0.32 seconds/shot. These are gameplay tuning defaults.
- [RI-05] Rifleman assigned to FOB stops and guards/fire from the designated defensive position, no walking through the bunker.
- [RI-06] Bullets interact with opposing infantry, including rocket soldiers. No friendly fire intended in current design.

## Rocket soldier
- [RO-01] On march, launcher is carried **on the back**.
- [RO-02] At engagement range the rocket soldier **stops** and places launcher on shoulder in preparation to fire.
- [RO-03] Rocket engagement is **225–600 world units ahead**, inclusive; rifle range remains 250, giving 25 units of overlap. The user subsequently selected a 600-unit maximum.
- [RO-04] Ground-directed arcing rocket fire and area damage are now authorized by the approved RC requirements below.
- [RO-05] 4 HP prototype baseline; rocket soldier assigned to FOB guards designated position.

## FOB physical appearance and occupation (CRITICAL, current known implementation mismatch)
- [FOB-01] Visually distinct **open sandbag bunker**, with layered sandbag frontage, **roof on posts/stilts** and **camouflage netting on top**; soldier bodies can be seen behind/within defenses. Not a generic hut, opaque box or decorative roof only.
- [FOB-02] Both FOBs start **empty**, **unoccupied**, **flag down**. No initially stationed soldiers, and no tap-to-spawn FOB garrison.
- [FOB-03] First **two matching friendly riflemen and one matching friendly rocket soldier** marching from their main HQ physically reach, **enter** and take three *distinct* positions inside the friendly FOB. Arrivals can be in any order; ensure correct slot type. An approach/enter/station animation and movement must be observable, not an instant coordinate teleport.
- [FOB-04] Distinguish states `UNCLAIMED`, `ASSEMBLING`, `OCCUPIED` (and `UNDERSTAFFED` after losing a defender); count slot occupancy only when unit reaches its assigned post.
- [FOB-05] **Only after** 2 riflemen **and** 1 rocketeer are physically stationed does the flag raise and the FOB become `OCCUPIED`. Partial squads never raise the flag.
- [FOB-06] Subsequent friendly units bypass fully staffed same-team FOB and keep advancing.
- [FOB-07] Defender remains guarding and may fight while stationed; dead defender leaves a vacancy; next qualifying arrival may replace them. Flag/occupied state reacts to vacancy rather than persisting erroneously.
- [FOB-08] Enemy infantry must not silently occupy the opposing team's FOB merely by entering its area. Changing FOB ownership/capture is out of scope until explicitly specified.
- [FOB-09] Show occupancy clearly in the rendering: defensive posts, visible soldiers, flag, and optional debugging inspector; screenshots must demonstrate each staged state.
- [FOB-10] Blue and red FOB mechanics must be symmetric.

## Combat and visibility
- [CB-01] Targets selected in front and within range; riflemen fire at opposing soldiers, bullets move visibly and collision causes HP loss; dead units removed with no phantom defenders.
- [CB-02] Combat must not prevent occupancy sequence tests from completing; deterministic simulation must support isolating the FOB lifecycle from combat.
- [CB-03] Rocket combat is authorized below. Vehicles, tanks, capture mechanics, helicopter battlefield integration and other weapons remain out of scope.
- [QA-01] Make gameplay observable by deterministic tests, simulation stepping and screenshots rather than relying on minutes-long manual walks.
- [QA-02] A separate adversarial reviewer checks all cross-feature invariants (capture, movement, rendering, combat, reset, red/blue symmetry).

## Approved rocket combat (user accepted design, 2026-10-25)
These requirements supersede the earlier aim-only rocket milestone. They specify intent, not passing implementation status.

- [RC-01] Rifle aim range is 0–250; rocket aim range is 225–600 world units forward, inclusive. Reject behind, dead and friendly targets. A nearer enemy inside rocket minimum does not prevent selection of another eligible enemy.
- [RC-02] Rocketeer stops, shoulders an upward-angled launcher and aims continuously at the same eligible target for 0.7 seconds before launch. After firing, reload 3 seconds before beginning the next aim. Losing/changing target restarts aim. Stationed rocketeers stay at their posts.
- [RC-03] Predict the target's ground intercept from its observed actual horizontal movement and ballistic flight time, as subsequently requested by the user. Once launched, never home or retarget. Randomize the landing point once and calculate a real ballistic trajectory to it. Infantry do not intercept airborne rockets; detonate only on ground impact.
- [RC-04] Landing error is uniformly sampled within ±5 units at 225 range, ±20 at 350, ±50 at 500 and ±66 at 600, interpolating continuously between anchors. Minimum/maximum firing ranges constrain target selection, not the scattered impact position. Longer shots must visibly miss more often.
- [RC-05] Ground explosions have a 25-unit radius and deal 2 HP at center to exposed opposing infantry, decreasing linearly to zero at the edge. No friendly fire. Both infantry kinds are vulnerable. In-flight rockets persist if their shooter or target dies.
- [RC-06] Show the upward launch, curved flight with trail, explosion flash, dust and brief ground impact effect. Launcher and projectile muzzle agree. Pause freezes combat; reset clears projectiles, effects, aim, reload and damage events.
- [RC-07] All scatter, cover chances and defender selection use a seeded, resettable simulation RNG, observable through test state. Identical seed/timestep/commands reproduce the full combat sequence.
- [RC-08] Preserve existing FOB lifecycle, distinct stationary posts, bypass, casualty replacement, controls and separate Flight School. Red and blue mechanics are symmetric.

## Approved bunker protection
- [BC-01] Protection starts when a live friendly infantry unit physically reaches a registered guard post. Merely approaching, reserving a slot or passing the bunker gives no protection. Partial and understaffed bunkers protect their stationed defenders; raised flag is not required.
- [BC-02] Each opposing rocket blast that reaches the bunker footprint (80 world units either side of center, plus 25 blast radius) creates exactly one shared damage event: choose one living stationed defender uniformly and deal **1/3 HP total**. Do not apply ordinary area damage to any stationed defender as well. This rule overrides ordinary blast falloff for that bunker.
- [BC-03] Each rifle bullet that physically hits a stationed defender has a **1-in-20 independent chance** to deal **0.5 HP**; otherwise it is absorbed. The contacted defender receives that damage; a bullet never pierces to another unit. This is probability, not a guaranteed every-twentieth counter.
- [BC-04] Exposed infantry keep ordinary rifle damage (1 HP) and ordinary rocket area damage. Infantry outside a hit bunker may take ordinary blast damage in the same event; no friendly fire or reduced damage for unstationed units.
- [BC-05] Fractional HP must cause eventual death without floating-point phantom survivors. Casualties free posts/reservations and update the flag as before; replacements receive protection only after arriving. Show damage/absorbed-hit feedback.

### Firing visibility and autonomous leading (user follow-up)
- [RC-09] Rocketeers autonomously select a live opposing target within their forward firing band. Keep an eligible target while aiming; choose a new one if it dies/leaves range. Predict ahead along actual observed ground velocity, including slower rifle fire-walk; stationary guards get no lead. Solve ballistic flight time and moving-target interception together. Scatter remains random; the rocket does not home after launch.
- [RC-10] A normal initial wave must produce observable rocket fire without requiring undocumented extra deployments. Blue starts one bunker-bound and one advancing rocket soldier from HQ. The later approved red economy buys its garrison and assault waves instead of receiving free opening troops. Keep FOBs initially empty and first-arrival staffing intact. Show cumulative launches, aiming/reload/guard/advance status in an opt-in Follow rockets view. Fit the launch/impact span and retain impact briefly; manual panning or FOB jump exits follow. `?view=rockets` starts this view without exposing a test controller.

## Red Supply economy and strategy (approved next version)
These rules supersede free red opening/manual deployments. Blue keeps its manual controls for balance testing; existing combat statistics and FOB protection remain unchanged.

- [EC-01] Red starts with120 Supply and no free troops, earns5 Supply/second from HQ, and stores at most240. FOBs add no income. No upkeep, collectors or upgrades.
- [EC-02] Rifleman costs25; rocketeer60. Confirm at most one purchase per2 seconds, charge only on successful HQ deployment, never overspend or pay for failed/invalid deployments.
- [EC-03] Red has a15-living-unit cap including garrisons, assembling squads and reinforcements in transit. Dead soldiers release capacity; no bypass through strategic/emergency purchases.
- [EC-04] Income, overflow, purchases, costs and balance are observable and reconcile. Fixed steps/seed/commands reproduce plans and spending. Pause freezes income/orders/deployments; reset restores120, clears ledgers/squads and empties both FOBs.
- [EC-05] Phone UI shows red Supply/cap, income, living population/cap and objective/progress. Blue remains manually deployable. Red is provisioned by AI rather than player spawn buttons.
- [AI-01] Prioritize2 friendly rifles and1 friendly rocket for FOB staffing; count assigned defenders and qualifying replacements already marching. Replace casualties without duplicate purchases. Redirect an eligible already-paid troop before buying another replacement. All enter physically and gain cover only on arrival.
- [AI-02] HQ danger takes priority over normal garrison/assault saving. Release assembling troops to defend and allow emergency spending of the60-Supply reserve; still obey prices, cooldown and cap. Initial threat radius800 is tuning, not a hidden bonus.
- [AI-03] Ordinary groups are3 rifles+2 rockets (195 total); attacks on staffed enemy FOBs are2 rifles+3 rockets (230). Buy incrementally while retaining60 Supply, gather the group near HQ, then release together. Do not start a group without enough population capacity for its composition.
- [AI-04] Reinforce understrength advancing groups, counting incoming members. After2 lost groups or10 field casualties, stop feeding them, regroup12 seconds, then add1 rifle+1 rocket to future waves. These are initial bounded tuning values; no free units or buffs.
- [AI-05] Reassess objectives about every3 seconds, with visible HQ emergencies/vacancies allowed to interrupt. Observe current public positions, teams, living infantry and staffed FOBs only; never player future purchases or hidden damage bonuses. Commit to an assembling composition until interrupted by emergency/reinforcement need.
- [AI-06] Economy, observation/strategy, squad orders and UI adapters must be isolated modules under docs/js/battlefield/. No DOM/canvas/global browser clock/RNG in economy/AI. Scene injects the normal HQ spawn factory and applies movement directives; it does not implement economy rules.
- [SQ-01] Purchased field troops physically walk to rally positions and wait for the full composition; no coordinate snapping or marching in place. Deployments are not counted as physically assembled until they reach rally.
- [SQ-02] On advance, rifles match the slowest joined soldier (normally33 units/s). Permit existing stop-to-fire behavior and a360-unit tactical formation gap, allowing rifle/rocket ranges to coexist. Reinforcements travel normally to join existing groups; no speed buffs.
- [SQ-03] Preserve first-arrival FOB registration, stationary distinct posts, bypass, vacancy/flag behavior and friendly ownership. Squad orders cannot move guards out of posts or invent capture.
- [SQ-04] Keep rifle firing-walk, rocket stopping/leading/ranges/reload, damage and friendly-fire filtering unchanged. Flight School and legacy Unity remain untouched.

## Shared faction economy (v0.8, supersedes red-only EC rules and free blue RC-10 opening)
- [EC-06] Both factions start with the same free grant of3 riflemen+2 rocketeers at mirrored HQ positions, plus independent identical accounts:120 initial,5/s income,240 bank,25/60 costs,2-second deployment spacing,15 living cap. Every subsequent deployment, including blue buttons and both AI commanders, uses the same accounting transaction; no shared balance. The five opening troops count toward the15 living cap and are explicitly exempt from purchase costs.
- [EC-07] Both factions use the same provisioning/strategy/squad implementation with mirrored HQ/rally/defense/attack positions. Blue manual purchases spend its own account and respect the same cooldown/cap, cannot deploy while paused, and receive no hidden resource bonus. Automatic garrison and waves run for both teams. Matching observations produce matching economic decisions; combat randomness need not produce a tied battle.
- [EC-08] Phone and landscape HUD show both accounts/populations/objectives and priced blue controls with unavailable purchases disabled. Pause freezes both accounts/orders; reset restores the same five-soldier grant on both sides, clears both ledgers/squads and restores independent120 accounts with empty FOBs. Deterministic replay and all prior combat/FOB mechanics remain intact. Natural opening must produce rocket fire for both factions without clicks within60 simulation seconds.
