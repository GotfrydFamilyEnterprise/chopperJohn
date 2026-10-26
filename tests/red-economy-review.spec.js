import {test,expect} from '@playwright/test';
test('review AI-02 emergency releases an already assembling physical wave',async({page})=>{
 await page.goto('/battlefield.html?test');
 const result=await page.evaluate(()=>{battlefieldTest.combat(false);battlefieldTest.step(600);const before=battlefieldTest.snapshot();const id=battlefieldTest.spawn(0,'rifle',2900);battlefieldTest.patchUnit(id,{velocity:0});battlefieldTest.step();return {before,after:battlefieldTest.snapshot()};});
 const gathering=result.before.redCommander.squads.find(s=>s.phase==='gather');expect(gathering).toBeTruthy();expect(gathering.members.length).toBeGreaterThan(0);
 expect(result.after.redCommander.strategy.mode).toBe('DEFEND');const defense=result.after.redCommander.squads.find(s=>s.id===gathering.id);expect(defense.phase).toBe('advance');expect(defense.role).toBe('defense');
 for(const id of gathering.members){const old=result.before.units.find(u=>u.id===id),now=result.after.units.find(u=>u.id===id);expect(Math.abs(now.x-old.x)).toBeLessThanOrEqual(47/60+1e-8);}
});
test('review EC-05 red status remains inside portrait and landscape viewport',async({page})=>{
 for(const viewport of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(viewport);await page.goto('/battlefield.html?test');await page.evaluate(()=>battlefieldTest.step(1800));const box=await page.locator('#redEconomy').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.y).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(viewport.width);expect(box.y+box.height).toBeLessThanOrEqual(viewport.height);await expect(page.locator('#redRifle')).toHaveCount(0);await expect(page.locator('#blueRifle')).toBeVisible();await page.screenshot({path:`docs/quality/evidence/shared-economy-regression-${viewport.width}.png`});}
});
