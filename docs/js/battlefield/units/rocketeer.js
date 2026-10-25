import {createSoldier,drawBody,endBody,updateWalking} from "./soldierCommon.js";
export function createRocketeer(id,team,x,ground){return createSoldier(id,team,"rocket",x,ground);}
export function updateRocketeer(u,dt,enemyNearby){
 // Stop to shoulder the launcher; no projectiles or damage in this animation pass.
 u.state=u.guardBase!==null?"fireStop":enemyNearby?"fireStop":"march";
 if(enemyNearby)u.timer+=dt;
 else updateWalking(u,dt,1);
}
export function drawRocketeer(ctx,u){
 const aiming=u.state==="fireStop",p=drawBody(ctx,u,aiming?0:1),b=p.bob;
 ctx.strokeStyle=p.colors.body;ctx.lineWidth=3;
 if(aiming){
   // Launcher is horizontal and supported at the shoulder.
   ctx.fillStyle="#626b5d";ctx.fillRect(-5,-46-b,39,9);
   ctx.fillStyle="#c0ad7f";ctx.fillRect(27,-49-b,8,4);
   p.line([0,-34-b],[8,-41-b]);p.line([8,-41-b],[20,-40-b]);
   p.line([0,-34-b],[-6,-31-b]);p.line([-6,-31-b],[8,-41-b]);
 }else{
   // Tube secured diagonally on the back while marching.
   ctx.save();ctx.translate(-13,-34-b);ctx.rotate(-.73);
   ctx.fillStyle="#626b5d";ctx.fillRect(-20,-4,42,9);
   ctx.fillStyle="#c0ad7f";ctx.fillRect(16,-6,8,4);ctx.restore();
   p.line([0,-34-b],[10,-22-b]);p.line([10,-22-b],[2,-18-b]);
   p.line([0,-34-b],[-11,-27-b]);p.line([-11,-27-b],[-5,-21-b]);
 }
 endBody(ctx);
}
