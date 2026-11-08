// Reviewer geometry stress: enumerate above-retreat-threshold surviving cohorts.
import fs from 'node:fs';
import {createEncounter} from '../../js/battlefield/platoons/encounters.js';
import {platoonOrder,slotGoal} from '../../js/battlefield/ai/platoons.js';
import {maneuverCenter,MANEUVER_RULES} from '../../js/battlefield/ai/platoonManeuvers.js';
const l=JSON.parse(fs.readFileSync('docs/campaign/first-assault.json')),c=JSON.parse(fs.readFileSync('docs/platoon-lab/encounters.json'));let count=0;const failures=[];
for(let rifle=2;rifle<=9;rifle++)for(let rocket=1;rocket<=10-rifle;rocket++)for(const strategy of ['assault','siege','spread']){
 const config=structuredClone(c);config.mixes.x={rifle,rocket};const s=createEncounter(l,config,{mix:'x',controller:strategy}),w=s.world,g=w.platoons.groups[0],lead=w.units.find(u=>u.id===g.leaderId);w.bases=[];w.units=w.units.filter(u=>u.team===s.team);g.phase='advance';g.launchedAt=0;lead.x=1000;
 for(const slot of g.slots)w.units.find(u=>u.id===slot.unitId).x=slotGoal(w,g,slot);
 for(let mask=0;mask<2**g.slots.length;mask++){const ready=1+g.slots.filter((sl,i)=>!(mask&(1<<i))).length;if(ready/(rifle+rocket)<=.6)continue;count++;
  for(const[i,sl]of g.slots.entries())w.units.find(u=>u.id===sl.unitId).hp=mask&(1<<i)?0:3;
  const center=maneuverCenter(w,g),goal=platoonOrder(w,lead).goalX;if(goal<=lead.x+1e-6)failures.push({rifle,rocket,strategy,mask,ready,total:rifle+rocket,centerOffset:center-lead.x,goalOffset:goal-lead.x});
 }
}
const guaranteedForwardSlack=MANEUVER_RULES.leaderRadius-220;if(guaranteedForwardSlack<20)failures.push({error:'configured band must exceed all bounded220 role offsets by at least20'});
const out={source:'Post-F7 source with leaderRadius'+MANEUVER_RULES.leaderRadius,checks:count,guaranteedForwardSlack,status:failures.length?'FAIL':'PASS',failures};fs.writeFileSync('docs/quality/evidence/cohesion-final-review-casualty-geometry.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({checks:count,status:out.status,guaranteedForwardSlack,failingConfigurations:failures.length,examples:failures.slice(0,5)},null,2));if(failures.length)process.exitCode=1;
