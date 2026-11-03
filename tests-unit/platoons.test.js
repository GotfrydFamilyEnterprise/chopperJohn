import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{createWorld,buySergeant,stepWorld,worldSnapshot,spawn}from'../docs/js/battlefield/campaign/world.js';
import{activePlatoons,createSergeant,platoonOrder}from'../docs/js/battlefield/ai/platoons.js';
const data=()=>JSON.parse(readFileSync('docs/campaign/first-assault.json'));
const world=()=>createWorld(data(),{platoons:true,systems:{weapons:false,flight:false,repairs:false}});
test('PL-01 sergeant is an ordinary paid rifleman; invalid/disabled/paused/failed orders cannot spend',()=>{
 const w=world();assert.equal(buySergeant(w,0,'bad').reason,'invalid-strategy');assert.equal(buySergeant(w,9).reason,'invalid-faction');assert.equal(createSergeant(w,0,{},()=>null).reason,'deployment-failed');assert.equal(w.commanders[0].supply.spent,0);assert.equal(w.platoons.groups.length,0);
 const r=buySergeant(w);assert.ok(r.unit.isSergeant);assert.equal(r.unit.type,'rifle');assert.equal(r.unit.hp,3);assert.equal(r.unit.captureEligible,false);assert.equal(w.commanders[0].supply.spent,25);assert.equal(buySergeant(w).reason,'deployment-cooldown');w.paused=true;assert.equal(buySergeant(w).reason,'paused-or-finished');assert.equal(buySergeant(createWorld(data())).reason,'platoons-disabled');
});
test('PL-01/02 full physical rally precedes launch; existing field troops reused while guards remain free',()=>{
 const w=world();buySergeant(w);stepWorld(w,{},120);const group=activePlatoons(w,0)[0];assert.equal(group.phase,'rally');assert.equal(group.launchedAt,null);assert.ok(w.units.filter(u=>u.team===0&&u.order?.role==='garrison').length>=3);assert.equal(w.units.filter(u=>u.team===0&&u.platoonId===group.id).length,3);
 stepWorld(w,{},1200);assert.ok(group.launchedAt>1);assert.ok(group.slots.every(s=>s.unitId!==null&&s.joined));assert.equal(w.commanders[0].supply.spent,110);assert.equal(w.commanders[0].supply.purchases,3);assert.ok(w.platoons.stats.adopted>=2);for(const u of w.units.filter(u=>u.platoonId===group.id))assert.equal(u.guardBase,null);
});
test('PL-03 paid replacement is unique, queues for funds/cap, and physically sprints at twice speed until joined',()=>{
 const w=world();buySergeant(w);stepWorld(w,{},2400);const g=activePlatoons(w,0)[0],slot=g.slots.find(s=>s.type==='rocket');w.units.find(u=>u.id===slot.unitId).hp=0;w.commanders[0].supply.balance=0;w.commanders[0].supply.cooldown=0;const spent=w.commanders[0].supply.spent;stepWorld(w);assert.equal(slot.unitId,null);assert.equal(g.blockReason,'saving-supply');assert.equal(w.commanders[0].supply.spent,spent);
 w.commanders[0].supply.balance=240;stepWorld(w);const u=w.units.find(u=>u.id===slot.unitId);assert.ok(u&&u.sprinting);assert.equal(w.commanders[0].supply.spent,spent+60);assert.equal(Math.abs(u.velocity),33);const x=u.x;stepWorld(w,{},120);assert.ok(Math.abs(u.x-x-66)<1e-6);assert.equal(w.commanders[0].supply.spent,spent+60);assert.equal(w.events.filter(e=>e.type==='platoonReplacement'&&e.groupId===g.id).length,1);
 stepWorld(w,{},3000);assert.ok(slot.joined);assert.equal(u.sprinting,false);
});
test('PL-03 leader death disbands and cancels resupply without deleting already paid troops',()=>{
 const w=world();buySergeant(w);stepWorld(w,{},1200);const g=activePlatoons(w,0)[0],ids=g.slots.map(s=>s.unitId);w.units.find(u=>u.id===g.leaderId).hp=0;const spent=w.commanders[0].supply.spent;stepWorld(w,{},600);assert.equal(g.phase,'disbanded');assert.equal(activePlatoons(w,0).length,0);assert.equal(w.commanders[0].supply.spent,spent);for(const id of ids){const u=w.units.find(u=>u.id===id);assert.ok(u&&u.hp>0);assert.equal(u.platoonId,null);assert.equal(u.sprinting,false);}
});
test('PL-02/04 both factions launch bounded squads and exact replay preserves orders, finances and damage',()=>{
 const a=world(),b=world();buySergeant(a,0,'spread');buySergeant(b,0,'spread');stepWorld(a,{},3600);for(let i=0;i<36;i++)stepWorld(b,{},100);assert.deepEqual(worldSnapshot(a),worldSnapshot(b));assert.ok(activePlatoons(a,1).length>0);for(const team of[0,1]){assert.ok(activePlatoons(a,team).length<=2);assert.ok(a.units.filter(u=>u.hp>0&&u.team===team).length<=15);}const leader=a.units.find(u=>u.isSergeant&&u.team===0);assert.ok(platoonOrder(a,leader));
});
test('PL-05 campaign close-range rifle collision includes barrel segment, ending overlapping post duels',()=>{
 const w=createWorld(data(),{systems:{troops:false,commanders:false,flight:false,repairs:false,takeover:false}});const units=[w.units.find(u=>u.team===0&&u.type==='rifle'),w.units.find(u=>u.team===1&&u.type==='rifle')];w.units=units;for(const u of units){u.x=1400;u.y=460;u.guardBase=null;}stepWorld(w,{},120);assert.ok(units.every(u=>u.hp===0));assert.equal(w.stats.rifleShots,6);
});
test('PL-03 casualties during rally and after launch always buy a replacement, never adopt a spare',()=>{
 for(const ticks of[120,1200]){const w=world();buySergeant(w);stepWorld(w,{},ticks);const g=activePlatoons(w,0)[0],s=g.slots.find(s=>s.type==='rifle'),dead=w.units.find(u=>u.id===s.unitId);assert.ok(dead);dead.hp=0;const spare=spawn(w,0,'rifle',g.rallyX);spare.order={role:'advance'};w.commanders[0].supply.balance=240;w.commanders[0].supply.cooldown=0;const spent=w.commanders[0].supply.spent;stepWorld(w);assert.notEqual(s.unitId,spare.id);assert.equal(w.commanders[0].supply.spent,spent+25);assert.equal(w.platoons.stats.replacements,1);assert.equal(s.replacement,true);assert.ok(w.units.find(u=>u.id===s.unitId).sprinting);}
});
test('PL-03 full population queues casualty without charging and fills once space opens',()=>{
 const w=world();buySergeant(w);stepWorld(w,{},2400);const g=activePlatoons(w,0)[0],s=g.slots.find(s=>s.type==='rocket');w.units.find(u=>u.id===s.unitId).hp=0;while(w.units.filter(u=>u.team===0&&u.hp>0).length<15){const u=spawn(w,0,'rifle',100);u.order={role:'garrison'};}w.commanders[0].supply.balance=240;w.commanders[0].supply.cooldown=0;const spent=w.commanders[0].supply.spent;stepWorld(w);assert.equal(s.unitId,null);assert.equal(g.blockReason,'unit-limit');assert.equal(w.commanders[0].supply.spent,spent);w.units.find(u=>u.team===0&&u.hp>0&&!u.platoonId).hp=0;stepWorld(w);assert.ok(s.unitId);assert.equal(w.commanders[0].supply.spent,spent+60);
});
test('PL-03/05 replacement retains actual double speed when entering capture approach',()=>{
 const w=world();w.systems.takeover=false;buySergeant(w);stepWorld(w,{},2400);const g=activePlatoons(w,0)[0],s=g.slots.find(s=>s.type==='rifle');w.units.find(u=>u.id===s.unitId).hp=0;w.commanders[0].supply.balance=240;w.commanders[0].supply.cooldown=0;stepWorld(w);const u=w.units.find(u=>u.id===s.unitId);w.units.find(u=>u.id===g.leaderId).x=1420;u.x=1670;w.bases.find(b=>b.id==='red-fob').defensePoints=0;w.systems.takeover=true;const x=u.x;stepWorld(w);assert.ok(u.sprinting);assert.ok(Math.abs((u.x-x)*120-94)<1e-6);
});
test('PL-01/03 red field recruitment preserves a missing garrison rocket saving priority',()=>{
 const w=world();for(const u of w.units.filter(u=>u.team===1&&u.type==='rocket'&&u.order.role==='garrison'))u.hp=0;w.commanders[1].supply.balance=30;stepWorld(w);assert.equal(w.commanders[1].strategy.mode,'GARRISON');assert.equal(w.commanders[1].supply.spent,0);assert.equal(activePlatoons(w,1).length,0);stepWorld(w,{},900);assert.equal(w.commanders[1].supply.ledger[0].type,'rocket');assert.equal(w.commanders[1].supply.ledger[0].cost,60);
});
test('PL-01 JSON rejects a wave without a follower rifle before it can stall campaign AI',()=>{
 const d=data();d.factions[0].wave={rifle:1,rocket:1};assert.throws(()=>createWorld(d,{platoons:true}),/including sergeant/);
});
