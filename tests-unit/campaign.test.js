import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {validateBattlefield,validateCampaign} from '../docs/js/battlefield/campaign/definition.js';
import {readProgress,completeLevel,unlocked,PROGRESS_KEY} from '../docs/js/battlefield/campaign/progress.js';
import {createWorld,stepWorld,worldSnapshot,buyInfantry,explode,aircraftGround} from '../docs/js/battlefield/campaign/world.js';
import {groundY} from '../docs/js/battlefield/terrain/heightfield.js';
import {updateHelicopter,createHelicopter,parkedOnPad} from '../docs/js/battlefield/aircraft/helicopter.js';
const data=id=>JSON.parse(readFileSync('docs/campaign/'+id+'.json'));const manifest=()=>validateCampaign(data('campaign'));
test('CP-01 both JSON battlefields validate/clone, malformed maps/profile/footprints/factions rejected',()=>{
 for(const id of ['first-assault','ridgeline']){const d=data(id),v=validateBattlefield(d);assert.deepEqual(validateBattlefield(v),v);d.world.width=999;assert.notEqual(v.world.width,999);}
 for(const mutate of [d=>d.schemaVersion=2,d=>d.balanceProfile='god',d=>d.bases[1].id=d.bases[0].id,d=>d.bases[1].team=0,d=>d.bases[2].x=1500,d=>d.helipad.x=1400,d=>d.helipad.id=' ',d=>d.factions[0].controller='ai',d=>d.factions[1].team=0,d=>d.factions[0].supply=999,d=>d.factions[1].opening.pop(),d=>d.factions[1].wave.rocket=0,d=>d.objective.target='blue-hq',d=>d.world.width=Infinity]){const d=data('ridgeline');mutate(d);assert.throws(()=>validateBattlefield(d));}
 assert.throws(()=>validateCampaign({...data('campaign'),levels:[{id:'../bad',name:'Bad',file:'../bad.json'}]}));
});
test('CP-04 progression only unlocks from valid blue victories; corrupt/blocked storage and replay are safe',()=>{
 const c=manifest(),map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};const p=readProgress(storage,c);assert.ok(unlocked(c,p,'first-assault'));assert.equal(unlocked(c,p,'ridgeline'),false);assert.equal(completeLevel(c,p,'ridgeline',{winner:0},storage),false);assert.equal(completeLevel(c,p,'first-assault',{winner:1},storage),false);assert.equal(completeLevel(c,p,'first-assault',{winner:null},storage),false);
 assert.ok(completeLevel(c,p,'first-assault',{winner:0},storage));assert.ok(unlocked(c,p,'ridgeline'));completeLevel(c,p,'first-assault',{winner:0},storage);assert.equal(p.completed.length,1);assert.deepEqual(readProgress(storage,c),p);
 map.set(PROGRESS_KEY,'bad');assert.deepEqual(readProgress(storage,c),{completed:[]});map.set(PROGRESS_KEY,JSON.stringify({schemaVersion:1,completed:['ridgeline']}));assert.deepEqual(readProgress(storage,c),{completed:[]});
 const bad={getItem:()=>{throw Error();},setItem:()=>{throw Error();}};const session=readProgress(bad,c);assert.equal(completeLevel(c,session,'first-assault',{winner:0},bad),false);assert.ok(unlocked(c,session,'ridgeline'));
});
test('CP-02 fresh armies/economy, manual blue, paid red, pause and seed replay on both maps',()=>{
 for(const id of ['first-assault','ridgeline']){const a=createWorld(data(id)),b=createWorld(data(id));assert.equal(a.units.length,10);assert.ok(a.bases.filter(x=>!x.main).every(x=>x.state==='UNCLAIMED'));assert.deepEqual(a.commanders.map(c=>c.supply.balance),[120,120]);stepWorld(a,{},1200);for(let i=0;i<10;i++)stepWorld(b,{},120);assert.deepEqual(worldSnapshot(a),worldSnapshot(b));assert.equal(a.commanders[0].supply.purchases,0);assert.ok(a.commanders[1].supply.purchases>0);const bought=buyInfantry(a,'rocket');assert.ok(bought.unit);assert.equal(a.commanders[0].supply.spent,60);assert.equal(buyInfantry(a,'rifle').reason,'deployment-cooldown');a.paused=true;const paused=worldSnapshot(a);stepWorld(a,{},100);assert.deepEqual(worldSnapshot(a),paused);assert.equal(buyInfantry(a,'rifle').unit,null);}
});
test('CP-03 troops follow terrain at bounded speed and real cover blocks bullets; free guard reservations become real posts',()=>{
 const w=createWorld(data('ridgeline'),{systems:{commanders:false,weapons:false,flight:false,repairs:false}});const u=w.units[0];u.x=1350;u.y=groundY(w.level,u.x);u.order={role:'advance'};for(let i=0;i<1200;i++){const old={x:u.x,y:u.y};stepWorld(w);assert.equal(u.y,groundY(w.level,u.x));assert.ok(Math.hypot(u.x-old.x,u.y-old.y)<=47/120+1e-7);}assert.ok(u.y<460);
 const flat=createWorld(data('first-assault'),{systems:{weapons:false,commanders:false,flight:false}});stepWorld(flat,{},4800);assert.ok(flat.bases.filter(b=>!b.main).every(b=>b.slots.rifle.every(id=>id!==null)&&b.slots.rocket[0]!==null));for(const b of flat.bases.filter(b=>!b.main))for(const id of Object.values(b.slots).flat()){const soldier=flat.units.find(u=>u.id===id);assert.ok(soldier.arrived&&soldier.guardBase===b.x);}
});
test('CP-02 shared exposed blast and bunker protection resolve before rocket-only breach',()=>{
 const w=createWorld(data('first-assault'),{systems:{commanders:false,weapons:false,flight:false}});stepWorld(w,{},4800);const b=w.bases.find(b=>b.id==='red-fob'),guards=w.units.filter(u=>u.guardBase===b.x&&u.arrived);const hp=guards.reduce((n,u)=>n+u.hp,0);b.defensePoints=1;explode(w,{team:0},{x:b.x,y:b.y});assert.equal(b.defensePoints,0);assert.ok(Math.abs(guards.reduce((n,u)=>n+u.hp,0)-(hp-1/3))<1e-8);const before=guards.reduce((n,u)=>n+u.hp,0);explode(w,{team:0},{x:b.x,y:b.y});assert.ok(guards.reduce((n,u)=>n+u.hp,0)<before-1/3);
});
test('CP-03 real rifle capture ends mission, freezes clocks, and new attempts reset funds/army',()=>{
 const w=createWorld(data('first-assault'),{systems:{commanders:false,weapons:false,flight:false,repairs:false}});const hq=w.bases.find(b=>b.id==='red-hq');hq.defensePoints=0;w.units=w.units.filter(u=>u.team===0);const u=w.units[0];u.guardBase=null;u.x=hq.x-60;u.y=hq.y;u.order={role:'advance'};stepWorld(w,{},500);assert.equal(w.result,null);stepWorld(w,{},200);assert.equal(w.result.winner,0);assert.ok(u.x>hq.x-60);const stopped=worldSnapshot(w);stepWorld(w,{},1200);assert.deepEqual(worldSnapshot(w),stopped);assert.equal(createWorld(data('first-assault')).commanders[0].supply.balance,120);
});
test('CP-03 helicopter terrain contact, configurable pad, repair/rearm preserve real flight controls',()=>{
 const w=createWorld(data('ridgeline'));assert.ok(aircraftGround(w,1560)<=groundY(w.level,1560));const h=createHelicopter(400,1,700);assert.ok(parkedOnPad(h,400));h.x=400;assert.equal(parkedOnPad(h,400),false);
 const flight=createHelicopter(460);flight.x=1600;flight.y=320;flight.vy=100;flight.grounded=false;updateHelicopter(flight,{},1/120,()=>300,3600);assert.equal(flight.y,277);assert.ok(flight.grounded);assert.equal(flight.hp,65);
 w.helicopter.hp=50;w.helicopter.ammo=0;stepWorld(w,{},120);assert.ok(w.helicopter.hp>54&&w.helicopter.ammo>29);stepWorld(w,{y:-1},240);assert.ok(w.helicopter.y<groundY(w.level,400)-40);const ammo=w.helicopter.ammo;stepWorld(w,{fire:true},120);assert.ok(w.helicopter.ammo<ammo);assert.ok(w.stats.helicopterShots>0);
});
