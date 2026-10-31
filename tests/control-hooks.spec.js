import {test,expect} from '@playwright/test';
test('CP-06 campaign button hooks obey locks, paid transactions, cooldown, pause and real pilot handlers',async({page})=>{
 await page.goto('/campaign.html?test');await expect(page.locator('[data-level="first-assault"]')).toBeEnabled();
 expect((await page.evaluate(()=>campaignTest.interact.press('heliFire'))).ok).toBe(false);
 // Dynamic level buttons have stable test IDs as well as data-level selectors.
 await page.click('[data-level="first-assault"]');await expect.poll(async()=>page.evaluate(()=>campaignTest.snapshot().mode)).toBe('play');
 let action=await page.evaluate(()=>campaignTest.interact.click('blueRifle'));expect(action.ok).toBe(true);expect(action.state.world.commanders[0].supply.spent).toBe(25);
 action=await page.evaluate(()=>campaignTest.interact.click('blueRocket'));expect(action.ok).toBe(false);expect(action.reason).toBe('disabled');
 await page.evaluate(()=>campaignTest.interact.advance(2));action=await page.evaluate(()=>campaignTest.interact.click('blueRocket'));expect(action.ok).toBe(true);expect(action.state.world.commanders[0].supply.spent).toBe(85);
 await page.evaluate(()=>campaignTest.interact.joystick(0,-1));await page.evaluate(()=>campaignTest.interact.advance(1.5));await page.evaluate(()=>campaignTest.interact.releaseAll());expect((await page.evaluate(()=>campaignTest.snapshot())).world.helicopter.y).toBeLessThan(400);
 const shots=await page.evaluate(()=>campaignTest.interact.hold('heliFire',1));expect(shots.state.world.stats.helicopterShots).toBe(8);expect(shots.state.world.helicopter.ammo).toBe(112);
 const facing=shots.state.world.helicopter.facing;action=await page.evaluate(()=>campaignTest.interact.press('heliTurn'));expect(action.state.world.helicopter.facing).toBe(-facing);
 await page.evaluate(()=>campaignTest.interact.click('menuToggle'));await page.evaluate(()=>campaignTest.interact.click('pause'));const frozen=await page.evaluate(()=>campaignTest.snapshot());expect((await page.evaluate(()=>campaignTest.interact.hold('heliFire',1))).ok).toBe(false);await page.evaluate(()=>campaignTest.interact.advance(1));expect(await page.evaluate(()=>campaignTest.snapshot())).toEqual(frozen);
 expect((await page.evaluate(()=>campaignTest.interact.click('missing-button'))).reason).toBe('unknown');expect((await page.evaluate(()=>campaignTest.interact.list())).some(b=>b.id==='blueRifle')).toBe(true);
});
test('CP-06 legacy battlefield exposes same hook vocabulary without bypassing menu, ammo or purchases',async({page})=>{
 await page.goto('/battlefield.html?test&menu');expect((await page.evaluate(()=>battlefieldTest.interact.press('heliFire'))).ok).toBe(false);expect((await page.evaluate(()=>battlefieldTest.interact.click('newGame'))).ok).toBe(true);
 const purchase=await page.evaluate(()=>battlefieldTest.interact.click('blueRifle'));expect(purchase.state.blueCommander.supply.spent).toBe(25);
 const fired=await page.evaluate(()=>battlefieldTest.interact.hold('heliFire',1));expect(fired.state.gunShotsTotal).toBe(8);expect(fired.state.helicopter.ammo).toBe(112);expect(fired.state.pilotInput.fire).toBe(false);
});
test('CP-06 terrain buttons/selectors use actual scene handlers and bounded deterministic advance',async({page})=>{
 await page.goto('/terrain-lab.html?test');await expect(page.locator('#run')).toBeEnabled();expect((await page.evaluate(()=>terrainTest.interact.select('scenario','rifles'))).ok).toBe(true);expect((await page.evaluate(()=>terrainTest.interact.click('step'))).state.tick).toBe(120);expect((await page.evaluate(()=>terrainTest.interact.select('blast','50'))).state.tick).toBe(0);expect((await page.evaluate(()=>terrainTest.interact.select('blast','bad'))).reason).toBe('invalid-option');expect((await page.evaluate(()=>terrainTest.interact.advance(.1))).tick).toBe(12);expect((await page.evaluate(()=>terrainTest.interact.advance(201))).tick).toBe(24132);
});
test('CP-06 normal campaign, skirmish and terrain URLs expose no interaction controller',async({page})=>{
 for(const [url,name]of[['/campaign.html','campaignTest'],['/battlefield.html','battlefieldTest'],['/terrain-lab.html','terrainTest']]){await page.goto(url);expect(await page.evaluate(name=>typeof window[name],name)).toBe('undefined');}
});
