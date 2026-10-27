import {rocketDefenseBlast,updateTakeover,headquartersResult} from "./bases/takeover.js?v=1.3.1";
import {rifleAssaultBase,advanceCaptureRifle} from "./bases/assaultOrders.js?v=1.3.1";
import {drawTakeover,baseStatus} from "./bases/takeoverRenderer.js?v=1.3.1";
import {installMatchResult} from "./ui/matchResult.js?v=1.3.1";
import {drawTutorialRange,tutorialSpeedLimit} from "./session/tutorialArena.js?v=1.3.1";
import {createSession,beginSession,endSession,updateSession} from "./session/sessionFlow.js?v=1.3.1";
import {installSessionMenu} from "./ui/sessionMenu.js?v=1.3.1";
import {installTouchGuards} from "./ui/touchGuards.js?v=1.3.1";
import {updateAircraftSupport} from "./aircraft/aircraftSupport.js?v=1.3.1";
import {installGameMenu} from "./ui/gameMenu.js?v=1.3.1";
import {pilotView,groundOffset} from "./ui/battlefieldCamera.js?v=1.3.1";
import {allocateRocketTargets} from "./combat/rocketAllocation.js?v=1.3.1";
import {createHelicopter,updateHelicopter,repairHelicopter,turnHelicopter,damageHelicopter} from "./aircraft/helicopter.js?v=1.3.1";
import {drawHelicopter,drawHelipad} from "./aircraft/helicopterRenderer.js?v=1.3.1";
import {installPilotControls} from "./ui/pilotControls.js?v=1.3.1";
import {updatePrioritizedRocket} from "./combat/targetPriority.js?v=1.3.1";
import {updateHelicopterGun,stepHelicopterBullet} from "./combat/helicopterGun.js?v=1.3.1";
import {stepBattleRocket,resolveAirburstGround,helicopterBurstDamage} from "./combat/airRocketFlight.js?v=1.3.1";
import {hullDistance} from "./combat/collision2d.js?v=1.3.1";
import {installFullscreen} from "./ui/fullscreen.js?v=1.3.1";
import {clamp} from "./units/soldierCommon.js?v=1.3.1";
import {createRifleman,updateRifleman,drawRifleman} from "./units/rifleman.js?v=1.3.1";
import {createRocketeer,updateRocketeer,drawRocketeer} from "./units/rocketeer.js?v=1.3.1";
import {createBase} from "./bases/baseCommon.js?v=1.3.1";
import {drawHeadquarters} from "./bases/headquarters.js?v=1.3.1";
import {drawForwardBase,occupied,assignDefender,releaseDeadDefenders,advanceDefender,refreshOccupation,drawForwardFront} from "./bases/forwardBase.js?v=1.3.1";
import {WEAPONS,createRandom,selectTarget,resolveRifleHit,resolveRocketBlast} from "./combat/weapons.js?v=1.3.1";
import {drawCombatEffects} from "./combat/effects.js?v=1.3.1";
import {createCommander,updateCommander,commanderMovementOrder} from "./ai/redCommander.js?v=1.3.1";
import {renderRedEconomy} from "./ui/redEconomyPanel.js?v=1.3.1";
import {purchaseUnit,purchaseStatus,accrueSupply} from "./economy/supply.js?v=1.3.1";
const cv=document.getElementById("field"),ctx=cv.getContext("2d");
const W=3600,GROUND=460,DT=1/60;
const testing=new URLSearchParams(location.search).has("test");
// Legacy deterministic combat fixtures opt into an already-running battle.
const session=createSession(testing&&!new URLSearchParams(location.search).has("menu")?"game":"menu");
let sessionUI=null,matchResult=null,resultUI=null;
let followFocus=null,helicopter=createHelicopter(),helicopterEnabled=true,gunRounds=[],airRandom=createRandom(),controls=null,testPilotInput=null;
let followHelicopter=new URLSearchParams(location.search).get("view")!=="rockets",cameraOffsetY=null;
const defaultSystems=()=>({flight:true,troops:true,weapons:true,projectiles:true,damage:true,repairs:true,commanders:true,takeover:true,kinematic:false});
let systems=defaultSystems();
let redCommander=createCommander(1),blueCommander=createCommander(0),redAIEnabled=true,blueAIEnabled=false;
let gunShotsTotal=0;
let followRockets=new URLSearchParams(location.search).get("view")==="rockets",shotsFired=0;
let combatEnabled=true,random=createRandom(),seed=0xc0ffee;
let rockets=[],explosions=[],impacts=[],combatEvents=[],nextRoundId=1;
function recordCombat(event){if(event.type==="launch")shotsFired++;combatEvents.push({time,...event});if(combatEvents.length>128)combatEvents.shift();}
function explodeRocket(x,team,id){const hits=systems.damage?resolveRocketBlast(x,team,units,bases,random):[];if(helicopterEnabled&&systems.damage&&team!==helicopter.team&&hullDistance({x,y:GROUND},helicopter)<=25)damageHelicopter(helicopter,5);if(systems.damage&&systems.takeover)for(const change of rocketDefenseBlast({x,y:GROUND},team,bases))recordCombat(change);explosions.push({x,y:GROUND,age:0});recordCombat({type:"explosion",id,x,team,hits});}
let viewW=innerWidth,viewH=innerHeight,ratio=1,scale=1,camera=0,dragId=null,lastPointerX=0,dragDistance=0,acc=0,last=0,time=0,paused=false,units=[],bases=[],bullets=[],nextId=1;
function resize(){viewW=innerWidth;viewH=innerHeight;ratio=Math.min(devicePixelRatio||1,2);cv.width=Math.round(viewW*ratio);cv.height=Math.round(viewH*ratio);scale=Math.max(.58,Math.min(viewH/585,1.35));camera=clamp(camera,0,Math.max(0,W-viewW/scale));}
function spawn(team,type,x){const unit=type==="rifle"?createRifleman(nextId++,team,x,GROUND):createRocketeer(nextId++,team,x,GROUND);units.push(unit);return unit;}
function reset(resetSeed=0xc0ffee){seed=resetSeed>>>0;random=createRandom(seed);airRandom=createRandom(seed^0xa17c9e33);matchResult=null;helicopter=createHelicopter();helicopterEnabled=true;gunRounds=[];systems=defaultSystems();testPilotInput=null;controls?.release();followHelicopter=!followRockets;units=[];bullets=[];rockets=[];explosions=[];impacts=[];combatEvents=[];nextRoundId=1;nextId=1;shotsFired=0;gunShotsTotal=0;followFocus=null;time=0;camera=0;paused=false;redCommander=createCommander(1);blueCommander=createCommander(0);redAIEnabled=true;blueAIEnabled=false;blueCommander.strategy={mode:"MANUAL",label:"Manual deployment"};document.getElementById("pause").textContent="Pause";
 bases=[createBase(110,0,true),createBase(W-110,1,true),createBase(1120,0,false),createBase(W-1120,1,false)];
 // EC-06: equal five-soldier opening grants; all later deployments are paid.
 for(const team of [0,1]){
  const positions=[220,256,292,170,200];
  for(let i=0;i<5;i++){
   const unit=spawn(team,i<3?"rifle":"rocket",team===0?positions[i]:W-positions[i]);
   unit.order={role:i===2||i===4?'opening-assault':'garrison'};
  }
 }
}
function command(team,type){
 if(matchResult||paused||(session.mode==="menu"||session.mode==="tutorial-intro"))return;
 if(session.mode==="tutorial"&&(session.tutorial.step!==4||blueCommander.supply.ledger.some(e=>e.type===type)))return;
 const state=team===0?blueCommander:redCommander;
 const living=units.filter(u=>u.hp>0&&u.team===team).length;
 purchaseUnit(state.supply,type,living,kind=>{
  const unit=spawn(team,kind,state.rules.spawnX);
  unit.order={role:'garrison'};
  return unit;
 });
 state.observations={...state.observations,living:units.filter(u=>u.hp>0&&u.team===team).length};
 draw();
}
function update(dt){if(matchResult||paused||(session.mode==="menu"||session.mode==="tutorial-intro"))return;time+=dt;
 const previousHelicopter={...helicopter};
 if(helicopterEnabled){
  if(helicopter.hp<=0){controls?.release();testPilotInput=null;}
  const input=testPilotInput??controls?.read()??{x:0,y:0,fire:false};
  const result=systems.flight?updateHelicopter(helicopter,input,dt,GROUND,W,{kinematic:systems.kinematic,damage:systems.damage,respawn:false}):{};
  if(result.respawned){controls?.release();testPilotInput=null;recordCombat({type:"respawn",id:helicopter.id});}
  if(systems.weapons&&combatEnabled)for(const shot of updateHelicopterGun(helicopter,!result.respawned&&!!input.fire,dt,previousHelicopter)){
   shot.id=nextRoundId++;gunShotsTotal++;gunRounds.push(shot);recordCombat({type:"helicopterShot",shotTime:time-dt+shot.spawnDelay,id:shot.id,x:shot.x,y:shot.y,vx:shot.vx,vy:shot.vy});
  }
 }
 // Each commander observes the same pre-purchase frame, avoiding first-updated advantage.
 const observedUnits=[...units];
 for(const [state,enabled] of [[blueCommander,blueAIEnabled],[redCommander,redAIEnabled]])if(enabled&&systems.commanders){
  const ownView=[...observedUnits];
  updateCommander(state,dt,ownView,bases,(type,x)=>{const unit=spawn(state.rules.team,type,x);ownView.push(unit);return unit;},helicopterEnabled?helicopter:null);
 }
 // BAL-01: manual blue income continues; no commander gets a blue purchase callback.
 if(systems.commanders&&!blueAIEnabled)accrueSupply(blueCommander.supply,dt);
 if(helicopterEnabled){
  const service=updateAircraftSupport(helicopter,dt,blueCommander.supply,{fire:!!(testPilotInput??controls?.read())?.fire,rearm:systems.repairs,replace:systems.flight&&systems.commanders,ground:GROUND});
  if(service.respawned){controls?.release();testPilotInput=null;recordCombat({type:"respawn",id:helicopter.id,cost:service.cost});}
 }
 for(const b of bases)if(!b.main){
  b.coverFlash=Math.max(0,(b.coverFlash||0)-dt);
  b.flagProgress=clamp(b.flagProgress+(occupied(b)||b.everCaptured?1:-1)*dt*.8,0,1);
 }
 const previousPositions=new Map(units.map(unit=>[unit.id,unit.x]));
 const allocations=combatEnabled&&systems.weapons?allocateRocketTargets(units,helicopterEnabled?helicopter:null,{stagger:true,bases:systems.takeover&&session.mode==='game'?bases:[]}):new Map();
 for(const u of units){
  if(u.hp<=0)continue;
  u.hitFlash=Math.max(0,u.hitFlash-dt);
  // Reserve the first matching arrivals; further infantry bypass a full FOB.
  if(u.guardBase===null)for(const b of bases)if(!b.main&&b.team===u.team){
   if((b.x-u.x)*(u.team===0?1:-1)<=100&&(b.x-u.x)*(u.team===0?1:-1)>=-80&&assignDefender(b,u))break;
  }
  const choice=combatEnabled&&systems.weapons&&u.type==="rocket"?allocations.get(u.id)??null:null;
  if(u.type==="rocket"){u.rocketAssignment=choice?.kind??null;u.rocketAllocation=choice?.allocation??null;}
  const target=combatEnabled&&systems.weapons?(u.type==="rifle"?selectTarget(u,units,0,WEAPONS.rifleRange):choice?.target??null):null;
  if(systems.troops&&u.guardBase!==null){advanceDefender(bases.find(b=>!b.main&&b.x===u.guardBase),u,dt,!!target);}
  const order=commanderMovementOrder(u.team===0?blueCommander:redCommander,u,units,dt);
  const maxSpeed=session.mode==="tutorial"?Math.min(order?.maxSpeed??Infinity,tutorialSpeedLimit(u,dt)):order?.maxSpeed??Infinity;
  if(u.type==="rifle"){
   if(systems.troops&&u.guardBase===null){const assault=systems.takeover&&session.mode==='game'?rifleAssaultBase(u,bases):null;if(assault)advanceCaptureRifle(u,assault,dt,!!target);else updateRifleman(u,dt,!!target,maxSpeed);}
   u.fireCooldown-=dt;
   if(target&&u.fireCooldown<=0){
    const direction=u.team===0?1:-1;
    bullets.push({originX:u.x,x:u.x+direction*33,y:GROUND-37,vx:direction*630,team:u.team,ttl:1.0,damage:1});
    u.fireCooldown=.32;
   }
  }else{
   if(systems.troops&&u.guardBase===null)updateRocketeer(u,dt,!!target,maxSpeed);
   const rocket=systems.weapons?updatePrioritizedRocket(u,choice,dt,random,airRandom):null;
   if(rocket){rocket.id=nextRoundId++;rockets.push(rocket);recordCombat({type:"launch",id:rocket.id,team:u.team,shooterId:u.id,targetKind:rocket.targetKind??"ground",targetId:rocket.targetId,aimedY:rocket.aimedY,targetVy:rocket.targetVy,originX:rocket.originX,originY:rocket.originY,vx:rocket.vx,vy:rocket.vy,aimedX:rocket.aimedX,impactX:rocket.impactX,targetX:rocket.targetX,targetVelocity:rocket.targetVelocity,flightTime:rocket.flightTime,spread:rocket.spread});}
  }
  u.x=clamp(u.x,systems.takeover?80:170,W-(systems.takeover?80:170));
 }
 for(const u of units)u.observedVelocity=(u.x-previousPositions.get(u.id))/dt;
 if(systems.projectiles)for(const p of bullets){
  // CB-01: include the initial muzzle segment for enemies at close range.
  const previous=p.originX??p.x;delete p.originX;p.x+=p.vx*dt;p.ttl-=dt;
  const victim=units.filter(u=>u.hp>0&&u.team!==p.team&&u.x>=Math.min(previous,p.x)-9&&u.x<=Math.max(previous,p.x)+9).sort((a,b)=>Math.abs(a.x-previous)-Math.abs(b.x-previous))[0];
  if(victim){const hit=systems.damage?resolveRifleHit(victim,bases,random):{id:victim.id,amount:0,hp:victim.hp,covered:false};recordCombat({type:"bulletHit",team:p.team,...hit});impacts.push({x:victim.x,y:GROUND-(hit.covered?24:37),covered:hit.covered,age:0});p.ttl=0;}
 }
 bullets=bullets.filter(p=>p.ttl>0);
 for(const effect of [...explosions,...impacts])effect.age+=dt;
 explosions=explosions.filter(effect=>effect.age<.65);impacts=impacts.filter(effect=>effect.age<.16);
 if(systems.projectiles){
  for(const p of gunRounds){const hit=stepHelicopterBullet(p,dt,units,bases,airRandom,GROUND,systems.damage);if(hit){recordCombat({type:"helicopterHit",...hit});impacts.push({...hit,age:0});}}
  gunRounds=gunRounds.filter(p=>p.ttl>1e-9);
  for(const rocket of rockets){
   const event=stepBattleRocket(rocket,dt,previousHelicopter,helicopterEnabled?helicopter:null,GROUND);
   if(event){
    let hits=[];
    if(systems.damage){
     hits=event.cause==="ground"&&rocket.kind!=="airRocket"?resolveRocketBlast(event.x,event.team,units,bases,random):resolveAirburstGround(event,event.team,units,bases,airRandom);
     if(helicopterEnabled){const amount=helicopterBurstDamage(event,helicopter);if(amount){damageHelicopter(helicopter,amount);hits.push({id:helicopter.id,air:true,amount,hp:helicopter.hp});}}
    }
    if(systems.damage&&systems.takeover)for(const change of rocketDefenseBlast(event,event.team,bases))recordCombat(change);
    explosions.push({x:event.x,y:event.y,air:event.cause!=="ground",age:0});
    recordCombat({type:"explosion",id:rocket.id,x:event.x,y:event.y,team:event.team,cause:event.cause,hits});
   }
  }
  rockets=rockets.filter(rocket=>!rocket.done);
 }
 if(helicopterEnabled){if(systems.repairs)repairHelicopter(helicopter,dt,GROUND);if(helicopter.hp<=0){controls?.release();testPilotInput=null;}}
 units=units.filter(u=>u.hp>0);
 const aliveIds=new Set(units.map(u=>u.id));
 for(const b of bases)if(!b.main){releaseDeadDefenders(b,aliveIds);refreshOccupation(b);}
 if(systems.takeover&&session.mode==='game'){
  const changes=bases.map(b=>updateTakeover(b,units,dt)).filter(Boolean);for(const change of changes)recordCombat(change);
  matchResult=headquartersResult(changes,time);if(matchResult){controls?.release();releasePan();testPilotInput=null;document.getElementById('gameMenu').open=false;}
 }
 updateSession(session,{helicopter,shots:gunShotsTotal,ledger:blueCommander.supply.ledger});
}
function releasePan(){const pointer=dragId;dragId=null;if(pointer!==null&&cv.hasPointerCapture(pointer))cv.releasePointerCapture(pointer);}
function startSession(mode){
 releasePan();beginSession(session,mode);followRockets=false;followHelicopter=true;combatEnabled=true;reset();
 if(mode.startsWith('tutorial')){redAIEnabled=false;systems.damage=false;units=[];}
 dragId=null;acc=0;document.getElementById('gameMenu').open=false;sessionUI?.render({focus:true});draw();
}
function returnToMenu(){
 endSession(session);matchResult=null;controls?.release();releasePan();testPilotInput=null;acc=0;paused=false;
 units=[];bullets=[];rockets=[];gunRounds=[];explosions=[];impacts=[];combatEvents=[];
 document.getElementById('gameMenu').open=false;document.getElementById('fullscreenHelp').close();
 sessionUI?.render({focus:true});draw();
}
function draw(){
 sessionUI?.render();resultUI?.(matchResult);
 document.getElementById('baseObjectives').textContent=session.mode==='game'?bases.map(baseStatus).join(' · '):'';
 document.getElementById("pilotStatus").textContent=helicopterEnabled?(helicopter.hp<=0?(helicopter.respawnRemaining>0?`Respawn ${Math.ceil(helicopter.respawnRemaining)}s · 90 supply`:`Need 90 supply · ${Math.floor(blueCommander.supply.balance)}/90`):`Hull ${Math.ceil(helicopter.hp)} · Ammo ${Math.floor(helicopter.ammo)}${helicopter.rearming?" +30/s":helicopter.ammo<1?" · REARM":""}${helicopter.repairing?" +5HP/s":""}`):"Ground battle test";
 document.getElementById("followHelicopter").classList.toggle("active",followHelicopter);

 cameraOffsetY=null;
 for(const state of [blueCommander,redCommander])state.observations={...state.observations,living:units.filter(u=>u.hp>0&&u.team===state.rules.team).length};
 renderRedEconomy(document.getElementById("redEconomy"),redCommander,document.getElementById("redStrategy"));
 renderRedEconomy(document.getElementById("blueEconomy"),blueCommander,document.getElementById("blueStrategy"));
 for(const [id,type] of [["blueRifle","rifle"],["blueRocket","rocket"]]){
  const button=document.getElementById(id);
  const reason=purchaseStatus(blueCommander.supply,type,units.filter(u=>u.hp>0&&u.team===0).length);
  const tutorialBlocked=session.mode==="tutorial"&&(session.tutorial.step!==4||blueCommander.supply.ledger.some(e=>e.type===type));
  button.disabled=!!matchResult||paused||reason!=="ready"||tutorialBlocked;
  button.title=tutorialBlocked?"Tutorial: deploy each soldier in step 5":paused?"Paused":reason;
 }
 if(followRockets){
  if(followFocus&&time>followFocus.until)followFocus=null;
  if(!followFocus&&rockets.length){const shot=rockets[0];followFocus={start:shot.originX,end:shot.impactX,until:time+shot.flightTime-shot.age+.45};}
  const shot=followFocus;
  const active=units.filter(unit=>unit.type==="rocket"&&unit.rocketGoal).sort((a,b)=>(a.rocketCooldown||0)-(b.rocketCooldown||0))[0];
  const leader=active||units.filter(unit=>unit.type==="rocket"&&unit.guardBase===null).sort((a,b)=>Math.abs(a.x-W/2)-Math.abs(b.x-W/2))[0];
  if(shot||leader){
   const start=shot?shot.start:leader.x,end=shot?shot.end:(leader.rocketGoal?.impactX??leader.x+(leader.team===0?1:-1)*240);
   scale=Math.min(Math.max(.58,Math.min(viewH/585,1.35)),viewW/(Math.abs(end-start)+160));
   camera=clamp((start+end)/2-viewW/(2*scale),0,Math.max(0,W-viewW/scale));
  }
 }
 if(followHelicopter&&helicopterEnabled){const view=pilotView(helicopter,viewW,viewH,W,GROUND);scale=view.scale;camera=view.camera;cameraOffsetY=view.offsetY;}

 ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,viewW,viewH);
 ctx.fillStyle="#152a43";ctx.fillRect(0,0,viewW,viewH);ctx.save();
 const offsetY=cameraOffsetY??groundOffset(viewH,scale,GROUND);
 ctx.translate(0,offsetY);ctx.scale(scale,scale);ctx.translate(-camera,0);
 const visible=viewW/scale;ctx.fillStyle="#2f4b5d";
 for(let i=0;i<26;i++){const x=i*170;ctx.beginPath();ctx.ellipse(x,GROUND-20+(i%4)*8,120,90,0,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle="#4e7254";ctx.fillRect(camera,GROUND,visible+5,100);ctx.fillStyle="#79946c";ctx.fillRect(camera,GROUND,visible+5,7);
 ctx.fillStyle="#d8e0c8";for(let x=Math.floor(camera/100)*100;x<camera+visible+100;x+=100)ctx.fillRect(x,GROUND+16,35,3);
 drawHelipad(ctx,GROUND);
 const visibleBases=session.mode==="tutorial"?bases.filter(b=>b.main&&b.team===0):bases;
 for(const b of visibleBases)b.main?drawHeadquarters(ctx,b):drawForwardBase(ctx,b);
 if(session.mode==="tutorial")drawTutorialRange(ctx,GROUND);
 for(const u of units)u.type==="rifle"?drawRifleman(ctx,u):drawRocketeer(ctx,u);
 for(const b of visibleBases)if(!b.main)drawForwardFront(ctx,b);
 if(systems.takeover&&session.mode==='game')for(const b of visibleBases)drawTakeover(ctx,b);
 // Fractional damage remains visible without changing the accepted soldier gait.
 for(const u of units){const maxHp=u.type==="rifle"?3:4;if(u.hp<maxHp){ctx.fillStyle="#14212a";ctx.fillRect(u.x-13,u.y-66,26,4);ctx.fillStyle="#a4d77c";ctx.fillRect(u.x-13,u.y-66,26*u.hp/maxHp,4);}}
 drawCombatEffects(ctx,rockets,explosions,impacts);
 if(helicopterEnabled)drawHelicopter(ctx,helicopter);
 if(followRockets)for(const u of units)if(u.type==="rocket"&&u.hp>0){
  const label=u.rocketCooldown>0?"Reloading":u.rocketAimTime>0?"Aiming":u.arrived?"Guarding":"Advancing";
  ctx.font="bold 11px system-ui";ctx.textAlign="center";ctx.fillStyle="#f2d9a2";ctx.fillText(label,u.x,u.y-74);
  if(u.rocketGoal){const x=u.rocketGoal.aimedX;ctx.strokeStyle=u.team===0?"#a5dfff":"#ffc0b5";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-6,GROUND-7);ctx.lineTo(x+6,GROUND-7);ctx.moveTo(x,GROUND-13);ctx.lineTo(x,GROUND-1);ctx.stroke();}
 }
 ctx.strokeStyle="#fff0a1";ctx.lineWidth=2.4;
 for(const p of [...bullets,...gunRounds]){ctx.beginPath();ctx.moveTo(p.x,p.y);const n=Math.hypot(p.vx,p.vy||0);ctx.lineTo(p.x-p.vx/n*11,p.y-(p.vy||0)/n*11);ctx.stroke();}
 ctx.restore();document.getElementById("count").textContent=" · "+units.length+" soldiers · "+bullets.length+" rounds · "+rockets.length+" flying · "+shotsFired+" launched";
}
function frame(ts){const dt=Math.min((ts-last)/1000||0,.06);last=ts;acc=Math.min(acc+dt,.2);while(acc>=DT){update(DT);acc-=DT;}draw();requestAnimationFrame(frame);}
function leaveFollow(){const wasFollowing=followRockets||followHelicopter;followHelicopter=false;followRockets=false;followFocus=null;document.getElementById("followRockets").classList.remove("active");if(wasFollowing)resize();}
cv.addEventListener("pointerdown",e=>{if((session.mode==="menu"||session.mode==="tutorial-intro"))return;leaveFollow();dragId=e.pointerId;lastPointerX=e.clientX;dragDistance=0;cv.setPointerCapture(e.pointerId);});
cv.addEventListener("pointermove",e=>{if(e.pointerId!==dragId)return;const dx=e.clientX-lastPointerX;dragDistance+=Math.abs(dx);camera=clamp(camera-dx/scale,0,Math.max(0,W-viewW/scale));lastPointerX=e.clientX;});
cv.addEventListener("pointerup",()=>{dragId=null;});
cv.addEventListener("pointercancel",()=>dragId=null);
for(const [id,team,type] of [["blueRifle",0,"rifle"],["blueRocket",0,"rocket"]])
 document.getElementById(id).addEventListener("click",()=>command(team,type));
document.getElementById("jumpBlue").addEventListener("click",()=>{leaveFollow();camera=clamp(1120-viewW/(2*scale),0,W-viewW/scale);draw();});
document.getElementById("jumpRed").addEventListener("click",()=>{leaveFollow();camera=clamp(W-1120-viewW/(2*scale),0,W-viewW/scale);draw();});
document.getElementById("followRockets").addEventListener("click",e=>{followHelicopter=false;followRockets=!followRockets;e.target.classList.toggle("active",followRockets);if(!followRockets)resize();draw();});
document.getElementById("pause").addEventListener("click",e=>{if((session.mode==="menu"||session.mode==="tutorial-intro"))return;paused=!paused;controls?.release();testPilotInput=null;e.target.textContent=paused?"Resume":"Pause";});
document.getElementById("reset").addEventListener("click",e=>{e.preventDefault();if(session.mode==='menu')return;startSession(session.mode==='tutorial-intro'?'tutorial-intro':session.mode==='tutorial'?'tutorial':'game');});
addEventListener("resize",()=>{resize();draw();});
addEventListener("keydown",e=>{if((session.mode==="menu"||session.mode==="tutorial-intro")||followHelicopter||e.target.closest?.("button,a,summary,details"))return;if(e.key==="ArrowRight"||e.key==="ArrowLeft")leaveFollow();if(e.key==="ArrowRight")camera=clamp(camera+130,0,W-viewW/scale);if(e.key==="ArrowLeft")camera=clamp(camera-130,0,W-viewW/scale);});
controls=installPilotControls({stick:document.getElementById("pilotStick"),knob:document.getElementById("pilotKnob"),fire:document.getElementById("heliFire"),turn:document.getElementById("heliTurn"),canControl:()=>!matchResult&&(session.mode!=="menu"&&session.mode!=="tutorial-intro")&&!paused&&helicopter.hp>0,onTurn:()=>{if(!matchResult&&(session.mode!=="menu"&&session.mode!=="tutorial-intro")&&!paused)turnHelicopter(helicopter);},onEngage:()=>{followRockets=false;followHelicopter=true;document.getElementById("followRockets").classList.remove("active");}});
 document.getElementById("followHelicopter").addEventListener("click",()=>{leaveFollow();followHelicopter=true;draw();});
installTouchGuards();
installGameMenu(document.getElementById("gameMenu"),()=>controls?.release());
sessionUI=installSessionMenu({state:session,onStart:startSession,onEnd:returnToMenu});
resultUI=installMatchResult({onNewGame:()=>startSession('game'),onMenu:returnToMenu});
resize();reset();sessionUI.render();document.getElementById("followRockets").classList.toggle("active",followRockets);
if(testing)window.battlefieldTest={
 reset:(value=0xc0ffee)=>{reset(value);combatEnabled=false;redAIEnabled=false;blueAIEnabled=false;helicopterEnabled=false;followHelicopter=false;draw();},
 step:(n=1)=>{for(let i=0;i<n;i++)update(DT);draw();},
 spawn:(team,type,x)=>{spawn(team,type,x??(team===0?200:W-200));return nextId-1;},
 kill:id=>{const u=units.find(u=>u.id===id);if(u)u.hp=0;},
 combat:value=>combatEnabled=value,
 clear:()=>{redAIEnabled=false;blueAIEnabled=false;helicopterEnabled=false;followHelicopter=false;gunRounds=[];units=[];bullets=[];rockets=[];explosions=[];impacts=[];combatEvents=[];for(const b of bases)if(!b.main){releaseDeadDefenders(b,new Set());refreshOccupation(b);}},
 blueAI:value=>{blueAIEnabled=value;},
 redAI:value=>{redAIEnabled=value;},
 patchBase:(x,patch)=>Object.assign(bases.find(b=>b.x===x),patch),
 snapshot:()=>structuredClone({session,matchResult,gunShotsTotal,helicopter,helicopterEnabled,gunRounds,systems,followHelicopter,pilotInput:testPilotInput??controls?.read(),airRandomState:airRandom.state(),blueAIEnabled,blueCommander,redAIEnabled,redCommander,time,units,bases,bullets,rockets,explosions,combatEvents,seed,shotsFired,camera,scale,followRockets,randomState:random.state()}),
 airRandomValue:value=>{let draws=0;const fixture=()=>{draws++;return value;};fixture.state=()=>({fixture:value,draws});airRandom=fixture;},
 aircraft:value=>{helicopterEnabled=value;},
 systems:patch=>{Object.assign(systems,patch);},
 pilot:input=>{testPilotInput={x:0,y:0,fire:false,...input};},
 patchHelicopter:patch=>{Object.assign(helicopter,patch);},
 turn:()=>turnHelicopter(helicopter),
 damageHelicopter:amount=>damageHelicopter(helicopter,amount),
 injectProjectile:projectile=>{if(projectile.kind==="helicopterBullet")gunRounds.push({...projectile});else rockets.push({...projectile,id:nextRoundId++});},
 patchUnit:(id,changes)=>Object.assign(units.find(unit=>unit.id===id),changes),
 impactRocket:(x,team)=>{explodeRocket(x,team,nextRoundId++);draw();},
 view:(x,value)=>{leaveFollow();scale=value;camera=clamp(x-viewW/(2*scale),0,Math.max(0,W-viewW/scale));draw();},
 camera:x=>{camera=clamp(x-viewW/(2*scale),0,W-viewW/scale);draw();}
};
if(!testing)requestAnimationFrame(frame);else draw();

installFullscreen({button:document.getElementById("fullscreen"),dialog:document.getElementById("fullscreenHelp"),message:document.getElementById("fullscreenMessage")});
