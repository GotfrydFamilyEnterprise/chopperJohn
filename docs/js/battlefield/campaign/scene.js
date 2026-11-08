import {activePlatoons,platoonSummary} from '../ai/platoons.js?v=2.2.0';
import {installTestInteractions} from '../ui/testInteractions.js?v=2.2.0';
import {fetchJson,validateCampaign,validateBattlefield} from './definition.js?v=2.2.0';
import {PROGRESS_KEY,readProgress,unlocked,completeLevel} from './progress.js?v=2.2.0';
import {createWorld,stepWorld,buySergeant,buyInfantry,turnAircraft,worldSnapshot,CAMPAIGN_STEP,spawn} from './world.js?v=2.2.0';
import {drawCampaign} from './renderer.js?v=2.2.0';
import {groundY} from '../terrain/heightfield.js?v=2.2.0';
import {pilotView,groundOffset} from '../ui/battlefieldCamera.js?v=2.2.0';
import {installPilotControls} from '../ui/pilotControls.js?v=2.2.0';
import {installGameMenu} from '../ui/gameMenu.js?v=2.2.0';
import {installTouchGuards} from '../ui/touchGuards.js?v=2.2.0';
import {installFullscreen} from '../ui/fullscreen.js?v=2.2.0';
import {renderRedEconomy} from '../ui/redEconomyPanel.js?v=2.2.0';
import {purchaseStatus} from '../economy/supply.js?v=2.2.0';
import {baseStatus} from '../bases/takeoverRenderer.js?v=2.2.0';
const $=id=>document.getElementById(id),canvas=$('field'),ctx=canvas.getContext('2d'),testing=new URLSearchParams(location.search).has('test');
let campaign,progress={completed:[]},world=null,mode='menu',loadToken=0,controls,follow=true,view={scale:1,camera:0,offsetY:0},width=innerWidth,height=innerHeight,dpr=1,acc=0,last=0,drag=null,saved=true;
let storage;try{storage=localStorage;}catch{storage=null;}
for(const el of document.querySelectorAll('[data-game-version]'))el.textContent='v2.2.0';
$('followRockets').hidden=true;
function release(){controls?.release();if(drag&&canvas.hasPointerCapture(drag.id))canvas.releasePointerCapture(drag.id);drag=null;acc=0;}
function menu(){loadToken++;release();mode='menu';world=null;$('gameMenu').open=false;$('fullscreenHelp').close();renderMenu();draw();}
function renderMenu(){
 if(!campaign)return;$('campaignLevels').replaceChildren(...campaign.levels.map((l,i)=>{const b=document.createElement('button');b.dataset.level=l.id;b.id='level-'+l.id;b.disabled=mode==='loading'||!unlocked(campaign,progress,l.id);b.textContent=(i+1)+'. '+l.name;const small=document.createElement('small');small.textContent=!unlocked(campaign,progress,l.id)?'Complete the previous mission to unlock':progress.completed.includes(l.id)?'Completed · Replay with fresh forces':'Start mission · Fresh forces';b.append(small);b.onclick=()=>start(l.id);return b;}));$('campaignProgress').textContent=progress.completed.length+' / '+campaign.levels.length+' complete'+(!saved?' · Progress could not be saved on this device':'');
}
async function loadCampaign(){mode='loading';$('retryLoad').hidden=true;$('campaignError').textContent='Loading campaign…';try{const c=await fetchJson(new URL('../../../campaign/campaign.json',import.meta.url),validateCampaign);campaign=c;progress=readProgress(storage,c);mode='menu';$('campaignError').textContent='';renderMenu();}catch(e){mode='menu';$('campaignError').textContent=e.message;$('retryLoad').hidden=false;}}
async function start(id){
 if(!campaign||!unlocked(campaign,progress,id))return;const token=++loadToken;release();mode='loading';renderMenu();$('campaignError').textContent='Loading mission…';draw();
 try{const entry=campaign.levels.find(l=>l.id===id),data=await fetchJson(new URL('../../../campaign/'+entry.file,import.meta.url),validateBattlefield);if(token!==loadToken)return;if(data.id!==id)throw Error('Level ID does not match campaign');const candidate=createWorld(data,{platoons:true});world=candidate;mode='play';follow=true;view.camera=0;$('campaignError').textContent='';$('gameMenu').open=false;resize();draw();canvas.focus({preventScroll:true});}
 catch(e){if(token===loadToken){mode='menu';$('campaignError').textContent=e.message;renderMenu();draw();}}
}
function settle(){if(mode!=='play'||!world?.result)return;release();mode='result';if(world.result.winner===0)saved=completeLevel(campaign,progress,world.level.id,world.result,storage);$('gameMenu').open=false;const win=world.result.winner===0,index=campaign.levels.findIndex(l=>l.id===world.level.id),next=campaign.levels[index+1];$('resultTitle').textContent=world.result.winner===null?'Draw':win?'Mission complete':'Defeat';$('resultText').textContent=win?(next?'Enemy headquarters captured. The next mission is unlocked.':'Both missions complete. Campaign victory!')+(saved?'':' Progress could not be saved on this device.'):'Your headquarters fell. Retry with a fresh army and helicopter.';$('resultNext').hidden=!win||!next;$('resultNext').onclick=()=>start(next.id);$('resultNewGame').focus({preventScroll:true});}
function resize(){width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);if(world&&!follow)view={scale:Math.max(.5,Math.min(1.2,height/585)),camera:Math.max(0,Math.min(world.level.world.width-width/view.scale,view.camera)),offsetY:groundOffset(height,view.scale,world.level.world.baseline)};}
function draw(){
 const home=mode==='menu'||mode==='loading';$('mainMenu').hidden=!home;$('mainMenu').inert=!home;for(const id of['gameMenu','battleHUD','pilotControls']){$(id).hidden=home||mode==='result';$(id).inert=$(id).hidden;}$('matchResult').hidden=mode!=='result';$('matchResult').inert=mode!=='result';
 if(world){const h=world.helicopter;if(follow)view=pilotView(h,width,height,world.level.world.width,groundY(world.level,h.x));$('missionBrief').textContent=world.level.description;$('sessionModeLabel').hidden=false;$('sessionModeLabel').textContent=world.level.name;$('pilotStatus').textContent=h.hp>0?'Hull '+Math.ceil(h.hp)+' · Ammo '+Math.floor(h.ammo)+(h.rearming?' · REARM':''):h.respawnRemaining>0?'Respawn '+Math.ceil(h.respawnRemaining)+'s':'Need90 Supply';
  const reports=world.commanders.map(c=>({...c,observations:{...c.observations,living:world.units.filter(u=>u.hp>0&&u.team===c.rules.team).length}}));renderRedEconomy($('blueEconomy'),reports[0],$('blueStrategy'));renderRedEconomy($('redEconomy'),reports[1],$('redStrategy'));
  for(const[id,type]of[['blueRifle','rifle'],['blueRocket','rocket']])$(id).disabled=mode!=='play'||world.paused||purchaseStatus(world.commanders[0].supply,type,world.units.filter(u=>u.hp>0&&u.team===0).length)!=='ready';$('blueSergeant').disabled=mode!=='play'||world.paused||activePlatoons(world,0).length>=2||purchaseStatus(world.commanders[0].supply,'rifle',world.units.filter(u=>u.hp>0&&u.team===0).length)!=='ready';$('platoonStatus').textContent='Blue: '+platoonSummary(world,0)+' | Red: '+platoonSummary(world,1);$('pause').textContent=world.paused?'Resume':'Pause';$('baseObjectives').textContent=world.bases.map(baseStatus).join(' · ');$('count').textContent=world.time.toFixed(1)+'s · '+world.stats.rocketShots+' rockets · '+world.stats.helicopterShots+' helicopter rounds';
 }
 ctx.setTransform(dpr,0,0,dpr,0,0);drawCampaign(ctx,width,height,world,view);
}
controls=installPilotControls({stick:$('pilotStick'),knob:$('pilotKnob'),fire:$('heliFire'),turn:$('heliTurn'),canControl:()=>mode==='play'&&world&&!world.paused&&world.helicopter.hp>0,onTurn:()=>turnAircraft(world),onEngage:()=>{follow=true;}});
$('blueSergeant').onclick=()=>{if(mode==='play')buySergeant(world,0,$('platoonTactic').value);draw();};
$('blueRifle').onclick=()=>{if(mode==='play')buyInfantry(world,'rifle');draw();};$('blueRocket').onclick=()=>{if(mode==='play')buyInfantry(world,'rocket');draw();};$('pause').onclick=()=>{if(world&&mode==='play'){world.paused=!world.paused;release();draw();}};
$('reset').textContent='Retry level';$('reset').onclick=$('resultNewGame').onclick=()=>{if(world)start(world.level.id);};$('endSession').onclick=$('resultMenu').onclick=menu;$('retryLoad').onclick=loadCampaign;$('followHelicopter').onclick=()=>{follow=true;draw();};
for(const[id,key]of[['jumpBlue','blue-fob'],['jumpRed','red-fob']])$(id).onclick=()=>{if(!world)return;follow=false;const b=world.bases.find(b=>b.id===key);if(b){view.scale=Math.max(.5,Math.min(1,height/585));view.camera=Math.max(0,Math.min(world.level.world.width-width/view.scale,b.x-width/(2*view.scale)));view.offsetY=groundOffset(height,view.scale,b.y);}draw();};
canvas.onpointerdown=e=>{if(mode!=='play')return;follow=false;drag={id:e.pointerId,x:e.clientX,camera:view.camera};canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(drag?.id===e.pointerId){view.camera=Math.max(0,Math.min(world.level.world.width-width/view.scale,drag.camera-(e.clientX-drag.x)/view.scale));draw();}};canvas.onpointerup=canvas.onpointercancel=e=>{if(drag?.id===e.pointerId)drag=null;};
addEventListener('resize',()=>{resize();draw();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&world&&mode==='play'){world.paused=true;release();draw();}});
installTouchGuards();installGameMenu($('gameMenu'),release);installFullscreen({button:$('fullscreen'),dialog:$('fullscreenHelp'),message:$('fullscreenMessage')});
if(testing)window.campaignTest={snapshot:()=>({mode,progress:structuredClone(progress),world:world?worldSnapshot(world):null}),step:n=>{if(mode==='play'){stepWorld(world,controls.read(),n);settle();draw();}},patchUnit:(id,patch)=>Object.assign(world.units.find(u=>u.id===id),patch),patchHelicopter:patch=>Object.assign(world.helicopter,patch),systems:patch=>Object.assign(world.systems,patch),patchBase:(id,patch)=>Object.assign(world.bases.find(b=>b.id===id),patch),spawn:(team,type,x)=>spawn(world,team,type,x).id};
if(testing)window.campaignTest.interact=installTestInteractions({enabled:true,controls,step:n=>window.campaignTest.step(n),snapshot:()=>window.campaignTest.snapshot(),dt:CAMPAIGN_STEP});
function frame(now){const elapsed=Math.min(.06,(now-last)/1000||0);last=now;if(!testing&&mode==='play'){acc+=elapsed;while(acc>=CAMPAIGN_STEP){stepWorld(world,controls.read());acc-=CAMPAIGN_STEP;if(world.result){settle();break;}}}draw();requestAnimationFrame(frame);}
resize();draw();await loadCampaign();draw();requestAnimationFrame(frame);
