// Physical regression for F7: surviving rear-heavy cohorts above60% must advance.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createEncounter} from '../../js/battlefield/platoons/encounters.js';
import {stepWorld} from '../../js/battlefield/campaign/world.js';
import {MANEUVER_RULES} from '../../js/battlefield/ai/platoonManeuvers.js';
const l=JSON.parse(fs.readFileSync('docs/campaign/first-assault.json')),c=JSON.parse(fs.readFileSync('docs/platoon-lab/encounters.json')),rows=[];
for(const composition of[{rifle:3,rocket:2},{rifle:2,rocket:2},{rifle:2,rocket:1},{rifle:2,rocket:4},{rifle:2,rocket:8}])for(const mirrored of[false,true]){
 const row={composition,mirrored};try{const config=structuredClone(c);config.mixes.probe=composition;const s=createEncounter(l,config,{mix:'probe',controller:'siege',mirrored}),w=s.world,g=w.platoons.groups[0];w.systems.weapons=false;w.bases=[];w.units=w.units.filter(u=>u.team===s.team);stepWorld(w,{},1200);const lead=w.units.find(u=>u.id===g.leaderId),before=lead.x;
  // At minimum remove the only/first follower rifle; remove extra forward rockets
  // in larger rosters to leave a rear-heavy but above-threshold live cohort.
  const kill=g.slots.filter(sl=>sl.type==='rifle').slice(0,1),additional=Math.ceil((composition.rifle+composition.rocket)*.4)-2;if(additional>0)kill.push(...g.slots.filter(sl=>sl.type==='rocket').slice(-additional));
  for(const sl of kill)w.units.find(u=>u.id===sl.unitId).hp=0;stepWorld(w,{},4800);row.distance=(lead.x-before)*(mirrored?-1:1);row.ready=g.combatReady;row.total=g.totalStrength;row.phase=g.phase;row.retreats=g.retreatCount||0;assert.ok(row.ready/row.total>.6);assert.equal(row.retreats,0);assert.equal(g.phase,'advance');assert.ok(row.distance>400,'rear-heavy survivors stall');row.status='PASS';
 }catch(e){row.status='FAIL';row.error=e.message;}rows.push(row);
}
const out={source:'Post-F7 source with leaderRadius'+MANEUVER_RULES.leaderRadius,status:rows.every(r=>r.status==='PASS')?'PASS':'FAIL',rows};fs.writeFileSync('docs/quality/evidence/cohesion-final-review-casualties.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));if(out.status==='FAIL')process.exitCode=1;
