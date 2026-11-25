import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCombinedAssault,stepCombinedAssault,combinedAssaultResult,FORCE_LAYOUTS} from '../docs/js/battlefield/platoons/combinedAssaultStudy.js';
import {worldSnapshot} from '../docs/js/battlefield/campaign/world.js';
const level=JSON.parse(readFileSync(new URL('../docs/campaign/first-assault.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function assembled(s){let n=0;while(s.combined.acquired<8||s.combined.launches.length<s.combined.groups.length||s.combined.layout==='support'&&s.combined.supportLaunchedAt===null){assert.ok(n++<120*65,'physical assembly must finish');stepCombinedAssault(s);}return s;}

test('#44 / PL-10 all layouts buy identical 340-Supply RRRRKKKK force at HQ in both directions',()=>{
 for(const mirrored of[false,true])for(const layout of FORCE_LAYOUTS){
  const s=assembled(createCombinedAssault(level,{layout,mirrored})),r=combinedAssaultResult(s),w=s.world,p=s.combined;
  assert.equal(p.acquired,8);assert.equal(r.spent[0],340);assert.equal(r.spent[1],110);assert.equal(r.ledgerValid,true);assert.equal(r.maxPopulation[0],8);
  assert.deepEqual(r.initialPurchases.map(p=>p.type),['rifle','rifle','rifle','rifle','rocket','rocket','rocket','rocket']);
  assert.ok(r.initialPurchases.every(p=>p.x===w.commanders[s.team].rules.spawnX));assert.ok(r.defendersReadyAt<r.launches[0].time);
  assert.ok(r.launches.every(l=>l.spent===340));assert.equal(p.groups.length,layout==='two'?2:1);
  assert.equal(w.units.filter(u=>u.team===s.team&&u.isSergeant).length,layout==='two'?2:1);
  if(layout==='two')close(r.launches[0].time,r.launches[1].time);
  if(layout==='support'){assert.equal(p.supportRoster.length,4);assert.ok(Math.abs(r.supportLaunchedAt-r.launches[0].time)<.02);assert.ok(p.supportRoster.every(slot=>!w.units.find(u=>u.id===slot.unitId).platoonId));}
  const a=r.accounts[0];for(let n=1;n<a.ledger.length;n++)assert.ok(a.ledger[n].time-a.ledger[n-1].time>=2-1e-6);
 }
});
test('#44 staggered releases a complete paid component before the full force, coordinated does not',()=>{
 for(const layout of['two','support']){
  const a=assembled(createCombinedAssault(level,{layout,release:'coordinated'})),b=assembled(createCombinedAssault(level,{layout,release:'staggered'}));
  assert.ok(b.combined.launches[0].time<a.combined.launches[0].time-10);
  assert.equal(b.combined.launches[0].spent,220);assert.equal(a.combined.launches[0].spent,340);
 }
});
test('#44 whole-force endpoint survives loss of a group; surviving support can really capture',()=>{
 const s=assembled(createCombinedAssault(level,{layout:'two'})),w=s.world;w.systems.weapons=false;
 const g=s.combined.groups[0];for(const u of w.units)if(u.platoonId===g.id)u.hp=0;
 stepCombinedAssault(s,120);assert.equal(s.finished,false);assert.equal(g.phase,'disbanded');
 // Test setup: remove defenses only after the group-loss assertion. The remaining
 // group's actual walking/capture must finish; no injected captured event.
 w.bases[0].defensePoints=0;for(const u of w.units)if(u.team===s.enemy)u.hp=0;
 for(let n=0;n<120*180&&!s.finished;n++)stepCombinedAssault(s);
 assert.equal(s.outcome,'capture');assert.equal(w.bases[0].team,s.team);
});
test('#44 fixed casualties stay fixed; supplied vacancies and support replacements cost Supply at HQ',()=>{
 for(const resupply of[false,true]){
  const s=assembled(createCombinedAssault(level,{layout:'support',resupply})),w=s.world;w.systems.weapons=false;
  const slot=s.combined.supportRoster.find(s=>s.type==='rocket'),old=slot.unitId;w.units.find(u=>u.id===old).hp=0;
  stepCombinedAssault(s,120*20);const r=combinedAssaultResult(s);assert.equal(r.ledgerValid,true);
  if(resupply){assert.notEqual(slot.unitId,old);assert.equal(r.spent[0],400);const u=w.units.find(u=>u.id===slot.unitId);assert.ok(Math.abs(u.x-w.commanders[s.team].rules.spawnX)<1000);}else{assert.equal(slot.unitId,old);assert.equal(r.spent[0],340);}
 }
});
test('#44 deterministic batching, paused clocks, invalid configurations',()=>{
 const a=createCombinedAssault(level,{layout:'support',seed:9001}),b=createCombinedAssault(level,{layout:'support',seed:9001});stepCombinedAssault(a,1200);for(let n=0;n<12;n++)stepCombinedAssault(b,100);
 assert.deepEqual(worldSnapshot(a.world),worldSnapshot(b.world));assert.deepEqual(combinedAssaultResult(a),combinedAssaultResult(b));
 a.world.paused=true;const before=worldSnapshot(a.world);stepCombinedAssault(a,1200);assert.deepEqual(worldSnapshot(a.world),before);
 for(const options of[{layout:'free'},{release:'teleport'},{resupply:1},{mirrored:1},{seconds:0},{seed:-1}])assert.throws(()=>createCombinedAssault(level,options));
 for(const n of[-1,.5,72001])assert.throws(()=>stepCombinedAssault(b,n));
});
test('#44 one component has exactly identical coordinated/staggered schedules and combat',()=>{
 for(const mirrored of[false,true])for(const resupply of[false,true]){
  const a=createCombinedAssault(level,{layout:'one',release:'coordinated',mirrored,resupply,seed:7001}),b=createCombinedAssault(level,{layout:'one',release:'staggered',mirrored,resupply,seed:7001});
  while(!a.finished)stepCombinedAssault(a,120);while(!b.finished)stepCombinedAssault(b,120);
  assert.deepEqual(worldSnapshot(a.world),worldSnapshot(b.world));
  const {release:ar,...ra}=combinedAssaultResult(a),{release:br,...rb}=combinedAssaultResult(b);assert.deepEqual(ra,rb);
 }
});
