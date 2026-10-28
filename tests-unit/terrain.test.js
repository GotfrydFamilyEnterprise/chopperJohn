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
