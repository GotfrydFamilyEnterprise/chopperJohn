# V1 helicopter battlefield: stories and validation plan

Status: **APPROVED IMPLEMENTATION BASELINE — user merged the plan and authorized building.** This document retains the design history; current execution evidence belongs in implementation-status.md, not this planning matrix.

This plan separates approved rules from proposed tuning and unanswered decisions. A test listed here is planned, not executed or passing evidence. Read with requirements.md, acceptance.md and quality/adversarial-review.md. No Flight School or legacy Unity edits are authorized by this plan.

## 1. Confirmed product rules

| ID | Approved behavior |
|---|---|
| H-01 | One player-controlled blue helicopter starts landed on a visible helipad near blue HQ. |
| H-02 | Helicopter weapons damage enemy ground soldiers only. Blue soldiers cannot take friendly fire. Both enemy infantry types are eligible, including actual FOB defenders. This does not grant HQ/bunker structural damage. |
| HG-01 | Each helicopter bullet that physically contacts a stationed enemy FOB defender has an independent 10% chance to deal1 HP, double the rifleman's existing 0.5-HP protected hit. Otherwise it is absorbed. It is not a guaranteed every-tenth counter. |
| HG-02 | Cover applies only after physical post arrival. Entering, reserved and bypassing infantry are exposed. Penetration damages the contacted defender, not a randomly selected guard or all guards. |
| AA-01 | Only enemy rocket soldiers may deliberately target and damage the helicopter. Rifles cannot target or damage it. Friendly rockets cannot damage it. |
| AA-02 | A rocket aims ahead using the helicopter's actual current velocity, commits when launched and does not home afterwards. Changing speed after launch must be capable of evading its predicted intercept; neither acceleration nor braking guarantees a miss if too small or too late. |
| AA-03 | Anti-air accuracy worsens with distance using the existing spread anchors:225±5,350±20,500±50,600±66 world units, continuous interpolation. Scatter sampled once per launch using deterministic RNG. |
| AA-04 | Anti-air rockets use arcing ballistic flight, not straight flight or homing. A miss explodes at maximum travel range; exact range metric remains a proposed contract below. |
| AA-05 | Enemy rocket soldiers may aim at the helicopter in any direction, including overhead and behind, without moving stationed guards from their posts. |
| AA-06 | A rocket physically contacting the hull detonates for20 damage. A near miss detonates at its closest approach within25 units for5 damage, rather than immediately on entering that radius. One rocket applies one hull-damage event; direct and nearby damage never stack. |
| H-03 | A destroyed helicopter respawns on the blue helipad after 10 simulation seconds while the ground battle continues. Pause must freeze that countdown. |
| H-04 | Helicopter has100 hull. A direct enemy rocket hit deals20 hull damage; a nearby rocket explosion deals5. One rocket damages the same helicopter once: direct20 replaces proximity5, not25 combined. |
| H-05 | Repair at5 hull per simulation second while landed and stationary on the blue helipad, capped at100. Parking geometry/speed tolerances remain implementation tuning. |
| HG-03 | Use the accepted Flight School controls and machine gun only for initial v1:8 rounds/s and 1HP to exposed infantry; protected defenders retain the approved 10%/1HP rule. No helicopter-fired rockets in this milestone. |
| QA-H01 | Build modularly, test deterministic gameplay in real browsers, capture/inspect mobile screenshots, conduct a fresh independent adversarial review, present a PR and playable build, and do not merge without user authorization. |

The existing ground battle, equal Supply accounts, five free starting soldiers per faction, FOB lifecycle, ground-rocket behavior and fullscreen support remain the regression baseline. The new player helicopter is an explicit blue-side capability; equal ground economic rules do not imply identical faction capabilities.

## 2. Decisions still to settle

Suggested defaults below are **not approved settings**. The user subsequently authorized merging and building. Explicit answers below are approved rules; the remaining suggested defaults are now initial implementation tuning choices under that authorization, recorded in requirements.md H-TUNING. They remain reviewable rather than blocking routine implementation.

| Decision | Suggested starting choice | Why it matters |
|---|---|---|
| Flight controls / helicopter weapon | **Approved: accepted Flight School controls and 8-round/s machine gun only**,1 damage to exposed infantry | No helicopter-fired rockets in this milestone. |
| Anti-air flight style | **Approved: arcing ballistic anti-air rockets**, with variable launch elevation; ground rockets retain their current arc | Need a2D moving-target ballistic solver rather than the old ground-only fixed50° solution. |
| Anti-air launch speed / gravity | Proposed initial speed 450 units/s and gravity240 units/s², choosing the earliest feasible upward-launch arc | Initial speed is fixed, but gravity changes velocity during flight. At450 and gravity240, maximum rise from a vertical launch is about422 units; include battlefield ceiling reachability in tests. Ground gravity is240. Verify reachability/path budget and tune reaction time in play. |
| Air target band / expiry metric | Proposed 225–600 units of 2D muzzle-to-target distance; **proposed 600-unit radial reach from the launch muzzle** for expiry, rather than600 accumulated curved-path length | A nonstraight arc to a target600 units away travels more than600 units; a600-path fuse would silently shorten effective reach. A radial600 fuse preserves the intended reach where a ballistic solution exists. This metric still needs approval. |
| Anti-air aiming direction | **Approved: any direction**, including above/behind; launcher visually rotates while guard feet remain fixed | Current ground shots remain forward-only. |
| Target priority | **Latest approved direction:** helicopter is higher threat and immediately preempts ground aim; groups split2/3 air and1/3 ground where both threats are reachable, with stable assignments | Avoid aim thrashing and ensure anti-air is observable. No firing an impossible intercept or free extra ammo cadence. |
| Helicopter HP / rocket damage | **Approved:100 hull,20 direct-hit damage,5 nearby-explosion damage**, never both from one rocket | Five direct hits or20 nearby bursts destroy full hull without repairs. Define how proximity allows direct hits before coding. Hull proximity damage has no inferred ground-style zero-at-edge falloff. |
| Damage to exposed infantry | **Approved:1 HP per helicopter bullet** | User confirmed the proposed machine-gun-only baseline, including exposed damage. |
| Rocket detonation triggers | **Approved: physical hull hit for20, or near-miss burst at closest approach within25 units for5.** Terrain/range expiry also ends the shot | No immediate outer-radius fuse that prevents direct hits. Resolve the first actual event, exactly once; do not use future pilot inputs to classify a shot. |
| Airburst effects on infantry | Existing enemy-only blast/cover strengths, but only when the2D blast actually reaches the infantry/bunker | A blast high in the sky must not damage soldiers merely sharing its horizontal position. No friendly splash. |
| Destruction / replacement | **Approved: respawn on blue pad after 10 seconds**, battle continues; propose full hull, no Supply charge and clean inputs | No battle-wide reset; replacement cost is not implied by the selected timer. |
| Landing / services | **Approved:5 hull/s while landed and stationary on blue pad**, capped100; no fuel/rearm system | Define landed, stationary and inside-pad criteria; airborne, moving, wrong-place or dead aircraft do not repair. Hard landing and repair timing need deterministic tests. |
| Ammunition / fuel | Unlimited gun ammunition, no fuel system for the initial milestone | Keep first integration focused. Must be explicit rather than an accidental infinite resource. |
| Victory rules | No new HQ health, structural destruction or win condition in this integration | These require separate stories if “v1” must also include a complete match ending. |

User answered: **ballistic arcs, any-direction aiming,10-second respawn**, and added **proximity detonation**. User further approved 100 hull,20 direct/5 nearby rocket damage, repair while parked, and machine-gun-only with the accepted controls/ 8rps/exposed1HP baseline. User has now confirmed **physical direct hits or closest-approach near-miss bursts within25 units**, and **5 hull/s repair while landed and stationary on the pad**. Both questions are closed. Ammunition, precise2D range/fuse metric, speed and parking tolerances still need explicit acceptance of proposed defaults. Do not repeatedly ask about already confirmed10% independent penetration or enemy-only helicopter fire.

## 3. Ballistic anti-air shot contract

Arcing flight, any-direction aim, current-velocity prediction, unguided travel, proximity detonation and 10-second respawn are approved. Numeric parameters and precise geometry below remain proposals until confirmed.

1. Observe the live opposing helicopter's actual world position and measured horizontal **and vertical** velocity. Use realized motion after collision/clamping, not joystick intent, commanded maximum speed or future inputs.
2. Proposed acquisition uses inclusive 225–600 units of 2D distance from the actual launch muzzle to the helicopter center. Confirm this metric; ground rockets retain their existing horizontal forward band. Proposed aircraft threat checks apply to any opposing rocket, including one originally aimed at infantry, without changing its committed path; the new maximum-reach fuse applies to anti-air shots only unless a broader ground-rocket change is explicitly approved. A stationary/landed helicopter remains a valid aircraft target. An aircraft within the range band may still be ballistically unreachable.
3. Keep existing 0.7-second continuous aim and 3-second reload. Each soldier has one weapon, one cooldown and one typed aim lock shared across ground/air modes. Switching target kind or identity resets aim; no parallel reloads or double shots.
4. While aiming, refresh the ballistic intercept from observed velocity. At launch, snapshot actual current position/velocity and solve for an upward launch vector at the agreed initial speed under gravity. Do not freeze prediction at aim start.
5. With fixed muzzle `m`, relative target position `r`, observed target velocity `v`, gravity vector `a=(0,g)` and initial rocket speed `s`, solve `|r + v*t - 0.5*a*t²|² = s²*t²` for positive flight times. This is a ballistic quartic, not the straight-projectile quadratic. Select the earliest valid upward-launch root whose trajectory stays within the selected range budget until contact/proximity. Test other roots explicitly and reject non-finite/unreachable cases.
6. The muzzle itself must agree with the aimed launcher, including overhead/backwards. If its tip is a barrel length `L` from a fixed shoulder pivot, solve `|r + v*t - 0.5*a*t²| = L+s*t` from that pivot, then derive the tip and launch vector consistently. An alternative numerical solver must satisfy the same geometry; do not calculate from one point and render from another.
7. Sample one uniform signed aiming error from existing spread anchors based on launch-time current2D range. The intended intercept is displaced perpendicular to the zero-error aim line in the flight plane. Re-solve the arc against the predicted motion plus that fixed offset, without resampling to obtain a better shot. Define a bounded fallback for a scattered aimpoint that has no feasible solution: proposed keep the ideal feasible arc and perturb its elevation by `atan(error/range)` while preserving launch speed, so the sampled error remains a real miss rather than being discarded. Record when fallback is used. This edge policy must be reviewed before implementation; near/far spread tests verify intended aim error separately from gravity's resulting miss distance.
8. After launch, integrate `position=m+v0*t+0.5*a*t²` and `velocity=v0+a*t`. Never read the helicopter's later motion to steer or refresh this trajectory. Rockets survive shooter/target death or loss of aim lock. Fixed speed applies at launch only; gravity changes the speed afterwards.
9. Proposed maximum range is600 units of **radial reach from the immutable launch muzzle**: the first outward crossing of `|position(t)-muzzle|=600` triggers expiry. A ballistic arc travels farther along its curve than its radial displacement; do not silently substitute600 accumulated-path units and reduce the reachable firing band. Independently measure both quantities in traces and test root selection, including vertical apex/return. If the user instead selects accumulated-path range, integrate `|v0+a*t|` with a stable exact formula and test the shorter feasible boundary explicitly. In either policy, solve the crossing within the timestep; do not use `600 / initialSpeed` as a timer or measure range from a moving shooter.
10. Sweep the curved trajectory and moving aircraft through each timestep for physical hull contact and closest approach inside the approved proximity envelope. Subdivide with a declared curvature-error bound or solve the curve/shape problem directly; a single long straight chord is not sufficient near an apex. The approved near-miss fuse triggers when distance to the moving hull reaches a local minimum within 25 units, while physical contact detonates immediately for 20; do not look at future pilot inputs to decide whether to delay a burst. Compare those actual events with terrain contact/range expiry and choose the earliest, once. Do not replace this with first-entry detonation, which would prevent ordinary direct hits. Handle already-inside/initially-receding states and an arc that has multiple close passes. No arming delay is implied.
11. A physical rocket/hull contact deals exactly 20 hull damage once. A nearby burst within the approved25-unit hull-distance radius deals exactly 5, including the radius boundary. Direct20 and nearby5 never stack on the same helicopter for one rocket. Terrain/range airbursts can also deal5 when within range; no friendly splash. Do not import zero-at-edge ground blast falloff into this fixed hull-damage rule.
12. Airburst effects on infantry use true2D proximity and existing ground blast strengths/cover rules only if the explosion physically reaches them. A high-altitude burst must not damage soldiers directly below merely sharing its X coordinate. Keep current ground-shot explosion behavior separate.

**Evasion proof:** launch a zero-scatter ballistic shot at a helicopter moving steadily at a chosen reachable velocity. Keeping that motion enters the predicted proximity envelope. Starting from an identical launch state, braking or accelerating sufficiently early moves the helicopter outside the committed envelope; the rocket follows exactly the same arc and eventually explodes at its selected range limit if no earlier trigger occurs. Very late/small changes may still trigger proximity. The test must compare trajectories and outcomes rather than grant a scripted dodge when input changes.

## 4. Implementation stories, in dependency order

### V1-01 — Freeze decisions and numerical contracts
As a player, I want predictable helicopter and rocket rules before the scene changes.

- Record answers from section2 as approved requirements, with IDs; preserve the distinction between approved rules and starting tuning proposals.
- Define muzzle, helicopter/infantry collision shapes, helipad extent, altitude ceiling and world boundaries in world units. Define2D range, maximum reach metric and damage scales explicitly.
- Define whether a helicopter resting on the pad remains a valid rocket target; recommended yes, since it is the same aircraft and enemy-only rules still apply.
- Acceptance: no contradictory range/expiry/cover rules; every selected behavior maps to a named test below.
- Depends on: design answers. Test: `H-CONTRACT` (configuration/schema/invariant checks and reviewer challenge).

### V1-02 — Introduce a landed helicopter and helipad
As a player, I start beside blue HQ and can clearly see where to take off and return.

- Add a visible H-marked pad near blue HQ, clear of infantry spawn/rally routes and HQ art. Proposed pad center aroundx400, with final size chosen from actual helicopter footprint; it must fit inside camera bounds.
- Start exactly one blue helicopter with skids on the pad, facing the battlefield, zero velocity and full approved hull. FOBs remain empty; the existing five soldiers/account120 per side are unchanged.
- Neutral input does not lift or drift the landed helicopter. Start/reset recreates this state, not the airborne Flight School tutorial start.
- Test: `H-START`, `H-RESET`; screenshots `v1-start-portrait`, `v1-start-landscape`, `v1-pad-closeup`.
- Depends on: V1-01.

### V1-03 — Preserve flight feel in isolated modules
As a pilot, I use the familiar pitch, collective and TURN behavior in the larger battlefield.

- Port accepted flight equations/constants into a pure battlefield flight module, without modifying the Flight School page. Use the existing 420ms turn, world-space momentum, rotor lead/body lag, lift loss when tilted and speed limits as the baseline.
- Ground contact, ceiling and horizontal boundaries are explicit; no repeated crash damage every tick from one impact. Define gentle/hard landing thresholds and apply a crash only once per contact episode.
- Rotors, pitched gun muzzle and facing must agree with physics, including during TURN. No automatic direction reversal from velocity alone.
- Test: `H-FLIGHT-REFERENCE`, `H-LANDING`, `H-BOUNDARY`, `H-TURN`; compare fixed input traces with accepted Flight School equations, not screenshots alone.
- Depends on: V1-02.

### V1-04 — Mobile pilot controls and camera
As a player on a phone, I can fly and fire while the ground war stays understandable.

- Left joystick controls pitch/collective; right FIRE and TURN. Add Follow helicopter, with explicit exit on pan/FOB jump; retain Follow rockets as a separate mode so two cameras cannot fight.
- While piloting, camera frames the aircraft and enough ground ahead to aim. Handle altitude/landscape without clipping it above the screen; do not reuse the current ground-only horizontal framing blindly.
- Lay out Supply HUD, status/hull, fullscreen, Pause and troop controls without covering joystick/fire targets. Pointer capture supports simultaneous movement+fire; camera dragging ignores control-origin touches.
- Pointer cancellation, blur, visibility changes and opening modal help release held flight/fire inputs. Pause and fullscreen do not reset aircraft or battle state. Re-entry requires intentional input; no stuck FIRE after resuming.
- Test: `H-INPUT`, `H-CAMERA`, `H-UI`, `H-PAUSE`; screenshot portrait/landscape, flight/high altitude/fullscreen/help.
- Depends on: V1-03.

### V1-05 — Helicopter gun against exposed infantry
As a pilot, I can pitch the helicopter to hit enemy soldiers with visible machine-gun rounds.

- Implement approved 8 shots/s and approved damage. Proposed projectile defaults are 680-unit/s muzzle speed plus aircraft velocity and 1.2-second lifetime; accept those before coding their behavior.
- Use the actual transformed muzzle and visible facing while turning. Swept2D collision prevents fast rounds tunnelling through a soldier or hitting solely because their X coordinates match.
- Only living opposing infantry are damageable. A round stops at its first enemy hit or terrain/lifetime; it cannot pierce several soldiers. Friendly infantry do not consume a damaging hit or receive damage. Whether they visually block rounds is proposed no, consistent with enemy-only filtering.
- Test: `HG-EXPOSED`, `HG-MUZZLE`, `HG-TEAM`, `HG-SWEEP`, `HG-CADENCE`.
- Depends on: V1-03; record approved exposed damage in V1-01.

### V1-06 — Helicopter gun against protected FOB defenders
As a pilot, I can suppress a bunker but must overcome its protection.

- For each bullet physically contacting a live stationed enemy defender, draw one independent penetration random value: `<0.10` deals1 HP, otherwise0. Damage is not shared among the garrison.
- No protection before arrival; no protection from a full flag alone. A dead defender releases its post and lowers the flag; a replacement walks in before gaining protection.
- Absorbed versus penetrating impacts have clear feedback. Keep infantry rifle protection at 5%/0.5 HP and rocket protection at one shared1/3 HP per qualifying bunker blast.
- Test: `HG-COVER`, `HG-ODDS`, `HG-CASUALTY`; staged bunker screenshots and actual absorbed/penetrating-hit captures.
- Depends on: V1-05.

### V1-07 — Rocket soldiers acquire airborne targets
As a pilot, enemy rocketeers become an observable threat while riflemen remain ground-only.

- Integrate helicopter eligibility, selected priority/direction policy and shared aim/reload into existing weapon decisions. Stationed guards can rotate launchers but never leave/snap out of their posts.
- Aim continues only while its chosen target remains valid/reachable; switching between an aircraft and a soldier restarts aim. No double firing or parallel air/ground reloads.
- Rifle target selectors ignore the helicopter, and rifle projectile damage filtering independently rejects it. Friendly rocket damage also rejects it.
- Landed/hovering/climbing/behind/out-of-range/dead aircraft cases are explicit. Helicopter position is public observation; future inputs are unavailable to AI.
- Test: `AA-ELIGIBLE`, `AA-LOCK`, `AA-CADENCE`, `AA-NORIFLE`, `AA-GUARD`.
- Depends on: V1-03 and confirmed targeting policy.

### V1-08 — Velocity interception, scatter and evasion
As a pilot, I must change my motion after launch rather than outrun a magically homing rocket.

- Implement the selected intercept contract from section3. Predict both velocity axes; observe actual motion after clamps/landings. Refresh during aim and commit at launch.
- Apply existing distance-error anchors to the anti-air shot; do not change ground rocket targeting/scatter. Keep separate pure functions for ground and anti-air ballistic solvers; anti-air elevation is variable, ground elevation stays50°.
- Show launcher aim/trail clearly enough to recognize a committed incoming shot. Debug traces record launch-time velocity, solve time, ideal/scattered point, sampled error and projectile speed.
- Test: `AA-INTERCEPT`, `AA-SCATTER`, `AA-EVADE`, `AA-NOHOMING`, `AA-UNREACHABLE`; paired steady/brake/accelerate videos or screenshot sequences.
- Depends on: V1-07 and flight-model approval.

### V1-09 — Collision, maximum-range fuse and airbursts
As a player, I can see every rocket resolve consistently, even when it misses.

- Detect swept physical contact and approved near-miss/proximity events against the moving aircraft; detonate on the first selected event, at the correct substep point. Destroy/dead target/shooter state does not erase in-flight shots.
- Expire at exactly the approved maximum reach using the selected radial/path metric, producing a visible airburst once. Pause freezes travel/fuse/effects; reset clears them. No homing, invisible despawn, range extension by shooter motion or duplicate explosion when collision and expiry coincide.
- Airbursts use2D proximity for aircraft/infantry/bunker intersection. High-altitude bursts do not trigger the existing one-dimensional ground damage path. Friendly filtering applies to all damage paths; direct hit plus blast cannot double-charge hull.
- Test: `AA-FUSE`, `AA-COLLISION`, `AA-BLAST2D`, `AA-LIFETIME`; screenshots missile near end of range, burst at 600, high burst over untouched infantry.
- Depends on: V1-08 and approved 20-direct/5-nearby hull damage and proximity policy.

### V1-10 — Hull, destruction and 10-second respawn
As a pilot, I understand my helicopter's condition and what happens when I lose it.

- Display hull and clear damage feedback; zero hull disables flight, firing and targeting immediately. Resolve multiple same-tick hits without negative HP, repeated deaths or invulnerable phantom colliders.
- Apply the approved 10-second respawn rule. Create only one helicopter with clean inputs at the pad after 10 simulation seconds; proposed respawn hull is100 and must be accepted before implementation; do not reset troops/accounts/FOBs/rockets.
- Repair while parked on the blue pad at the selected rate, capped at 100. Define consistent same-tick order: apply damage and death before repair; a zero-hull aircraft cannot be revived by repair. No repair in flight, while moving, outside the pad or during respawn. Existing air/ground projectiles persist appropriately after aircraft destruction; a new helicopter gets a new lifecycle ID.
- Test: `H-HULL`, `H-DEATH`, `H-RESPAWN`, `H-PAD`, `H-REPAIR`; destroyed/respawn/landed screenshots.
- Depends on: V1-09 and lifecycle decisions.

### V1-11 — Repair while parked on the blue helipad
As a pilot, I can return to base and restore a damaged helicopter without restarting the battle.

- Define parked as live, landed, fully within the pad footprint, and within approved horizontal/vertical speed tolerances. Proposed thresholds: absolute horizontal speed at most5 units/s and no vertical motion. Confirm whether a small pitch tolerance is needed from landing playtests.
- Apply5 hull/s, capped at100: a helicopter with50 hull reaches100 after10 simulation seconds parked, while a95-hull aircraft reaches100 after1 second. Never heal a zero-hull aircraft. Take damage and resolve death before repair in the same tick; dead aircraft cannot be healed back into play.
- No repair airborne, on other terrain, partially outside the pad, while moving, paused or waiting to respawn. Proposed allow firing while parked, since only being parked was specified; make any firing/under-fire restriction a separate explicit design choice.
- Repair and respawn costs remain proposed zero; neither can silently spend or generate infantry Supply. Show a Repairing indicator and actual hull gain while active.
- Test: `H-REPAIR`, `H-PAD`, `H-PAUSE`; exact pad/speed boundaries, fractional-time healing, full-hull clamp, damage while repairing, lethal hit, firing while parked, pause and reset. Capture parked repair and no-repair off-pad states.
- Depends on: V1-10; repair rate is approved at5 hull/s.

### V1-12 — Preserve the ground war and economic fairness
As a player, adding the helicopter does not break the existing battle.

- Keep equal120 Supply,5/s income,240 bank,25/60 unit costs,2-second cooldown,15-living **infantry** cap, five free3R+2RO grants, paid reinforcements and physical squad/FOB behavior.
- Proposed: helicopter is a separate player asset, outside the infantry budget/cap. No automatic income advantage, free rocket defenders, reactive AI spending bypass or hidden anti-helicopter stat bonuses.
- Commander provisioning/compositions remain unchanged for initial integration; only weapon target selection gains aircraft. More strategic anti-air purchasing is a separate tuning decision/story if requested.
- Keep ground rockets'225–600 forward band, fixed50° ballistic path, leading,25 blast and bunker rules. Never route ground shots through the new variable-elevation proximity/range-fused air projectile by accident.
- Test: `V1-REGRESSION`, `V1-NATURAL` (ordinary player-control engagement): run the full existing module/browser suite, both-faction casualty/replacement scenarios, and no-helicopter/disabled-helicopter replay comparison with the old ground baseline.
- Depends on: V1-02 through V1-11.

### V1-13 — Independent review and release
As a mobile reviewer, I can try the complete feature and see honest validation results.

- Fresh-context reviewer reads every relevant requirement, diff, raw traces and browser renders; authors independent negative cases for leading, no-homing, protection, proximity/range fuse and friendly fire.
- Matrix records PASS/FAIL/UNVERIFIED with test IDs, raw results, screenshots and limits. Reviewer findings get regression cases, repairs and targeted reruns.
- Deliver a browser-playable preview and PR. After explicit merge authorization and passing CI, merge and verify Pages build commit plus served HTML/modules. Do not confuse a preview publication, source push or successful CI with a Pages deployment.
- Physical iPhone Safari: fly+fire simultaneously, TURN, portrait/landscape, pause/fullscreen and Home Screen launch. Keep these UNVERIFIED until actually observed; user playtesting is evidence, not a claim of automated Safari coverage.
- Depends on: all stories; design decisions must be closed first.

## 5. Code boundaries

Proposed files under `docs/js/battlefield/`:

| Module | Owns | Must not own |
|---|---|---|
| `aircraft/helicopter.js` | Aircraft state, fixed-step flight, landing/turn/lifecycle primitives and explicit parked-pad repair | DOM, target selection, Supply |
| `aircraft/helicopterRenderer.js` | Body/rotors/muzzle/hull visuals from state | Physics or damage decisions |
| `bases/helipad.js` | Pad geometry/rendering and landing-zone query | Spawning free replacement troops or changing hull directly |
| `ui/pilotControls.js` | Pointer/keyboard input, capture/release | Moving coordinates directly, firing bullets directly |
| `ui/battlefieldCamera.js` | Exclusive follow/manual modes and framing | Simulation, health or economy |
| `combat/helicopterGun.js` | Gun timing, muzzle transforms,2D bullet contact and approved gun damage | Infantry strategy or changing rifle rules |
| `combat/airInterception.js` | Pure feasibility/intercept/scatter calculation | Looking at future pilot input or turning a launched projectile |
| `combat/antiAirRockets.js` | Launch snapshot, ballistic flight, proximity and explicit maximum-reach fuse | Ground rocket trajectory rules |
| `combat/collision2d.js` | Curved-trajectory/moving-hull proximity, swept contact, earliest event and blast-distance geometry | Choosing targets, cover odds or UI |
| `combat/damage.js` (or narrow extensions) | Explicit weapon-specific hull/infantry/cover damage policies | X-only airburst shortcuts or duplicate damage paths |
| `battlefieldScene.js` | Compose modules and deterministic tick order, inject state/deployment | Reimplement physics/interception/resource rules inline |

Keep existing Flight School source as the accepted reference. Do not rewrite it as part of extraction. Ground and air weapon modes may share tested math/clock helpers, but their trajectory and damage policies remain explicit. Introduce new modules only where they hold a coherent responsibility; do not create wrappers solely to match this table.

## 6. Deterministic test system

### Harness and observability

- Use existing `?test`/Playwright harness with 1/60-second stepping; no real-time sleeps for gameplay assertions. Test-only functions stay absent from normal URLs.
- Add `setPilotInput`, helicopter fixture/patch/reset, controlled air-target motion, typed projectile launch, controlled RNG and detached snapshot support. Normal-game tests must still use real input controls and normal troop spawning; fixture shortcuts are for isolated math/collision cases only.
- Snapshot helicopter state, lifecycle ID, actual observed velocity, typed target/aim state, all projectile trajectories, travelled distance/fuse, damage/explosion events and every RNG state. Log RNG draws with weapon/event ownership for diagnosis.
- Use a separate deterministic air-combat RNG stream derived from the reset seed so disabled-aircraft regression runs do not consume/reorder ground-combat randomness. Both streams reset/replay exactly; tests do not depend on unrelated render frequency.
- Define tick order: collect latched inputs; advance aircraft physics; derive actual aircraft velocity; observe/select/aim/launch weapons from that state; advance entities/projectiles using swept contact and exact event times; apply damage once; clean casualties/posts; update presentation. Existing ground order remains baseline unless a justified change has explicit regression coverage.
- Record events as plain data with simulation time, IDs, event cause, origin/current/target positions, velocity, range, error, HP and RNG state. Renderer never consumes gameplay randomness.

### Planned automated assertion matrix

| Tests | Inputs / adversarial cases | Required assertion |
|---|---|---|
| H-CONTRACT | Approved configuration versus plan defaults, schema, story/test ID audit | No pending choice silently becomes code; all IDs trace to executable assertions before implementation completion |
| H-START / H-RESET | Fresh load, reset mid-flight/aim/explosion/respawn | Exactly one grounded helicopter, zero drift, correct pad,10 opening infantry, both 120 accounts, empty FOBs, clean lifecycle/input/projectiles |
| H-FLIGHT-REFERENCE / H-TURN | Fixed input traces, both facings,420ms turn while moving/firing | Rotor leads body; neutral trim/tilt lift loss/inertia preserved; turn does not reverse world velocity; rendered muzzle matches shots |
| H-LANDING / H-BOUNDARY | Gentle/hard approach, exactly-at-threshold and just-above, ceiling/world edges | Approved landing damage, one contact episode, no tunnelling/drift/NaN; observed velocity reflects actual clamped movement |
| H-INPUT / H-UI | Two simultaneous touches, pointercancel/lost capture, blur/hide, mouse/keyboard;390×844 and 844×390 | Move+fire together; no stuck input; controls separated and in bounds; no camera drag from joystick touches |
| H-CAMERA / H-PAUSE | Aircraft near each edge/high altitude; follow switching, jump/pan, fullscreen/help, pause600 ticks | Exclusive camera mode, aircraft visible, manual exit respected; frozen state/cooldowns/fuses/accounts during pause |
| HG-EXPOSED / HG-TEAM / HG-SWEEP | Both infantry types, friendly before enemy, overlapping enemies, high-speed steps, wrong-height near miss | Correct approved HP loss to first physical enemy only; no friendly damage, no X-only hits or multiple penetration |
| HG-MUZZLE / HG-CADENCE | Both facings,420ms TURN, repeated held FIRE, varying render rates, pause/death/reset | Round origin/direction matches rendered muzzle; approved8/s cadence and selected speed/lifetime; no catch-up burst or stuck FIRE |
| HG-COVER / HG-CASUALTY | Reserved, entering, stationed, partial, understaffed, bypassed; guards killed/replaced | Only actually stationed defenders get10%/1 HP; proper flag/vacancy/physical replacement; contacted target only |
| HG-ODDS | RNG values0,.099999,.10,.999999; repeated deterministic sequence;100,000 seeded contacts | Values below.10 penetrate, others do not; draws independent, no every-tenth counter; sample penetration within a predeclared9.5–10.5% sanity band; rifle remains5%/0.5 |
| AA-ELIGIBLE / AA-NORIFLE | Both factions, life/landing states;2D distances224.99/225/250/600/600.01, behind/overhead | Only eligible enemy rockets acquire aircraft; selected directional policy exact; rifle aiming/projectile paths cannot damage hull |
| AA-LOCK / AA-CADENCE / AA-GUARD | Ground↔air target switch, target death/range loss, near aim threshold, shared reload, stationed shooter | Continuous.7s aim,3s reload before new aim; no dual mode fire; guards keep posts; lock resets correctly |
| AA-INTERCEPT / AA-UNREACHABLE | Hover, horizontal/vertical/diagonal motion, approach/retreat, targets faster than rocket, degenerate roots, boundary-clamped target | Zero-error predicted meeting/proximity verified with independent gravity solver; earliest valid upward arc; finite root within the selected range budget or clean refusal |
| AA-SCATTER | Anchor/intermediate ranges, controlled draws at lower/middle/upper bounds, seeded near/far batches | Exact±5/20/50/66 anchors, interpolation and uniform one-sample cross-track offset; far miss spread larger; same seed reproducible |
| AA-EVADE / AA-NOHOMING | Paired identical launch snapshots; keep speed/brake/accelerate/climb/reverse after launch; vary response delay | Constant-velocity zero-error reference intercepted; sufficiently early approved acceleration/braking misses; shot position/velocity follow the same gravity-driven arc across paired runs; late/small changes may still hit |
| AA-FUSE / AA-COLLISION |599.99/600 units under the selected radial/path metric, dt overshoot, proximity entry just outside/at/inside25, hull contact/closest-approach burst before/at/after expiry, shooter moves/dies, target dies, pause/reset | Exact expiry point and one explosion; first-event precedence; no silent vanish, duplicate blast or extension from shooter movement |
| AA-BLAST2D / H-HULL | Center/half/edge/outside blast, overlapping hit+burst, high altitude over bunker, friendlies, last hull point | Exactly20 direct or5 nearby hull damage once, including proximity boundary; preserve ground falloff; zero out-of-radius/friendly damage; no ground damage below a distant sky burst; no phantom surviving aircraft |
| H-DEATH / H-RESPAWN | Several same-tick hits, held input during death, death mid-flight, pause during respawn | One destruction, exactly 10-second replacement timing, no battle reset or held-input carryover; old projectiles remain independent |
| AA-LIFETIME | Shooter/target dies, old lifecycle replaced, pause/reset, no collision until maximum reach | In-flight shots follow committed arcs and own fuse; no homing to replacement ID, no death-triggered disappearance; exactly one expiry event |
| H-PAD | Landed/airborne, pad footprint edges, stationary/moving, safe/hard touchdown | Start/landing/repair eligibility uses one geometric pad contract; no repair by proximity alone; no coordinate snap |
| H-REPAIR | Park damaged aircraft on pad, exact boundary/speed tolerances,100 cap, moving/airborne/off-pad/dead, simultaneous damage, pause/respawn | Repair only in parked state at5 hull/s;50→100 in10s and95→100 in1s; cap100; damage/death before repair; no reviving dead hull or repairing during pause/respawn; accounts unchanged |
| V1-REGRESSION / QA-H01 | Existing full suite, ground-only replay, repeated mixed battle with scripted pilot inputs | Prior ground rules/costs/occupancy preserved; full seed+command replay identical; no gameplay RNG consumed by rendering |

### Natural-play acceptance (required, not only fixtures)

`V1-NATURAL`: begin with ordinary five-soldier openings and both commanders active, take off using actual mobile controls, fly into a reachable enemy launcher's air band, and record it aiming/firing at the helicopter without spawning hidden test defenders. Demonstrate one steady-motion threat, early acceleration and braking evasions, a visible missed-shot expiry, a return to parked repair and an actual10-second respawn while the battle/economy continues. Run controlled fixtures separately for exact20/5 damage and zero-scatter assertions; do not label a lucky natural miss proof of evasion. Require real normal-game evidence so the earlier “rockets never fire in the opening” defect cannot recur unnoticed.

### Analytic and numerical oracles

- For ballistic rockets, compare production roots against an independently implemented bracketed numerical solver of the gravity/moving-target equations and a high-resolution trajectory simulation. Validate positive root choice, actual muzzle geometry, upward launch and selected maximum-reach metric; do not call the same helper for implementation and expected result.
- Collision assertions use an independent fine-step oracle for a ballistic curve crossing an expanded moving hull, including proximity entry without physical contact and passage through the whole envelope in one timestep. Compare 1/60 versus1/120 and a deliberately coarse1/30 step at event boundaries with a declared geometry/time tolerance; never use “no crash” as correctness.
- For evasion, run the same launch three times (steady, brake, accelerate) with exactly the same sampled scatter, then vary only post-launch pilot motion. Assert identical rocket position/velocity at equal times up to the first detonation (the steady-speed run can detonate earlier by proximity), and compare actual swept contact outcomes. Include zero-scatter controlled fixtures and seeded realistic-scatter replays; a random miss alone proves nothing about leading.
- For bunker penetration, assert threshold boundaries and RNG consumption first; use the seeded statistical batch only as a secondary check. Count eligible physical contacts, not bullets fired into empty sky.
- Test the range fuse with the exact remaining reach and curved-path travel inside a timestep, not rounded frame counts. Pausing cannot consume range or trigger respawn.

### Visual evidence checklist

Capture and independently inspect: landed helicopter/pad; takeoff; tilted/turning fire with correct muzzle; ordinary red infantry hit; protected absorbed and penetrating hits; enemy launcher aiming at aircraft while guard feet remain planted; steady-speed hit versus brake/accelerate miss sequences; missed rocket's600-range airburst; airborne blast above untouched bunker; hull/direct20/nearby5/destruction/10-second replacement/parked repair; mobile simultaneous controls; fullscreen and Safari Home Screen flow. Keep traces alongside captures. A screenshot alone cannot establish RNG, collision, travel range or no-homing.

## 7. Delivery gates

1. Review this plan and close blocking design choices. No gameplay implementation yet. Direct-hit/proximity sequencing and5 hull/s repair are approved. The user subsequently authorized merging and building, including isolated interaction tests and helicopter-first target prioritization with split group responsibilities. Initial defaults are selected under that authorization and recorded in H-TUNING.
2. Implement V1-02..04 and review flight/phone handling in a preview before adding combat complexity.
3. Implement V1-05..06; prove enemy-only exposed/covered gun behavior while anti-air is isolated.
4. Implement V1-07..11; prove interception, maximum-reach fuse, proximity evasion and lifecycle with controlled fixtures and ordinary natural gameplay.
5. Execute V1-12..13, resolve review findings, publish the complete reviewable build/PR, then merge only after explicit user authorization. Verify GitHub Pages separately after merge.

No new tanks, capture, helicopter transport, repair upgrades or repair costs, multiple aircraft, fuel/ammo economy, destructible HQs or victory system are implied. Basic parked-pad repair is approved. If requested, add explicit stories and tests rather than quietly expanding this milestone.
