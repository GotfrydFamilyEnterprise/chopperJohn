import test from 'node:test';
import assert from 'node:assert/strict';
import {stepBattleRocket,helicopterBurstDamage} from '../docs/js/battlefield/combat/airRocketFlight.js';
import {allocateRocketTargets} from '../docs/js/battlefield/combat/rocketAllocation.js';
import {createHelicopter,damageHelicopter,repairHelicopter,updateHelicopter} from '../docs/js/battlefield/aircraft/helicopter.js';
import {createSoldier} from '../docs/js/battlefield/units/soldierCommon.js';
const h={...createHelicopter(),x:1600,y:150,grounded:false};
const rocket=()=>({id:1,kind:'airRocket',team:1,originX:1500,originY:200,vx:200,vy:-100,age:0,flightTime:2,terminalCause:'range'});
function run(dt,heli=h){const r=rocket();let e;while(!r.done)e=stepBattleRocket(r,dt,heli,heli);return e;}
test('AA-COLLISION independent coarse/fine event equivalence',()=>{const reference=run(1/2000);for(const dt of [1/30,1/60,1/120]){const e=run(dt);assert.equal(e.cause,reference.cause);assert.ok(Math.abs(e.age-reference.age)<1e-5);assert.equal(helicopterBurstDamage(e,h),5);}});
test('AA-COLLISION initial receding envelope and initial direct resolve immediately exactly once',()=>{for(const [x,cause] of [[1460,'proximity'],[1500,'direct']]){const heli={...h,x,y:200};const r=rocket();const e=stepBattleRocket(r,1/30,heli,heli);assert.equal(e.cause,cause);assert.equal(e.age,0);assert.equal(stepBattleRocket(r,1/30,heli,heli),null);}});
test('H-DEATH parked dead aircraft cannot repair and repeated damage cannot restart timer',()=>{const a=createHelicopter();damageHelicopter(a,100);updateHelicopter(a,{},4);damageHelicopter(a,100);repairHelicopter(a,100);assert.equal(a.respawnRemaining,6);assert.equal(a.hp,0);});
test('AA-GROUP disconnected factions/groups and capability fallback never assign unavailable threats',()=>{for(const team of [0,1]){const units=[0,10,300,310].map((offset,i)=>createSoldier(i+1,team,'rocket',(team===1?2200:1400)+offset,460));const heli={...h,team:1-team,x:team===1?1800:1800,y:220};const a=allocateRocketTargets(units,heli);for(const c of a.values()){assert.equal(c.kind,'air');assert.ok(c.plan);assert.equal(c.target,heli);}assert.ok(a.size>0);}});
