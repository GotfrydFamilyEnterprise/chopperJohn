import test from'node:test';
import assert from'node:assert/strict';
import{wilson,createTrial,stepTrial,summarize,pairedDifference}from'../scripts/platoon-monte-carlo.mjs';
import{assaultStudyResult,createAssaultStudy,stepAssaultStudy}from'../docs/js/battlefield/platoons/assaultStudy.js';
import{worldSnapshot}from'../docs/js/battlefield/campaign/world.js';
import{platoonOrder}from'../docs/js/battlefield/ai/platoons.js';
import{readFileSync}from'node:fs';
const level=JSON.parse(readFileSync(new URL('../docs/campaign/first-assault.json',import.meta.url)));
function launch(s){while(s.study.launchAt===null)stepTrial(s,1);return s;}
test('PL-10 Wilson intervals keep uncertainty at0%/100% and reject invalid counts',()=>{
 assert.ok(wilson(0,20)[1]>.15);assert.ok(wilson(20,20)[0]<.85);assert.ok(Math.abs(wilson(10,20)[0]-(1-wilson(10,20)[1]))<1e-12);
 for(const [w,n]of[[0,0],[2,1],[-1,3],[1.5,4]])assert.throws(()=>wilson(w,n));
});
test('PL-10 candidate and baseline have identical paid physical assembly; ordinary policy is unchanged',()=>{
 const a=createTrial({policy:'siege'}),b=createTrial({policy:'reserve640'});launch(a);launch(b);
 assert.deepEqual(a.world.units,b.world.units);assert.deepEqual(assaultStudyResult(a),assaultStudyResult(b));assert.equal(b.study.group.assaultPolicy.standoff,640);assert.equal(a.study.group.assaultPolicy,undefined);
 const reference=createAssaultStudy(level,{controller:'siege',composition:{rifle:3,rocket:4}}),trial=createTrial({policy:'siege',seed:101});stepAssaultStudy(reference,2400);stepTrial(trial,2400);assert.deepEqual(worldSnapshot(trial.world),worldSnapshot(reference.world));
});
test('PL-10 research reserve waits for breach and defender clearance; original rifle/rocket stats and retreat preserved',()=>{
 for(const mirrored of[false,true]){
  const s=launch(createTrial({policy:'reserve640',mirrored})),w=s.world,g=s.study.group,b=w.bases[0];stepTrial(s,1);
  const rifle=w.units.find(u=>u.id===g.slots.find(s=>s.type==='rifle').unitId),before={hp:rifle.hp,velocity:rifle.velocity};
  assert.equal(platoonOrder(w,rifle).allowCapture,false);b.defensePoints=0;assert.equal(platoonOrder(w,rifle).allowCapture,false);
  for(const u of w.units.filter(u=>u.team===s.enemy))u.hp=0;assert.equal(platoonOrder(w,rifle).allowCapture,true);assert.deepEqual({hp:rifle.hp,velocity:rifle.velocity},before);
  for(const slot of g.slots.slice(0,3))w.units.find(u=>u.id===slot.unitId).hp=0;stepTrial(s,1);assert.equal(g.phase,'retreat');assert.equal(platoonOrder(w,w.units.find(u=>u.id===g.leaderId)).allowCapture,false);
 }
});
test('PL-10 replay and pause preserve complete opt-in simulation and accounts',()=>{
 const a=createTrial({policy:'reserve640',seed:303}),b=createTrial({policy:'reserve640',seed:303});stepTrial(a,6000);for(let n=0;n<60;n++)stepTrial(b,100);assert.deepEqual(worldSnapshot(a.world),worldSnapshot(b.world));
 a.world.paused=true;const before=worldSnapshot(a.world);stepTrial(a,120);assert.deepEqual(worldSnapshot(a.world),before);
});
test('PL-10 summaries count captures only; paired mirrors stay separate and pairs must match',()=>{
 const row=(policy,seed,outcome,mirrored=false)=>({caseId:'prepared',policy,seed,outcome,mirrored,breachAt:outcome==='unfinished'?5:null,seconds:20,spent:[100,100],survivingValue:[50,50],ledgerValid:true});
 const rs=[row('siege',1,'unfinished'),row('reserve640',1,'capture'),row('siege',2,'defense'),row('reserve640',2,'unfinished'),row('siege',1,'capture',true),row('reserve640',1,'capture',true)];
 const summary=summarize(rs);assert.equal(summary.length,4);assert.equal(summary.find(x=>x.key==='prepared/siege/false').rate,0);assert.equal(summary.find(x=>x.key==='prepared/reserve640/false').rate,.5);
 assert.deepEqual(pairedDifference(rs,'reserve640').map(x=>[x.mirrored,x.change]),[[false,.5],[true,0]]);assert.throws(()=>pairedDifference(rs.slice(1),'reserve640'));assert.throws(()=>summarize([rs[0],rs[0]]));
});
test('PL-10 unknown policy/case and invalid stepping fail before simulation',()=>{
 assert.throws(()=>createTrial({policy:'cheat'}));assert.throws(()=>createTrial({caseId:'bad'}));const s=createTrial();assert.throws(()=>stepTrial(s,-1));assert.throws(()=>stepTrial(s,.5));
});
