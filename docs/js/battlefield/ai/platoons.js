// PL-01..05: paid sergeant-led formations; no DOM, wall clock or hidden buffs.
import {purchaseUnit,SUPPLY_RULES} from '../economy/supply.js?v=2.1.0';
export const PLATOON_TACTICS=Object.freeze({
 assault:Object.freeze({name:'Assault',standoff:650,rocketRange:550,rifles:[440,480],rockets:[160,200],cohesion:260}),
 siege:Object.freeze({name:'Siege',standoff:800,rocketRange:700,rifles:[500,535],rockets:[180,230],cohesion:280}),
 spread:Object.freeze({name:'Spread',standoff:680,rocketRange:550,rifles:[445,535],rockets:[150,245],cohesion:280}),
});
export const PLATOON_RULES=Object.freeze({maxActive:2,joinDistance:35,rallyTolerance:8,sprint:2});
export function createPlatoonState(enabled=false){return {enabled,nextId:1,groups:[],stats:{leaders:0,recruits:0,replacements:0,adopted:0,disbanded:0},redStrategy:'assault'};}
const active=g=>g.phase!=='disbanded';
export const activePlatoons=(w,team)=>w.platoons.groups.filter(g=>g.team===team&&active(g));
const live=(w,id)=>w.units.find(u=>u.id===id&&u.hp>0);
const population=(w,team)=>w.units.filter(u=>u.hp>0&&u.team===team).length;
function attach(u,g,slot,replacement=false){slot.unitId=u.id;slot.joined=false;slot.replacement=replacement;u.platoonId=g.id;u.platoonSlot=slot.index;u.order={role:'platoon',platoonId:g.id};}
export function createSergeant(w,team,{strategy='assault',composition}={},spawn,emit=()=>{}){
 if(![0,1].includes(team))return {unit:null,reason:'invalid-faction'};
 if(!w.platoons.enabled)return {unit:null,reason:'platoons-disabled'};
 if(w.paused||w.result)return {unit:null,reason:'paused-or-finished'};
 if(team===1&&w.commanders[team].fieldRecruitmentBlocked)return {unit:null,reason:'defense-priority'};
 if(!PLATOON_TACTICS[strategy])return {unit:null,reason:'invalid-strategy'};
 if(activePlatoons(w,team).length>=2)return {unit:null,reason:'platoon-limit'};
 const recipe=composition??w.level.factions.find(f=>f.team===team).wave;
 if(!Number.isInteger(recipe?.rifle)||!Number.isInteger(recipe?.rocket)||recipe.rifle<2||recipe.rocket<1||recipe.rifle+recipe.rocket>10)return {unit:null,reason:'invalid-composition'};
 const c=w.commanders[team];let group;
 const result=purchaseUnit(c.supply,'rifle',population(w,team),()=>{
  const u=spawn(team,'rifle',c.rules.spawnX);if(!u)return null;u.isSergeant=true;u.captureEligible=false;
  group={id:w.platoons.nextId++,team,leaderId:u.id,strategy,composition:{...recipe},phase:'rally',rallyX:c.rules.rallyX,createdAt:w.time,launchedAt:null,slots:[],blockReason:'assembling',objectiveId:null};
  let index=0;for(let i=1;i<recipe.rifle;i++)group.slots.push({index:index++,type:'rifle',unitId:null,joined:false,replacement:false});for(let i=0;i<recipe.rocket;i++)group.slots.push({index:index++,type:'rocket',unitId:null,joined:false,replacement:false});
  u.platoonId=group.id;u.order={role:'platoon',platoonId:group.id};w.platoons.groups.push(group);w.platoons.stats.leaders++;emit({type:'sergeantCreated',groupId:group.id,team,unitId:u.id});return u;
 });return {...result,group};
}
function compactOffset(g,slot){const ofType=g.slots.filter(s=>s.type===slot.type),i=ofType.indexOf(slot);return slot.type==='rifle'?24+i*24:-30-i*30;}
function formationOffset(g,slot){const p=PLATOON_TACTICS[g.strategy],i=g.slots.filter(s=>s.type===slot.type).indexOf(slot),values=slot.type==='rifle'?p.rifles:p.rockets;return values[Math.min(i,values.length-1)]+Math.max(0,i-values.length+1)*(slot.type==='rifle'?35:-35);}
const bounded=(w,x)=>Math.max(80,Math.min(w.level.world.width-80,x));
export function slotGoal(w,g,slot){const dir=g.team===0?1:-1,leader=live(w,g.leaderId);return bounded(w,g.phase==='rally'?g.rallyX+dir*compactOffset(g,slot):(leader?.x??g.rallyX)+dir*formationOffset(g,slot));}
export function updatePlatoons(w,spawn,emit=()=>{}){
 if(!w.platoons.enabled||w.paused||w.result)return;
 for(const g of w.platoons.groups.filter(active)){
  const leader=live(w,g.leaderId);
  if(!leader){g.phase='disbanded';g.endedAt=w.time;g.blockReason='leader-lost';w.platoons.stats.disbanded++;for(const u of w.units)if(u.platoonId===g.id){u.platoonId=null;u.platoonSlot=null;u.order={role:'advance'};}emit({type:'platoonDisbanded',groupId:g.id,team:g.team});continue;}
  for(const slot of g.slots){const u=live(w,slot.unitId);if(slot.unitId!==null&&(!u||u.guardBase!==null)){if(u){u.platoonId=null;u.platoonSlot=null;}slot.unitId=null;slot.joined=false;slot.replacement=true;emit({type:'platoonVacancy',groupId:g.id,slot:slot.index});}}
  // Reuse only unassigned opening/field troops near HQ, never guards or garrison orders.
  for(const slot of g.slots.filter(s=>s.unitId===null&&!s.replacement)){
   const candidate=w.units.filter(u=>u.hp>0&&u.team===g.team&&u.type===slot.type&&!u.isSergeant&&!u.platoonId&&u.guardBase===null&&['opening-assault','advance'].includes(u.order?.role)&&Math.abs(u.x-g.rallyX)<=180).sort((a,b)=>a.id-b.id)[0];
   if(candidate){attach(candidate,g,slot);w.platoons.stats.adopted++;}
  }
  const missing=g.slots.find(s=>s.unitId===null);g.blockReason=missing?'awaiting-'+missing.type:g.phase==='rally'?'moving-to-rally':'advancing';
  if(missing&&w.systems.commanders){const replacement=missing.replacement;const bought=g.team===1&&w.commanders[g.team].fieldRecruitmentBlocked?{unit:null,reason:'defense-priority'}:purchaseUnit(w.commanders[g.team].supply,missing.type,population(w,g.team),()=>{const u=spawn(g.team,missing.type,w.commanders[g.team].rules.spawnX);if(!u)return null;attach(u,g,missing,replacement);return u;});g.blockReason=bought.reason;if(bought.unit){w.platoons.stats.recruits++;if(replacement)w.platoons.stats.replacements++;emit({type:replacement?'platoonReplacement':'platoonRecruit',groupId:g.id,unitId:bought.unit.id,kind:missing.type,team:g.team});}}
  for(const slot of g.slots){const u=live(w,slot.unitId);if(u&&!slot.joined&&Math.abs(u.x-slotGoal(w,g,slot))<=(g.phase==='rally'?8:35)){slot.joined=true;slot.replacement=false;emit({type:'platoonJoined',groupId:g.id,unitId:u.id});}}
  if(g.phase==='rally'&&Math.abs(leader.x-g.rallyX)<=8&&g.slots.every(s=>live(w,s.unitId)&&s.joined&&Math.abs(live(w,s.unitId).x-slotGoal(w,g,s))<=8)){g.phase='advance';g.launchedAt=w.time;g.blockReason='advancing';emit({type:'platoonLaunched',groupId:g.id,team:g.team});}
 }
}
export function prunePlatoons(w){w.platoons.groups=w.platoons.groups.filter(g=>active(g)||w.time-(g.endedAt??w.time)<30);}
export function groupFor(w,u){return u.platoonId?w.platoons.groups.find(g=>g.id===u.platoonId&&active(g)):null;}
export function platoonOrder(w,u){
 const g=groupFor(w,u);if(!g)return null;const dir=g.team===0?1:-1,leader=live(w,g.leaderId),policy=PLATOON_TACTICS[g.strategy];
 if(u.id!==g.leaderId){const slot=g.slots.find(s=>s.unitId===u.id);if(!slot)return null;const desired=slotGoal(w,g,slot),goal=g.phase==='rally'||slot.replacement&&!slot.joined?desired:(g.team===0?Math.max(u.x,desired):Math.min(u.x,desired));return {goalX:goal,speed:slot.replacement&&!slot.joined?Math.abs(u.velocity)*2:Math.abs(slotGoal(w,g,slot)-u.x)>8&&slot.type==='rifle'?47:33,sprint:slot.replacement&&!slot.joined,joining:!slot.joined};}
 if(g.phase==='rally')return {goalX:g.rallyX,speed:33,sprint:false};
 const base=w.bases.filter(b=>b.team!==g.team&&(b.x-u.x)*dir>=-80).sort((a,b)=>(a.x-b.x)*dir)[0];g.objectiveId=base?.id??null;
 let goal=base?base.x-dir*(base.defensePoints>0?policy.standoff:Math.max(600,policy.standoff-50)):g.team===0?w.level.world.width-80:80;
 if(base)g.phase=base.defensePoints>0?'breach':'capture';
 const enemy=w.units.filter(v=>v.hp>0&&v.team!==g.team&&(v.x-u.x)*dir>0).sort((a,b)=>(a.x-b.x)*dir)[0];if(enemy&&(enemy.x-u.x)*dir<1000)goal=dir*Math.min(goal*dir,(enemy.x-dir*policy.standoff)*dir);
 const joined=g.slots.filter(s=>s.joined).map(s=>live(w,s.unitId)).filter(Boolean);if(joined.some(v=>(u.x-v.x)*dir>policy.cohesion))goal=u.x;
 const screens=g.slots.filter(s=>s.type==='rifle'&&s.joined&&live(w,s.unitId));if(screens.length)goal=dir*Math.min(goal*dir,Math.max(u.x*dir,Math.min(...screens.map(s=>live(w,s.unitId).x*dir-formationOffset(g,s)+35))));
 goal=dir*Math.max(u.x*dir,goal*dir);
 return {goalX:bounded(w,goal),speed:33,sprint:false};
}
export function permitsEngagement(w,u,target){
 if(!target)return false;const g=groupFor(w,u);if(!g)return true;const slot=g.slots.find(s=>s.unitId===u.id),distance=Math.abs(target.x-u.x);
 if(slot&&!slot.joined&&g.launchedAt!==null)return distance<=(u.type==='rifle'?150:350);
 return u.type!=='rocket'||distance<=PLATOON_TACTICS[g.strategy].rocketRange;
}
export function platoonSummary(w,team){return activePlatoons(w,team).map(g=>{const count=1+g.slots.filter(s=>live(w,s.unitId)).length,total=1+g.slots.length,joining=g.slots.filter(s=>live(w,s.unitId)&&!s.joined).length;const reason={'saving-supply':'saving Supply','unit-limit':'troop cap','deployment-cooldown':'deployment cooldown','ready':'recruiting'}[g.blockReason]??g.blockReason.replaceAll('-',' ');return `Sgt ${g.id} · ${PLATOON_TACTICS[g.strategy].name} · ${count}/${total} · ${g.phase}${joining?' · '+joining+' joining':''}${g.slots.some(s=>s.unitId===null)?' · '+reason:''}`;}).join(' | ')||'No active platoon';}
