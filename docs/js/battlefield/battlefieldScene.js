import {clamp} from "./units/soldierCommon.js";
import {createRifleman,updateRifleman,drawRifleman} from "./units/rifleman.js";
import {createRocketeer,updateRocketeer,drawRocketeer} from "./units/rocketeer.js";
import {createBase} from "./bases/baseCommon.js";
import {drawHeadquarters} from "./bases/headquarters.js";
import {drawForwardBase,tryDeploy} from "./bases/forwardBase.js";
const cv=document.getElementById("field"),ctx=cv.getContext("2d");
const W=3600,GROUND=460,DT=1/60;
const ENGAGEMENT_DISTANCE={rifle:250,rocket:420};
let viewW=innerWidth,viewH=innerHeight,ratio=1,scale=1,camera=0,dragId=null,lastPointerX=0,dragDistance=0,acc=0,last=0,time=0,paused=false,units=[],bases=[],nextId=1;
function resize(){viewW=innerWidth;viewH=innerHeight;ratio=Math.min(devicePixelRatio||1,2);cv.width=Math.round(viewW*ratio);cv.height=Math.round(viewH*ratio);scale=Math.max(.58,Math.min(viewH/585,1.35));camera=clamp(camera,0,Math.max(0,W-viewW/scale));}
function spawn(team,type,x){units.push(type==="rifle"?createRifleman(nextId++,team,x,GROUND):createRocketeer(nextId++,team,x,GROUND));}
function reset(){units=[];nextId=1;time=0;camera=0;paused=false;document.getElementById("pause").textContent="Pause";
 bases=[createBase(110,0,true),createBase(W-110,1,true),createBase(1120,0,false,3),createBase(W-1120,1,false,3)];
 for(let i=0;i<3;i++){spawn(0,"rifle",220+i*36);spawn(1,"rifle",W-220-i*36);}
 spawn(0,"rocket",170);spawn(1,"rocket",W-170);
}
function command(team,type){spawn(team,type,team===0?200:W-200);}
function update(dt){if(paused)return;time+=dt;
 for(const u of units){
  const direction=u.team===0?1:-1;
  const enemy=units.find(e=>e.team!==u.team&&(e.x-u.x)*direction>=0&&(e.x-u.x)*direction<=ENGAGEMENT_DISTANCE[u.type]);
  if(u.type==="rifle")updateRifleman(u,dt,!!enemy);
  else updateRocketeer(u,dt,!!enemy);
  u.x=clamp(u.x,170,W-170);
 }
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
 ctx.restore();document.getElementById("count").textContent=" · "+units.length+" soldiers";
}
function frame(ts){const dt=Math.min((ts-last)/1000||0,.06);last=ts;acc=Math.min(acc+dt,.2);while(acc>=DT){update(DT);acc-=DT;}draw();requestAnimationFrame(frame);}
cv.addEventListener("pointerdown",e=>{dragId=e.pointerId;lastPointerX=e.clientX;dragDistance=0;cv.setPointerCapture(e.pointerId);});
cv.addEventListener("pointermove",e=>{if(e.pointerId!==dragId)return;const dx=e.clientX-lastPointerX;dragDistance+=Math.abs(dx);camera=clamp(camera-dx/scale,0,Math.max(0,W-viewW/scale));lastPointerX=e.clientX;});
cv.addEventListener("pointerup",e=>{if(e.pointerId!==dragId)return;if(dragDistance<14){
 const rect=cv.getBoundingClientRect(),offsetY=Math.max(0,(viewH-(GROUND+85)*scale)/2);
 const x=camera+(e.clientX-rect.left)/scale,y=(e.clientY-rect.top-offsetY)/scale;
 const b=bases.find(b=>!b.main&&Math.abs(b.x-x)<75&&y>GROUND-140&&y<GROUND+20);
 if(b)tryDeploy(b,spawn);
}dragId=null;});
cv.addEventListener("pointercancel",()=>dragId=null);
for(const [id,team,type] of [["blueRifle",0,"rifle"],["blueRocket",0,"rocket"],["redRifle",1,"rifle"],["redRocket",1,"rocket"]])
 document.getElementById(id).addEventListener("click",()=>command(team,type));
document.getElementById("pause").addEventListener("click",e=>{paused=!paused;e.target.textContent=paused?"Resume":"Pause";});
document.getElementById("reset").addEventListener("click",e=>{e.preventDefault();reset();});
addEventListener("resize",resize);
addEventListener("keydown",e=>{if(e.key==="ArrowRight")camera=clamp(camera+130,0,W-viewW/scale);if(e.key==="ArrowLeft")camera=clamp(camera-130,0,W-viewW/scale);});
resize();reset();requestAnimationFrame(frame);
