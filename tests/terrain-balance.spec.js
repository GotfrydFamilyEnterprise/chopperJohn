import {test,expect} from '@playwright/test';
const ready=async(page,query='')=>{await page.goto('/terrain-lab.html?test&level=battle-lines&scenario=long'+query);await expect(page.locator('#caption strong')).toContainText('Open approach');};
const snap=page=>page.evaluate(()=>terrainTest.snapshot());
test('TL-09 shared costs, radius comparison resets actual combat and deterministic replay',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);await expect(page.locator('#blast')).toHaveValue('40');await page.click('#economyDetails summary');await expect(page.locator('#economyReport')).toContainText('Blue: 300 Supply fielded');await expect(page.locator('#economyReport')).toContainText('Red: 300 Supply fielded');
 await page.evaluate(()=>terrainTest.step(1200));const first=await snap(page);expect(first.stats.rocketShots).toBeGreaterThan(0);expect(first.stats.hits).toBeGreaterThan(0);await page.click('#reset');await page.evaluate(()=>terrainTest.step(1200));expect(await snap(page)).toEqual(first);
 await page.selectOption('#blast','25');expect((await snap(page)).time).toBe(0);expect((await snap(page)).blastRadius).toBe(25);expect((await snap(page)).units.every(u=>u.damageTaken===0)).toBe(true);await page.evaluate(()=>terrainTest.step(1200));const small=await snap(page);expect(small.stats.rocketShots).toBeGreaterThan(0);expect(small.units.reduce((n,u)=>n+u.damageTaken,0)).toBeLessThanOrEqual(first.units.reduce((n,u)=>n+u.damageTaken,0));expect(errors).toEqual([]);
});
test('TL-09 budget remainder, high/cover JSON presets and 50-radius real blast fit mobile layouts',async({page})=>{
 await ready(page,'&blast=50');await page.selectOption('#scenario','screen');await page.click('#economyDetails summary');await expect(page.locator('#economyReport')).toContainText('Blue: 220 Supply fielded');await expect(page.locator('#caption')).toContainText('20 unspent');
 for(const level of ['battle-hill','battle-cover']){await page.selectOption('#level',level);await expect.poll(async()=>(await snap(page)).levelId).toBe(level);await page.evaluate(()=>terrainTest.step(1200));expect((await snap(page)).stats.rocketShots).toBeGreaterThan(0);}
 await page.selectOption('#level','battle-lines');await expect(page.locator('#caption strong')).toContainText('Open approach');
 // Capture a real ground explosion, including its actual 50-unit outline.
 await page.evaluate(()=>{for(let i=0;i<3600;i++){terrainTest.step(1);if(terrainTest.snapshot().effects.some(e=>e.kind==='blast'))break;}});
 expect((await snap(page)).effects.some(e=>e.kind==='blast'&&e.radius===50)).toBe(true);
 for(const [name,size] of [['portrait',{width:390,height:844}],['landscape',{width:844,height:390}]]){await page.setViewportSize(size);await expect(page.locator('#canvas')).toBeVisible();for(const id of ['blast','run','reset','zoom','status']){const box=await page.locator('#'+id).boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(size.width);expect(box.y+box.height).toBeLessThanOrEqual(size.height);}await page.screenshot({path:'docs/quality/evidence/terrain-balance-blast-'+name+'.png'});}
});
test('TL-09 readable public balance report links to runnable encounters without test hooks',async({page})=>{
 await page.goto('/balance-report.html');await expect(page.locator('h1')).toContainText('Terrain balance');await expect(page.locator('#scope')).toContainText('No live income');await expect(page.locator('article')).toHaveCount(8);await page.locator('a[data-play="long"]').click();await expect(page.locator('#caption strong')).toContainText('Open approach');expect(await page.evaluate(()=>window.terrainTest)).toBeUndefined();
});
