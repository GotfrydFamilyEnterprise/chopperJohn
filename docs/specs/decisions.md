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
