import test from 'node:test';
import assert from 'node:assert/strict';
import {WEAPONS as C,createRandom,selectTarget,rocketSpread,launchRocket,rocketPosition,updateRocketWeapon,stationedBase,resolveRifleHit,resolveRocketBlast} from '../docs/js/battlefield/combat/weapons.js';
import {createBase} from '../docs/js/battlefield/bases/baseCommon.js';
import {createSoldier} from '../docs/js/battlefield/units/soldierCommon.js';
import {assignDefender,advanceDefender,releaseDeadDefenders,refreshOccupation} from '../docs/js/battlefield/bases/forwardBase.js';
const unit=(id,team=0,type='rifle',x=1000)=>createSoldier(id,team,type,x,460);
function bunker(team=1){const b=createBase(1500,team,false),units=['rifle','rifle','rocket'].map((t,i)=>unit(i+1,team,t,b.x));for(const u of units){assert.equal(assignDefender(b,u),true);for(let i=0;i<200;i++)advanceDefender(b,u,1/60);}return {b,units};}
for(const team of [0,1])test(`RC-01 inclusive targeting and overlap faction ${team}`,()=>{
 const u=unit(1,team,'rocket'),dir=team?-1:1;
 for(const [distance,valid] of [[224.999,false],[225,true],[250,true],[500,true],[600,true],[600.001,false],[-250,false]]){
  const target=unit(2,1-team,'rifle',u.x+dir*distance);
  assert.equal(!!selectTarget(u,[target],225,C.rocketMaxRange),valid);
 }
 const tooClose=unit(2,1-team,'rifle',u.x+dir*200),far=unit(3,1-team,'rocket',u.x+dir*300);
 assert.equal(selectTarget(u,[tooClose,far],225,C.rocketMaxRange),far);
 assert.equal(selectTarget(u,[unit(4,team,'rifle',u.x+dir*250)],225,C.rocketMaxRange),null);
 far.hp=0;assert.equal(selectTarget(u,[far],225,C.rocketMaxRange),null);
 assert.equal(C.rifleRange-C.rocketMinRange,25);assert.equal(C.rocketMaxRange,600);
});
test('RC-03/04 ballistic landing, upward launch, scatter bounds and variance',()=>{
 for(const team of [0,1])for(const distance of [225,350,500]){
  const rng=createRandom(123),errors=[];
  for(let i=0;i<1000;i++){
   const u=unit(1,team,'rocket'),target=unit(2,1-team,'rifle',u.x+(team?-1:1)*distance),r=launchRocket(u,target,rng);
   errors.push(r.impactX-target.x);assert.ok(Math.abs(r.impactX-target.x)<=rocketSpread(distance));assert.ok(r.vy<0);
   assert.ok(rocketPosition(r,r.flightTime/2).y<r.originY);
   const end=rocketPosition(r,r.flightTime);assert.ok(Math.abs(end.x-r.impactX)<1e-8);assert.ok(Math.abs(end.y-460)<1e-8);
   target.x+=100;assert.equal(r.aimedX,u.x+(team?-1:1)*distance);
  }
  const rms=Math.sqrt(errors.reduce((s,e)=>s+e*e,0)/errors.length);assert.ok(rms>rocketSpread(distance)*.5);
 }
 assert.equal(rocketSpread(225),5);assert.equal(rocketSpread(350),20);assert.equal(rocketSpread(500),50);
});
test('RC-02 aim interruption and full reload',()=>{
 const u=unit(1,0,'rocket'),target=unit(2,1,'rifle',1300),rng=createRandom(1);
 for(let i=0;i<41;i++)assert.equal(updateRocketWeapon(u,target,1/60,rng),null);
 updateRocketWeapon(u,null,1/60,rng);
 for(let i=0;i<41;i++)assert.equal(updateRocketWeapon(u,target,1/60,rng),null);
 assert.ok(updateRocketWeapon(u,target,1/60,rng));
 for(let i=0;i<179;i++)assert.equal(updateRocketWeapon(u,target,1/60,rng),null);
 assert.ok(u.rocketCooldown>0);assert.equal(u.rocketAimTime,0);
});
test('BC-01/03 only arrived registered soldiers get a probabilistic half hit',()=>{
 const b=createBase(1500,1,false),u=unit(1,1,'rifle',1410);
 assignDefender(b,u);assert.equal(stationedBase(u,[b]),null);assert.equal(resolveRifleHit(u,[b],()=>0).amount,1);
 for(let i=0;i<200;i++)advanceDefender(b,u,1/60);
 assert.equal(stationedBase(u,[b]),b);assert.equal(b.state,'ASSEMBLING');
 assert.equal(resolveRifleHit(u,[b],()=>.049).amount,.5);assert.equal(resolveRifleHit(u,[b],()=>.05).amount,0);
 const fake=unit(9,1,'rocket',1500);fake.arrived=true;fake.guardBase=1500;assert.equal(stationedBase(fake,[b]),null);
});
test('BC-02 shared single random defender, no double AoE, ordinary bystanders',()=>{
 const {b,units}=bunker();const exposed=unit(9,1,'rocket',1500),friend=unit(10,0,'rifle',1500);units.push(exposed,friend);
 const before=units.map(u=>u.hp);const hits=resolveRocketBlast(1500,0,units,[b],()=>.8);
 assert.equal(hits.filter(h=>h.covered).length,1);assert.equal(hits.find(h=>h.covered).id,3);
 assert.ok(Math.abs(units[2].hp-(before[2]-1/3))<1e-9);assert.equal(units[0].hp,before[0]);assert.equal(units[1].hp,before[1]);
 assert.equal(exposed.hp,2);assert.equal(friend.hp,3);
});
test('RC-05 exposed falloff, boundary and no friendly fire',()=>{
 const units=[0,12.5,25,26].map((x,i)=>unit(i+1,1,'rocket',1000+x));units.push(unit(99,0,'rifle',1000));
 resolveRocketBlast(1000,0,units,[],createRandom(1));assert.deepEqual(units.map(u=>u.hp),[2,3,4,4,3]);
});
test('BC-03 seeded penetrations approximate 1/20; exposed hits stay 1 HP',()=>{
 const {b,units}=bunker();const u=units[0];u.hp=10000;const rng=createRandom(17);let total=0;
 for(let i=0;i<20000;i++)total+=resolveRifleHit(u,[b],rng).amount;
 assert.ok(total>450&&total<550,`expected about 500 HP, got ${total}`);
 assert.equal(resolveRifleHit(unit(90),[],rng).amount,1);
});
test('BC-05 repeated thirds kill cleanly, release slot, replacement starts exposed',()=>{
 const {b,units}=bunker();
 for(let i=0;i<9;i++)resolveRocketBlast(1500,0,units,[b],()=>0);
 assert.equal(units[0].hp,0);releaseDeadDefenders(b,new Set(units.filter(u=>u.hp>0).map(u=>u.id)));refreshOccupation(b);
 assert.equal(b.state,'UNDERSTAFFED');assert.equal(b.slots.rifle[0],null);
 const replacement=unit(50,1,'rifle',1600);assignDefender(b,replacement);assert.equal(stationedBase(replacement,[b]),null);
 for(let i=0;i<300;i++)advanceDefender(b,replacement,1/60);assert.equal(stationedBase(replacement,[b]),b);
});
test('RC-07 identical seeded rockets and damage, different seed changes scatter',()=>{
 const run=seed=>{const {b,units}=bunker(),rng=createRandom(seed),shots=[];for(let i=0;i<8;i++){const r=launchRocket(unit(99,0,'rocket',1100),units[0],rng);shots.push([r.impactX,resolveRocketBlast(r.impactX,0,units,[b],rng),rng.state()]);}return shots;};
 assert.deepEqual(run(123),run(123));assert.notDeepEqual(run(123),run(124));
});
