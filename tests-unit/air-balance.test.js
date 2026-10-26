import test from 'node:test';import assert from 'node:assert/strict';
import {createHelicopter,damageHelicopter,updateHelicopter} from '../docs/js/battlefield/aircraft/helicopter.js';
import {updateAircraftSupport} from '../docs/js/battlefield/aircraft/aircraftSupport.js';
import {updateHelicopterGun} from '../docs/js/battlefield/combat/helicopterGun.js';
import {createSupply,accrueSupply,purchaseReplacement} from '../docs/js/battlefield/economy/supply.js';
import {createCommander,updateCommander} from '../docs/js/battlefield/ai/redCommander.js';
import {updateAirPressure} from '../docs/js/battlefield/ai/airPressure.js';
import {createBase} from '../docs/js/battlefield/bases/baseCommon.js';
import {createSoldier} from '../docs/js/battlefield/units/soldierCommon.js';
import {allocateRocketTargets} from '../docs/js/battlefield/combat/rocketAllocation.js';
import {updatePrioritizedRocket} from '../docs/js/battlefield/combat/targetPriority.js';
test('BAL-02 paid replacement waits ten seconds and enough supply, charges exactly once',()=>{
 const h=createHelicopter(),a=createSupply();a.balance=0;damageHelicopter(h,100);
 for(let i=0;i<599;i++){updateHelicopter(h,{},1/60,460,3600,{respawn:false});updateAircraftSupport(h,1/60,a);}assert.equal(h.hp,0);assert.equal(a.spent,0);
 updateHelicopter(h,{},1/60,460,3600,{respawn:false});assert.equal(updateAircraftSupport(h,1/60,a).waitingSupply,true);
 accrueSupply(a,18);assert.equal(updateAircraftSupport(h,0,a).respawned,true);assert.equal(h.id,'helicopter:2');assert.equal(h.ammo,120);assert.equal(a.balance,0);assert.equal(a.spent,90);assert.equal(a.ledger[0].type,'helicopter');
 updateAircraftSupport(h,1,a);assert.equal(a.spent,90);assert.equal(a.ledger.length,1);
});
test('BAL-02 transaction failure and replacement do not alter troop cooldown',()=>{const a=createSupply();a.cooldown=1;const before=structuredClone(a);assert.equal(purchaseReplacement(a,()=>null).unit,null);assert.deepEqual(a,before);assert.ok(purchaseReplacement(a,()=>({id:'heli:2'})).unit);assert.equal(a.cooldown,1);assert.equal(a.balance,30);});
test('BAL-03 gun spends exactly120 rounds over15 seconds then cannot fire',()=>{const h=createHelicopter();let shots=0;for(let i=0;i<960;i++)shots+=updateHelicopterGun(h,true,1/60).length;assert.equal(shots,120);assert.equal(h.ammo,0);assert.equal(updateHelicopterGun(h,true,1).length,0);});
test('BAL-03 parked reload30/s, cap, fire/moving/off-pad/dead restrictions',()=>{const a=createSupply();for(const patch of [{},{x:459},{vx:5.1},{grounded:false},{hp:0},{fire:true}]){const h={...createHelicopter(),ammo:0,...patch};updateAircraftSupport(h,1,a,{fire:!!patch.fire,replace:false});assert.equal(h.ammo,Object.keys(patch).length?0:30);}const h={...createHelicopter(),ammo:119};updateAircraftSupport(h,1,a);assert.equal(h.ammo,120);});
test('BAL-04 exposure threshold, hysteresis, friendly and destroyed filtering',()=>{const c=createCommander(1),h={...createHelicopter(),x:2400};assert.equal(updateAirPressure(c,h,1.99),false);assert.equal(updateAirPressure(c,h,.01),true);h.x=400;assert.equal(updateAirPressure(c,h,5.99),true);assert.equal(updateAirPressure(c,h,.01),false);h.x=2400;h.team=1;assert.equal(updateAirPressure(c,h,10),false);h.team=0;updateAirPressure(c,h,2);h.hp=0;assert.equal(updateAirPressure(c,h,0),false);});
test('BAL-04 red buys paid anti-air rather than rifle spam, no duplicates and cooldown/cap',()=>{
 const c=createCommander(1),bases=[createBase(3490,1,true),createBase(2480,1,false),createBase(1120,0,false)],units=[];let id=1;
 for(const type of ['rifle','rifle','rifle','rocket','rocket']){const u=createSoldier(id++,1,type,2800,460);u.order={role:'garrison'};units.push(u);}
 c.nextDecisionAt=3;
 const h={...createHelicopter(),x:2400};const deploy=type=>{const u=createSoldier(id++,1,type,3430,460);units.push(u);return u;};
 for(let i=0;i<120;i++)updateCommander(c,1/60,units,bases,deploy,h);
 assert.equal(c.supply.ledger[0].type,'rocket');assert.equal(c.supply.ledger[0].cost,60);assert.equal(c.strategy.mode,'AIR_DEFEND');assert.equal(units.filter(u=>u.type==='rifle').length,3);assert.equal(units.filter(u=>u.type==='rocket').length,3);assert.ok(Math.abs(c.supply.balance-70)<1e-7);
});
test('BAL-05 staggered air launches retain aim/reload and committed trajectories',()=>{const units=[1,2,3].map((id)=>createSoldier(id,1,'rocket',2200+id*5,460)),h={...createHelicopter(),x:1800,y:220,grounded:false},times=[];
 for(let i=0;i<100;i++){const choices=allocateRocketTargets(units,h,{stagger:true});for(const u of units){u.rocketAssignment=choices.get(u.id)?.kind;const shot=updatePrioritizedRocket(u,choices.get(u.id),1/60,()=>.5,()=>.5);if(shot)times.push((i+1)/60);}}
 assert.equal(times.length,3);assert.ok(times[0]>=.7);assert.ok(times[1]-times[0]>=.21);assert.ok(times[2]-times[1]>=.21);
});
