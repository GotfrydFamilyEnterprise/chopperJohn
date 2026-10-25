import {createSoldier,drawBody,endBody,updateWalking} from "./soldierCommon.js";
export function createRifleman(id,team,x,ground){return createSoldier(id,team,"rifle",x,ground);}
export function updateRifleman(u,dt,enemyNearby){
 // Aiming is animated without creating projectiles yet.
 u.state=u.guardBase!==null?"guard":enemyNearby?"fireWalk":"march";
 if(u.state==="guard")u.timer+=dt;
 else updateWalking(u,dt,enemyNearby?.42:1);
}
export function drawRifleman(ctx,u){
 const firing=u.state==="fireWalk"||u.state==="guard";
 const p=drawBody(ctx,u,1),b=p.bob;
 ctx.strokeStyle=p.colors.body;ctx.lineWidth=3;
 if(firing){
   // Rear hand stabilizes stock against shoulder; forward hand grips fore-end.
   p.line([-1,-34-b], [5,-34-b]);p.line([5,-34-b],[14,-36-b]);
   p.line([0,-34-b],[10,-30-b]);p.line([10,-30-b],[22,-36-b]);
   ctx.fillStyle="#373d43";ctx.fillRect(4,-39-b,29,4);
   ctx.fillRect(14,-35-b,4,8);ctx.fillStyle="#e0bf82";ctx.fillRect(29,-39-b,5,2);
 }else{
   // Low-ready: clearly below the chest, never at shoulder height.
   p.line([0,-34-b],[7,-24-b]);p.line([7,-24-b],[13,-23-b]);
   p.line([0,-34-b],[-6,-25-b]);p.line([-6,-25-b],[20,-24-b]);
   ctx.fillStyle="#373d43";ctx.fillRect(7,-27-b,29,4);ctx.fillRect(15,-23-b,4,8);
   ctx.fillStyle="#e0bf82";ctx.fillRect(31,-27-b,5,2);
 }
 if(u.hitFlash>0){ctx.globalAlpha=.45;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(0,-31-b,18,0,Math.PI*2);ctx.fill();}
 endBody(ctx);
}
