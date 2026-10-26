import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
for(const team of [0,1])test(`RC-09 real marching target is led faction ${team}`,async({page})=>{
 await page.goto('/battlefield.html?test&view=rockets');
 const result=await page.evaluate(team=>{
  battlefieldTest.reset(42);battlefieldTest.clear();const dir=team?-1:1,x=team?2200:1400;
  const shooter=battlefieldTest.spawn(team,'rocket',x),target=battlefieldTest.spawn(1-team,'rifle',x+dir*600);
  battlefieldTest.combat(true);battlefieldTest.step(42);return {shooter,target,state:battlefieldTest.snapshot()};
 },team);
 const shot=result.state.rockets[0],target=result.state.units.find(u=>u.id===result.target);
 expect(shot.targetId).toBe(target.id);expect(shot.targetVelocity).toBeCloseTo(team?47:-47);
 expect((shot.aimedX-shot.targetX)*shot.targetVelocity).toBeGreaterThan(0);
 expect(shot.aimedX).toBeCloseTo(shot.targetX+shot.targetVelocity*shot.flightTime,5);
 await page.evaluate(()=>battlefieldTest.step(30));
 await page.screenshot({path:`docs/quality/evidence/rocket-leading-team-${team}.png`});
 const landed=await page.evaluate(()=>{while(battlefieldTest.snapshot().rockets.length)battlefieldTest.step();return battlefieldTest.snapshot();});
 expect(landed.combatEvents.some(e=>e.type==='explosion')).toBeTruthy();
 writeFileSync(`docs/quality/evidence/rocket-leading-team-${team}-trace.json`,JSON.stringify({launch:result.state,landed},null,2));
});
test('RC-10 normal opening wave fires without manual deployments and follow shows flight',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/battlefield.html?test&view=rockets');
 const result=await page.evaluate(()=>{
  battlefieldTest.combat(true);const checkpoints=[];
  for(let i=0;i<120;i++){
   battlefieldTest.step(30);const state=battlefieldTest.snapshot();
   checkpoints.push({time:state.time,shotsFired:state.shotsFired,units:state.units.length});
   if(state.rockets.length)return {state,checkpoints};
  }
  return {state:battlefieldTest.snapshot(),checkpoints};
 });
 expect(result.state.time).toBeLessThan(60);expect(result.state.rockets.length).toBeGreaterThan(0);
 expect(result.state.units.filter(u=>u.type==='rocket'&&u.guardBase===null).length).toBeGreaterThan(0);
 expect(result.state.followRockets).toBe(true);
 const shot=result.state.rockets[0];
 for(const x of [shot.originX,shot.impactX])expect((x-result.state.camera)*result.state.scale).toBeGreaterThan(0);
 await page.evaluate(()=>battlefieldTest.step(30));
 await page.screenshot({path:'docs/quality/evidence/rocket-opening-follow.png'});
 await expect(page.locator('#count')).toContainText('launched');
 const both=await page.evaluate(()=>{battlefieldTest.step(Math.max(0,Math.ceil((60-battlefieldTest.snapshot().time)*60)));return battlefieldTest.snapshot();});
 expect(new Set(both.combatEvents.filter(e=>e.type==='launch').map(e=>e.team)).size).toBe(2);
 writeFileSync('docs/quality/evidence/rocket-opening-follow-trace.json',JSON.stringify({first:result,both},null,2));
 await page.locator('#jumpBlue').click();expect((await page.evaluate(()=>battlefieldTest.snapshot())).followRockets).toBe(false);
 await page.locator('#followRockets').click();expect((await page.evaluate(()=>battlefieldTest.snapshot())).followRockets).toBe(true);
 await page.mouse.move(100,400);await page.mouse.down();await page.mouse.up();
 expect((await page.evaluate(()=>battlefieldTest.snapshot())).followRockets).toBe(false);
 expect(errors).toEqual([]);
});
