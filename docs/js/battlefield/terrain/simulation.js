import {LAB_ROCKET,labRocketSpread,planTerrainRocket,rocketReachAtDrop} from './ballistics.js?v=0.4.0';
import {validateLevel} from './level.js?v=0.4.0';
import {groundY,terrainContact,visible,walkSurface} from './heightfield.js?v=0.4.0';
import {createSoldier} from '../units/soldierCommon.js';
import {WEAPONS,createRandom,applyDamage} from '../combat/weapons.js?v=1.3.1';
export const LAB_STEP=1/120;
export const eye=u=>({x:u.x,y:u.y-40});
export function createSimulation(data,scenarioId){
 const level=validateLevel(data),scenario=level.scenarios.find(s=>s.id===scenarioId);
 if(!scenario)throw new Error('Unknown scenario');
 return {level,scenarioId,time:0,tick:0,result:null,random:createRandom(level.seed),units:scenario.units.map(u=>({...createSoldier(u.id,u.team,u.type,u.x,groundY(level,u.x)),mode:u.mode,shotsFired:0,firstShotAt:null,damageTaken:0})),projectiles:[],effects:[],events:[],stats:{rifleShots:0,rocketShots:0,terrainHits:0,hits:0}};
}
export function targetFor(sim,u){
 if(!sim.level.scenarios.find(s=>s.id===sim.scenarioId).combat)return null;
 const dir=u.team===0?1:-1;
 return sim.units.filter(v=>v.hp>0&&v.team!==u.team&&(v.x-u.x)*dir>=(u.type==='rifle'?0:LAB_ROCKET.minRange)&&(u.type!=='rifle'||(v.x-u.x)*dir<=WEAPONS.rifleRange)&&(u.type==='rocket'?!!rocketPlan(sim.level,u,v):visible(sim.level,eye(u),eye(v)))).sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)||a.id-b.id)[0]??null;
}
// TL-07: public adapter retained for isolated solver tests.
export const rocketPlan=planTerrainRocket;
function event(sim,e){sim.events.push({tick:sim.tick,...e});if(sim.events.length>400)sim.events.shift();}
function recordShot(sim,u){u.shotsFired++;if(u.firstShotAt===null)u.firstShotAt=sim.time;}
function damageUnit(u,amount){const damage=applyDamage(u,amount);u.damageTaken+=damage.amount;return damage;}
function unitContact(a,b,u){
 // Swept segment against torso/head rectangle; earliest hit wins over terrain.
 let low=0,high=1;
 for(const [p,d,min,max] of [[a.x,b.x-a.x,u.x-7,u.x+7],[a.y,b.y-a.y,u.y-54,u.y-8]]){
  if(Math.abs(d)<1e-12){if(p<min||p>max)return null;}
  else{const t1=(min-p)/d,t2=(max-p)/d;low=Math.max(low,Math.min(t1,t2));high=Math.min(high,Math.max(t1,t2));if(low>high)return null;}
 }
 return low;
}
function detonate(sim,p,point){
 sim.stats.terrainHits++;sim.effects.push({...point,age:0,kind:'blast'});event(sim,{type:'rocketImpact',x:point.x,y:point.y});
 for(const u of sim.units)if(u.hp>0&&u.team!==p.team){
  const body={x:u.x,y:u.y-20},distance=Math.hypot(u.x-point.x,u.y-point.y);
  // Surface burst starts just above soil, and hills occlude splash too.
  if(distance<WEAPONS.blastRadius&&visible(sim.level,{x:point.x,y:point.y-.1},body)){
   const damage=damageUnit(u,WEAPONS.blastDamage*(1-distance/WEAPONS.blastRadius));sim.stats.hits++;event(sim,{type:'damage',weapon:'rocket',...damage});
  }
 }
}
export function stepSimulation(sim,count=1){
 if(!Number.isInteger(count)||count<0||count>24000)throw new Error('Invalid step count');
 for(let n=0;n<count;n++){
  if(sim.result)break;
  sim.tick++;sim.time=sim.tick*LAB_STEP;
  // TL-06: all movement uses the same pre-step world; fire observes committed positions.
  const movementTargets=new Map(sim.units.filter(u=>u.hp>0).map(u=>[u.id,targetFor(sim,u)]));
  for(const u of sim.units){
   if(u.hp<=0)continue;
   u.hitFlash=Math.max(0,u.hitFlash-LAB_STEP);
   const target=movementTargets.get(u.id),before=u.x;
   if(u.mode==='walk'&&!(u.type==='rocket'&&target))u.x=Math.max(40,Math.min(sim.level.world.width-40,walkSurface(sim.level,u.x,u.velocity*LAB_STEP*(target?.42:1))));
   u.y=groundY(sim.level,u.x);u.observedVelocity=(u.x-before)/LAB_STEP;u.phase=(u.phase+Math.abs(u.x-before)/44)%1;
  }
  for(const u of sim.units){
   if(u.hp<=0)continue;
   const target=targetFor(sim,u);
   u.state=target?(u.type==='rocket'?'fireStop':'fireWalk'):'march';
   u.rifleAimAngle=target?Math.atan2(target.y-32-(u.y-37),target.x-(u.x+(u.team===0?5:-5))):null;
   u.fireCooldown=Math.max(0,u.fireCooldown-LAB_STEP);
   if(u.type==='rifle'&&target&&u.fireCooldown<=1e-8){
    // Real muzzle and uphill/downhill trajectory, no hidden penetration roll.
    const angle=u.rifleAimAngle,a={x:u.x+(u.team===0?5:-5)+29*Math.cos(angle),y:u.y-37+29*Math.sin(angle)};
    sim.projectiles.push({...a,vx:900*Math.cos(angle),vy:900*Math.sin(angle),shooterId:u.id,age:0,kind:'bullet',team:u.team});
    recordShot(sim,u);sim.stats.rifleShots++;u.fireCooldown=.32;event(sim,{type:'rifleShot',id:u.id,x:u.x,y:u.y});
   }
   if(u.type==='rocket'){
    const dir=u.team===0?1:-1,focus=target||sim.units.filter(v=>v.hp>0&&v.team!==u.team&&(v.x-u.x)*dir>0).sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)||a.id-b.id)[0];
    u.rocketReach=focus?{targetId:focus.id,distance:Math.abs(focus.x-u.x),drop:focus.y-(u.y-42),terrainDrop:focus.y-u.y,clearAir:rocketReachAtDrop(focus.y-(u.y-42)),reachable:!!target}:null;
    const goal=target?rocketPlan(sim.level,u,target):null;u.rocketGoal=goal;u.rocketAimAngle=sim.time-(u.lastRocketAt??-Infinity)<.15?u.lastRocketAngle:goal?.angle??null;
    u.rocketCooldown=Math.max(0,(u.rocketCooldown||0)-LAB_STEP);
    if(!target||u.rocketTargetId!==target.id){u.rocketAimTime=0;u.rocketTargetId=target?.id??null;}
    if(target&&u.rocketCooldown<=1e-8){
     u.rocketAimTime=(u.rocketAimTime||0)+LAB_STEP;
     if(u.rocketAimTime+1e-8>=WEAPONS.rocketAimSeconds){
      const error=(sim.random()*2-1)*labRocketSpread(Math.abs(target.x-u.x)),plan=rocketPlan(sim.level,u,target,error);
      if(plan){sim.projectiles.push({...plan,kind:'rocket',team:u.team});recordShot(sim,u);u.rocketAimAngle=plan.angle;u.lastRocketAngle=plan.angle;u.lastRocketAt=sim.time;sim.stats.rocketShots++;event(sim,{type:'rocketShot',id:u.id,error,impactX:plan.impactX,angle:plan.angle,flightTime:plan.flightTime,speed:plan.speed});}
      u.rocketAimTime=0;u.rocketCooldown=WEAPONS.rocketReloadSeconds;
     }
    }
   }
  }
  sim.projectiles=sim.projectiles.filter(p=>{
   const a={x:p.x,y:p.y};p.age+=LAB_STEP;
   const b=p.kind==='rocket'?{x:p.originX+p.vx*p.age,y:p.originY+p.vy*p.age+WEAPONS.gravity*p.age*p.age/2}:{x:p.x+p.vx*LAB_STEP,y:p.y+p.vy*LAB_STEP};
   const terrain=terrainContact(sim.level,a,b);let victim=null,first=terrain?.t??Infinity;
   if(p.kind==='bullet')for(const u of sim.units)if(u.hp>0&&u.team!==p.team){const t=unitContact(a,b,u);if(t!==null&&t<first){first=t;victim=u;}}
   p.x=b.x;p.y=b.y;
   if(victim){const damage=damageUnit(victim,1);sim.stats.hits++;sim.effects.push({x:victim.x,y:victim.y-32,kind:'hit',age:0});event(sim,{type:'damage',weapon:'rifle',shooterId:p.shooterId,...damage});return false;}
   if(terrain){if(p.kind==='rocket')detonate(sim,p,terrain);else{sim.stats.terrainHits++;sim.effects.push({...terrain,kind:'spark',age:0});event(sim,{type:'bulletBlocked',x:terrain.x,y:terrain.y});}return false;}
   return p.age<8&&p.x>=0&&p.x<=sim.level.world.width;
  });
  sim.effects=sim.effects.filter(e=>(e.age+=LAB_STEP)<.65);
  const scenario=sim.level.scenarios.find(s=>s.id===sim.scenarioId);
  if(scenario.combat&&new Set(scenario.units.map(u=>u.team)).size===2&&!sim.projectiles.length){
   const teams=[...new Set(sim.units.filter(u=>u.hp>0).map(u=>u.team))];
   if(teams.length<2)sim.result={winner:teams[0]??null,time:sim.time};
  }
 }
 return sim;
}
export function snapshot(sim){return {levelId:sim.level.id,scenarioId:sim.scenarioId,tick:sim.tick,time:sim.time,result:sim.result?{...sim.result}:null,randomState:sim.random.state(),units:structuredClone(sim.units),projectiles:structuredClone(sim.projectiles),events:structuredClone(sim.events),stats:{...sim.stats}};}
