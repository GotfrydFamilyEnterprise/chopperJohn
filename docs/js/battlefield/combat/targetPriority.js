import {chooseRocketTarget,updateRocketWeapon,WEAPONS} from './weapons.js';
import {planAirShot,launchAirRocket} from './airInterception.js';
// AA-PRIORITY: a reachable helicopter immediately preempts a ground aim lock.
// The shared weapon clock is advanced exactly once, regardless of target kind.
export function chooseRocketThreat(unit,units,helicopter){
 const plan=helicopter?planAirShot(unit,helicopter):null;
 if(plan)return {kind:'air',target:helicopter,plan};
 const target=chooseRocketTarget(unit,units);return target?{kind:'ground',target}:null;
}
export function updatePrioritizedRocket(unit,choice,dt,groundRandom,airRandom){
 const kind=choice?.kind??null,target=choice?.target??null;
 if(unit.rocketTargetKind!==kind){unit.rocketTargetId=null;unit.rocketAimTime=0;}
 unit.rocketTargetKind=kind;
 if(kind!=='air'){unit.rocketAirAim=null;return updateRocketWeapon(unit,target,dt,groundRandom);}
 const previous=unit.rocketCooldown||0;unit.rocketCooldown=Math.max(0,previous-dt);
 if(unit.rocketTargetId!==target.id){unit.rocketAimTime=0;unit.rocketTargetId=target.id;}
 const plan=choice.plan;
 unit.rocketAirAim=Math.atan2(plan.vy,plan.vx*(unit.team===0?1:-1));
 unit.rocketGoal={...plan,targetKind:'air',targetId:target.id,impactX:plan.aimedX,impactY:plan.aimedY};
 if(unit.rocketCooldown>1e-9)return null;
 unit.rocketAimTime=(unit.rocketAimTime||0)+Math.max(0,dt-previous);
 if(unit.rocketAimTime+1e-9<WEAPONS.rocketAimSeconds)return null;
 const rocket=launchAirRocket(unit,target,airRandom);if(!rocket){unit.rocketAimTime=0;return null;}
 unit.rocketAimTime=0;unit.rocketCooldown=3;return rocket;
}
