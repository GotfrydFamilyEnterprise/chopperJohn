import {clamp} from "./units/soldierCommon.js?v=0.4.1";
import {createRifleman,updateRifleman,drawRifleman} from "./units/rifleman.js?v=0.4.1";
import {createRocketeer,updateRocketeer,drawRocketeer} from "./units/rocketeer.js?v=0.4.1";
import {createBase} from "./bases/baseCommon.js?v=0.4.1";
import {drawHeadquarters} from "./bases/headquarters.js?v=0.4.1";
import {drawForwardBase,occupied,assignDefender,releaseDeadDefenders} from "./bases/forwardBase.js?v=0.4.1";
const cv=document.getElementById("field"),ctx=cv.getContext("2d");
const W=3600,GROUND=460,DT=1/60,RIFLE_RANGE=250,ROCKET_RANGE=420;
let viewW=innerWidth,viewH=innerHeight,ratio=1,scale=1,camera=0,dragId=null,lastPointerX=0,dragDistance=0,acc=0,last=0,time=0,paused=false,units=[],bases=[],bullets=[],nextId=1;
function resize(){viewW=innerWidth;viewH=innerHeight;ratio=Math.min(devicePixelRatio||1,2);cv.width=Math.round(viewW*ratio);cv.height=Math.round(viewH*ratio);scale=Math.max(.58,Math.min(viewH/585,1.35));camera=clamp(camera,0,Math.max(0,W-viewW/scale));}
function spawn(team,type,x){units.push(type==="rifle"?createRifleman(nextId++,team,x,GROUND):createRocketeer(nextId++,team,x,GROUND));}
function reset(){units=[];bullets=[];nextId=1;time=0;camera=0;paused=false;document.getElementById("pause").textContent="Pause";
 bases=[createBase(110,0,true),createBase(W-110,1,true),createBase(1120,0,false),createBase(W-1120,1,false)];
 for(let i=0;i<3;i++){spawn(0,"rifle",220+i*36);spawn(1,"rifle",W-220-i*36);}
 spawn(0,"rocket",170);spawn(1,"rocket",W-170);
}
function command(team,type){spawn(team,type,team===0?200:W-200);}
function nearestEnemy(u,range){
 const forward=u.team===0?1:-1;
 let best=null,dist=Infinity;
 for(const e of units)if(e.hp>0&&e.team!==u.team){
  const d=(e.x-u.x)*forward;
  if(d>=0&&d<=range&&d<dist){best=e;dist=d;}
 }
 return best;
}
function update(dt){if(paused)return;time+=dt;
 for(const b of bases)if(!b.main){
  b.flagProgress=clamp(b.flagProgress+(occupied(b)?1:-1)*dt*.8,0,1);
 }
 for(const u of units){
  if(u.hp<=0)continue;
  u.hitFlash=Math.max(0,u.hitFlash-dt);
  // Reserve the first matching arrivals; further infantry bypass a full FOB.
  if(u.guardBase===null)for(const b of bases)if(!b.main&&b.team===u.team){
   if(Math.abs(u.x-b.x)<Math.max(8,Math.abs(u.velocity)*dt+3)&&assignDefender(b,u))break;
  }
  const target=nearestEnemy(u,u.type==="rifle"?RIFLE_RANGE:ROCKET_RANGE);
  if(u.type==="rifle"){
   updateRifleman(u,dt,!!target);
   u.fireCooldown-=dt;
   if(target&&u.fireCooldown<=0){
    const direction=u.team===0?1:-1;
    bullets.push({x:u.x+direction*33,y:GROUND-37,vx:direction*630,team:u.team,ttl:1.0,damage:1});
    u.fireCooldown=.32;
   }
  }else updateRocketeer(u,dt,!!target);
  u.x=clamp(u.x,170,W-170);
 }
 for(const p of bullets){
  const previous=p.x;p.x+=p.vx*dt;p.ttl-=dt;
  const victim=units.find(u=>u.hp>0&&u.team!==p.team&&Math.abs(u.x-p.x)<10&&((u.x-previous)*(u.x-p.x)<=0||Math.abs(u.x-p.x)<9));
  if(victim){victim.hp=Math.max(0,victim.hp-p.damage);victim.hitFlash=.15;p.ttl=0;}
 }
 bullets=bullets.filter(p=>p.ttl>0);
 units=units.filter(u=>u.hp>0);
 const aliveIds=new Set(units.map(u=>u.id));
 for(const b of bases)if(!b.main)releaseDeadDefenders(b,aliveIds);
}
function draw(){
 ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,viewW,viewH);
 ctx.fillStyle="#152a43";ctx.fillRect(0,0,viewW,viewH);ctx.save();
 const offsetY=Math.max(0,(viewH-(GROUND+85)*scale)/2);
 ctx.translate(0,offsetY);ctx.scale(scale,scale);ctx.translate(-camera,0);
 const visible=viewW/scale;ctx.fillStyle="#2f4b5d";
 for(let i=0;i<26;i++){const x=i*170;ctx.beginPath();ctx.ellipse(x,GROUND-20+(i%4)*8,120,90,0,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle="#4e7254";ctx.fillRect(camera,GROUND,visible+5,100);ctx.fillStyle="#79946c";ctx.fillRect(camera,GROUND,visible+5,7);
 ctx.fillStyle="#d8e0c8";for(let x=Math.floor(camera/100)*100;x<camera+visible+100;x+=100)ctx.fillRect(x,GROUND+16,35,3);
 for(const b of bases)b.main?drawHeadquarters(ctx,b):drawForwardBase(ctx,b);
 for(const u of units)u.type==="rifle"?drawRifleman(ctx,u):drawRocketeer(ctx,u);
 ctx.strokeStyle="#fff0a1";ctx.lineWidth=2.4;
 for(const p of bullets){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-Math.sign(p.vx)*11,p.y);ctx.stroke();}
 ctx.restore();document.getElementById("count").textContent=" · "+units.length+" soldiers · "+bullets.length+" rounds";
}
function frame(ts){const dt=Math.min((ts-last)/1000||0,.06);last=ts;acc=Math.min(acc+dt,.2);while(acc>=DT){update(DT);acc-=DT;}draw();requestAnimationFrame(frame);}
cv.addEventListener("pointerdown",e=>{dragId=e.pointerId;lastPointerX=e.clientX;dragDistance=0;cv.setPointerCapture(e.pointerId);});
cv.addEventListener("pointermove",e=>{if(e.pointerId!==dragId)return;const dx=e.clientX-lastPointerX;dragDistance+=Math.abs(dx);camera=clamp(camera-dx/scale,0,Math.max(0,W-viewW/scale));lastPointerX=e.clientX;});
cv.addEventListener("pointerup",()=>{dragId=null;});
cv.addEventListener("pointercancel",()=>dragId=null);
for(const [id,team,type] of [["blueRifle",0,"rifle"],["blueRocket",0,"rocket"],["redRifle",1,"rifle"],["redRocket",1,"rocket"]])
 document.getElementById(id).addEventListener("click",()=>command(team,type));
document.getElementById("jumpBlue").addEventListener("click",()=>{camera=clamp(1120-viewW/(2*scale),0,W-viewW/scale);});
document.getElementById("jumpRed").addEventListener("click",()=>{camera=clamp(W-1120-viewW/(2*scale),0,W-viewW/scale);});
document.getElementById("pause").addEventListener("click",e=>{paused=!paused;e.target.textContent=paused?"Resume":"Pause";});
document.getElementById("reset").addEventListener("click",e=>{e.preventDefault();reset();});
addEventListener("resize",resize);
addEventListener("keydown",e=>{if(e.key==="ArrowRight")camera=clamp(camera+130,0,W-viewW/scale);if(e.key==="ArrowLeft")camera=clamp(camera-130,0,W-viewW/scale);});
resize();reset();requestAnimationFrame(frame);
