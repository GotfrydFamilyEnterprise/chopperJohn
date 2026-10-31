import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {BALANCE_CASES,BLAST_RADII,balanceLevel,hillBalanceLevel,encounterLevel,forceEconomics,forceValue} from '../docs/js/battlefield/terrain/balance.js';
import {createSimulation,stepSimulation,snapshot} from '../docs/js/battlefield/terrain/simulation.js';
import {validateLevel} from '../docs/js/battlefield/terrain/level.js';
import {WEAPONS} from '../docs/js/battlefield/combat/weapons.js';
import {SUPPLY_RULES} from '../docs/js/battlefield/economy/supply.js';
const radiusBurst=(radius,blocked=false)=>{
 const d=balanceLevel();d.scenarios=[{id:'burst',name:'Burst fixture',combat:false,units:[0,20,25,39,40,50].map((offset,i)=>({id:i+1,team:1,type:'rifle',mode:'hold',x:1200+offset})).concat({id:7,team:0,type:'rocket',mode:'hold',x:1200})}];
 if(blocked)d.terrain.points=[[0,0],[1200,0],[1219,19],[1238,0],[2400,0]];
 const sim=createSimulation(d,'burst',{blastRadius:radius});
 sim.projectiles.push({kind:'rocket',team:0,x:1200,y:500,originX:1200,originY:500,vx:100,vy:0,age:0});stepSimulation(sim);return sim;
};
test('TL-09 blast comparison changes real damage radius, retains center/falloff/edge/friendly rules',()=>{
 for(const radius of BLAST_RADII){const s=radiusBurst(radius);assert.equal(s.stats.terrainHits,1);assert.equal(s.units[0].hp,1);assert.equal(s.units[6].hp,4);assert.equal(s.effects[0].radius,radius);for(let i=0;i<6;i++){const distance=[0,20,25,39,40,50][i];assert.ok(Math.abs(s.units[i].hp-(3-Math.max(0,2*(1-distance/radius))))<1e-8);}}
 assert.equal(createSimulation(balanceLevel(),'long').blastRadius,40);assert.equal(WEAPONS.blastRadius,25);
 for(const blastRadius of [0,-1,41,NaN,'40',Infinity])assert.throws(()=>createSimulation(balanceLevel(),'long',{blastRadius}),/Blast radius/);
});
test('TL-09 larger splash still cannot penetrate terrain',()=>{
 const s=radiusBurst(50,true);assert.equal(s.units[3].hp,3);assert.equal(s.units[4].hp,3);assert.equal(s.units[0].hp,1);
});
test('TL-09 fixtures use shared prices, exact costs or explicit budget remainder, and population cap',()=>{
 assert.deepEqual(SUPPLY_RULES.costs,{rifle:25,rocket:60});
 for(const c of BALANCE_CASES){const d=encounterLevel(c.id),v=validateLevel(d);assert.ok(v.scenarios[0].units.length<=24);const s=createSimulation(d,c.id);for(const team of [0,1]){const u=s.units.filter(u=>u.team===team);assert.ok(u.length<=SUPPLY_RULES.unitLimit);assert.equal(forceValue(u),forceEconomics(s,team).fielded);}if(['close','long','cluster','spread'].includes(c.id))assert.equal(forceEconomics(s,0).fielded,forceEconomics(s,1).fielded);else if(c.id!=='mirror'){assert.equal(forceEconomics(s,0).fielded,220);assert.equal(forceEconomics(s,1).fielded,240);}}
 for(const id of ['battle-lines','battle-hill','battle-cover'])validateLevel(JSON.parse(readFileSync('docs/levels/'+id+'.json')));
 assert.deepEqual(validateLevel(balanceLevel()),validateLevel(JSON.parse(readFileSync('docs/levels/battle-lines.json'))));assert.deepEqual(validateLevel(hillBalanceLevel()),validateLevel(JSON.parse(readFileSync('docs/levels/battle-hill.json'))));
});
test('TL-09 mirror preserves roles/terrain/costs, replay batches preserve actual outcomes',()=>{
 for(const id of ['close','screen','high','reverse']){const a=createSimulation(encounterLevel(id,3),id),b=createSimulation(encounterLevel(id,3,true),id),c=createSimulation(encounterLevel(id,3),id);stepSimulation(a,1200);stepSimulation(b,1200);for(let i=0;i<10;i++)stepSimulation(c,120);assert.deepEqual(snapshot(a),snapshot(c));for(const u of a.units){const v=b.units.find(v=>v.id===u.id);assert.ok(Math.abs(u.hp-v.hp)<1e-6);assert.ok(Math.abs(u.x+v.x-2400)<1e-6);assert.equal(u.shotsFired,v.shotsFired);}assert.equal(forceEconomics(a,0).lost,forceEconomics(b,1).lost);}
});
test('TL-09 survivor value uses full replacement cost and never silently counts damaged troops as destroyed',()=>{
 const s=createSimulation(balanceLevel(),'screen'),u=s.units[0];u.hp=.1;assert.equal(forceEconomics(s,0).lost,0);u.hp=0;assert.equal(forceEconomics(s,0).lost,25);assert.equal(forceEconomics(s,0).surviving,195);assert.equal(forceEconomics(s,1).surviving,240);
});
