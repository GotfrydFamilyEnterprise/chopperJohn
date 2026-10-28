import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {validateLevel,loadLevel} from '../docs/js/battlefield/terrain/level.js';
import {groundY,terrainContact,visible,walkSurface} from '../docs/js/battlefield/terrain/heightfield.js';
import {createSimulation,stepSimulation,snapshot,rocketPlan} from '../docs/js/battlefield/terrain/simulation.js';
const level=id=>JSON.parse(readFileSync(new URL('../docs/levels/'+id+'.json',import.meta.url)));
test('TL-01 shipped JSON levels round trip, clone, malformed geometry/units/version rejected',()=>{
 for(const id of ['ridge','valley','bumps']){const input=level(id),valid=validateLevel(input);assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(valid))),valid);input.terrain.points[0][1]=12;assert.equal(valid.terrain.points[0][1],0);}
 for(const mutate of [d=>d.schemaVersion=2,d=>d.name='',d=>d.name='  ',d=>d.scenarios[0].name='',d=>d.scenarios[0].name='  ',d=>d.seed=-1,d=>d.terrain.points[1][0]=0,d=>d.terrain.points[1][1]=NaN,d=>d.terrain.points[0][0]=1,d=>d.terrain.points[1][1]=250,d=>d.scenarios[0].units[0].x=-1,d=>d.scenarios[0].units[1].id=1,d=>d.scenarios[0].combat='yes',d=>d.world.width=Infinity]){const d=level('ridge');mutate(d);assert.throws(()=>validateLevel(d));}
});
test('TL-01 network failures and non-JSON data fail explicitly',async()=>{await assert.rejects(loadLevel('/bad',async()=>({ok:false,status:404})),/404/);await assert.rejects(loadLevel('/bad',async()=>({ok:true,json:async()=>({})})),/schemaVersion/);});
test('TL-02 surface interpolation/clamping and constant surface speed through corners',()=>{
 const d=level('ridge');assert.equal(groundY(d,600),350);assert.equal(groundY(d,510),420);assert.equal(groundY(d,-100),500);assert.equal(groundY(d,1300),500);
 assert.ok(Math.abs(walkSurface(d,420,Math.hypot(180,140))-600)<1e-8);assert.ok(Math.abs(walkSurface(d,600,-Math.hypot(180,140))-420)<1e-8);
 assert.equal(walkSurface(d,1190,100),1200);assert.equal(walkSurface(d,10,-100),0);
 for(const id of ['ridge','valley','bumps']){const s=createSimulation(level(id),'walk');for(let i=0;i<2400;i++){const previous=s.units.map(u=>({...u}));stepSimulation(s);for(let j=0;j<s.units.length;j++){const u=s.units[j],p=previous[j];assert.equal(u.y,groundY(s.level,u.x));assert.ok(Math.hypot(u.x-p.x,u.y-p.y)<=47/120+1e-8);}}assert.equal(s.stats.rifleShots,0);}
});
test('TL-03 swept collision blocks both directions, vertical/tangent/start-underground cases',()=>{
 const d=level('ridge'),a={x:480,y:403},b={x:720,y:403};assert.equal(visible(d,a,b),false);assert.equal(visible(d,b,a),false);assert.ok(terrainContact(d,a,b).x<600);
 assert.equal(terrainContact(d,{x:600,y:300},{x:600,y:400}).y,350);assert.equal(terrainContact(d,{x:500,y:350},{x:700,y:350}).x,600);assert.equal(terrainContact(d,{x:600,y:400},{x:610,y:410}).t,0);assert.equal(visible(d,{x:480,y:250},{x:720,y:250}),true);
});
test('TL-03 ridge conceals while valley exposes: real shots/damage, enemy-only filters',()=>{
 const ridge=createSimulation(level('ridge'),'rifles');stepSimulation(ridge,1200);assert.equal(ridge.stats.rifleShots,0);assert.ok(ridge.units.every(u=>u.hp===3));
 const valley=createSimulation(level('valley'),'rifles');stepSimulation(valley,1200);assert.ok(valley.stats.hits>=6);assert.ok(valley.units.every(u=>u.hp===0));
 const friendly=level('valley');friendly.scenarios[1].units[1].team=0;const f=createSimulation(friendly,'rifles');stepSimulation(f,1200);assert.equal(f.stats.rifleShots,0);
});
test('TL-03 physical bullets stop on slope when eyes visible but muzzle occluded',()=>{
 const d=level('ridge');d.terrain.points=[[0,0],[480,0],[600,36],[720,0],[1200,0]];const s=createSimulation(d,'rifles');stepSimulation(s,240);assert.ok(s.stats.rifleShots>0);assert.ok(s.events.some(e=>e.type==='bulletBlocked'));assert.ok(s.units.every(u=>u.hp===3));
});
test('TL-04 terrain-aware rockets launch/impact without homing, scatter, elevated endpoint and cover',()=>{
 const s=createSimulation(level('ridge'),'rockets');stepSimulation(s,100);assert.ok(s.projectiles.length===2);const p={...s.projectiles[0]};s.units[1].x+=100;stepSimulation(s,60);const live=s.projectiles.find(r=>r.originX===p.originX);assert.equal(live.vx,p.vx);assert.equal(live.vy,p.vy);
 const elevated=level('valley'),shot=rocketPlan(elevated,{x:300,y:groundY(elevated,300),team:0},{x:800,observedVelocity:0});assert.ok(Math.abs(shot.originY+shot.vy*shot.flightTime+120*shot.flightTime**2-groundY(elevated,shot.impactX))<1e-6);
 const run=createSimulation(level('ridge'),'rockets');stepSimulation(run,2400);assert.ok(run.stats.rocketShots>4);assert.ok(run.stats.terrainHits>4);assert.ok(run.events.filter(e=>e.type==='rocketShot').some(e=>e.error!==0));for(const e of run.events.filter(e=>e.type==='rocketImpact'))assert.ok(Math.abs(e.y-groundY(run.level,e.x))<1e-6);
});
test('TL-05 same seed and steps reproduce all states, fresh reset discards old damage/projectiles',()=>{
 const a=createSimulation(level('ridge'),'rockets'),b=createSimulation(level('ridge'),'rockets');stepSimulation(a,2400);for(let i=0;i<24;i++)stepSimulation(b,100);assert.deepEqual(snapshot(a),snapshot(b));assert.deepEqual(snapshot(createSimulation(level('ridge'),'rockets')),snapshot(createSimulation(level('ridge'),'rockets')));assert.throws(()=>stepSimulation(a,-1));
});
test('TL-06 all terrain presets physically walk/fire while holders stay fixed and metrics reflect shots',()=>{
 for(const id of ['ridge','valley','bumps'])for(const scenarioId of ['crest-red','crest-blue','approach-blue','approach-red']){
  const sim=createSimulation(level(id),scenarioId),initial=sim.units.map(u=>u.x);let movingFire=false,pendingReturn=false;
  for(let i=0;i<12000&&!sim.result;i++){
   const before=sim.units.map(u=>({...u}));stepSimulation(sim);
   sim.units.forEach((u,k)=>{if(u.mode==='hold')assert.equal(u.x,initial[k]);if(u.mode==='walk'&&u.hp>0&&u.shotsFired>0&&Math.abs(u.x-before[k].x)>0)movingFire=true;assert.equal(u.y,groundY(sim.level,u.x));});
   if(sim.units.some(u=>u.hp===0)&&sim.projectiles.length){pendingReturn=true;assert.equal(sim.result,null);}
  }
  assert.ok(movingFire,id+scenarioId);assert.ok(sim.result);assert.ok(sim.units.every(u=>u.firstShotAt>0&&u.shotsFired>=3));assert.equal(sim.stats.rifleShots,sim.units.reduce((n,u)=>n+u.shotsFired,0));assert.equal(sim.projectiles.length,0);
  const final=snapshot(sim);stepSimulation(sim,1200);assert.deepEqual(snapshot(sim),final);

 }
});
test('TL-06 mirrored ridge swaps winner, and array order does not alter contact or result',()=>{
 const d=level('ridge'),a=createSimulation(d,'approach-blue'),b=createSimulation(d,'approach-red');stepSimulation(a,12000);stepSimulation(b,12000);assert.equal(a.result.winner,0);assert.equal(b.result.winner,1);assert.ok(Math.abs(a.result.time-b.result.time)<1e-8);assert.equal(a.units[0].hp,b.units[1].hp);
 const reversed=structuredClone(d);reversed.scenarios.forEach(s=>s.units.reverse());const c=createSimulation(reversed,'approach-blue');stepSimulation(c,12000);assert.deepEqual(c.result,a.result);
 for(const u of a.units){const v=c.units.find(v=>v.id===u.id);assert.equal(v.hp,u.hp);assert.ok(Math.abs(v.x-u.x)<1e-8);assert.equal(v.firstShotAt,u.firstShotAt);assert.equal(v.shotsFired,u.shotsFired);}
});
test('TL-06 actual uphill/downhill barrel direction, return fire settles before draw',()=>{
 const s=createSimulation(level('ridge'),'crest-red');while(!s.stats.rifleShots)stepSimulation(s);assert.ok(s.units[0].rifleAimAngle<0);assert.ok(Math.sin(s.units[1].rifleAimAngle)>0);assert.equal(s.units[0].firstShotAt,s.units[1].firstShotAt);assert.ok(s.projectiles.some(p=>p.vy<0));assert.ok(s.projectiles.some(p=>p.vy>0));stepSimulation(s,12000);assert.equal(s.result.winner,null);assert.ok(s.units.every(u=>u.hp===0));assert.equal(s.projectiles.length,0);
});
test('TL-06 fired outcome metrics and full replay reset remain deterministic',async()=>{
 const {combatSummary}=await import('../docs/js/battlefield/terrain/outcomes.js');
 const a=createSimulation(level('ridge'),'approach-blue');stepSimulation(a,12000);const summary=combatSummary(a);assert.match(summary.outcome,/Blue survives/);assert.equal(summary.teams[0].hp,1);assert.equal(summary.teams[0].shots,4);assert.equal(summary.teams[0].firstShot,5.5);
 const b=createSimulation(level('ridge'),'approach-blue');for(let i=0;i<1200;i++)stepSimulation(b,10);assert.deepEqual(snapshot(a),snapshot(b));const fresh=combatSummary(createSimulation(level('ridge'),'approach-blue'));assert.ok(fresh.teams.every(t=>t.shots===0&&t.firstShot===null));assert.equal(fresh.outcome,'Waiting for contact');
});
test('TL-06 one death cannot finish a match before a slower return bullet arrives',()=>{
 const d=level('ridge');d.terrain.points=[[0,0],[1200,0]];const s=createSimulation(d,'rifles');s.units.forEach(u=>u.fireCooldown=1000);s.units.forEach(u=>u.hp=1);
 s.projectiles.push({kind:'bullet',team:0,x:712,y:468,vx:900,vy:0,age:0},{kind:'bullet',team:1,x:580,y:468,vx:-100,vy:0,age:0});
 stepSimulation(s,2);assert.equal(s.units[1].hp,0);assert.equal(s.units[0].hp,1);assert.equal(s.result,null);assert.equal(s.projectiles.length,1);
 stepSimulation(s,200);assert.equal(s.result.winner,null);assert.ok(s.result.time>.9);assert.ok(s.units.every(u=>u.hp===0));
});
test('TL-07 angular tracers are parallel to actual bullet velocity in every direction',async()=>{
 const {projectileTail}=await import('../docs/js/battlefield/terrain/ballistics.js');
 for(const [vx,vy] of [[3,4],[-3,4],[3,-4],[-3,-4],[0,-5]]){const p={kind:'bullet',x:100,y:100,vx,vy,age:0},tail=projectileTail(p,5);assert.ok(Math.abs((p.x-tail.x)*vy-(p.y-tail.y)*vx)<1e-8);assert.ok(Math.abs(Math.hypot(p.x-tail.x,p.y-tail.y)-5)<1e-8);}
 assert.deepEqual(projectileTail({x:1,y:2,vx:0,vy:0,kind:'bullet'}),{x:1,y:2});
});
test('TL-07 800-unit lab range and scatter, inclusive bounds and target filtering',async()=>{
 const {LAB_ROCKET,labRocketSpread}=await import('../docs/js/battlefield/terrain/ballistics.js');const {targetFor}=await import('../docs/js/battlefield/terrain/simulation.js');
 assert.equal(LAB_ROCKET.maxRange,800);assert.equal(labRocketSpread(600),66);assert.equal(labRocketSpread(800),98);
 const d=level('rocket-ridge');d.terrain.points=[[0,0],[1800,0]];const s=createSimulation(d,'rocket-range'),u=s.units[0],target=s.units[1];assert.equal(targetFor(s,u).id,target.id);
 target.x=1300.01;assert.equal(targetFor(s,u),null);target.x=725;assert.equal(targetFor(s,u).id,target.id);target.x=724.99;assert.equal(targetFor(s,u),null);target.x=1300;target.team=0;assert.equal(targetFor(s,u),null);target.team=1;target.hp=0;assert.equal(targetFor(s,u),null);
});
test('TL-07 solver picks low open arc and higher clear ridge arc with exact endpoint and real muzzle',async()=>{
 const {planTerrainRocket,LAB_ROCKET}=await import('../docs/js/battlefield/terrain/ballistics.js');const d=level('rocket-ridge'),flat=structuredClone(d);flat.terrain.points=[[0,0],[1800,0]];const u={x:500,y:500,team:0},t={x:1300,observedVelocity:0},low=planTerrainRocket(flat,u,t),high=planTerrainRocket(d,u,t);
 assert.ok(high.elevation>low.elevation);assert.ok(high.flightTime>low.flightTime);assert.ok(Math.abs(low.elevation-50*Math.PI/180)>.1);
 for(const shot of [low,high]){assert.ok(shot.speed<=LAB_ROCKET.maxSpeed);assert.ok(Math.abs(Math.hypot(shot.originX-u.x,shot.originY-(u.y-42))-34)<1e-8);assert.ok(Math.abs(shot.originX+shot.vx*shot.flightTime-shot.impactX)<1e-7);assert.ok(Math.abs(shot.originY+shot.vy*shot.flightTime+120*shot.flightTime**2-groundY(d,shot.impactX))<1e-7);for(let t=.001;t<shot.flightTime-.001;t+=.002){const p={x:shot.originX+shot.vx*t,y:shot.originY+shot.vy*t+120*t*t};assert.ok(p.y<groundY(shot===low?flat:d,p.x));}}
 const mirrored=planTerrainRocket(d,{x:1300,y:500,team:1},{x:500,observedVelocity:0});assert.ok(Math.abs(mirrored.flightTime-high.flightTime)<1e-8);assert.ok(Math.abs(mirrored.vx+high.vx)<1e-8);
});
test('TL-07 solver search is within20ms of a fine independent feasibility oracle',async()=>{
 const {planTerrainRocket}=await import('../docs/js/battlefield/terrain/ballistics.js');const d=level('rocket-ridge'),u={x:500,y:500,team:0},target={x:1300,observedVelocity:0},shot=planTerrainRocket(d,u,target);let oracle=null;
 for(let t=1;t<4;t+=.001){const dx=800,dy=42-120*t*t,len=Math.hypot(dx,dy),speed=(len-34)/t,nx=dx/len,ny=dy/len,angle=Math.atan2(-ny,nx);if(speed>520||angle<8*Math.PI/180||angle>80*Math.PI/180)continue;let clear=true;for(let j=0;j<=1000;j++){const a=t*j/1000,x=u.x+34*nx+nx*speed*a,y=u.y-42+34*ny+ny*speed*a+120*a*a;if(j<1000&&groundY(d,x)-y<0){clear=false;break;}}if(clear){oracle=t;break;}}
 assert.ok(oracle!==null);assert.ok(shot.flightTime>=oracle-.002);assert.ok(shot.flightTime-oracle<.04); // 20ms grid plus explicit2-unit ridge safety.
});
test('TL-07 lead, unreachable rejection and unchanged committed trajectories',async()=>{
 const {planTerrainRocket}=await import('../docs/js/battlefield/terrain/ballistics.js');const d=level('rocket-ridge'),u={x:500,y:500,team:0};const shot=planTerrainRocket(d,u,{x:1150,observedVelocity:20});assert.ok(shot.aimedX>1150);assert.ok(Math.abs(shot.aimedX-1150-20*shot.flightTime)<1e-8);assert.equal(planTerrainRocket(d,{...u,y:1500},{x:1300}),null);
 const s=createSimulation(d,'rocket-approach-blue');stepSimulation(s,600);assert.ok(s.units[0].x>680);assert.ok(s.units[1].x<1680);assert.ok(s.stats.rocketShots>=2);const p={...s.projectiles[0]};s.units[1].x-=40;stepSimulation(s,12);const live=s.projectiles.find(v=>v.originX===p.originX);if(live){assert.equal(live.vx,p.vx);assert.equal(live.vy,p.vy);}assert.ok(s.events.some(e=>e.type==='rocketShot'&&Number.isFinite(e.angle)));
});
test('TL-07 longer-level rocket encounters replay identically across step batching',()=>{
 const d=level('rocket-ridge');for(const id of ['rocket-approach-blue','rocket-approach-red','mixed-rocket-blue','mixed-rocket-red']){const a=createSimulation(d,id),b=createSimulation(d,id);stepSimulation(a,2400);for(let i=0;i<240;i++)stepSimulation(b,10);assert.deepEqual(snapshot(a),snapshot(b));assert.ok(a.stats.rocketShots>0);assert.ok(a.stats.terrainHits>0);}
});
test('TL-07 inward scatter cannot skip a faster feasible trajectory (independent review regression)',async()=>{
 const {planTerrainRocket}=await import('../docs/js/battlefield/terrain/ballistics.js');const d=level('rocket-ridge');d.terrain.points=[[0,0],[1800,0]];
 const shot=planTerrainRocket(d,{x:500,y:500,team:0},{x:1300,observedVelocity:0},-98);assert.ok(shot.flightTime<1.343);assert.equal(shot.impactX,1202);assert.ok(shot.speed<=520);assert.ok(Math.abs(shot.originY+shot.vy*shot.flightTime+120*shot.flightTime**2-500)<1e-8);
});
