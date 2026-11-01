import {rocketSpread} from './weapons.js?v=1.3.1';
export const ANTI_AIR=Object.freeze({speed:450,gravity:240,minRange:225,maxRange:600,barrel:34,proximity:25});
const value=(p,t)=>p.reduce((n,c)=>n*t+c,0);
// Recursively bracket derivative roots, then bisect monotone polynomial pieces.
// Unlike sign-sampling this also finds tangent roots at the ballistic envelope.
export function polynomialRoots(coefficients,min=1e-7,max=12){
 let p=[...coefficients];while(p.length>1&&Math.abs(p[0])<1e-12)p.shift();
 if(p.length<2)return [];
 if(p.length===2){const t=-p[1]/p[0];return t>=min&&t<=max?[t]:[];}
 const critical=polynomialRoots(p.slice(0,-1).map((c,i)=>c*(p.length-1-i)),min,max),bounds=[min,...critical,max],roots=[];
 const add=t=>{if(!roots.some(r=>Math.abs(r-t)<1e-6))roots.push(t);};
 for(const t of bounds)if(Math.abs(value(p,t))<1e-5)add(t);
 for(let i=1;i<bounds.length;i++){let a=bounds[i-1],b=bounds[i],fa=value(p,a),fb=value(p,b);if(fa*fb>=0)continue;for(let n=0;n<60;n++){const m=(a+b)/2,f=value(p,m);if(fa*f<=0){b=m;fb=f;}else{a=m;fa=f;}}add((a+b)/2);}
 return roots.sort((a,b)=>a-b);
}
export function airPosition(r,t){return {x:r.originX+r.vx*t,y:r.originY+r.vy*t+.5*240*t*t};}
export function reachTime(vx,vy){return polynomialRoots([14400,240*vy,vx*vx+vy*vy,0,-360000])[0]??Infinity;}
function solve(shooter,target,offset={x:0,y:0}){
 const s=450,g=240,L=34,px=shooter.x,py=shooter.y-42,rx=target.x+offset.x-px,ry=target.y+offset.y-py,vx=target.observedVx??target.vx??0,vy=target.observedVy??target.vy??0;
 const roots=polynomialRoots([g*g/4,-g*vy,vx*vx+vy*vy-g*ry-s*s,2*(rx*vx+ry*vy)-2*s*L,rx*rx+ry*ry-L*L]);
 for(const t of roots){const qx=rx+vx*t,qy=ry+vy*t-.5*g*t*t,n=Math.hypot(qx,qy);if(!n||Math.abs(n-(L+s*t))>1e-3)continue;const ux=qx/n,uy=qy/n;if(uy>=-1e-8)continue;
  const originX=px+L*ux,originY=py+L*uy,rvx=ux*s,rvy=uy*s,expiryTime=reachTime(rvx,rvy);
  const terrainTime=(-rvy+Math.sqrt(rvy*rvy+2*g*(shooter.y-originY)))/g;
  return {originX,originY,vx:rvx,vy:rvy,flightTime:t,expiryTime,terrainTime,aimedX:target.x+offset.x+vx*t,aimedY:target.y+offset.y+vy*t,targetVelocity:vx,targetVy:vy};
 }
 return null;
}
export function planAirShot(shooter,target,error=0,{requireReach=true}={}){
 if(!target||target.hp<=0||target.team===shooter.team)return null;
 const roughRange=Math.hypot(target.x-shooter.x,target.y-(shooter.y-42));if(roughRange<191||roughRange>634)return null;
 const ideal=solve(shooter,target);if(!ideal)return null;
 const range=Math.hypot(target.x-ideal.originX,target.y-ideal.originY);
 if(range<225-1e-8||range>600+1e-8||requireReach&&ideal.flightTime>Math.min(ideal.expiryTime,ideal.terrainTime)+1e-7)return null;
 let plan=ideal;
 if(error){const dx=ideal.aimedX-ideal.originX,dy=ideal.aimedY-ideal.originY,n=Math.hypot(dx,dy);plan=solve(shooter,target,{x:-dy/n*error,y:dx/n*error});
  if(!plan){const theta=Math.atan2(ideal.vy,ideal.vx)+Math.atan2(error,range);const vx=450*Math.cos(theta),vy=450*Math.sin(theta);const originX=shooter.x+34*Math.cos(theta),originY=shooter.y-42+34*Math.sin(theta);plan={...ideal,originX,originY,vx,vy,expiryTime:reachTime(vx,vy),terrainTime:(-vy+Math.sqrt(vy*vy+480*(shooter.y-originY)))/240,scatterFallback:true};}
 }
 const actual=airPosition(plan,plan.flightTime);
 return {...plan,range,spread:rocketSpread(range),error,predictedX:ideal.aimedX,predictedY:ideal.aimedY,intendedX:plan.aimedX,intendedY:plan.aimedY,scatteredX:actual.x,scatteredY:actual.y};
}
export function launchAirRocket(shooter,target,random){const ideal=planAirShot(shooter,target);if(!ideal)return null;const error=(random()*2-1)*ideal.spread,plan=planAirShot(shooter,target,error);if(!plan)return null;const flightTime=Math.min(plan.expiryTime,plan.terrainTime),end=airPosition(plan,flightTime);return {...plan,kind:'airRocket',targetKind:'air',team:shooter.team,shooterId:shooter.id,targetId:target.id,targetX:target.x,targetY:target.y,age:0,x:plan.originX,y:plan.originY,interceptTime:plan.flightTime,flightTime,impactX:end.x,impactY:end.y,terminalCause:plan.terrainTime<=plan.expiryTime?'ground':'range'};}
