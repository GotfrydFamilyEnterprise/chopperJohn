import {planTerrainRocket} from '../terrain/ballistics.js?v=2.0.0';
import {planAirShot} from '../combat/airInterception.js?v=2.0.0';
// CP-02/03: pure campaign battlefield. UI injects input/orders; no DOM, storage or clock.
import {validateBattlefield} from './definition.js?v=2.0.0';
import {groundY,terrainContact,visible,walkSurface} from '../terrain/heightfield.js?v=2.0.0';
import {allocateSplash} from '../terrain/splash.js?v=2.0.0';
import {infantryTarget,rifleRound,rifleBearing,updateGroundRocket} from '../combat/groundInfantry.js?v=2.0.0';
import {createSoldier} from '../units/soldierCommon.js?v=2.0.0';
import {createRandom,applyDamage,stationedBase,resolveRifleHit} from '../combat/weapons.js?v=2.0.0';
import {createBase} from '../bases/baseCommon.js?v=2.0.0';
import {assignDefender,releaseDeadDefenders,refreshOccupation,occupied} from '../bases/forwardBase.js?v=2.0.0';
import {rifleAssaultBase} from '../bases/assaultOrders.js?v=2.0.0';
import {capturePoint,rocketDefenseBlast,updateTakeover,headquartersResult} from '../bases/takeover.js?v=2.0.0';
import {createCommander,updateCommander,commanderMovementOrder} from '../ai/redCommander.js?v=2.0.0';
import {purchaseUnit,accrueSupply} from '../economy/supply.js?v=2.0.0';
import {createHelicopter,updateHelicopter,repairHelicopter,turnHelicopter,damageHelicopter} from '../aircraft/helicopter.js?v=2.0.0';
import {updateAircraftSupport} from '../aircraft/aircraftSupport.js?v=2.0.0';
import {updateHelicopterGun,resolveHelicopterHit} from '../combat/helicopterGun.js?v=2.0.0';
import {allocateRocketTargets} from '../combat/rocketAllocation.js?v=2.0.0';
import {updatePrioritizedRocket} from '../combat/targetPriority.js?v=2.0.0';
import {stepBattleRocket,helicopterBurstDamage} from '../combat/airRocketFlight.js?v=2.0.0';
import {segmentBox,soldierBox,boxDistance,lerpAircraft} from '../combat/collision2d.js?v=2.0.0';
export const CAMPAIGN_STEP=1/120;
export const CAMPAIGN_BALANCE=Object.freeze({id:'campaign-v1',blastRadius:40,damageModel:'shared'});
export function record(w,e){w.events.push({tick:w.tick,time:w.time,...e});if(w.events.length>512)w.events.shift();}
export function spawn(w,team,type,x){const u={...createSoldier(w.nextId++,team,type,x,groundY(w.level,x)),mode:'walk',shotsFired:0,firstShotAt:null,damageTaken:0};w.units.push(u);return u;}
export function createWorld(input,{seed=input.seed,systems={}}={}){
 const level=validateBattlefield(input);if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid seed');
 const w={level,seed,time:0,tick:0,nextId:1,nextRoundId:1,paused:false,result:null,units:[],bases:level.bases.map(b=>({...createBase(b.x,b.team,b.type==='hq'),id:b.id,y:groundY(level,b.x)})),projectiles:[],effects:[],events:[],random:createRandom(seed),airRandom:createRandom(seed^0xa17c9e33),stats:{rifleShots:0,rocketShots:0,helicopterShots:0,damage:0,repairs:0},systems:{flight:true,troops:true,weapons:true,projectiles:true,damage:true,repairs:true,commanders:true,takeover:true,...systems}};
 for(const p of level.terrain.points)Object.freeze(p);Object.freeze(level.terrain.points);Object.freeze(level.terrain);Object.freeze(level.world);Object.freeze(level);
 w.groundPlans=new Map();w.airPlans=new Map();
 w.planGround=(layout,u,t,error=0)=>{const key=[u.team,u.x,u.y,t.x,t.observedVelocity||0,error].join(':');if(!w.groundPlans.has(key)){if(w.groundPlans.size>8192)w.groundPlans.clear();w.groundPlans.set(key,planTerrainRocket(layout,u,t,error));}const p=w.groundPlans.get(key);return p?{...p}:null;};
 w.planAir=(u,h)=>{const key=[u.team,u.x,u.y,h.x,h.y,h.observedVx,h.observedVy].join(':');if(!w.airPlans.has(key))w.airPlans.set(key,planAirShot(u,h));return w.airPlans.get(key);};
 w.helicopter=createHelicopter(groundY(level,level.helipad.x),1,level.helipad.x);
 w.commanders=[0,1].map(team=>{const f=level.factions.find(f=>f.team===team),hq=w.bases.find(b=>b.main&&b.team===team),enemy=w.bases.find(b=>b.main&&b.team!==team);const c=createCommander(team,{rules:{hqX:hq.x,spawnX:f.spawnX,rallyX:f.rallyX,defenseX:f.defenseX,goalX:enemy.x-(team===0?60:-60)},compositions:{intercept:f.wave,assault:{rifle:f.wave.rifle,rocket:f.wave.rocket+1},defense:{rifle:3,rocket:1}}});c.supply.balance=f.supply;if(team===0)c.strategy={mode:'MANUAL',label:'Manual deployment'};return c;});
 for(const f of level.factions)for(const initial of f.opening){const u=spawn(w,f.team,initial.type,initial.x);u.order={role:initial.order==='garrison'?'garrison':'opening-assault'};}
 return w;
}
export function buyInfantry(w,type){if(w.paused||w.result)return {unit:null,reason:'paused-or-finished'};const c=w.commanders[0];return purchaseUnit(c.supply,type,w.units.filter(u=>u.hp>0&&u.team===0).length,kind=>{const u=spawn(w,0,kind,c.rules.spawnX);u.order={role:'garrison'};record(w,{type:'purchase',unitId:u.id,kind});return u;});}
export function turnAircraft(w){if(!w.paused&&!w.result)return turnHelicopter(w.helicopter);return false;}
export function aircraftGround(w,x){const xs=[x-32,x,x+32,...w.level.terrain.points.filter(([a])=>a>x-32&&a<x+32).map(([a])=>a)];return Math.min(...xs.map(a=>groundY(w.level,a)));}
function damage(w,u,amount,weapon,extra={}){const hit=applyDamage(u,amount);u.damageTaken=(u.damageTaken||0)+hit.amount;w.stats.damage+=hit.amount;record(w,{type:'damage',weapon,...hit,...extra});return hit;}
export function explode(w,p,point){
 const radius=CAMPAIGN_BALANCE.blastRadius;w.effects.push({...point,age:0,kind:'blast',radius});record(w,{type:'explosion',x:point.x,y:point.y,team:p.team});
 if(!w.systems.damage)return;
 // Protected bunkers receive their original single shared event, before breach.
 for(const b of w.bases)if(!b.main&&b.team!==p.team&&boxDistance(point,{left:b.x-80,right:b.x+80,top:b.y-70,bottom:b.y})<=25){const guards=w.units.filter(u=>stationedBase(u,[b]));if(guards.length){b.coverFlash=.2;damage(w,guards[Math.floor(w.random()*guards.length)],1/3,'rocket',{covered:true,baseId:b.id});}}
 const candidates=w.units.filter(u=>u.hp>0&&u.team!==p.team&&!stationedBase(u,w.bases)).map(u=>({u,d:Math.hypot(u.x-point.x,u.y-point.y)})).filter(({u,d})=>d<radius&&visible(w.level,{x:point.x,y:point.y-.1},{x:u.x,y:u.y-20}));
 const allocation=allocateSplash(candidates.map(({u,d})=>({id:u.id,falloff:1-d/radius})),w.random,'shared');
 for(const share of allocation.shares)damage(w,w.units.find(u=>u.id===share.id),share.amount,'rocket',{covered:false,allocated:share.amount,budget:allocation.budget});
 if(w.systems.takeover)for(const e of rocketDefenseBlast(point,p.team,w.bases))record(w,e);
}
function choices(w){return allocateRocketTargets(w.units,w.helicopter.hp>0?w.helicopter:null,{stagger:true,airPlanner:w.planAir,groundSelector:u=>infantryTarget(w.level,u,w.units,w.bases,w.planGround)});}
function move(w,u,goal,distance){const old=u.x;let next=walkSurface(w.level,u.x,Math.sign(goal-u.x)*Math.min(distance,Math.abs(goal-u.x)));next=Math.max(Math.min(old,goal),Math.min(Math.max(old,goal),next));u.x=Math.max(40,Math.min(w.level.world.width-40,next));u.y=groundY(w.level,u.x);u.phase=(u.phase+Math.abs(u.x-old)/44)%1;u.observedVelocity=(u.x-old)/CAMPAIGN_STEP;}
function shot(w,u,p,weapon){p.id=w.nextRoundId++;w.projectiles.push(p);u.shotsFired++;if(u.firstShotAt===null)u.firstShotAt=w.time;w.stats[weapon==='rifle'?'rifleShots':'rocketShots']++;record(w,{type:'launch',weapon,team:u.team,shooterId:u.id,targetKind:p.targetKind??'ground',...p});}
function contactUnit(p,a,b,u){return segmentBox(a,b,p.kind==='helicopterBullet'?soldierBox(u):{left:u.x-7,right:u.x+7,top:u.y-54,bottom:u.y-8});}
function advanceProjectiles(w,previousHelicopter){
 w.projectiles=w.projectiles.filter(p=>{
  if(p.kind==='rocket'||p.kind==='airRocket'){
   const start=p.age,end=Math.min(p.flightTime,start+CAMPAIGN_STEP),a={x:p.x,y:p.y},b={x:p.originX+p.vx*end,y:p.originY+p.vy*end+120*end*end},terrain=terrainContact(w.level,a,b);
   let e=stepBattleRocket(p,CAMPAIGN_STEP,previousHelicopter,w.helicopter,groundY(w.level,b.x));
   const hitAge=terrain?start+(end-start)*terrain.t:Infinity;
   if(terrain&&(!e||hitAge<=e.age+1e-9)){p.age=hitAge;p.x=terrain.x;p.y=terrain.y;p.done=true;e={x:p.x,y:p.y,age:hitAge,cause:'ground',team:p.team,hull:lerpAircraft(previousHelicopter,w.helicopter,(hitAge-start)/CAMPAIGN_STEP)};}
   if(e){explode(w,p,e);if(w.systems.damage){const amount=helicopterBurstDamage(e,w.helicopter);if(amount){const dealt=damageHelicopter(w.helicopter,amount);record(w,{type:'helicopterDamage',amount:dealt,cause:e.cause});}}return false;}return true;
  }
  const delay=Math.min(p.spawnDelay||0,CAMPAIGN_STEP);p.spawnDelay=Math.max(0,(p.spawnDelay||0)-CAMPAIGN_STEP);const dt=Math.min(CAMPAIGN_STEP-delay,p.ttl??2);if(dt<=0)return p.ttl>0;
  const a={x:p.x,y:p.y},b={x:p.x+p.vx*dt,y:p.y+p.vy*dt},terrain=terrainContact(w.level,a,b);let first=terrain?.t??Infinity,victim=null;
  for(const u of w.units)if(u.hp>0&&u.team!==p.team){const t=contactUnit(p,a,b,u);if(t!==null&&t<first){first=t;victim=u;}}
  p.age+=dt;p.ttl-=dt;p.x=b.x;p.y=b.y;
  if(victim){const hit=w.systems.damage?(p.kind==='helicopterBullet'?resolveHelicopterHit(victim,w.bases,w.airRandom):resolveRifleHit(victim,w.bases,w.random)):{id:victim.id,amount:0,hp:victim.hp};victim.damageTaken=(victim.damageTaken||0)+hit.amount;w.stats.damage+=hit.amount;w.effects.push({x:victim.x,y:victim.y-32,kind:'hit',age:0});record(w,{type:'damage',weapon:p.kind==='helicopterBullet'?'helicopter':'rifle',...hit});return false;}
  if(terrain){record(w,{type:'terrainBlocked',weapon:p.kind});return false;}return p.ttl>0&&p.x>=0&&p.x<=w.level.world.width;
 });
}
export function stepWorld(w,input={},count=1){
 if(!Number.isInteger(count)||count<0||count>36000)throw Error('Invalid step count');
 for(let n=0;n<count;n++){
  if(w.paused||w.result)break;const dt=CAMPAIGN_STEP;w.airPlans.clear();w.tick++;w.time=w.tick*dt;const oldH={...w.helicopter};
  if(w.systems.flight){updateHelicopter(w.helicopter,input,dt,x=>aircraftGround(w,x),w.level.world.width,{respawn:false,damage:w.systems.damage});}
  if(w.systems.commanders){accrueSupply(w.commanders[0].supply,dt);updateCommander(w.commanders[1],dt,[...w.units],w.bases,(type,x)=>{const u=spawn(w,1,type,x);return u;},w.helicopter);}
  if(w.systems.repairs){const before=w.helicopter.hp;repairHelicopter(w.helicopter,dt,groundY(w.level,w.level.helipad.x));w.stats.repairs+=Math.max(0,w.helicopter.hp-before);}
  if(w.systems.flight)updateAircraftSupport(w.helicopter,dt,w.commanders[0].supply,{fire:!!input.fire,rearm:w.systems.repairs,replace:w.systems.commanders,ground:groundY(w.level,w.level.helipad.x)});
  if(w.systems.weapons)for(const p of updateHelicopterGun(w.helicopter,!!input.fire,dt,oldH)){p.id=w.nextRoundId++;w.projectiles.push(p);w.stats.helicopterShots++;}
  const beforeChoices=w.systems.weapons?choices(w):new Map(),targets=new Map(w.units.filter(u=>u.hp>0).map(u=>[u.id,!w.systems.weapons?null:u.type==='rocket'?beforeChoices.get(u.id)?.target:infantryTarget(w.level,u,w.units)]));
  for(const u of w.units)if(u.hp>0){u.hitFlash=Math.max(0,u.hitFlash-dt);u.observedVelocity=0;u.y=groundY(w.level,u.x);
   if(u.guardBase===null)for(const b of w.bases)if(!b.main&&b.team===u.team&&(b.x-u.x)*(u.team===0?1:-1)<=100&&(b.x-u.x)*(u.team===0?1:-1)>=-80&&assignDefender(b,u))break;
   const engaging=!!targets.get(u.id),order=commanderMovementOrder(w.commanders[u.team],u,w.units,dt),speed=Math.min(Math.abs(u.velocity)*(engaging?(u.type==='rifle'?.42:0):1),order?.maxSpeed??Infinity);
   if(w.systems.troops){let goal=u.team===0?w.level.world.width-40:40;
    if(u.guardBase!==null){const b=w.bases.find(b=>b.x===u.guardBase);goal=b.x+(u.type==='rocket'?0:u.guardSlot===0?-43:43);move(w,u,goal,Math.abs(u.velocity)*dt*(engaging?(u.type==='rifle'?.42:0):1));if(Math.abs(u.x-goal)<1e-6){u.arrived=true;b.slots[u.type][u.guardSlot]=u.id;}}
    else{const b=w.systems.takeover?rifleAssaultBase(u,w.bases):null;if(b)goal=capturePoint(b,u.team);move(w,u,goal,(b?Math.abs(u.velocity)*(engaging?.42:1):speed)*dt);}
   }
   u.mode='walk';u.state=engaging?(u.type==='rifle'?'fireWalk':'fireStop'):u.arrived?'guard':'march';
  }
  const afterChoices=w.systems.weapons?choices(w):new Map();
  for(const u of w.units)if(u.hp>0){const choice=afterChoices.get(u.id);if(u.type==='rifle'){
    const target=w.systems.weapons?infantryTarget(w.level,u,w.units):null;u.rifleAimAngle=rifleBearing(u,target);u.fireCooldown=Math.max(0,u.fireCooldown-dt);if(target&&u.fireCooldown<=1e-8){shot(w,u,rifleRound(u,target),'rifle');u.fireCooldown=.32;}
   }else if(w.systems.weapons){u.rocketAssignment=choice?.kind??null;u.rocketAllocation=choice?.allocation??null;let p;
    if(choice?.kind==='air'){p=updatePrioritizedRocket(u,choice,dt,w.random,w.airRandom);u.rocketAimAngle=u.rocketGoal?Math.atan2(u.rocketGoal.vy,u.rocketGoal.vx):null;}
    else{const kind=choice?.kind??null;if(u.rocketTargetKind!==kind){u.rocketTargetId=null;u.rocketAimTime=0;}u.rocketTargetKind=kind;p=updateGroundRocket(w.level,u,choice?.target??null,dt,w.time,w.random,w.planGround);}
    if(p)shot(w,u,p,'rocket');
   }
  }
  if(w.systems.projectiles)advanceProjectiles(w,oldH);
  w.effects=w.effects.filter(e=>(e.age+=dt)<.65);const alive=new Set(w.units.filter(u=>u.hp>0).map(u=>u.id));
  for(const b of w.bases){b.coverFlash=Math.max(0,(b.coverFlash||0)-dt);if(!b.main){releaseDeadDefenders(b,alive);refreshOccupation(b);b.flagProgress=Math.max(0,Math.min(1,b.flagProgress+(occupied(b)||b.everCaptured?1:-1)*dt*.8));}}
  if(w.systems.takeover){const events=w.bases.map(b=>updateTakeover(b,w.units,dt)).filter(Boolean);for(const e of events)record(w,e);w.result=headquartersResult(events,w.time);}
 }
 return w;
}
export function worldSnapshot(w){return {levelId:w.level.id,seed:w.seed,tick:w.tick,time:w.time,paused:w.paused,result:structuredClone(w.result),units:structuredClone(w.units),bases:structuredClone(w.bases),helicopter:{...w.helicopter},projectiles:structuredClone(w.projectiles),events:structuredClone(w.events),stats:{...w.stats},commanders:structuredClone(w.commanders),randomState:w.random.state(),airRandomState:w.airRandom.state()};}
