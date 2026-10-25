import test from 'node:test';
import assert from 'node:assert/strict';
import {createSoldier} from '../docs/js/battlefield/units/soldierCommon.js';
import {WEAPONS,launchRocket,chooseRocketTarget,planRocketShot,rocketPosition} from '../docs/js/battlefield/combat/weapons.js';
for(const team of [0,1])for(const velocity of [-47,0,47])test(`RC-09 leading intercept team ${team}, velocity ${velocity}`,()=>{
 const direction=team?-1:1,u=createSoldier(1,team,'rocket',1800,460),target=createSoldier(2,1-team,'rifle',1800+direction*600,460);
 target.observedVelocity=velocity;
 const shot=launchRocket(u,target,()=>.5),goal=planRocketShot(u,target),end=rocketPosition(shot,shot.flightTime);
 assert.ok(Math.abs(end.x-(target.x+velocity*shot.flightTime))<1e-6);
 assert.ok(Math.abs(end.y-460)<1e-8);
 assert.ok(Math.abs(shot.aimedX-goal.aimedX)<1e-8);
 if(velocity===0)assert.equal(shot.aimedX,target.x);else assert.ok((shot.aimedX-target.x)*velocity>0);
 const destination=shot.impactX;target.x+=100;target.observedVelocity=-velocity;assert.equal(shot.impactX,destination);
});
test('RC-09 autonomous target lock remains stable and reacquires only eligible targets',()=>{
 const u=createSoldier(1,0,'rocket',1500,460),a=createSoldier(2,1,'rifle',1900,460),b=createSoldier(3,1,'rocket',1800,460);
 u.rocketTargetId=2;assert.equal(chooseRocketTarget(u,[a,b]),a);
 a.hp=0;assert.equal(chooseRocketTarget(u,[a,b]),b);
 b.x=u.x+WEAPONS.rocketMaxRange+1;assert.equal(chooseRocketTarget(u,[a,b]),null);
});
