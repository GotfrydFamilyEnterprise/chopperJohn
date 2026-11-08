// PL-09/10: deliberately isolated fixtures, actual Campaign combat and Supply.
import{createWorld,spawn,stepWorld,record,CAMPAIGN_STEP,worldSnapshot}from'../campaign/world.js?v=2.2.0';
import{compactOffset}from'../ai/platoonManeuvers.js?v=2.2.0';
import{createSergeant,updatePlatoons}from'../ai/platoons.js?v=2.2.0';
import{purchaseUnit,accrueSupply,SUPPLY_RULES}from'../economy/supply.js?v=2.2.0';
export const forceCost=m=>m.rifle*25+m.rocket*60;
export const CONTROLLERS=['independent','independent-legacy','assault','siege','spread','siege-no-retreat'];
export function validateEncounters(data){
 if(data?.schemaVersion!==1||!Array.isArray(data.cases)||!data.mixes)throw Error('Invalid encounter catalog');const ids=new Set();
 for(const c of data.cases){if(!/^[a-z-]+$/.test(c.id)||ids.has(c.id)||typeof c.name!=='string'||!['field','fob'].includes(c.kind)||!Number.isInteger(c.seconds)||c.seconds<10||c.seconds>600)throw Error('Invalid encounter');ids.add(c.id);if(c.resupply!==undefined&&typeof c.resupply!=='boolean'||c.kind==='fob'&&(c.defenders?.rifle>2||c.defenders?.rocket>1))throw Error('Invalid fortified composition or resupply');for(const t of['rifle','rocket'])if(!Number.isInteger(c.defenders?.[t])||c.defenders[t]<0||c.defenders[t]>10)throw Error('Invalid defender mix');if(c.defenders.rifle+c.defenders.rocket>15||c.kind==='field'&&!forceCost(c.defenders))throw Error('Invalid defender count');}
 for(const m of Object.values(data.mixes))if(!Number.isInteger(m.rifle)||!Number.isInteger(m.rocket)||m.rifle<2||m.rocket<1||m.rifle+m.rocket>10)throw Error('Invalid platoon mix');return structuredClone(data);
}
export function createEncounter(level,catalog,{caseId='equal-mixed',mix='mixed',controller='siege',seed=101,mirrored=false}={}){
 const config=validateEncounters(catalog),scenario=config.cases.find(c=>c.id===caseId),composition=config.mixes[mix];if(!scenario||!composition||!CONTROLLERS.includes(controller))throw Error('Unknown tactical fixture');
 const w=createWorld(level,{seed,platoons:true,systems:{commanders:false,platoonRecruitment:!!scenario.resupply,flight:false,repairs:false,rifleHold:controller!=='independent-legacy',takeover:scenario.kind==='fob'}}),team=mirrored?1:0,enemy=1-team,width=w.level.world.width,at=x=>mirrored?width-x:x;
 w.units=[];w.helicopter.hp=0;w.bases=scenario.kind==='fob'?[{...w.bases.find(b=>b.id==='red-fob'),x:at(1950),team:enemy,id:'target-fob'}]:[];
 const start=at(550),c=w.commanders[team];c.rules.spawnX=start;c.rules.rallyX=start;w.commanders[enemy].rules.spawnX=at(2350);w.commanders[enemy].rules.rallyX=at(2250);
 // All controllers get the same preassembled initial positions/types and25 paid leader transaction.
 const created=createSergeant(w,team,{strategy:controller.startsWith('independent')?'assault':controller==='siege-no-retreat'?'siege':controller,composition},(t,k,x)=>spawn(w,t,k,x),e=>record(w,e));const g=created.group;let rifle=0,rocket=0;
 for(const slot of g.slots){const offset=compactOffset(g,slot),u=spawn(w,team,slot.type,start+(team===0?offset:-offset));u.order={role:'opening-assault'};}
 updatePlatoons(w,(t,k,x)=>spawn(w,t,k,x),e=>record(w,e));g.retreatEnabled=controller!=='siege-no-retreat';
 const roster=[{type:'rifle',unitId:g.leaderId},...g.slots.map(s=>({type:s.type,unitId:s.unitId}))];
 if(controller.startsWith('independent')){w.platoons.groups=[];for(const u of w.units){u.isSergeant=false;u.captureEligible=true;u.platoonId=null;u.platoonSlot=null;u.order={role:'advance'};}}
 const defenderRoster=[];let i=0;for(const type of['rifle','rocket'])for(let n=0;n<scenario.defenders[type];n++){const x=scenario.kind==='fob'?at(1950+(type==='rocket'?0:n===0?-43:43)):at(1450+i++*35),u=spawn(w,enemy,type,x);u.order={role:scenario.kind==='fob'?'garrison':'advance'};if(scenario.kind==='fob'){const b=w.bases[0];u.guardBase=b.x;u.guardSlot=type==='rocket'?0:mirrored?1-n:n;u.arrived=true;b.slots[type][u.guardSlot]=u.id;b.reservations[type][u.guardSlot]=u.id;}defenderRoster.push({type,unitId:u.id});}
 // Mirror accounting too: both begin with120; both paid25 for equivalent initial attack rifle.
 const sim={world:w,scenario,composition,controller,mix,seed,mirrored,team,enemy,roster,defenderRoster,finished:false,outcome:null,initialCost:[forceCost(composition),forceCost(scenario.defenders)],breachAt:null,captureAt:null,maxLeaderGap:0,retreats:0,regroups:0,resumes:0};return sim;
}
function replenish(sim,team,roster,guard){const w=sim.world,c=w.commanders[team];for(const slot of roster){if(w.units.some(u=>u.id===slot.unitId&&u.hp>0))continue;const bought=purchaseUnit(c.supply,slot.type,w.units.filter(u=>u.hp>0&&u.team===team).length,()=>{const u=spawn(w,team,slot.type,c.rules.spawnX);u.order={role:guard?'garrison':'advance'};return u;});if(bought.unit)slot.unitId=bought.unit.id;break;}}
export function stepEncounter(sim,ticks=1){if(!Number.isInteger(ticks)||ticks<0||ticks>72000)throw Error('Invalid encounter steps');const w=sim.world;
 for(let i=0;i<ticks&&!sim.finished;i++){
  if(w.paused||w.result)break;
  if(sim.scenario.resupply){for(const c of w.commanders)accrueSupply(c.supply,CAMPAIGN_STEP);if(sim.controller.startsWith('independent'))replenish(sim,sim.team,sim.roster,false);replenish(sim,sim.enemy,sim.defenderRoster,true);}
  stepWorld(w);const g=w.platoons.groups.find(g=>g.team===sim.team&&g.phase!=='disbanded'),leader=g&&w.units.find(u=>u.id===g.leaderId&&u.hp>0);if(leader){const xs=g.slots.filter(s=>s.joined).map(s=>w.units.find(u=>u.id===s.unitId&&u.hp>0)).filter(Boolean).map(u=>u.x).sort((a,b)=>a-b);if(xs.length){const center=(xs[Math.floor((xs.length-1)/2)]+xs[Math.floor(xs.length/2)])/2;sim.maxLeaderGap=Math.max(sim.maxLeaderGap,Math.abs(leader.x-center));}}
  for(const e of w.events.filter(e=>e.tick===w.tick)){if(e.type==='platoonRetreat')sim.retreats++;if(e.type==='platoonRegroup')sim.regroups++;if(e.type==='platoonResumed')sim.resumes++;if(e.type==='breach'&&e.team===sim.team&&sim.breachAt===null)sim.breachAt=e.time;if(e.type==='captured'&&e.team===sim.team&&sim.captureAt===null)sim.captureAt=e.time;}
  const alive=team=>w.units.some(u=>u.team===team&&u.hp>0),pending=w.projectiles.length>0;
  if(sim.captureAt!==null){sim.finished=true;sim.outcome='capture';}
  else if(!pending&&!alive(sim.team)){sim.finished=true;sim.outcome=alive(sim.enemy)?'defense':'mutual';}
  else if(sim.scenario.kind==='field'&&!pending&&!alive(sim.enemy)){sim.finished=true;sim.outcome='attack';}
  else if(w.time>=sim.scenario.seconds){sim.finished=true;sim.outcome='unfinished';}
 }return sim;
}
export function encounterResult(s){const w=s.world;return {case:s.scenario.id,mix:s.mix,controller:s.controller,seed:s.seed,mirrored:s.mirrored,seconds:w.time,outcome:s.outcome??'running',initialCost:s.initialCost,alive:[s.team,s.enemy].map(t=>w.units.filter(u=>u.hp>0&&u.team===t).length),survivingValue:[s.team,s.enemy].map(t=>w.units.filter(u=>u.hp>0&&u.team===t).reduce((n,u)=>n+SUPPLY_RULES.costs[u.type],0)),hp:[s.team,s.enemy].map(t=>w.units.filter(u=>u.hp>0&&u.team===t).reduce((n,u)=>n+u.hp,0)),spent:[s.team,s.enemy].map(t=>w.commanders[t].supply.spent),bank:[s.team,s.enemy].map(t=>w.commanders[t].supply.balance),breachAt:s.breachAt,captureAt:s.captureAt,retreats:s.retreats,regroups:s.regroups,resumes:s.resumes,maxLeaderGap:s.maxLeaderGap,shots:{rifle:w.stats.rifleShots,rocket:w.stats.rocketShots},projectiles:w.projectiles.length};}
export function encounterSnapshot(s){return {result:encounterResult(s),world:worldSnapshot(s.world)};}
