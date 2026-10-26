import {menuAction} from './menu-helper.js';
import {test,expect} from '@playwright/test';
test('review RC-10 follow contains both endpoints, pause/reset/manual navigation remain usable',async({page})=>{
 await page.goto('/battlefield.html?test&view=rockets');
 const shotState=await page.evaluate(()=>{
  battlefieldTest.combat(true);
  for(let i=0;i<3600;i++){battlefieldTest.step();const s=battlefieldTest.snapshot();if(s.rockets.length)return s;}
  return battlefieldTest.snapshot();
 });
 expect(shotState.rockets.length).toBeGreaterThan(0);
 for(const x of [shotState.rockets[0].originX,shotState.rockets[0].impactX]){
  expect((x-shotState.camera)*shotState.scale).toBeGreaterThanOrEqual(0);
  expect((x-shotState.camera)*shotState.scale).toBeLessThanOrEqual(390);
 }
 await menuAction(page,'#pause');const before=await page.evaluate(()=>battlefieldTest.snapshot());
 await page.evaluate(()=>battlefieldTest.step(90));expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(before);
 await menuAction(page,'#reset');const reset=await page.evaluate(()=>{battlefieldTest.step(0);return battlefieldTest.snapshot();});
 expect(reset.shotsFired).toBe(0);expect(reset.rockets).toHaveLength(0);expect(reset.combatEvents).toHaveLength(0);
 expect(reset.bases.filter(b=>!b.main).every(b=>b.state==='UNCLAIMED'&&b.flagProgress===0)).toBe(true);
 expect(reset.units.filter(u=>u.type==='rocket')).toHaveLength(4);
 expect(reset.units.every(u=>!u.rocketAimTime&&!u.rocketCooldown&&!u.rocketGoal)).toBe(true);
 await page.keyboard.press('ArrowRight');expect((await page.evaluate(()=>battlefieldTest.snapshot())).followRockets).toBe(false);
 await menuAction(page,'#followRockets');expect((await page.evaluate(()=>battlefieldTest.snapshot())).followRockets).toBe(true);
 await menuAction(page,'#jumpRed');expect((await page.evaluate(()=>battlefieldTest.snapshot())).followRockets).toBe(false);
});
