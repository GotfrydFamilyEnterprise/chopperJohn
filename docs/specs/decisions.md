# Design decisions and changes recorded from ChopperJohn conversation
Last updated 2026-10-25. This file records *why* the current agreed specification differs from earlier iterations.

1. User wanted a mobile browser game for immediate iPhone play and GitHub Pages delivery, developing ChopperJohn in the existing repository rather than replacing legacy Unity project.
2. Flight School intentionally isolated from battlefield. Pitch is relative to helicopter facing; vertical stick controls collective; dedicated TURN replaced double tap due to Safari zoom; FIRE must shoot repeatedly along pitched body.
3. User approved flight v0.4: spinning main/tail rotors, cyclic lead, pitch-dependent lift loss, more inertia, optional telemetry. Preserve this as regression baseline.
4. Battlefield: two widely separated bases plus two FOBs, stick figure infantry only, no tanks.
5. Infantry visuals: articulated knee step, planted foot stance, lifted forward swing, restrained body bob; user explicitly reported new walking gait looked good. Riflemen carry low, shoulder rifle and slow while firing; rocketeers carry tube on back and stop to aim.
6. Engagement range tuning: rifle 250 world units; rocket 420. Actual rifle projectiles/hits required, but rocket firing not yet required.
7. **Superseded**: initial FOB garrison of 3 and tap-to-deploy. **Current**: each FOB starts unoccupied and unstaffed. First 2 riflemen + 1 rocketeer march from HQ, visibly enter, occupy discrete spots. Flag rises only once all three are stationed. Following troops bypass. Dead guards free slots for replacements.
8. FOB art: sandbag defensive bunker, camouflaged net roof supported by stilts/posts; not a hut. Should clearly show the guard positions.
9. User reports current FOB implementation fails appearance and arrival/capture behavior. Consider it a known defect, not a completed feature.
10. User wants Codex Cloud operated on mobile, project history written into repository, and independent adversarial auditing of whole-feature correctness rather than line-level syntax.

## Prioritization
Correct FOB lifecycle and visual acceptance before adding tanks, rocket damage, helicopter battlefield integration, territorial capture, additional troop classes or more decorative UI.

## Rocket and bunker combat design approved after PR #2

User visually accepted the FOB gameplay and authorized merge of PR #2. The subsequent approved design authorizes actual rockets: target range 225–500 (rifles 250), 0.7-second aiming, 3-second reload, ground-directed ballistic flight, error ±5/20/50 at range 225/350/500, 25-unit blast radius and linear 2-HP exposed damage. Bunker rockets share one 1/3-HP hit among living stationed defenders; rifle bullets penetrate with 1/20 probability for 0.5 HP. Replacements gain protection on physical arrival. These requirements supersede the historical aim-only range-420 restriction; other weapons, vehicles and capture remain out of scope.

### User follow-up: no visible firing, farther range, autonomous targets and leading

The original v0.6 default wave never fired a rocket in a 180-second replay: all rocketeers became out-of-range bunker guards. Adding rockets manually fired after ~43 seconds, off the starting camera. Address with a normal assault rocket per faction, a Follow rockets view and observable launch counts. User explicitly superseded no-leading design: predict moving targets from observed movement, then commit the unguided ballistic trajectory. User selected a 600-unit maximum; the original 225 minimum and 25-unit overlap remain. Preserve the original 500±50 precision anchor and extend to 600±66.

## User-approved red economy

After accepting and merging PR3, user approved one-resource red provisioning:120 start,5/s,240 stored, rifle25/rocket60,2-second deployments,15 living soldiers. No FOB income/upkeep. Automatic garrison repair, HQ emergency, coordinated3R+2RO or2R+3RO waves, reserve and loss adaptation; blue stays manual for testing. User explicitly requested proper code isolation. New red units must be paid, replacing its formerly free initial wave. Reserve60, threat radius800, regroup12s after2 wiped groups/10 field casualties and360 formation gap are implementation tuning values recorded for review. No HQ health/victory, reverse-facing retreat or new weapons are added.

## v0.8 — user requests fair economy for both sides
User explicitly supersedes the red-only economy: apply identical accounting and limits to blue and red. Reuse one faction-parameterized commander with mirrored geometry, automatically buying garrisons and waves on both sides. Preserve optional blue intervention through paid, capped, cooldown-limited buttons. User follow-up explicitly requests five free soldiers for each side, matching the prior blue opening:3 rifles+2 rockets, mirrored starting positions, with2 rifles+1 rocket assigned to staff each FOB and the remainder advancing. Both accounts still start at120; all later units cost Supply. Preserve first-minute natural rocket firing.

## Fullscreen control
User requests an on-screen way to hide the browser top bar. Add a Battlefield view-only fullscreen toggle using standard/vendor document-root APIs where supported. iPhone browsers may not support arbitrary element fullscreen; provide honest Safari Home Screen instructions plus standalone manifest/Apple metadata instead of pretending a CSS change hides browser chrome. No Flight School changes or automatic merge.

## V1.1 — manual blue and helicopter logistics
User accepted the proposed balance pass and explicitly rejected automatic blue troop purchases. Preserve equal account rules and five free openings, but blue infantry spending is exclusively manual. Build90-supply replacement after10s minimum,120-round gun with30/s parked rearm, red paid air-response and staggered anti-air without changing flight feel or damage. See BAL-01..05 for tuning and exact scope. No hull performance penalty or new victory system in this pass.

## V1.2 main menu and tutorial
User asks for New Game and Tutorial from a versioned main menu, ending either through the dropdown, and copyright Ilya Gotfryd2026. Implement an isolated six-goal battlefield practice tutorial using real controls, rather than changing the separate accepted Flight School. The main menu freezes simulation; New Game always resets. No save/resume or victory system implied.

## V1.3 takeover and game end
User approved rocket-only breaching, rifle-only physical occupation,6 defense hits,5s uncontested hold and20s rifle-present rebuild. User explicitly selected main headquarters takeover ending the game, in addition to FOB ownership. CAP-01..06 supersede historical capture-out-of-scope and captured-flag rules; initial FOB staffing behavior remains. No capture supply/spawn bonus or soldier conversion. Both sides use the same rules; blue purchasing stays manual.

## V1.3.1 outpost durability
After winning the takeover preview, user requested significantly more rocket hits for outposts. Tune both FOBs to20 hits (from6); HQs remain6. Rebuilding/reset/display use the appropriate base capacity. Capture timing, damage to infantry and economy stay unchanged.

## Terrain Lab exploration
User requested JSON-defined levels and separate exploration of hills, valleys and bumps, then explicitly selected all three experiments together: slope walking, rifle visibility/bullet cover, ballistic rockets over terrain. The lab is a separate page with pure data/geometry/simulation modules. Its experimental rocket knowledge of obscured ground positions is labeled, not silently applied to normal AI. No deliberate cover-seeking AI is introduced yet; first follow-up proposed is riflemen advancing to and holding at a useful crest firing position, followed by measured cover seeking.

## Terrain Lab mixed encounters
User requested uneven approach timing and real walk/fire exchanges when one soldier is on top and the other moving, including reversed roles. Add fixed JSON scenario starts/orders and observed outcomes, not autonomous cover selection or automatic height damage buffs. All movement precedes weapon acquisition for the tick. Declare outcome only after return projectiles settle; expose slow playback and fine stepping for inspection.

## Terrain Lab v0.3
User requested angled bullet appearance, uneven rocketeer approaches, increased range and optimal rocket trajectories. User explicitly selected800 units. Apply this exploration to the separate lab: fix tracer orientation, preserve shot scatter, use a bounded shortest-clear-flight search and add longer terrain/mixed encounters. Do not silently alter the live main-game600-range model. Solver speed520,20ms search,8–80° and2-unit clearance are explicit testable starting choices under implementation authorization.

## Terrain Lab v0.4 relative height instead of a distance cap
User supersedes the fixed800 rule: use height difference between weapon and target. Keep approximate800 equal-ground baseline by calibrating constant launch power413.6, rather than retaining520 power and silently increasing level-ground reach. No absolute-altitude bonus, height damage boost or arbitrary linear range multiplier. Actual ballistic feasibility stays authoritative. Clear-air range is approximate diagnostics only; mirrored860-unit presets expose the difference.
