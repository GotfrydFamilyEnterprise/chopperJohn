// PL-10 / #44: whole-force outcomes, paid acquisition, actual Campaign combat.
import {createWorld,spawn,record,CAMPAIGN_STEP} from '../campaign/world.js?v=2.2.0';
import {createSergeant,slotGoal} from '../ai/platoons.js?v=2.2.0';
import {createSquad,addMember} from '../ai/squads.js?v=2.2.0';
import {purchaseUnit,accrueSupply} from '../economy/supply.js?v=2.2.0';
import {stepEncounter,encounterResult} from './encounters.js?v=2.2.0';

export const FORCE_LAYOUTS=['one','two','support'];
const live=(w,id)=>w.units.find(u=>u.id===id&&u.hp>0);
const population=(w,t)=>w.units.filter(u=>u.team===t&&u.hp>0).length;
const reserve={standoff:680,rifles:[-180,-220],rockets:[180,220],leaderRearGap:140};
const ready=(w,g)=>live(w,g.leaderId)&&Math.abs(live(w,g.leaderId).x-g.rallyX)<=8&&g.slots.every(s=>s.joined&&live(w,s.unitId)&&Math.abs(live(w,s.unitId).x-slotGoal(w,g,s))<=8);

export function createCombinedAssault(level,{layout='one',release='coordinated',resupply=false,seed=1,mirrored=false,seconds=240}={}){
 if(!FORCE_LAYOUTS.includes(layout)||!['coordinated','staggered'].includes(release)||typeof resupply!=='boolean'||typeof mirrored!=='boolean'||!Number.isInteger(seconds)||seconds<60||seconds>600)throw Error('Invalid combined assault');
 const w=createWorld(level,{seed,platoons:true,systems:{commanders:false,platoonRecruitment:false,flight:false,repairs:false}}),team=mirrored?1:0,enemy=1-team,at=x=>mirrored?w.level.world.width-x:x;
 w.units=[];w.helicopter.hp=0;w.bases=[{...w.bases.find(b=>b.id==='red-fob'),x:at(1950),team:enemy,id:'target-fob'}];
 Object.assign(w.commanders[team].rules,{spawnX:at(550),rallyX:at(650)});
 Object.assign(w.commanders[enemy].rules,{spawnX:at(2350),rallyX:at(2250)});
 const support=createSquad(900,'study-support',{rifle:2,rocket:2},0,w.commanders[team].rules);support.holdUntil=Infinity;w.commanders[team].squads.push(support);
 const s={world:w,scenario:{id:resupply?'combined-supplied':'combined-fixed',kind:'fob',resupply:false,seconds},team,enemy,seed,mirrored,composition:{rifle:4,rocket:4},controller:layout,mix:'4r-4k',roster:[],defenderRoster:['rifle','rifle','rocket'].map(type=>({type,unitId:null})),finished:false,outcome:null,initialCost:[340,110],breachAt:null,captureAt:null,maxLeaderGap:0,retreats:0,regroups:0,resumes:0,
  combined:{layout,release,resupply,support,supportRoster:[],groups:[],acquired:0,initialIds:[],purchases:[],launches:[],supportLaunchedAt:null,fullyPaidAt:null,defendersReadyAt:null,maxPopulation:[0,0]}};
 acquire(s);return s;
}
function acquire(s){
 const w=s.world,p=s.combined,index=p.acquired;if(index===8)return;
 const type=index<4?'rifle':'rocket',leader=index===0||p.layout==='two'&&index===1;
 let result;
 if(leader){result=createSergeant(w,s.team,{strategy:'siege',composition:p.layout==='one'?{rifle:4,rocket:4}:{rifle:2,rocket:2}},(t,k,x)=>spawn(w,t,k,x),e=>record(w,e));if(result.group){result.group.holdRally=true;result.group.assaultPolicy=structuredClone(reserve);p.groups.push(result.group);}}
 else result=purchaseUnit(w.commanders[s.team].supply,type,population(w,s.team),()=>{
  const u=spawn(w,s.team,type,w.commanders[s.team].rules.spawnX);
  // Ordinary adoption fills leader slots on the next engine tick. Support uses
  // the existing squad gather movement, with an ineligible adoption order.
  if(p.groups.some(g=>g.slots.some(slot=>slot.type===type&&slot.unitId===null)))u.order={role:'advance'};
  else{addMember(p.support,u);p.supportRoster.push({type,unitId:u.id});}
  return u;
 });
 if(result.unit){p.acquired++;p.initialIds.push(result.unit.id);p.purchases.push({id:result.unit.id,type,x:result.unit.x,time:w.time});if(p.acquired===8)p.fullyPaidAt=w.time;}
}
function replenish(s,team,roster,guard){
 const w=s.world,slot=roster.find(slot=>slot.unitId===null||s.combined.resupply&&!live(w,slot.unitId));if(!slot)return;
 const result=purchaseUnit(w.commanders[team].supply,slot.type,population(w,team),()=>{const u=spawn(w,team,slot.type,w.commanders[team].rules.spawnX);u.order={role:guard?'garrison':'advance'};return u;});
 if(result.unit)slot.unitId=result.unit.id;
}
export function stepCombinedAssault(s,ticks=1){
 if(!Number.isInteger(ticks)||ticks<0||ticks>72000)throw Error('Invalid combined steps');
 const w=s.world,p=s.combined;
 for(let i=0;i<ticks&&!s.finished;i++){
  if(w.paused||w.result)break;
  for(const c of w.commanders)accrueSupply(c.supply,CAMPAIGN_STEP);
  acquire(s);replenish(s,s.enemy,s.defenderRoster,true);
  const supportReady=p.supportLaunchedAt===null&&p.supportRoster.length===4&&p.supportRoster.every((s,i)=>live(w,s.unitId)&&Math.abs(live(w,s.unitId).x-(p.support.rallyX-p.support.direction*i*14))<=8);
  const together=p.acquired===8&&p.groups.every(g=>g.phase==='rally'&&ready(w,g))&&(p.layout!=='support'||supportReady);
  for(const g of p.groups)if(g.phase==='rally'&&(p.release==='staggered'&&ready(w,g)||together))g.holdRally=false;
  if(p.layout==='support'&&p.supportLaunchedAt===null&&supportReady&&(p.release==='staggered'||together)){
   p.supportLaunchedAt=w.time;p.support.phase='retired';for(const slot of p.supportRoster)live(w,slot.unitId).order={role:'advance'};
  }
  // Initial acquisition has priority. Afterwards the normal platoon recruiter
  // replaces vacancies; independent support retains its own paid four slots.
  w.systems.platoonRecruitment=p.resupply&&p.acquired===8;
  if(p.resupply&&p.supportLaunchedAt!==null)replenish(s,s.team,p.supportRoster,false);
  stepEncounter(s,1);
  for(const g of p.groups)if(g.launchedAt!==null&&!p.launches.some(l=>l.groupId===g.id))p.launches.push({groupId:g.id,time:g.launchedAt,spent:w.commanders[s.team].supply.spent});
  if(p.defendersReadyAt===null&&s.defenderRoster.every(slot=>live(w,slot.unitId)?.arrived))p.defendersReadyAt=w.time;
  for(const t of[0,1])p.maxPopulation[t]=Math.max(p.maxPopulation[t],population(w,t));
 }
 return s;
}
export function combinedAssaultResult(s){
 const w=s.world,p=s.combined,accounts=[s.team,s.enemy].map(t=>structuredClone(w.commanders[t].supply));
 return {...encounterResult(s),layout:p.layout,release:p.release,resupply:p.resupply,fullyPaidAt:p.fullyPaidAt,launches:p.launches,supportLaunchedAt:p.supportLaunchedAt,defendersReadyAt:p.defendersReadyAt,initialPurchases:p.purchases,
  leadersAlive:p.groups.filter(g=>live(w,g.leaderId)).length,captureRiflesAlive:w.units.filter(u=>u.hp>0&&u.team===s.team&&u.type==='rifle'&&!u.isSergeant).length,maxPopulation:[p.maxPopulation[s.team],p.maxPopulation[s.enemy]],accounts,
  ledgerValid:accounts.every(a=>Math.abs(a.balance-(120+a.earned-a.spent))<1e-6&&Math.abs(a.earned+a.overflow-a.time*5)<1e-6)};
}
