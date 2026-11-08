import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{createEncounter,stepEncounter,encounterSnapshot,encounterResult,validateEncounters,forceCost}from'../docs/js/battlefield/platoons/encounters.js';
import{stepWorld}from'../docs/js/battlefield/campaign/world.js';
import{compactOffset}from'../docs/js/battlefield/ai/platoonManeuvers.js';
const level=()=>JSON.parse(readFileSync('docs/campaign/first-assault.json')),catalog=()=>JSON.parse(readFileSync('docs/platoon-lab/encounters.json'));
test('PL-09/10 matching starts, actual initial costs, mirrored stationed defenders, malformed data rejected',()=>{
 for(const mix of['mixed','rifle','rocket'])for(const mirrored of[false,true]){const a=createEncounter(level(),catalog(),{caseId:'staffed-fob',mix,mirrored,controller:'independent'}),b=createEncounter(level(),catalog(),{caseId:'staffed-fob',mix,mirrored,controller:'siege'});assert.deepEqual(a.world.units.map(u=>[u.team,u.type,u.x,u.hp]),b.world.units.map(u=>[u.team,u.type,u.x,u.hp]));assert.deepEqual(a.initialCost,b.initialCost);assert.equal(a.initialCost[0],forceCost(catalog().mixes[mix]));const guards=a.world.units.filter(u=>u.team===a.enemy),x=guards.map(u=>u.x);a.world.systems.weapons=false;stepEncounter(a,120);assert.deepEqual(guards.map(u=>u.x),x);}
 for(const field of['resupply','defenders']){const c=catalog();if(field==='resupply')c.cases.find(c=>c.kind==='fob').resupply='yes';else c.cases.find(c=>c.kind==='fob').defenders.rifle=3;assert.throws(()=>validateEncounters(c));}
});
test('PL-08/10 world pause freezes supplied encounter accounts, orders and all simulation state',()=>{
 const s=createEncounter(level(),catalog(),{caseId:'supplied-fob',controller:'independent'});s.world.units[1].hp=0;s.world.paused=true;const before=encounterSnapshot(s);stepEncounter(s,120);assert.deepEqual(encounterSnapshot(s),before);
});
test('PL-08 supported large formations can physically regroup and meet80% resume',()=>{
 for(const composition of[{rifle:5,rocket:1},{rifle:8,rocket:1},{rifle:2,rocket:8}]){const c=catalog();c.mixes.large=composition;const s=createEncounter(level(),c,{mix:'large'}),w=s.world,g=w.platoons.groups[0];w.systems.weapons=false;for(const slot of g.slots.slice(0,Math.ceil((g.slots.length+1)*.4)))w.units.find(u=>u.id===slot.unitId).hp=0;stepEncounter(s,1200);assert.equal(g.phase,'regroup');const lead=w.units.find(u=>u.id===g.leaderId);assert.ok(Math.abs(lead.x-g.retreatX)<=12);
  // Place renewed fixture members at their actual rally slots; no production success claim.
  for(const slot of g.slots){const u=w.units.find(u=>u.id===slot.unitId);if(u?.hp>0)continue;const dead=w.units.find(u=>u.platoonSlot===slot.index&&u.platoonId===g.id);if(!dead)continue;dead.hp=dead.type==='rifle'?3:4;dead.x=g.retreatX+compactOffset(g,slot);slot.unitId=dead.id;slot.joined=true;slot.replacement=false;}
  stepEncounter(s,1200);assert.ok(w.events.some(e=>e.type==='platoonResumed'));}
});
test('PL-09 actual empty-FOB breach precedes physical capture; fixed runs never refill casualties',()=>{
 for(const mix of['mixed','rifle','rocket']){const s=createEncounter(level(),catalog(),{caseId:'empty-fob',controller:'siege',mix});while(!s.finished)stepEncounter(s,120);const r=encounterResult(s);assert.equal(r.outcome,'capture');assert.ok(r.breachAt<r.captureAt);assert.deepEqual(r.spent,[25,0]);assert.equal(s.world.platoons.stats.replacements,0);}
});
test('PL-09/10 exact encounter replay and settled elimination outcomes',()=>{
 const a=createEncounter(level(),catalog(),{caseId:'three-mixed'}),b=createEncounter(level(),catalog(),{caseId:'three-mixed'});stepEncounter(a,1200);for(let n=0;n<12;n++)stepEncounter(b,100);assert.deepEqual(encounterSnapshot(a),encounterSnapshot(b));while(!a.finished)stepEncounter(a,120);if(['attack','defense','mutual'].includes(a.outcome))assert.equal(a.world.projectiles.length,0);
});
test('PL-07 above-retreat-threshold rifle casualty cannot stall a rocket-weighted surviving cohort',()=>{
 for(const mirrored of[false,true])for(const mix of['mixed','four']){const c=catalog();c.mixes.four={rifle:2,rocket:2};const s=createEncounter(level(),c,{mix,mirrored,controller:'siege'});s.world.systems.weapons=false;s.world.units=s.world.units.filter(u=>u.team===s.team);stepWorld(s.world,{},1200);const g=s.world.platoons.groups[0],lead=s.world.units.find(u=>u.id===g.leaderId),slot=g.slots.find(s=>s.type==='rifle');s.world.units.find(u=>u.id===slot.unitId).hp=0;const x=lead.x;stepWorld(s.world,{},4800);assert.equal(g.retreatCount||0,0);assert.ok((lead.x-x)*(mirrored?-1:1)>400,'formed surviving rockets must not immobilize the leader');}
});
