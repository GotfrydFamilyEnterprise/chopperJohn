import {helicopterMuzzle} from '../aircraft/helicopter.js';
import {segmentBox,soldierBox,lerpAircraft} from './collision2d.js';
import {stationedBase,applyDamage} from './weapons.js';
// HG-01..03: no rifle damage rules are changed by the aircraft gun.
export function updateHelicopterGun(h,fire,dt,previous=h){
 const prior=h.fireCooldown;h.fireCooldown=Math.max(0,prior-dt);
 if(!fire||h.hp<=0||h.ammo<1-1e-8)return [];
 const shots=[];let offset=prior;
 while(offset<dt-1e-9&&h.ammo>=1-1e-8){const at=lerpAircraft(previous,h,dt?offset/dt:1),m=helicopterMuzzle(at);if(m.dx||m.dy){h.ammo=Math.max(0,h.ammo-1);shots.push({kind:'helicopterBullet',team:h.team,x:m.x,y:m.y,vx:m.dx*680+h.vx,vy:m.dy*680+h.vy,ttl:1.2,age:0,spawnDelay:offset});}offset+=.125;}
 h.fireCooldown=Math.max(0,offset-dt);return shots;
}
export function resolveHelicopterHit(u,bases,random){const cover=stationedBase(u,bases),damage=cover?(random()<.10?1:0):1;if(cover)cover.coverFlash=.12;return {covered:!!cover,...applyDamage(u,damage)};}
export function stepHelicopterBullet(p,dt,units,bases,random,ground=460,damage=true){
 const delay=Math.min(p.spawnDelay||0,dt);p.spawnDelay=Math.max(0,(p.spawnDelay||0)-dt);if(dt-delay<=0)return null;
 const duration=Math.min(dt-delay,p.ttl),a={x:p.x,y:p.y},b={x:p.x+p.vx*duration,y:p.y+p.vy*duration};
 let first=p.vy>0?(ground-a.y)/(b.y-a.y):Infinity,victim=null;
 if(first<0||first>1)first=Infinity;
 for(const u of units){if(u.hp<=0||u.team===p.team)continue;const hit=segmentBox(a,b,soldierBox(u));if(hit!==null&&hit<first){first=hit;victim=u;}}
 p.ttl-=duration;p.age+=duration;
 if(first<=1){p.x=a.x+(b.x-a.x)*first;p.y=a.y+(b.y-a.y)*first;p.ttl=0;return victim?{x:p.x,y:p.y,team:p.team,weapon:'helicopterGun',...(damage?resolveHelicopterHit(victim,bases,random):{id:victim.id,amount:0,hp:victim.hp,covered:!!stationedBase(victim,bases)})}:null;}
 p.x=b.x;p.y=b.y;return null;
}
