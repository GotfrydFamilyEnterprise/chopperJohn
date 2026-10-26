// H-01..05: the accepted Flight School flight model, isolated from UI and combat.
export const FLIGHT = Object.freeze({maxPitch:.61,rotorRate:12,bodyRate:3.7,thrust:395,gravity:330,horizontalDamping:.45,verticalDamping:.9,maxHorizontal:270,maxVertical:200});
export const AIRCRAFT = Object.freeze({padX:400,padHalfWidth:90,hullHalfWidth:32,hullHalfHeight:12,hull:100,repairRate:5,respawnSeconds:10});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function createHelicopter(ground=460,generation=1){return {kind:'air',id:`helicopter:${generation}`,generation,team:0,x:AIRCRAFT.padX,y:ground-23,vx:0,vy:0,observedVx:0,observedVy:0,facing:1,angle:0,rotorAngle:0,turnTime:0,turnFrom:1,hp:100,ammo:120,rearming:false,fireCooldown:0,grounded:true,respawnRemaining:0,hitFlash:0,repairing:false,rotorTime:0};}
export function apparentFacing(h){return h.turnTime>0?h.turnFrom*Math.cos(Math.PI*(1-h.turnTime/.42)):h.facing;}
export function turnHelicopter(h){if(h.hp<=0||h.turnTime>0)return false;h.turnFrom=h.facing;h.facing=-h.facing;h.turnTime=.42;return true;}
export function damageHelicopter(h,amount){if(h.hp<=0||amount<=0)return 0;const dealt=Math.min(h.hp,amount);h.hp-=dealt;h.hitFlash=.15;if(h.hp<=1e-9){h.hp=0;h.respawnRemaining=10;h.repairing=false;}return dealt;}
export function parkedOnPad(h,ground=460){return h.hp>0&&h.grounded&&Math.abs(h.y-(ground-23))<1e-6&&Math.abs(h.x-400)+32<=90+1e-8&&Math.abs(h.vx)<=5&&Math.abs(h.vy)<1e-6;}
export function repairHelicopter(h,dt,ground=460){h.repairing=parkedOnPad(h,ground)&&h.hp<100;if(h.repairing)h.hp=Math.min(100,h.hp+5*dt);}
export function updateHelicopter(h,input,dt,ground=460,width=3600,{kinematic=false,damage=true,respawn=true}={}){
 if(!Number.isFinite(dt)||dt<0)throw new RangeError("Invalid flight timestep");if(dt===0)return {};
 if(h.hp<=0){h.respawnRemaining=Math.max(0,h.respawnRemaining-dt);if(respawn&&h.respawnRemaining<=1e-8){Object.assign(h,createHelicopter(ground,h.generation+1));return {respawned:true};}return {};}
 h.hitFlash=Math.max(0,h.hitFlash-dt);h.rotorTime+=dt;
 const oldX=h.x,oldY=h.y;
 if(kinematic){h.x+=h.vx*dt;h.y+=h.vy*dt;h.grounded=false;}
 else{
  const steer=clamp(input.x||0,-1,1),lift=clamp(input.y||0,-1,1);
  const requested=steer*h.facing*FLIGHT.maxPitch;
  h.rotorAngle+=(requested-h.rotorAngle)*(1-Math.exp(-FLIGHT.rotorRate*dt));
  h.angle+=(h.rotorAngle-h.angle)*(1-Math.exp(-FLIGHT.bodyRate*dt));
  const collective=clamp(1-lift*.8,.2,1.8);
  h.vx=(h.vx+h.facing*Math.sin(h.rotorAngle)*FLIGHT.thrust*collective*dt)*Math.exp(-FLIGHT.horizontalDamping*dt);
  h.vy=(h.vy+FLIGHT.gravity*(1-collective*Math.cos(h.rotorAngle)) *dt)*Math.exp(-FLIGHT.verticalDamping*dt);
  h.vx=clamp(h.vx,-270,270);h.vy=clamp(h.vy,-200,200);
  h.x=clamp(h.x+h.vx*dt,80,width-80);h.y=clamp(h.y+h.vy*dt,45,ground-23);
  const touchdown=h.y>=ground-23;
  if(touchdown){if(damage&&!h.grounded&&h.vy>95)damageHelicopter(h,35);h.vy=0;h.vx*=Math.exp(-8*dt);}
  if(h.y<=45)h.vy=0;
  if(h.x<=80||h.x>=width-80)h.vx=0;
  h.grounded=touchdown;
 }
 h.turnTime=Math.max(0,h.turnTime-dt);
 h.observedVx=(h.x-oldX)/dt;h.observedVy=(h.y-oldY)/dt;
 return {};
}
export function helicopterMuzzle(h){const f=apparentFacing(h),ca=Math.cos(h.angle),sa=Math.sin(h.angle);const dx=f*ca,dy=sa,n=Math.hypot(dx,dy);return {x:h.x+f*(36*ca-4*sa),y:h.y+36*sa+4*ca,dx:n>1e-3?dx/n:0,dy:n>1e-3?dy/n:0};}
