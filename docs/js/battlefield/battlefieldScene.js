import {clamp} from "./units/soldierCommon.js?v=0.6.0";
import {createRifleman,updateRifleman,drawRifleman} from "./units/rifleman.js?v=0.6.0";
import {createRocketeer,updateRocketeer,drawRocketeer} from "./units/rocketeer.js?v=0.6.0";
import {createBase} from "./bases/baseCommon.js?v=0.6.0";
import {drawHeadquarters} from "./bases/headquarters.js?v=0.6.0";
import {drawForwardBase,occupied,assignDefender,releaseDeadDefenders,advanceDefender,refreshOccupation,drawForwardFront} from "./bases/forwardBase.js?v=0.6.0";
import {WEAPONS,createRandom,selectTarget,updateRocketWeapon,rocketPosition,resolveRifleHit,resolveRocketBlast} from "./combat/weapons.js?v=0.6.0";
import {drawCombatEffects} from "./combat/effects.js?v=0.6.0";
const cv=document.getElementById("field"),ctx=cv.getContext("2d");
const W=3600,GROUND=460,DT=1/60;
const testing=new URLSearchParams(location.search).has("test");
let combatEnabled=true,random=createRandom(),seed=0xc0ffee;
let rockets=[],explosions=[],impacts=[],combatEvents=[],nextRoundId=1;
function recordCombat(event){combatEvents.push({time,...event});if(combatEvents.length>128)combatEvents.shift();}
function explodeRocket(x,team,id){const hits=resolveRocketBlast(x,team,units,bases,random);explosions.push({x,y:GROUND,age:0});recordCombat({type:"explosion",id,x,team,hits});}
let viewW=innerWidth,viewH=innerHeight,ratio=1,scale=1,camera=0,dragId=null,lastPointerX=0,dragDistance=0,acc=0,last=0,time=0,paused=false,units=[],bases=[],bullets=[],nextId=1;
function resize(){viewW=innerWidth;viewH=innerHeight;ratio=Math.min(devicePixelRatio||1,2);cv.width=Math.round(viewW*ratio);cv.height=Math.round(viewH*ratio);scale=Math.max(.58,Math.min(viewH/585,1.35));camera=clamp(camera,0,Math.max(0,W-viewW/scale));}
function spawn(team,type,x){units.push(type==="rifle"?createRifleman(nextId++,team,x,GROUND):createRocketeer(nextId++,team,x,GROUND));}
function reset(resetSeed=0xc0ffee){seed=resetSeed>>>0;random=createRandom(seed);units=[];bullets=[];rockets=[];explosions=[];impacts=[];combatEvents=[];nextRoundId=1;nextId=1;time=0;camera=0;paused=false;document.getElementById("pause").textContent="Pause";
 bases=[createBase(110,0,true),createBase(W-110,1,true),createBase(1120,0,false),createBase(W-1120,1,false)];
 for(let i=0;i<3;i++){spawn(0,"rifle",220+i*36);spawn(1,"rifle",W-220-i*36);}
 spawn(0,"rocket",170);spawn(1,"rocket",W-170);
}
function command(team,type){spawn(team,type,team===0?200:W-200);}
function update(dt){if(paused)return;time+=dt;
 for(const b of bases)if(!b.main){
  b.coverFlash=Math.max(0,(b.coverFlash||0)-dt);
  b.flagProgress=clamp(b.flagProgress+(occupied(b)?1:-1)*dt*.8,0,1);
 }
 for(const u of units){
  if(u.hp<=0)continue;
  u.hitFlash=Math.max(0,u.hitFlash-dt);
  // Reserve the first matching arrivals; further infantry bypass a full FOB.
  if(u.guardBase===null)for(const b of bases)if(!b.main&&b.team===u.team){
   if((b.x-u.x)*(u.team===0?1:-1)<=100&&(b.x-u.x)*(u.team===0?1:-1)>=-80&&assignDefender(b,u))break;
  }
  const target=combatEnabled?selectTarget(u,units,u.type==="rifle"?0:WEAPONS.rocketMinRange,u.type==="rifle"?WEAPONS.rifleRange:WEAPONS.rocketMaxRange):null;
  if(u.guardBase!==null){advanceDefender(bases.find(b=>!b.main&&b.x===u.guardBase),u,dt,!!target);}
  if(u.type==="rifle"){
   if(u.guardBase===null)updateRifleman(u,dt,!!target);
   u.fireCooldown-=dt;
   if(target&&u.fireCooldown<=0){
    const direction=u.team===0?1:-1;
    bullets.push({originX:u.x,x:u.x+direction*33,y:GROUND-37,vx:direction*630,team:u.team,ttl:1.0,damage:1});
    u.fireCooldown=.32;
   }
  }else{
   if(u.guardBase===null)updateRocketeer(u,dt,!!target);
   const rocket=updateRocketWeapon(u,target,dt,random);
   if(rocket){rocket.id=nextRoundId++;rockets.push(rocket);recordCombat({type:"launch",id:rocket.id,team:u.team,shooterId:u.id,aimedX:rocket.aimedX,impactX:rocket.impactX,spread:rocket.spread});}
  }
  u.x=clamp(u.x,170,W-170);
 }
 for(const p of bullets){
  // CB-01: include the initial muzzle segment for enemies at close range.
  const previous=p.originX??p.x;delete p.originX;p.x+=p.vx*dt;p.ttl-=dt;
  const victim=units.filter(u=>u.hp>0&&u.team!==p.team&&u.x>=Math.min(previous,p.x)-9&&u.x<=Math.max(previous,p.x)+9).sort((a,b)=>Math.abs(a.x-previous)-Math.abs(b.x-previous))[0];
  if(victim){const hit=resolveRifleHit(victim,bases,random);recordCombat({type:"bulletHit",team:p.team,...hit});impacts.push({x:victim.x,y:GROUND-(hit.covered?24:37),covered:hit.covered,age:0});p.ttl=0;}
 }
 bullets=bullets.filter(p=>p.ttl>0);
 for(const effect of [...explosions,...impacts])effect.age+=dt;
 explosions=explosions.filter(effect=>effect.age<.65);impacts=impacts.filter(effect=>effect.age<.16);
 for(const rocket of rockets){
  rocket.age=Math.min(rocket.flightTime,rocket.age+dt);
  Object.assign(rocket,rocketPosition(rocket,rocket.age));
  if(rocket.age>=rocket.flightTime)explodeRocket(rocket.impactX,rocket.team,rocket.id);
 }
 rockets=rockets.filter(rocket=>rocket.age<rocket.flightTime);
 units=units.filter(u=>u.hp>0);
 const aliveIds=new Set(units.map(u=>u.id));
 for(const b of bases)if(!b.main){releaseDeadDefenders(b,aliveIds);refreshOccupation(b);}
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
 for(const b of bases)if(!b.main)drawForwardFront(ctx,b);
 // Fractional damage remains visible without changing the accepted soldier gait.
 for(const u of units){const maxHp=u.type==="rifle"?3:4;if(u.hp<maxHp){ctx.fillStyle="#14212a";ctx.fillRect(u.x-13,u.y-66,26,4);ctx.fillStyle="#a4d77c";ctx.fillRect(u.x-13,u.y-66,26*u.hp/maxHp,4);}}
 drawCombatEffects(ctx,rockets,explosions,impacts);
 ctx.strokeStyle="#fff0a1";ctx.lineWidth=2.4;
 for(const p of bullets){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-Math.sign(p.vx)*11,p.y);ctx.stroke();}
 ctx.restore();document.getElementById("count").textContent=" · "+units.length+" soldiers · "+bullets.length+" rounds · "+rockets.length+" rockets";
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
addEventListener("resize",()=>{resize();draw();});
addEventListener("keydown",e=>{if(e.key==="ArrowRight")camera=clamp(camera+130,0,W-viewW/scale);if(e.key==="ArrowLeft")camera=clamp(camera-130,0,W-viewW/scale);});
resize();reset();
if(testing)window.battlefieldTest={
 reset:(value=0xc0ffee)=>{reset(value);combatEnabled=false;draw();},
 step:(n=1)=>{for(let i=0;i<n;i++)update(DT);draw();},
 spawn:(team,type,x)=>{spawn(team,type,x??(team===0?200:W-200));return nextId-1;},
 kill:id=>{const u=units.find(u=>u.id===id);if(u)u.hp=0;},
 combat:value=>combatEnabled=value,
 clear:()=>{units=[];bullets=[];rockets=[];explosions=[];impacts=[];combatEvents=[];for(const b of bases)if(!b.main){releaseDeadDefenders(b,new Set());refreshOccupation(b);}},
 snapshot:()=>structuredClone({time,units,bases,bullets,rockets,explosions,combatEvents,seed,randomState:random.state()}),
 patchUnit:(id,changes)=>Object.assign(units.find(unit=>unit.id===id),changes),
 impactRocket:(x,team)=>{explodeRocket(x,team,nextRoundId++);draw();},
 camera:x=>{camera=clamp(x-viewW/(2*scale),0,W-viewW/scale);draw();}
};
if(!testing)requestAnimationFrame(frame);else draw();
