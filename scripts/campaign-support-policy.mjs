// CP-05: benchmark controller only. Uses actual controls, ammo, repairs and paid
// transactions; never installed as a blue purchasing/piloting AI in the game.
import {turnAircraft,buyInfantry} from '../docs/js/battlefield/campaign/world.js';
import {groundY,visible} from '../docs/js/battlefield/terrain/heightfield.js';
import {parkedOnPad,helicopterMuzzle} from '../docs/js/battlefield/aircraft/helicopter.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function createSupportPolicy(mode='active'){return {mode,phase:'sortie',purchaseIndex:0,sorties:0};}
export function benchmarkPurchases(w,p){
 if(w.tick%240!==0)return;
 const live=w.units.filter(u=>u.hp>0&&u.team===0),rifles=live.filter(u=>u.type==='rifle').length,rockets=live.length-rifles;
 const type=rifles<5?'rifle':rockets<5?'rocket':'rifle';const bought=buyInfantry(w,type);if(bought.unit)p.purchaseIndex++;

}
export function supportInput(w,p){
 const h=w.helicopter;if(p.mode==='none'||h.hp<=0)return {x:0,y:0,fire:false};const pad=w.level.helipad.x,padY=groundY(w.level,pad);
 if(h.ammo<1||h.hp<35||p.mode==='limited'&&w.stats.helicopterShots>=40)p.phase='return';
 if(p.phase==='return'&&parkedOnPad(h,padY)&&h.ammo>=115&&h.hp>=95&&(p.mode!=='limited'||w.stats.helicopterShots<40)){p.phase='sortie';p.sorties++;}
 const front=Math.max(700,...w.units.filter(u=>u.hp>0&&u.team===0&&u.type==='rifle'&&u.guardBase===null).map(u=>u.x));const enemies=w.units.filter(u=>u.hp>0&&u.team!==0).sort((a,b)=>(Math.abs(a.x-front)+(a.type==='rocket'?-180:0))-(Math.abs(b.x-front)+(b.type==='rocket'?-180:0)));const target=enemies[0];
 const goalX=p.phase==='return'?pad:target?.x??w.level.world.width/2;
 const terrainAhead=[h.x,clamp(h.x+h.vx,40,w.level.world.width-40),goalX].map(x=>groundY(w.level,x));
 let goalY=p.phase==='return'&&Math.abs(goalX-h.x)<200?padY-20:Math.max(70,Math.min(...terrainAhead)-130);
 const dx=goalX-h.x;let desiredVx=clamp(dx*.8,-140,140),fire=false;
 let x=clamp(((desiredVx-h.vx)*1.5+.45*h.vx)/210,-1,1);
 if(p.phase==='sortie'&&target&&Math.abs(h.y-goalY)<65){
  const dist=target.x-h.x,dy=target.y-32-h.y;if(Math.abs(dist)>180&&Math.sign(dist)!==h.facing&&h.turnTime<=0)turnAircraft(w);
  if(Math.abs(dist)>110&&Math.abs(dist)<650&&Math.sign(dist)===h.facing&&dy>10){const angle=Math.atan2(dy,Math.abs(dist));x=clamp(angle/(h.facing*.61),-1,1);const m=helicopterMuzzle(h),bearing=Math.atan2(target.y-32-m.y,target.x-m.x);let error=bearing-Math.atan2(m.dy,m.dx);error=Math.atan2(Math.sin(error),Math.cos(error));fire=h.turnTime<=0&&Math.abs(error)<.12&&visible(w.level,m,{x:target.x,y:target.y-32});}
  else if(Math.abs(dist)<=180)x=h.facing*.65;
 }
 const ay=clamp((goalY-h.y)*1.4-h.vy*2.5,-150,150),collective=(1-ay/330)/Math.max(.6,Math.cos(h.rotorAngle));
 let y=clamp((1-collective)/.8,-1,1);const incoming=w.projectiles.some(r=>r.kind==='airRocket'&&r.team!==h.team&&Math.hypot(r.x-h.x,r.y-h.y)<280);if(incoming&&p.mode==='active'){y=Math.sin(w.time*5)>0?-1:.7;x=clamp(x+Math.sin(w.time*3)*.25,-1,1);}return {x,y,fire:p.phase==='sortie'&&fire};
}
