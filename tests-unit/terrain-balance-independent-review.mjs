// TL-09 independently authored negative and full-combat probes. Run: node tests-unit/terrain-balance-independent-review.mjs
import assert from 'node:assert/strict';
import {createSimulation,stepSimulation,snapshot,targetFor} from '../docs/js/battlefield/terrain/simulation.js';
import {encounterLevel,BALANCE_CASES,forceEconomics} from '../docs/js/battlefield/terrain/balance.js';
import {WEAPONS} from '../docs/js/battlefield/combat/weapons.js';
const rows=[];
for(const id of ['close','long','reverse','mirror']){
 const a=createSimulation(encounterLevel(id,7),id,{blastRadius:40});
 const b=createSimulation(encounterLevel(id,7,true),id,{blastRadius:40});
 stepSimulation(a,3600);stepSimulation(b,3600);
 for(const u of a.units){const v=b.units.find(v=>v.id===u.id);assert.ok(Math.abs(u.x+v.x-2400)<1e-5,id+' x');assert.ok(Math.abs(u.hp-v.hp)<1e-6,id+' hp');assert.equal(u.shotsFired,v.shotsFired,id+' shots');}
 assert.equal(a.random.state(),b.random.state());assert.equal(a.result?.winner==null?a.result?.winner:1-a.result.winner,b.result?.winner);
 rows.push({id,time:a.time,result:a.result,costs:[0,1].map(t=>forceEconomics(a,t)),projectiles:a.projectiles.length});
}
for(const radius of [25,40,50]){
 const d=encounterLevel('close');d.scenarios[0]={id:'probe',name:'probe',combat:false,units:[{id:1,team:0,type:'rocket',mode:'hold',x:1200},{id:2,team:1,type:'rifle',mode:'hold',x:1200},{id:3,team:1,type:'rocket',mode:'hold',x:1200+radius/2},{id:4,team:1,type:'rifle',mode:'hold',x:1200+radius},{id:5,team:0,type:'rifle',mode:'hold',x:1200+radius/2}]};
 const s=createSimulation(d,'probe',{blastRadius:radius});s.projectiles.push({kind:'rocket',team:0,x:1200,y:500,originX:1200,originY:500,vx:1,vy:0,age:0});stepSimulation(s);
 assert.deepEqual(s.units.map(u=>u.hp),[4,1,3,3,3]);assert.equal(s.effects[0].radius,radius);
}
assert.equal(WEAPONS.blastRadius,25);
const d=encounterLevel('close');d.scenarios[0].units=[{id:1,team:0,type:'rifle',mode:'hold',x:100},{id:2,team:1,type:'rocket',mode:'hold',x:2000}];const s=createSimulation(d,'close');stepSimulation(s,120);assert.equal(s.result,null);assert.equal(s.projectiles.length,0);assert.equal(s.stats.hits,0);
console.log(JSON.stringify({passed:'mirrors at 30s, three-radius enemy-kind/edge/friendly, unresolved separation, production radius',rows},null,2));
