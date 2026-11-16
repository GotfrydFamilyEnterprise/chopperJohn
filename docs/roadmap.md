# ChopperJohn: end-to-end game plan

Reconciled 2026-11-15 against the conversation, [requirements](specs/requirements.md), [acceptance](specs/acceptance.md), merged PRs and [live backlog](https://github.com/GotfrydFamilyEnterprise/chopperJohn/issues/15). This is the product map, not a replacement for the detailed behavioral contract. New generation/difficulty ideas below are proposals until agreed. Planning issue: [#37](https://github.com/GotfrydFamilyEnterprise/chopperJohn/issues/37).

## The game we are making

A mobile, side-scrolling helicopter action game in which the player supports a living ground battle. Blue purchases infantry and explicitly commissions sergeant-led platoons; red provisions its army through a fair paid AI. Riflemen, rockets, terrain and aircraft have distinct jobs. Coordinated forces breach and take enemy territory, capture the enemy headquarters, then advance to a more demanding mission.

The player loop is: choose a mission → assess terrain/threats → spend Supply and deploy troops/platoons → fly support while avoiding anti-air → return to repair/rearm when needed → help rockets breach and riflemen capture → win or retry → unlock the next mission. The helicopter cannot capture a base or replace the required ground force. A laboratory or large simulation matrix is a tool for this loop, not the product's endpoint.

Keep the accepted flight feel, visible physical soldiers/projectiles, horizontal mobile layout, distinct safe tutorial, versioned menu and immediate browser play. Preserve Flight School and the historical Unity project. No tanks or extra unit classes are currently approved.

## What exists, and what does not

| Capability | Actual position | Contract/evidence |
|---|---|---|
| Flight, menu, distinct tutorial, compact controls | Merged; retain regression coverage | FL-01–09, MENU-01–05, UI/FS; PRs8–10 |
| Fair Supply and manual blue purchases | Merged; platoon recruitment is an explicit later exception | EC-06–08, BAL-01–05, PL-01–03; PRs9/14 |
| Rifle/rocket combat, real FOB staffing and capture | Merged; rocket breach and rifle capture remain different jobs | RI/RC/BC/FOB, CAP-01–06; PRs2–3/11 |
| Helicopter support, predictive ballistic AA, pad logistics | Merged; current support balance still needs work | H/HG/AA, BAL; PRs8–9 |
| Terrain physics, relative-height rocket reach and shared splash | Implemented in the lab and integrated into Campaign | TL-01–10, CP-02–03; PRs12–13 |
| JSON mission schema, catalog, unlocks/retry/progress | Merged; exactly two authored missions: First assault and Ridgeline | CP-01–06; `campaign/README.md`, PR13 |
| Platoons, paid replacements, cohesion,60/80 regroup | Merged in v2.2; universal tactical superiority is not demonstrated | PL-01–10; PR14, `quality/cohesion-tactics-study.md` |
| Fully paid assault-preparation harness | Merged in PR35; issue34 | Four focused tests;162 module/129 browser CI at9eecaef; not present on main |
| Terrain-aware deliberate cover/crest tactics | Backlog; following terrain and terrain blocking fire already exist | Issue29; do not describe geometric cover as cover-seeking AI |
| Longer, calibrated campaign progression | Backlog beyond the existing two maps | Issues26/29/30 |
| Procedural level generation | **Not implemented; no agreed generator contract yet** | Current JSON maps are authored; their combat seed does not generate their terrain |
| iPhone Safari/Home Screen acceptance | Still an explicit physical-device gap | Issue31; browser emulation is separate evidence |

Main is `bfb3919` (workflow-skill PR36); the runtime release is v2.2 from user-merged PR14 (`d9026ff`); PR35 subsequently merged the paid research harness as`08e74ca`. Its last verified Pages deployment is [42456759431](https://github.com/GotfrydFamilyEnterprise/chopperJohn/actions/runs/42456759431), with [post-merge CI42456760023](https://github.com/GotfrydFamilyEnterprise/chopperJohn/actions/runs/42456760023). [Play Campaign](https://gotfrydfamilyenterprise.github.io/chopperJohn/campaign.html?v=2.2.0). This planning pass did not run a new live-device check. The separate Sites preview was last verified atv2.1; it is not the production release reference.

## Preserve the decisions we already made

- Both sides retain120 Supply,5/s,240 bank,25/60 infantry prices,2s spacing,15 living cap and the same initial3R2K grant. Blue has no general automatic infantry purchasing: only explicitly deployed platoons authorize their paid roster; paid aircraft replacement is a separate accepted expense.
- Rockets alone reduce structure defenses: FOB20, HQ6 valid hits. Riflemen alone physically capture for5 uncontested seconds. The helicopter suppresses enemy troops; it neither breaches with gunfire nor captures. Existing protection ends at breach as specified by CAP/BC.
- Early600-range/25-radius statements describe the classic profile and earlier milestones. Campaign explicitly shares the terrain solver's height-dependent reach and40-radius randomized exposed-infantry splash. Do not silently apply one profile's numbers to every scene. Bunker and aircraft damage remain separate from exposed crowd splash.
- The aircraft keeps its approved handling, predictive unguided ballistic AA, threat sharing and direct20/near5 rocket damage. Current replacement is paid90 after at least10s; parked repair/rearm remain5 hull/s and30 rounds/s. The original free-respawn plan is historical.
- Sergeant replacements cost Supply and physically catch up at2× out of combat. Retreat at60%, resume at80% after6s physically regrouped. No free-front spawning, hidden faction buffs or unconditional blue autobuy.
- Legacy prose marked capture/helicopter/economy integration out of scope at earlier milestones. Later CAP/CP/H/PL requirements supersede those restrictions in their stated scenes. Historical reports remain historical, not fresh proof after tactical changes.

Specifically, the campaign support study called "final" in `campaign/README.md` predates v2.2 cohesion. Its successful older-engine pilot samples do **not** qualify current support balance or the current mission difficulty curve. Issue26 must measure the current engine/platoon policies before those conclusions are used for new progression.

## The ordered delivery path

Each row is an outcome, split into small issue/branch/PR stories. They are not instructions to bundle a release-sized feature into one PR. Mobile checks and release traceability run throughout, rather than starting only after all gameplay work.

| Stage | Outcome and smallest useful next slice | Exit evidence | Existing tracking |
|---|---|---|---|
|1. Finish the current handoff|PR35 merged; review PR41 separately and resolve stale milestone claims without declaring physical acceptance done.|Accepted source, accurate issue states, known production URL. No merge is implied by this plan.|34/PR35;23/24/31/33 |
|2. Make defended-base assaults purposeful|Trace why capture rifles die; change one doctrine/order behavior, then compare matched paid forces before changing defense or damage values.|Real breach **and** surviving rifle capture routes with elapsed time, preparation and replacement cost. Retain cases where a strong defense wins.|25, then one small child issue per fix |
|3. Prove combined-arms play|Compare no/limited/active helicopter support with current cohesive platoons, then one observable enemy doctrine decision at a time.|Actual controls, sorties/ammo, repair trips, troop survival, Supply and HQ outcomes. Neither "helicopter alone wins" nor "ground play never matters."|26/27/28 |
|4. Make terrain tactically useful|Test crest defense, uneven approaches and safe reverse-slope regroup; only then try a bounded cover/position choice.|Matched terrain fixtures, physically valid movement and firing, meaningful rifle/rocket tradeoffs, no hidden range/damage bonuses.|29 |
|5. Deliver a paced authored campaign|Add one JSON mission at a time, with a stated lesson and tested support demand. Suggested later themes: valley crossfire, rolling-ground regroup, fortified HQ assault; these names/counts are proposals.|Fresh mission/retry/unlock behavior; completions and costs across declared seeds/policies plus human mobile play. Increasing support burden should arise from geography/opposition, not a hardcoded air-support gate.|30, informed by26/29 |
|6. Design level creation/generation|Agree authoring versus procedural scope and define a reproducible input/output contract. Start from the validated battlefield JSON, not a new combat engine.|A reviewed design and fixtures showing valid structures, traversable terrain, stable mission identity and honest difficulty labels.|Design-only issue38 under30; implementation not authorized by this audit |
|7. Qualify generated content, if selected|Implement one deterministic template family first; export ordinary mission JSON; reject bad candidates before offering them.|Same seed/version/settings reproduce JSON; geometry and real play checks distinguish valid, unqualified and qualified candidates; no claim of universal balance.|Separate small follow-ups after stage6 decision |
|8. Finish and release the campaign|Polish main-menu→tutorial/mission→victory/defeat→retry/next/menu; verify landscape/touch/Home Screen and readable status.|Requirement-linked tests, applicable screenshots, focused independent review, user acceptance, main CI, verified Pages version and playable link.|31/33, release-specific issues |

The short critical path is paid-assault handoff → one defensible assault fix → current-engine helicopter comparison → terrain/progression content. Wider simulations are used for critical balance decisions, not rerun for every documentation/UI edit. Issue27 already calls for at least20 independent seeds for critical balance decisions; mirrors remain paired sensitivity checks. Existing small studies remain exploratory.

Stages6/7 are an optional content branch, **not** prerequisites for stage8. A complete, accepted authored campaign can ship without procedural generation. Final release depends on the agreed mission scope and its applicable acceptance gates.

## JSON authoring versus generation

JSON configuration is already real: world, piecewise-linear terrain, structures, pad, faction deployments/opening troops/waves, seed, balance profile and HQ objective. The catalog orders missions. The Terrain Lab already edits/imports/exports its own experimental scenario JSON; that is not a complete Campaign mission authoring/generation tool.

Recommended progression is **authored missions → reusable constrained templates → optional seeded variants**, with a human-reviewed campaign order. This is a recommendation, not an agreed procedural feature. Decide whether generated content supplements the authored campaign, replaces it, or supplies separate skirmishes before implementing it.

If selected, the generation pipeline should be:

1. Accept a generator version, generation seed, template/terrain family and explicit difficulty settings. Keep layout-generation randomness separate from combat RNG; record both.
2. Place supported hills/valleys/bumps and reserve legal flat footprints. The present format cannot represent caves/overhangs; current bases need170 flat units, pad200, and legal spacing. Preserve two HQs, fair economy and legal deployment routes.
3. Emit ordinary battlefield JSON, then use the existing schema validator. Define any metadata/schema extensions explicitly; today's validator discards unsupported fields and must not silently accept ineffective difficulty fields.
4. Check terrain traversal, firing opportunities and structure accessibility. Schema-valid does not mean capturable, tactically interesting or fair.
5. Run bounded real-engine acceptance policies, record capture/failure/timeouts, Supply, losses, air-support/rearm demand and seed sensitivity. Unfinished is not impossible; a scripted pilot is not every human strategy. Report qualification limits.
6. Give each released mission a stable identity/version and preserve its JSON. Retry must replay that mission, not silently reroll the map. Define unlock/save compatibility before mixing generated identities into completed-level storage. Invalid generation must fail safely without replacing the current mission.

The generator proposes content; shared soldier, damage, economy and aircraft modules still determine gameplay. It must not obtain difficulty through extra free enemy soldiers, hidden damage, unequal income, unapproved automatic blue purchases or forced victories. The symmetric opening grant and explicitly commissioned paid platoons remain allowed.

## Decisions that remain open

| Decision | Current recommendation; not an invented requirement |
|---|---|
|How much procedural content?|Keep a small authored campaign first; consider optional seeded variants after its pacing works.|
|What makes later missions harder?|Terrain geometry, approach/exposure, composition and simultaneous threats; measure actual increased support/logistics demand. No hidden unit-stat bonuses.|
|What is a good mission duration?|Choose an early/later pacing envelope from actual mobile play before accepting difficulty labels. A long structural stall is not useful difficulty.|
|How actively should infantry seek cover?|Begin with one crest/holding-point decision. Spotters, prone/crouch and slope-speed penalties remain separate unapproved mechanics.|
|Should ground-only wins be impossible later?|Do not assert impossibility from limited seeds/controllers. The agreed direction is increasingly important helicopter support, evaluated with actual outcomes.|
|What is the full-campaign finish line?|Agree a bounded mission set and progression curve; every included mission must have a legitimate, repeatable completion path, fresh retry/unlock flow and physical mobile acceptance. More terrain templates alone do not satisfy it.|

## Plan integrity and release discipline

The durable hierarchy is: requirements for behavior; this roadmap for product direction and scoped proposals; GitHub issues for short implementation stories; `.work-dag/dag.json` for current dependencies/cursor/evidence. A done DAG node is not release proof. Earlier skill-installation nodes remain explicitly historical workflow work.

The audit found these planning debts: issues16–19 still appear open despite their merged implementation;23/24 mix completed release work with remaining preview/device acceptance; issue15 contained stale pre-merge statements (reconciled in this pass); a GitHub Project was not created because write permission was denied; workflow/CLAUDE drafts are still local. Reconcile these narrowly, preserving physical acceptance and original evidence rather than closing everything from a merge alone. Historical issue1 also remains open and is not silently treated as current missing FOB functionality.

Per story: issue → isolated branch → one behavior/config change → appropriate deterministic/real-browser checks → focused independent review → user acceptance → merge → verified deployment. Store large raw studies as artifacts when possible. Keep Flight School, classic skirmish, Campaign and labs distinguishable. Publish from a known source and give one canonical production link/version; no automatic merge.

Dependency refresh2026-11-16: PR35 is merged into master. Its shared DAG node is complete underT3/T4/T6, and PR41 now targets master but remains unmerged. This removes the harness-review blocker; it does not complete the assault milestone or activate the experimental doctrine.
