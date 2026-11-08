// FOB-TACTICS: isolated paid provisioning policies; combat stays in the Campaign engine.
import {createWorld,spawn,record,CAMPAIGN_STEP} from '../campaign/world.js?v=2.2.0';
import {createSergeant} from '../ai/platoons.js?v=2.2.0';
import {purchaseUnit,accrueSupply} from '../economy/supply.js?v=2.2.0';
import {stepEncounter,encounterResult,forceCost} from './encounters.js?v=2.2.0';

export const ASSAULT_CONTROLLERS=['independent','assault','siege','spread','siege-no-retreat'];
const living=(w,team)=>w.units.filter(u=>u.hp>0&&u.team===team).length;
const alive=(w,id)=>w.units.some(u=>u.id===id&&u.hp>0);

export function createAssaultStudy(level,{composition={rifle:3,rocket:2},controller='siege',seed=101,mirrored=false,resupply=false,seconds=480}={}){
 if(!ASSAULT_CONTROLLERS.includes(controller)||typeof resupply!=='boolean'||typeof mirrored!=='boolean'||!Number.isInteger(seconds)||seconds<60||seconds>600)throw Error('Invalid assault study');
 if(!Number.isInteger(composition.rifle)||!Number.isInteger(composition.rocket)||composition.rifle<2||composition.rocket<1||composition.rifle+composition.rocket>10)throw Error('Invalid assault composition');
 const w=createWorld(level,{seed,platoons:true,systems:{commanders:false,platoonRecruitment:true,flight:false,repairs:false}}),team=mirrored?1:0,enemy=1-team,at=x=>mirrored?w.level.world.width-x:x;
 // Scenario initialization only: no opening grant, aircraft or other objectives.
 w.units=[];w.helicopter.hp=0;w.bases=[{...w.bases.find(b=>b.id==='red-fob'),x:at(1950),team:enemy,id:'target-fob'}];
 w.commanders[team].rules.spawnX=at(550);w.commanders[team].rules.rallyX=at(550);
 w.commanders[enemy].rules.spawnX=at(2350);w.commanders[enemy].rules.rallyX=at(2250);
 // Identical paid rally assembly for every policy. The independent controller releases
 // the same physically assembled force, without formation/replacement speed advantages.
 const created=createSergeant(w,team,{strategy:'assault',composition},(t,k,x)=>spawn(w,t,k,x),e=>record(w,e));
 if(!created.group)throw Error('Failed to provision paid leader');
 return {world:w,scenario:{id:resupply?'paid-supplied-fob':'paid-staffed-fob',kind:'fob',seconds,resupply:false},composition:{...composition},controller,mix:`${composition.rifle}r-${composition.rocket}k`,seed,mirrored,team,enemy,
  roster:[],defenderRoster:['rifle','rifle','rocket'].map(type=>({type,unitId:null})),finished:false,outcome:null,initialCost:[forceCost(composition),110],breachAt:null,captureAt:null,maxLeaderGap:0,retreats:0,regroups:0,resumes:0,
  study:{resupply,group:created.group,launchAt:null,launchSpent:null,defendersReadyAt:null,initialAttackIds:[],initialDefenseIds:[],maxPopulation:team===0?[1,0]:[0,1]}};
}

function provision(s,team,roster,guard){
 const w=s.world,slot=roster.find(slot=>slot.unitId===null||s.study.resupply&&!alive(w,slot.unitId));if(!slot)return;
 const result=purchaseUnit(w.commanders[team].supply,slot.type,living(w,team),()=>{
  const u=spawn(w,team,slot.type,w.commanders[team].rules.spawnX);u.order={role:guard?'garrison':'advance'};record(w,{type:'studyPurchase',team,unitId:u.id,kind:slot.type});return u;
 });
 if(result.unit){if(slot.unitId===null)(guard?s.study.initialDefenseIds:s.study.initialAttackIds).push(result.unit.id);slot.unitId=result.unit.id;}
}

export function stepAssaultStudy(s,ticks=1){
 if(!Number.isInteger(ticks)||ticks<0||ticks>72000)throw Error('Invalid study steps');
 const w=s.world,p=s.study;
 for(let i=0;i<ticks&&!s.finished;i++){
  if(w.paused||w.result)break;
  for(const c of w.commanders)accrueSupply(c.supply,CAMPAIGN_STEP);
  provision(s,s.enemy,s.defenderRoster,true);
  if(p.launchAt!==null&&s.controller==='independent'&&p.resupply)provision(s,s.team,s.roster,false);
  stepEncounter(s,1);
  if(p.launchAt===null&&p.group.launchedAt!==null){
   p.launchAt=p.group.launchedAt;p.launchSpent=w.commanders[s.team].supply.spent;
   s.roster=[{type:'rifle',unitId:p.group.leaderId},...p.group.slots.map(slot=>({type:slot.type,unitId:slot.unitId}))];p.initialAttackIds=s.roster.map(slot=>slot.unitId);
   if(s.controller==='independent'){
    w.platoons.groups=[];for(const u of w.units.filter(u=>u.team===s.team)){u.isSergeant=false;u.captureEligible=true;u.platoonId=null;u.platoonSlot=null;u.order={role:'advance'};}
   }else{p.group.strategy=s.controller==='siege-no-retreat'?'siege':s.controller;p.group.retreatEnabled=s.controller!=='siege-no-retreat';}
   w.systems.platoonRecruitment=p.resupply;
  }
  if(p.defendersReadyAt===null&&s.defenderRoster.every(slot=>w.units.some(u=>u.id===slot.unitId&&u.hp>0&&u.arrived)))p.defendersReadyAt=w.time;
  for(const team of[0,1])p.maxPopulation[team]=Math.max(p.maxPopulation[team],living(w,team));
 }
 return s;
}

export function assaultStudyResult(s){
 const r=encounterResult(s),w=s.world,p=s.study;
 return {...r,provisioning:'all-paid-at-HQ',resupply:p.resupply,launchAt:p.launchAt,launchSpent:p.launchSpent,defendersReadyAt:p.defendersReadyAt,combatSeconds:p.launchAt===null?null:w.time-p.launchAt,
  maxPopulation:[p.maxPopulation[s.team],p.maxPopulation[s.enemy]],accounts:[s.team,s.enemy].map(t=>({...w.commanders[t].supply,ledger:w.commanders[t].supply.ledger.map(e=>({...e}))}))};
}
