// CP-03: renderer consumes world state; it never advances combat or RNG.
import {groundY} from '../terrain/heightfield.js?v=2.0.0';
import {drawTerrainSoldier} from '../terrain/renderer.js?v=2.0.0';
import {drawHeadquarters} from '../bases/headquarters.js?v=2.0.0';
import {drawForwardBase,drawForwardFront} from '../bases/forwardBase.js?v=2.0.0';
import {drawTakeover} from '../bases/takeoverRenderer.js?v=2.0.0';
import {drawHelicopter,drawHelipad} from '../aircraft/helicopterRenderer.js?v=2.0.0';
import {projectileTail} from '../terrain/ballistics.js?v=2.0.0';
export function drawCampaign(ctx,width,height,w,{scale,camera,offsetY}){
 ctx.clearRect(0,0,width,height);const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#14283e');sky.addColorStop(1,'#385b61');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);if(!w)return;
 ctx.save();ctx.translate(0,offsetY);ctx.scale(scale,scale);ctx.translate(-camera,0);
 const points=w.level.terrain.points;ctx.beginPath();ctx.moveTo(-1000,1000);ctx.lineTo(-1000,groundY(w.level,0));for(const[x]of points)ctx.lineTo(x,groundY(w.level,x));ctx.lineTo(w.level.world.width+1000,groundY(w.level,w.level.world.width));ctx.lineTo(w.level.world.width+1000,1000);ctx.closePath();ctx.fillStyle='#3e5c46';ctx.fill();
 ctx.beginPath();points.forEach(([x],i)=>i?ctx.lineTo(x,groundY(w.level,x)):ctx.moveTo(x,groundY(w.level,x)));ctx.strokeStyle='#9daf79';ctx.lineWidth=5;ctx.stroke();
 for(let x=Math.max(0,Math.floor(camera/100)*100);x<Math.min(w.level.world.width,camera+width/scale+100);x+=100){ctx.fillStyle='#a6b88c';ctx.fillRect(x,groundY(w.level,x)+15,25,2);}
 ctx.save();ctx.translate(w.level.helipad.x-400,groundY(w.level,w.level.helipad.x)-460);drawHelipad(ctx,460);ctx.restore();
 for(const b of w.bases){ctx.save();ctx.translate(0,b.y-460);if(b.main)drawHeadquarters(ctx,b);else drawForwardBase(ctx,b);ctx.restore();}
 for(const u of w.units)if(u.hp>0)drawTerrainSoldier(ctx,u,w.level);
 for(const b of w.bases){ctx.save();ctx.translate(0,b.y-460);if(!b.main)drawForwardFront(ctx,b);drawTakeover(ctx,b);ctx.restore();}
 for(const p of w.projectiles){if(p.kind==='rocket'||p.kind==='airRocket'){ctx.strokeStyle='#e0c091';ctx.lineWidth=1.5;ctx.beginPath();for(let j=0;j<=8;j++){const t=Math.max(0,p.age-(8-j)*.025),x=p.originX+p.vx*t,y=p.originY+p.vy*t+120*t*t;if(j)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();}const tail=projectileTail(p);ctx.strokeStyle=p.kind==='rocket'||p.kind==='airRocket'?'#ffb75f':'#fff1b4';ctx.lineWidth=p.kind==='rocket'||p.kind==='airRocket'?4:2;ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(p.x,p.y);ctx.stroke();}
 for(const e of w.effects){ctx.globalAlpha=Math.max(0,1-e.age/.65);ctx.fillStyle=e.kind==='blast'?'#ffc579':'#fff7dc';ctx.beginPath();ctx.arc(e.x,e.y,e.kind==='blast'?8+e.age*25:4,0,Math.PI*2);ctx.fill();if(e.radius){ctx.strokeStyle='#eec482';ctx.lineWidth=1;ctx.beginPath();ctx.arc(e.x,e.y,e.radius,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;}
 drawHelicopter(ctx,w.helicopter);ctx.restore();
}
