import {groundY} from './heightfield.js?v=0.3.0';
// TL-07: playground tuning; production weapon range/speed is untouched.
export const LAB_ROCKET=Object.freeze({minRange:225,maxRange:800,maxSpeed:520,gravity:240,barrel:34,timeStep:.02,maxFlight:7.8,clearance:2});
export function labRocketSpread(distance){
 const r=Math.max(225,Math.min(LAB_ROCKET.maxRange,distance));
 if(r<=350)return 5+(r-225)*15/125;
 if(r<=500)return 20+(r-350)*30/150;
 return 50+(r-500)*.16;
}
export function ballisticPosition(shot,t){return {x:shot.originX+shot.vx*t,y:shot.originY+shot.vy*t+LAB_ROCKET.gravity*t*t/2};}
// On each linear ground segment clearance is a concave quadratic, so its
// minimum occurs at an endpoint. Check every crossed terrain vertex exactly.
export function clearsTerrain(level,shot){
 const {originX,originY,vx,flightTime}=shot;
 if(groundY(level,originX)-originY<LAB_ROCKET.clearance)return false;
 for(const [x] of level.terrain.points){
  const t=(x-originX)/vx;
  if(t>1e-8&&t<flightTime-1e-8){const p=ballisticPosition(shot,t);if(groundY(level,x)-p.y<LAB_ROCKET.clearance)return false;}
 }
 return true;
}
// Deterministic bounded search: first feasible flight in 20ms increments.
// Direction includes the real barrel length, so aim, muzzle and flight agree.
export function planTerrainRocket(level,u,target,error=0){
 const dir=u.team===0?1:-1,shoulder={x:u.x,y:u.y-42},velocity=target.observedVelocity||0;
 const initialAim=Math.max(0,Math.min(level.world.width,target.x));
 const initialImpact=Math.max(0,Math.min(level.world.width,initialAim+error));
 const start=Math.max(.1,(Math.abs(initialImpact-u.x)-LAB_ROCKET.barrel)/(LAB_ROCKET.maxSpeed+Math.abs(velocity)));
 for(let index=0;;index++){
  const t=start+index*LAB_ROCKET.timeStep;if(t>LAB_ROCKET.maxFlight)return null;
  const aimedX=Math.max(0,Math.min(level.world.width,target.x+velocity*t));
  const impactX=Math.max(0,Math.min(level.world.width,aimedX+error));
  const dx=impactX-shoulder.x,dy=groundY(level,impactX)-shoulder.y-LAB_ROCKET.gravity*t*t/2;
  if(dx*dir<=0)continue;
  const length=Math.hypot(dx,dy),speed=(length-LAB_ROCKET.barrel)/t;
  const nx=dx/length,ny=dy/length,elevation=Math.atan2(-ny,nx*dir);
  if(speed<=0||speed>LAB_ROCKET.maxSpeed+1e-8||elevation<8*Math.PI/180||elevation>80*Math.PI/180)continue;
  const originX=shoulder.x+LAB_ROCKET.barrel*nx,originY=shoulder.y+LAB_ROCKET.barrel*ny;
  const shot={x:originX,y:originY,originX,originY,vx:nx*speed,vy:ny*speed,flightTime:t,impactX,aimedX,targetVelocity:velocity,angle:Math.atan2(ny,nx),elevation,speed,error,age:0};
  if(clearsTerrain(level,shot))return shot;
 }
}
// TL-07: the visual tracer follows exactly the projectile's velocity vector.
export function projectileTail(p,length=15){
 const vy=p.vy+(p.kind==='rocket'?LAB_ROCKET.gravity*p.age:0),speed=Math.hypot(p.vx,vy);
 if(!speed)return {x:p.x,y:p.y};
 return {x:p.x-p.vx/speed*length,y:p.y-vy/speed*length};
}
