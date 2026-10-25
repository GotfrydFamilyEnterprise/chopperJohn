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
- [RO-03] Engagement distance baseline **420 world units** ahead.
- [RO-04] Rocket projectile/damage behavior **not yet authorized as implemented**; current requirement is aiming/guard posture only.
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
- [CB-03] No full rocket combat, vehicles, tanks, capture mechanics, helicopter battlefield integration or additional weapons in this milestone.
- [QA-01] Make gameplay observable by deterministic tests, simulation stepping and screenshots rather than relying on minutes-long manual walks.
- [QA-02] A separate adversarial reviewer checks all cross-feature invariants (capture, movement, rendering, combat, reset, red/blue symmetry).
