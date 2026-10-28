import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const ready=async page=>{await page.goto('/terrain-lab.html?test');await expect(page.locator('#run')).toBeEnabled();};
const snap=page=>page.evaluate(()=>terrainTest.snapshot());
test('TL-01/03/05 JSON-loaded ridge blocks rifle sight; valley changes outcome, deterministic reset',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);await page.selectOption('#scenario','rifles');await page.evaluate(()=>terrainTest.step(1200));const hidden=await snap(page);expect(hidden.stats.rifleShots).toBe(0);expect(hidden.units.every(u=>u.hp===3)).toBe(true);await page.screenshot({path:'docs/quality/evidence/terrain-ridge-portrait.png'});
 await page.selectOption('#level','valley');await expect(page.locator('#caption strong')).toContainText('Valley');await page.selectOption('#scenario','rifles');await page.evaluate(()=>terrainTest.step(1200));expect((await snap(page)).stats.hits).toBeGreaterThan(0);await page.click('#reset');expect((await snap(page)).time).toBe(0);expect((await snap(page)).units.every(u=>u.hp===3)).toBe(true);expect(errors).toEqual([]);
});
test('TL-02/04/05 walking follows geometry and seeded rockets fly over ridge and collide',async({page})=>{
 await ready(page);await page.setViewportSize({width:844,height:390});await page.evaluate(()=>terrainTest.step(1200));const walk=await snap(page);expect(walk.stats.rifleShots).toBe(0);expect(walk.units[0].y).toBeLessThan(500);await page.screenshot({path:'docs/quality/evidence/terrain-walking-landscape.png'});
 await page.selectOption('#scenario','rockets');await page.evaluate(()=>terrainTest.step(180));expect((await snap(page)).projectiles.length).toBe(2);await page.screenshot({path:'docs/quality/evidence/terrain-rockets-landscape.png'});await page.evaluate(()=>terrainTest.step(2400));const first=await snap(page);expect(first.stats.terrainHits).toBeGreaterThan(4);await page.click('#reset');await page.evaluate(()=>terrainTest.step(2580));expect(await snap(page)).toEqual(first);
});
test('TL-01/05 edit/apply JSON and rejected edits preserve state, import/download round trip',async({page})=>{
 await ready(page);await page.click('#json');const source=JSON.parse(await page.locator('#source').inputValue());source.name='My test valley';source.terrain.points=source.terrain.points.map(([x])=>[x,0]);await page.fill('#source',JSON.stringify(source));await page.click('#apply');await expect(page.locator('#caption strong')).toContainText('My test valley');await page.selectOption('#scenario','rifles');await page.evaluate(()=>terrainTest.step(600));expect((await snap(page)).stats.hits).toBeGreaterThan(0);
 await page.click('#json');const before=await snap(page);await page.fill('#source','{"schemaVersion":99}');await page.click('#apply');await expect(page.locator('#error')).toContainText('schemaVersion');expect(await snap(page)).toEqual(before);
 const raw=readFileSync('docs/levels/bumps.json');await page.locator('#upload').setInputFiles({name:'bumps.json',mimeType:'application/json',buffer:raw});await expect(page.locator('#source')).toHaveValue(raw.toString());const downloadPromise=page.waitForEvent('download');await page.click('#download');const download=await downloadPromise;expect(download.suggestedFilename()).toBe('terrain-level.json');await page.click('#apply');expect((await snap(page)).levelId).toBe('bumps');
});
test('TL-05 actual run/pause/step and phone controls/editor fit, text guards, normal page hides test hook',async({page})=>{
 await ready(page);await page.click('#run');await expect.poll(async()=>(await snap(page)).time).toBeGreaterThan(.1);await page.click('#run');const paused=await snap(page);await page.waitForTimeout(150);expect(await snap(page)).toEqual(paused);await page.click('#step');expect((await snap(page)).tick).toBe(paused.tick+120);
 for(const size of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(size);await page.click('#json');for(const id of ['apply','closeJson','source']){const r=await page.locator('#'+id).boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y+r.height).toBeLessThanOrEqual(size.height);}await page.screenshot({path:'docs/quality/evidence/terrain-editor-'+size.width+'.png'});await page.click('#closeJson');const zoomed=await page.locator('#zoom').getAttribute('aria-pressed');await page.click('#zoom');await expect(page.locator('#zoom')).toHaveAttribute('aria-pressed',zoomed==='true'?'false':'true');await page.click('#zoom');}
 await page.goto('/terrain-lab.html');await expect(page.locator('#run')).toBeEnabled();expect(await page.evaluate(()=>typeof terrainTest)).toBe('undefined');expect(await page.locator('#run').evaluate(el=>getComputedStyle(el).userSelect)).toBe('none');
});
test('TL-01 failed level fetch leaves recoverable visible error',async({page})=>{
 await page.route('**/levels/ridge.json',route=>route.fulfill({status:404,body:'missing'}));await page.goto('/terrain-lab.html?test');await expect(page.locator('#status')).toContainText('404');await expect(page.locator('#run')).toBeDisabled();await page.selectOption('#level','valley');await expect(page.locator('#run')).toBeEnabled();expect((await snap(page)).levelId).toBe('valley');
});
test('TL-01/05 stale fetch cannot overwrite newer level and later fetch error stays visible',async({page})=>{
 await ready(page);
 let release;const wait=new Promise(resolve=>release=resolve);
 await page.route('**/levels/valley.json',async route=>{await wait;await route.fulfill({status:200,contentType:'application/json',body:readFileSync('docs/levels/valley.json','utf8')});});
 await page.selectOption('#level','valley');await page.selectOption('#level','bumps');await expect(page.locator('#caption strong')).toContainText('Rolling ground');release();await page.waitForTimeout(100);expect((await snap(page)).levelId).toBe('bumps');
 await page.route('**/levels/ridge.json',route=>route.fulfill({status:503,body:'unavailable'}));const before=await snap(page);await page.selectOption('#level','ridge');await expect(page.locator('#status')).toContainText('503');await page.waitForTimeout(150);await expect(page.locator('#status')).toContainText('503');expect(await snap(page)).toEqual(before);
});
