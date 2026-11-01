import test from 'node:test';import assert from 'node:assert/strict';
import {allocateSplash,checkedDamageModel} from '../docs/js/battlefield/terrain/splash.js';
import {createRandom} from '../docs/js/battlefield/combat/weapons.js';
import {createSimulation,stepSimulation,snapshot} from '../docs/js/battlefield/terrain/simulation.js';
import {balanceLevel,encounterLevel} from '../docs/js/battlefield/terrain/balance.js';
test('TL-10 centered crowd budget grows sublinearly, equal expected shares and bounded randomness',()=>{
 for(const count of [1,2,4,8]){const victims=Array.from({length:count},(_,i)=>({id:i+1,falloff:1})),r=allocateSplash(victims,createRandom(2));assert.ok(Math.abs(r.budget-2*Math.sqrt(count))<1e-9);assert.ok(Math.abs(r.shares.reduce((n,s)=>n+s.amount,0)-r.budget)<1e-9);assert.ok(r.shares.every(s=>s.amount>0&&s.amount<=2));}
 const totals=[0,0,0,0],random=createRandom(55);for(let i=0;i<20000;i++)allocateSplash(totals.map((_,id)=>({id,falloff:1})),random).shares.forEach(s=>totals[s.id]+=s.amount);for(const t of totals)assert.ok(Math.abs(t/20000-1)<.01);
});
test('TL-10 distance caps, edge immunity, deterministic stable IDs and legacy comparison',()=>{
 const victims=[{id:1,falloff:1},{id:2,falloff:.5},{id:3,falloff:.1},{id:4,falloff:0}];
 const a=allocateSplash(victims,createRandom(7)),b=allocateSplash([...victims].reverse(),createRandom(7));assert.deepEqual(a,b);assert.ok(Math.abs(a.shares.reduce((n,s)=>n+s.amount,0)-2*Math.sqrt(1.6))<1e-8);for(const s of a.shares)assert.ok(s.amount<=2*victims.find(v=>v.id===s.id).falloff+1e-9);assert.equal(a.shares[3].amount,0);
 assert.deepEqual(allocateSplash(victims,createRandom(1),'individual').shares.map(x=>x.amount),[2,1,.2,0]);assert.equal(allocateSplash([],createRandom(1)).budget,0);
 for(const bad of ['x','',null])assert.throws(()=>checkedDamageModel(bad));assert.throws(()=>allocateSplash([{id:1,falloff:NaN}],createRandom(1)));assert.throws(()=>allocateSplash([{id:1,falloff:1},{id:1,falloff:1}],createRandom(1)));
});
test('TL-10 isolated single victim preserves damage and RNG state; empty fringe adds no shielding',()=>{
 const random=createRandom(12),state=random.state();assert.equal(allocateSplash([{id:1,falloff:.7}],random).shares[0].amount,1.4);assert.equal(random.state(),state);assert.equal(allocateSplash([{id:1,falloff:1},{id:2,falloff:0}],random).shares[0].amount,2);
});
test('TL-10 actual shared impact allocates one pool, ignores friendlies, retains overkill and reset rules',()=>{
 const d=balanceLevel();d.scenarios=[{id:'burst',name:'Shared burst',combat:false,units:Array.from({length:4},(_,i)=>({id:i+1,team:1,type:i===3?'rocket':'rifle',x:1200,mode:'hold'})).concat({id:5,team:0,type:'rifle',x:1200,mode:'hold'})}];
 const s=createSimulation(d,'burst');assert.equal(s.damageModel,'shared');s.units[0].hp=.01;s.projectiles.push({kind:'rocket',team:0,x:1200,y:500,originX:1200,originY:500,vx:100,vy:0,age:0});stepSimulation(s);
 const damage=s.events.filter(e=>e.type==='damage');assert.equal(damage.length,4);assert.ok(Math.abs(damage.reduce((n,e)=>n+e.allocated,0)-4)<1e-8);assert.ok(damage.reduce((n,e)=>n+e.amount,0)<4);assert.equal(s.units[4].hp,3);assert.equal(s.effects[0].budget,4);assert.equal(s.units[0].hp,0);assert.equal(snapshot(createSimulation(d,'burst')).events.length,0);
});
test('TL-10 both damage modes replay across step batching and mirrored faction positions',()=>{
 for(const damageModel of ['shared','individual']){const a=createSimulation(encounterLevel('cluster',5),'cluster',{damageModel}),b=createSimulation(encounterLevel('cluster',5),'cluster',{damageModel}),c=createSimulation(encounterLevel('cluster',5,true),'cluster',{damageModel});stepSimulation(a,1200);for(let i=0;i<100;i++)stepSimulation(b,12);stepSimulation(c,1200);assert.deepEqual(snapshot(a),snapshot(b));for(const u of a.units){const v=c.units.find(v=>v.id===u.id);assert.ok(Math.abs(u.hp-v.hp)<1e-6);assert.equal(u.shotsFired,v.shotsFired);}}
});
