import {loadLevel,validateLevel} from './level.js';
import {createSimulation,stepSimulation,snapshot,LAB_STEP} from './simulation.js';
import {drawLab} from './renderer.js';
import {installTouchGuards} from '../ui/touchGuards.js';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
let portrait=innerWidth<500,loadError='';
let data,sim,running=false,last=0,accumulator=0,loadId=0,zoom=portrait?2:1,center=600,transform,drag;
installTouchGuards();
$('zoom').textContent=zoom===1?'Zoom in':'Fit terrain';$('zoom').setAttribute('aria-pressed',String(zoom!==1));
const testMode=new URLSearchParams(location.search).has('test');
function pause(){running=false;accumulator=0;$('run').textContent='Run';}
function start(scenarioId){pause();sim=createSimulation(data,scenarioId);center=data.world.width/2;$('scenario').value=scenarioId;$('caption').replaceChildren();const title=document.createElement('strong');title.textContent=data.name+' · '+data.scenarios.find(s=>s.id===scenarioId).name;$('caption').append(title,document.createTextNode(data.scenarios.find(s=>s.id===scenarioId).description));render();}
function install(level){loadError='';data=level;$('scenario').replaceChildren(...data.scenarios.map(s=>new Option(s.name,s.id)));start(data.scenarios[0].id);for(const id of ['run','step','reset','json'])$(id).disabled=false;}
async function selectLevel(){const request=++loadId;loadError='';pause();for(const id of ['run','step','reset','json'])$(id).disabled=true;try{const level=await loadLevel(new URL('../../../levels/'+$('level').value+'.json',import.meta.url));if(request===loadId)install(level);}catch(e){if(request===loadId){$('caption').textContent='Unable to load level. Choose another terrain to retry.';loadError=e.message;$('status').textContent=loadError;}}}
function render(){if(!sim)return;const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(r.width*dpr)||canvas.height!==Math.round(r.height*dpr)){canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);transform=drawLab(ctx,r.width,r.height,sim,{sight:$('sight').checked,zoom,center});const stats=sim.stats;$('status').textContent=loadError||(sim.time.toFixed(1)+'s · '+sim.units.filter(u=>u.hp>0).length+' alive · '+stats.rifleShots+' bullets · '+stats.rocketShots+' rockets · '+stats.terrainHits+' ground impacts');const e=sim.events.at(-1);$('eventLog').textContent=e?e.type==='damage'?'Last hit: '+e.amount.toFixed(2)+' HP':e.type==='rocketImpact'?'Rocket impact at '+Math.round(e.x):e.type==='bulletBlocked'?'Bullet stopped by terrain':'':'';}
$('level').addEventListener('change',selectLevel);$('scenario').addEventListener('change',()=>start($('scenario').value));
$('run').onclick=()=>{running=!running;accumulator=0;$('run').textContent=running?'Pause':'Run';};
$('step').onclick=()=>{pause();stepSimulation(sim,120);render();};$('reset').onclick=()=>start(sim.scenarioId);
$('sight').onchange=render;$('zoom').onclick=()=>{zoom=zoom===1?2:1;$('zoom').textContent=zoom===1?'Zoom in':'Fit terrain';$('zoom').setAttribute('aria-pressed',String(zoom!==1));render();};
$('json').onclick=()=>{pause();$('source').value=JSON.stringify(data,null,2);$('error').textContent='';$('jsonPanel').hidden=false;};$('closeJson').onclick=()=>{$('jsonPanel').hidden=true;};
function applySource(){try{const level=validateLevel(JSON.parse($('source').value));loadId++;install(level);$('jsonPanel').hidden=true;$('error').textContent='';}catch(e){$('error').textContent=e.message;}}
$('apply').onclick=applySource;
$('download').onclick=()=>{try{const level=validateLevel(JSON.parse($('source').value));const url=URL.createObjectURL(new Blob([JSON.stringify(level,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='terrain-level.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){$('error').textContent=e.message;}};
$('import').onclick=()=>$('upload').click();$('upload').onchange=async()=>{const file=$('upload').files[0];if(!file)return;if(file.size>100000){$('error').textContent='Level file must be under 100 KB.';return;}try{$('source').value=await file.text();$('error').textContent='Press Apply JSON to try this level.';}catch(e){$('error').textContent='Could not read file.';}$('upload').value='';};
canvas.onpointerdown=e=>{drag={id:e.pointerId,x:e.clientX,center};canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(drag&&e.pointerId===drag.id&&transform&&zoom>1){center=drag.center-(e.clientX-drag.x)/transform.scale;center=Math.max(0,Math.min(data.world.width,center));render();}};canvas.onpointerup=canvas.onpointercancel=e=>{if(drag?.id===e.pointerId){if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);drag=null;}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('resize',()=>{const next=innerWidth<500;if(next!==portrait){portrait=next;zoom=portrait?2:1;center=sim?.level.world.width/2||600;$('zoom').textContent=zoom===1?'Zoom in':'Fit terrain';$('zoom').setAttribute('aria-pressed',String(zoom!==1));}render();});
if(testMode)window.terrainTest={snapshot:()=>snapshot(sim),step:count=>{pause();stepSimulation(sim,count);render();},load:level=>{install(validateLevel(level));},scenario:id=>start(id)};
function frame(now){const elapsed=Math.min(.1,(now-last)/1000||0);last=now;if(running&&sim){accumulator+=elapsed;while(accumulator>=LAB_STEP){stepSimulation(sim);accumulator-=LAB_STEP;}}render();requestAnimationFrame(frame);}
await selectLevel();requestAnimationFrame(frame);
