import {test,expect} from '@playwright/test';
// Independent adversarial browser probes; source is never patched by these tests.
for(const team of [0,1])test(`review RC-03/05 airborne rocket survives both deaths and infantry crossing faction ${team}`,async({page})=>{
 await page.goto('/battlefield.html?test');
 const state=await page.evaluate(team=>{
  battlefieldTest.reset(76);battlefieldTest.clear();const direction=team?-1:1;
  const shooter=battlefieldTest.spawn(team,'rocket',1800),target=battlefieldTest.spawn(1-team,'rocket',1800+direction*300);
  battlefieldTest.patchUnit(target,{velocity:0,rocketCooldown:999});battlefieldTest.combat(true);battlefieldTest.step(42);
  const launched=battlefieldTest.snapshot().rockets[0];battlefieldTest.kill(shooter);battlefieldTest.kill(target);
  const crossing=battlefieldTest.spawn(1-team,'rifle',launched.originX+direction*50);
  battlefieldTest.patchUnit(crossing,{velocity:0});battlefieldTest.step(24);const airborne=battlefieldTest.snapshot();
  battlefieldTest.step(150);return {launched,crossing,airborne,final:battlefieldTest.snapshot()};
 },team);
 expect(state.airborne.rockets).toHaveLength(1);expect(state.airborne.units.find(u=>u.id===state.crossing).hp).toBe(3);
 const explosions=state.final.combatEvents.filter(e=>e.type==='explosion');expect(explosions).toHaveLength(1);
 expect(explosions[0].x).toBeCloseTo(state.launched.impactX);expect(state.final.units.find(u=>u.id===state.crossing).hp).toBe(3);
});
test('review RC-02 actual browser launch intervals include full reload then full aim',async({page})=>{
 await page.goto('/battlefield.html?test');
 const launches=await page.evaluate(()=>{
  battlefieldTest.reset(5);battlefieldTest.clear();const shooter=battlefieldTest.spawn(0,'rocket',1500),target=battlefieldTest.spawn(1,'rocket',1850);
  battlefieldTest.patchUnit(shooter,{hp:1000});battlefieldTest.patchUnit(target,{hp:1000,velocity:0,rocketCooldown:999});
  battlefieldTest.combat(true);battlefieldTest.step(500);return battlefieldTest.snapshot().combatEvents.filter(e=>e.type==='launch'&&e.shooterId===shooter);
 });
 expect(launches.length).toBeGreaterThanOrEqual(3);expect(launches[0].time).toBeCloseTo(.7);
 for(let i=1;i<launches.length;i++)expect(launches[i].time-launches[i-1].time).toBeCloseTo(3.7,8);
});
