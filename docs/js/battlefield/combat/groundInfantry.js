// CP-02: shared terrain infantry rules for the lab and campaign battlefield.
import {LAB_ROCKET,planTerrainRocket,labRocketSpread} from '../terrain/ballistics.js?v=2.1.0';
import {groundY,visible,walkSurface} from '../terrain/heightfield.js?v=2.1.0';
export const infantryEye=u=>({x:u.x,y:u.y-40});
export function infantryTarget(level,u,units,bases=[],plan=planTerrainRocket){
 const dir=u.team===0?1:-1;
 const candidates=units.filter(v=>v.hp>0&&v.team!==u.team&&(v.x-u.x)*dir>=(u.type==='rifle'?0:225)&&(u.type!=='rifle'||(v.x-u.x)*dir<=250));
 if(u.type==='rocket')for(const b of bases)if(b.team!==u.team&&b.defensePoints>0&&(b.x-u.x)*dir>=225)candidates.push({kind:'base',id:'base:'+b.id,x:b.x,y:b.y,team:b.team,hp:b.defensePoints,observedVelocity:0});
 candidates.sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)||(typeof a.id==='number'&&typeof b.id==='number'?a.id-b.id:String(a.id)<String(b.id)?-1:1));
 return candidates.find(v=>u.type==='rocket'?!!plan(level,u,v):visible(level,infantryEye(u),infantryEye(v)))??null;
}
export function walkInfantry(level,u,distance,dt){
 const before=u.x;u.x=Math.max(40,Math.min(level.world.width-40,walkSurface(level,u.x,distance)));u.y=groundY(level,u.x);u.observedVelocity=(u.x-before)/dt;u.phase=(u.phase+Math.abs(u.x-before)/44)%1;
}
export function rifleBearing(u,target){return target?Math.atan2(target.y-32-(u.y-37),target.x-(u.x+(u.team===0?5:-5))):null;}
export function rifleRound(u,target){const angle=rifleBearing(u,target);return {originX:u.x+(u.team===0?5:-5),originY:u.y-37,x:u.x+(u.team===0?5:-5)+29*Math.cos(angle),y:u.y-37+29*Math.sin(angle),vx:900*Math.cos(angle),vy:900*Math.sin(angle),shooterId:u.id,age:0,ttl:2,kind:'bullet',team:u.team};}
export function updateGroundRocket(level,u,target,dt,time,random,planShot=planTerrainRocket){
 const goal=target?planShot(level,u,target):null;u.rocketGoal=goal;u.rocketAimAngle=time-(u.lastRocketAt??-Infinity)<.15?u.lastRocketAngle:goal?.angle??null;
 u.rocketCooldown=Math.max(0,(u.rocketCooldown||0)-dt);
 if(!target||u.rocketTargetId!==target.id){u.rocketAimTime=0;u.rocketTargetId=target?.id??null;}
 if(!target||u.rocketCooldown>1e-8)return null;
 u.rocketAimTime=(u.rocketAimTime||0)+dt;
 if(u.rocketAimTime+1e-8<.7)return null;
 const error=(random()*2-1)*labRocketSpread(Math.abs(target.x-u.x))*(u.team===0?1:-1),plan=planShot(level,u,target,error);
 u.rocketAimTime=0;u.rocketCooldown=3;
 if(!plan)return null;u.rocketAimAngle=plan.angle;u.lastRocketAngle=plan.angle;u.lastRocketAt=time;
 return {...plan,kind:'rocket',team:u.team,shooterId:u.id,targetId:target.id,targetKind:target.kind==='base'?'base':'ground',spread:labRocketSpread(Math.abs(target.x-u.x))};
}
