import test from 'node:test';
import assert from 'node:assert/strict';
import {createRandom,updateRocketWeapon,resolveRocketBlast,resolveRifleHit,launchRocket,rocketPosition} from '../docs/js/battlefield/combat/weapons.js';
import {createBase} from '../docs/js/battlefield/bases/baseCommon.js';
import {createSoldier} from '../docs/js/battlefield/units/soldierCommon.js';
import {assignDefender,advanceDefender} from '../docs/js/battlefield/bases/forwardBase.js';
const soldier=(id,team,type='rifle',x=1500)=>createSoldier(id,team,type,x,460);
test('review RC-02 full reload must precede a new full aim',()=>{
 const u=soldier(1,0,'rocket'),target=soldier(2,1,'rocket',1800),rng=createRandom(9),shots=[];
 for(let tick=1;tick<=300;tick++)if(updateRocketWeapon(u,target,1/60,rng))shots.push(tick);
 assert.equal(shots[0],42);
 assert.ok(shots[1]-shots[0]>=222,`launch ticks ${shots}: reload 180 ticks plus aim 42 ticks required`);
});
test('review BC-02 footprint inclusive edges, partial bunker, no flag dependency',()=>{
 for(const team of [0,1])for(const [offset,expected] of [[-105,1],[105,1],[-105.001,0],[105.001,0]]){
  const b=createBase(1500,team,false),u=soldier(1,team);assignDefender(b,u);for(let i=0;i<300;i++)advanceDefender(b,u,1/60);
  assert.equal(b.state,'ASSEMBLING');assert.equal(b.flagProgress,0);
  const hits=resolveRocketBlast(b.x+offset,1-team,[u],[b],()=>0);
  assert.equal(hits.length,expected);if(expected)assert.ok(Math.abs(hits[0].amount-1/3)<1e-9);
 }
});
test('review BC-01 reservations and passers never gain cover; BC-03 independent endpoints',()=>{
 const b=createBase(1500,1,false),u=soldier(1,1,'rocket',1590);assignDefender(b,u);
 assert.equal(resolveRocketBlast(1590,0,[u],[b],()=>0)[0].amount,2);
 u.hp=4;for(let i=0;i<300;i++)advanceDefender(b,u,1/60);
 for(const random of [()=>0,()=>.049999,()=>.05,()=>.999999]){u.hp=4;const hit=resolveRifleHit(u,[b],random);assert.equal(hit.amount,random()<.05?.5:0);}
});
test('review RC-03/04 mirrored endpoint extremes land analytically on intended ground',()=>{
 for(const team of [0,1])for(const distance of [225,287.5,350,425,500])for(const value of [0,.5,1-Number.EPSILON]){
  const u=soldier(1,team,'rocket'),target=soldier(2,1-team,'rocket',u.x+(team?-1:1)*distance);
  const rocket=launchRocket(u,target,()=>value),end=rocketPosition(rocket,rocket.flightTime);
  assert.ok(Math.abs(end.x-rocket.impactX)<1e-8);assert.ok(Math.abs(end.y-u.y)<1e-8);assert.ok(rocket.vy<0);
 }
});

test('review RC-09 leading stays ballistic and mirror-symmetric throughout actual firing band',async()=>{
 const {planRocketShot}=await import('../docs/js/battlefield/combat/weapons.js');
 for(const distance of [225,350,500,550,600])for(const velocity of [-47,-19.74,0,19.74,47])for(const scatter of [-5,0,5]){
  const left={x:1800,y:460,team:0},right={...left,team:1};
  const a=planRocketShot(left,{x:1800+distance,observedVelocity:velocity},scatter);
  const b=planRocketShot(right,{x:1800-distance,observedVelocity:-velocity},-scatter);
  const end=rocketPosition(a,a.flightTime);
  assert.ok(Math.abs(end.x-(1800+distance+velocity*a.flightTime+scatter))<1e-5);
  assert.ok(Math.abs(end.y-460)<1e-8);assert.ok(Math.abs(a.flightTime-b.flightTime)<1e-9);
  assert.ok(Math.abs(a.impactX+b.impactX-3600)<1e-8);
 }
});
test('review RC-09 locked targets behind, friendly, dead and inside minimum are reacquired',async()=>{
 const {chooseRocketTarget}=await import('../docs/js/battlefield/combat/weapons.js');
 for(const team of [0,1])for(const bad of ['behind','friendly','dead','close','far']){
  const dir=team?-1:1,u=soldier(1,team,'rocket',1800),locked=soldier(2,1-team,'rifle',1800+dir*300),fallback=soldier(3,1-team,'rocket',1800+dir*600);
  u.rocketTargetId=locked.id;
  if(bad==='behind')locked.x=1800-dir;if(bad==='friendly')locked.team=team;if(bad==='dead')locked.hp=0;if(bad==='close')locked.x=1800+dir*224.999;if(bad==='far')locked.x=1800+dir*600.001;
  assert.equal(chooseRocketTarget(u,[locked,fallback]),fallback);
 }
});
