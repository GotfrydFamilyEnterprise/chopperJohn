import {infantryTarget,rifleBearing,rifleRound,updateGroundRocket} from '../combat/groundInfantry.js?v=2.2.0';
import {allocateSplash,checkedDamageModel} from './splash.js?v=2.2.0';
import {checkedBlastRadius} from './balance.js?v=2.2.0';
import {LAB_ROCKET,labRocketSpread,planTerrainRocket,rocketReachAtDrop} from './ballistics.js?v=2.2.0';
import {validateLevel} from './level.js?v=2.2.0';
import {groundY,terrainContact,visible,walkSurface} from './heightfield.js?v=2.2.0';
import {createSoldier} from '../units/soldierCommon.js?v=2.2.0';
import {WEAPONS,createRandom,applyDamage} from '../combat/weapons.js?v=2.2.0';
export const LAB_STEP=1/120;
export const eye=u=>({x:u.x,y:u.y-40});
export function createSimulation(data,scenarioId,options={}){
 const level=validateLevel(data),scenario=level.scenarios.find(s=>s.id===scenarioId);
 if(!scenario)throw new Error('Unknown scenario');
 return {level,scenarioId,blastRadius:checkedBlastRadius(options.blastRadius),damageModel:checkedDamageModel(options.damageModel),time:0,tick:0,result:null,random:createRandom(level.seed),units:scenario.units.map(u=>({...createSoldier(u.id,u.team,u.type,u.x,groundY(level,u.x)),mode:u.mode,shotsFired:0,firstShotAt:null,damageTaken:0})),projectiles:[],effects:[],events:[],stats:{rifleShots:0,rocketShots:0,terrainHits:0,hits:0}};
}
export function targetFor(sim,u){
 if(!sim.level.scenarios.find(s=>s.id===sim.scenarioId).combat)return null;
 return infantryTarget(sim.level,u,sim.units);
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
 const candidates=sim.units.filter(u=>u.hp>0&&u.team!==p.team).map(u=>({u,distance:Math.hypot(u.x-point.x,u.y-point.y)})).filter(({u,distance})=>distance<sim.blastRadius&&visible(sim.level,{x:point.x,y:point.y-.1},{x:u.x,y:u.y-20}));
 const allocation=allocateSplash(candidates.map(({u,distance})=>({id:u.id,falloff:1-distance/sim.blastRadius})),sim.random,sim.damageModel);
 sim.stats.terrainHits++;sim.effects.push({...point,age:0,kind:'blast',radius:sim.blastRadius,budget:allocation.budget});event(sim,{type:'rocketImpact',x:point.x,y:point.y,budget:allocation.budget,damageModel:sim.damageModel});
 // Allocate before applying HP: overkill is discarded, never smartly redirected.
 for(const share of allocation.shares){const u=sim.units.find(u=>u.id===share.id);if(share.amount>0){const damage=damageUnit(u,share.amount);sim.stats.hits++;event(sim,{type:'damage',weapon:'rocket',allocated:share.amount,...damage});}}
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
   u.rifleAimAngle=rifleBearing(u,target);
   u.fireCooldown=Math.max(0,u.fireCooldown-LAB_STEP);
   if(u.type==='rifle'&&target&&u.fireCooldown<=1e-8){
    // Real muzzle and uphill/downhill trajectory, no hidden penetration roll.
    sim.projectiles.push(rifleRound(u,target));
    recordShot(sim,u);sim.stats.rifleShots++;u.fireCooldown=.32;event(sim,{type:'rifleShot',id:u.id,x:u.x,y:u.y});
   }
   if(u.type==='rocket'){
    const dir=u.team===0?1:-1,focus=target||sim.units.filter(v=>v.hp>0&&v.team!==u.team&&(v.x-u.x)*dir>0).sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)||a.id-b.id)[0];
    u.rocketReach=focus?{targetId:focus.id,distance:Math.abs(focus.x-u.x),drop:focus.y-(u.y-42),terrainDrop:focus.y-u.y,clearAir:rocketReachAtDrop(focus.y-(u.y-42)),reachable:!!target}:null;
    const rocket=updateGroundRocket(sim.level,u,target,LAB_STEP,sim.time,sim.random);
    if(rocket){sim.projectiles.push(rocket);recordShot(sim,u);sim.stats.rocketShots++;event(sim,{type:'rocketShot',id:u.id,error:rocket.error,impactX:rocket.impactX,angle:rocket.angle,flightTime:rocket.flightTime,speed:rocket.speed});}
   }
  }
  sim.projectiles=sim.projectiles.filter(p=>{
   const a={x:p.kind==='bullet'?(p.originX??p.x):p.x,y:p.kind==='bullet'?(p.originY??p.y):p.y};if(p.kind==='bullet'){delete p.originX;delete p.originY;}p.age+=LAB_STEP;
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
export function snapshot(sim){return {levelId:sim.level.id,scenarioId:sim.scenarioId,blastRadius:sim.blastRadius,damageModel:sim.damageModel,tick:sim.tick,time:sim.time,result:sim.result?{...sim.result}:null,randomState:sim.random.state(),units:structuredClone(sim.units),projectiles:structuredClone(sim.projectiles),effects:structuredClone(sim.effects),events:structuredClone(sim.events),stats:{...sim.stats}};}
