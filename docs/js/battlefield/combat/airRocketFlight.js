import {airPosition} from './airInterception.js';
import {hullDistance,lerpAircraft,boxDistance,soldierBox} from './collision2d.js';
import {stationedBase,applyDamage} from './weapons.js?v=1.3.1';
// AA-COLLISION: <=4ms curved substeps (gravity chord error <0.0005 units),
// with bounded minimization and bisection against the interpolated moving hull.
export function stepBattleRocket(r,dt,previousHelicopter,helicopter,ground=460){
 if(r.done)return null;
 const start=r.age,end=Math.min(r.flightTime,start+dt),duration=end-start;
 let event=null;
 if(helicopter?.hp>0&&helicopter.team!==r.team&&duration>0){
  const pose=t=>lerpAircraft(previousHelicopter??helicopter,helicopter,(t-start)/dt);
  const distance=t=>hullDistance(airPosition(r,t),pose(t));
  const derivative=t=>(distance(t+1e-5)-distance(t-1e-5))/2e-5;
  const pieces=Math.max(1,Math.ceil(duration/.004));
  for(let i=0;i<pieces&&!event;i++){
   const a=start+duration*i/pieces,b=start+duration*(i+1)/pieces;
   let lo=a,hi=b;for(let j=0;j<22;j++){const m1=lo+(hi-lo)/3,m2=hi-(hi-lo)/3;if(distance(m1)<distance(m2))hi=m2;else lo=m1;}
   const tm=(lo+hi)/2,dm=distance(tm);
   if(distance(a)<=2+1e-7){event={age:a,cause:'direct',hull:pose(a)};break;}
   if(dm<=2+1e-7){let l=a,h=tm;for(let j=0;j<30;j++){const m=(l+h)/2;if(distance(m)<=2)h=m;else l=m;}event={age:(l+h)/2,cause:'direct',hull:pose((l+h)/2)};break;}
   if(dm<=25+1e-7&&derivative(a)<0&&derivative(b)>=0){let l=a,h=b;for(let j=0;j<28;j++){const m=(l+h)/2;if(derivative(m)>=0)h=m;else l=m;}const t=(l+h)/2;event={age:t,cause:'proximity',hull:pose(t)};break;}
   if(a===0&&distance(a)<=25&&derivative(a)>=0){event={age:a,cause:'proximity',hull:pose(a)};break;}
  }
 }
 if(!event&&end>=r.flightTime-1e-9)event={age:r.flightTime,cause:r.kind==='airRocket'?r.terminalCause:'ground',hull:helicopter?.hp>0?lerpAircraft(previousHelicopter??helicopter,helicopter,(r.flightTime-start)/dt):null};
 r.age=event?.age??end;Object.assign(r,airPosition(r,r.age));
 if(event){r.done=true;return {...event,x:r.x,y:event.cause==='ground'?ground:r.y,team:r.team,id:r.id};}
 return null;
}
export function resolveAirburstGround(point,team,units,bases,random){
 const hits=[];
 for(const base of bases){if(base.main||base.team===team||boxDistance(point,{left:base.x-80,right:base.x+80,top:460-70,bottom:460})>25)continue;const guards=units.filter(u=>stationedBase(u,[base]));if(guards.length){base.coverFlash=.2;const victim=guards[Math.floor(random()*guards.length)];hits.push({covered:true,baseX:base.x,...applyDamage(victim,1/3)});}}
 for(const u of units){if(u.hp<=0||u.team===team||stationedBase(u,bases))continue;const d=boxDistance(point,soldierBox(u));if(d<25)hits.push({covered:false,...applyDamage(u,2*(1-d/25))});}
 return hits;
}
export function helicopterBurstDamage(event,helicopter){if(!helicopter||helicopter.hp<=0||event.team===helicopter.team)return 0;const pose=event.hull?.id===helicopter.id?event.hull:helicopter;if(event.cause==='direct'&&event.hull?.id===helicopter.id)return 20;return hullDistance(event,pose)<=25+1e-6?5:0;}
