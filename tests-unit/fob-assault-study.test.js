import test from'node:test';
import assert from'node:assert/strict';
import{readFileSync}from'node:fs';
import{createAssaultStudy,stepAssaultStudy,assaultStudyResult}from'../docs/js/battlefield/platoons/assaultStudy.js';
import{worldSnapshot}from'../docs/js/battlefield/campaign/world.js';
const level=JSON.parse(readFileSync(new URL('../docs/campaign/first-assault.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function launch(s){for(let n=0;n<120*120&&s.study.launchAt===null;n++)stepAssaultStudy(s);assert.ok(s.study.launchAt>0);return s;}
function accounts(s){for(const a of assaultStudyResult(s).accounts){close(a.balance,120+a.earned-a.spent);close(a.earned+a.overflow,a.time*5);assert.ok(a.balance>=0&&a.balance<=240);assert.equal(a.purchases,a.ledger.length);close(a.spent,a.ledger.reduce((n,e)=>n+e.cost,0));for(let n=1;n<a.ledger.length;n++)assert.ok(a.ledger[n].time-a.ledger[n-1].time>=2-1e-6);}}

test('#34 every initial unit is paid at HQ, then physically joins; policies have identical paid assembly',()=>{
 for(const mirrored of[false,true]){
  const runs=['independent','siege','siege-no-retreat'].map(controller=>createAssaultStudy(level,{composition:{rifle:3,rocket:4},controller,mirrored}));
  for(const s of runs)assert.deepEqual(assaultStudyResult(s).maxPopulation,[1,0]);
  for(const s of runs){const w=s.world;assert.equal(w.units.length,1);assert.equal(w.commanders[s.team].supply.spent,25);assert.equal(w.units[0].x,w.commanders[s.team].rules.spawnX);assert.equal(w.bases[0].slots.rifle.filter(Boolean).length,0);launch(s);accounts(s);assert.equal(s.study.launchSpent,315);assert.equal(w.commanders[s.enemy].supply.spent,110);assert.ok(s.study.defendersReadyAt<s.study.launchAt);assert.ok(w.units.filter(u=>u.team===s.enemy).every(u=>u.arrived));assert.deepEqual(assaultStudyResult(s).maxPopulation,[7,3]);}
  const start=s=>({tick:s.world.tick,units:s.world.units.map(u=>[u.id,u.team,u.type,u.x,u.hp]),accounts:assaultStudyResult(s).accounts});assert.deepEqual(start(runs[0]),start(runs[1]));assert.deepEqual(start(runs[1]),start(runs[2]));
 }
});
test('#34 fixed-force casualties cannot cause purchases; supplied replacements pay normally and start at HQ',()=>{
 for(const controller of['independent','siege'])for(const resupply of[false,true]){
  const s=launch(createAssaultStudy(level,{controller,resupply})),w=s.world;w.systems.weapons=false;
  const victim=w.units.find(u=>u.id===s.roster.find(slot=>slot.type==='rocket').unitId);victim.hp=0;
  const before=w.commanders[s.team].supply.spent,ids=new Set(w.units.map(u=>u.id));stepAssaultStudy(s,240);
  // Initial assembly used almost all Supply: do not expect a free immediate replacement.
  assert.equal(w.commanders[s.team].supply.spent,before);
  for(let i=0;i<120*20&&!w.units.some(u=>u.team===s.team&&!ids.has(u.id));i++)stepAssaultStudy(s);
  const fresh=w.units.filter(u=>u.team===s.team&&!ids.has(u.id));
  if(resupply){assert.equal(w.commanders[s.team].supply.spent-before,60);assert.equal(fresh.length,1);assert.equal(fresh[0].type,'rocket');assert.ok(Math.abs(fresh[0].x-w.commanders[s.team].rules.spawnX)<140);}else{assert.equal(w.commanders[s.team].supply.spent,before);assert.equal(fresh.length,0);}
  accounts(s);
 }
});
test('#34 pause freezes economy and orders; batching gives exact same simulation and ledgers',()=>{
 const a=createAssaultStudy(level,{resupply:true,seed:103}),b=createAssaultStudy(level,{resupply:true,seed:103});
 stepAssaultStudy(a,1200);for(let i=0;i<12;i++)stepAssaultStudy(b,100);assert.deepEqual(worldSnapshot(a.world),worldSnapshot(b.world));assert.deepEqual(assaultStudyResult(a),assaultStudyResult(b));
 a.world.paused=true;const before=worldSnapshot(a.world),result=assaultStudyResult(a);stepAssaultStudy(a,1200);assert.deepEqual(worldSnapshot(a.world),before);assert.deepEqual(assaultStudyResult(a),result);accounts(a);
});
test('#34 invalid composition/controller/mode/step input is rejected',()=>{
 for(const options of[{composition:{rifle:1,rocket:4}},{composition:{rifle:3,rocket:8}},{controller:'cheat'},{resupply:1},{mirrored:'yes'},{seconds:0},{seed:-1}])assert.throws(()=>createAssaultStudy(level,options));
 const s=createAssaultStudy(level);for(const ticks of[-1,.5,72001])assert.throws(()=>stepAssaultStudy(s,ticks));
});
