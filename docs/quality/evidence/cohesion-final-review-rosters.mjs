// Independent roster stress probes; positions/HP altered only to set negative cases.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createEncounter} from '../../js/battlefield/platoons/encounters.js';
import {stepWorld} from '../../js/battlefield/campaign/world.js';
import {platoonOrder} from '../../js/battlefield/ai/platoons.js';
import {maneuverCenter,compactOffset,MANEUVER_RULES} from '../../js/battlefield/ai/platoonManeuvers.js';
const level=JSON.parse(fs.readFileSync('docs/campaign/first-assault.json')), catalog=JSON.parse(fs.readFileSync('docs/platoon-lab/encounters.json')),rows=[],failures=[];
for(let rifle=2;rifle<=9;rifle++)for(let rocket=1;rocket<=10-rifle;rocket++)for(const strategy of['assault','siege','spread'])for(const mirrored of[false,true]){
 const row={rifle,rocket,strategy,mirrored};try{const c=structuredClone(catalog);c.mixes.stress={rifle,rocket};const s=createEncounter(level,c,{mix:'stress',controller:strategy,mirrored}),w=s.world,g=w.platoons.groups[0],leader=w.units.find(u=>u.id===g.leaderId),dir=mirrored?-1:1,start=leader.x;w.systems.weapons=false;w.bases=[];w.units=w.units.filter(u=>u.team===s.team);
 let maximumOrderBand=0;for(let n=0;n<40;n++){stepWorld(w,{},120);maximumOrderBand=Math.max(maximumOrderBand,Math.abs(platoonOrder(w,leader).goalX-maneuverCenter(w,g)));}
 row.forwardDistance=(leader.x-start)*dir;row.maximumOrderBand=maximumOrderBand;assert.ok(row.forwardDistance>700,'forward formation stall');assert.ok(maximumOrderBand<=MANEUVER_RULES.leaderRadius+1e-6,'leader order exceeds configured band');
 const dead=g.slots.slice(0,Math.ceil((rifle+rocket)*.4)).map(sl=>({sl,u:w.units.find(u=>u.id===sl.unitId)}));for(const{u}of dead)u.hp=0;stepWorld(w,{},7200);row.afterLoss=g.phase;row.retreatX=g.retreatX;row.leaderAtRegroup=leader.x;assert.equal(g.phase,'regroup','physical retreat never regroups');
 // Restore at most enough casualties to cross80%; keep others absent.
 let restored=0;for(const{sl,u}of dead){if(1+g.slots.filter(sl=>w.units.some(u=>u.id===sl.unitId&&u.hp>0)).length>=Math.ceil(.8*(rifle+rocket)))break;u.hp=u.type==='rifle'?3:4;u.x=g.retreatX+dir*compactOffset(g,sl);sl.unitId=u.id;sl.joined=true;sl.replacement=false;restored++;}
 stepWorld(w,{},1200);row.afterRecovery=g.phase;row.restored=restored;row.resumeEvents=w.events.filter(e=>e.type==='platoonResumed').length;assert.ok(row.resumeEvents>0,'physically assembled80% never resumes');row.status='PASS';}catch(e){row.status='FAIL';row.error=e.message;failures.push(row);}rows.push(row);
}
const out={source:'Post-F7 source with leaderRadius'+MANEUVER_RULES.leaderRadius,scope:'All36 allowed3..10-soldier compositions ×3 doctrines ×2 mirrors. Actual40s unarmed forward travel,60s retreat after40% casualties, then10s recovery after fixture-restoring only enough physical compact-slot members to reach80%. HP restoration is negative-case setup, never balance evidence.',status:failures.length?'FAIL':'PASS',count:rows.length,failures,rows};fs.writeFileSync('docs/quality/evidence/cohesion-final-review-rosters.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,count:out.count,failures},null,2));if(failures.length)process.exitCode=1;
