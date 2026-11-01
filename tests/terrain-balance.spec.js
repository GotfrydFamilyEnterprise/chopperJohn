import {test,expect} from '@playwright/test';
const ready=async(page,query='')=>{await page.goto('/terrain-lab.html?test&level=battle-lines&scenario=long&damage=individual'+query);await expect(page.locator('#caption strong')).toContainText('Open approach');};
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
test('TL-10 shared crowd damage is real, model switch resets and individual comparison stays available',async({page})=>{
 await page.goto('/terrain-lab.html?test&level=battle-lines&scenario=cluster');await expect(page.locator('#run')).toBeEnabled();await expect(page.locator('#damageModel')).toHaveValue('shared');
 const level={schemaVersion:1,id:'shared-fixture',name:'Shared blast probe',seed:7,world:{width:2400,baseline:500},terrain:{points:[[0,0],[2400,0]]},scenarios:[{id:'crowd',name:'Crowd',description:'One rocket against four overlapping exposed enemies.',combat:true,units:[{id:1,team:0,type:'rocket',x:700,mode:'hold'},...[2,3,4,5].map(id=>({id,team:1,type:'rifle',x:1000,mode:'hold'}))]}]};
 await page.evaluate(level=>terrainTest.load(level),level);
 const impact=()=>page.evaluate(()=>{for(let i=0;i<1200;i++){terrainTest.step(1);const s=terrainTest.snapshot();if(s.effects.some(e=>e.kind==='blast'))return s;}throw Error('No actual impact');});
 const shared=await impact();const hits=shared.events.filter(e=>e.type==='damage'&&e.weapon==='rocket');expect(hits).toHaveLength(4);expect(new Set(hits.map(e=>e.amount)).size).toBeGreaterThan(1);const sharedTotal=hits.reduce((n,e)=>n+e.amount,0);expect(sharedTotal).toBeLessThan(4);expect(shared.damageModel).toBe('shared');
 await page.screenshot({path:'docs/quality/evidence/terrain-shared-crowd-portrait.png'});await page.setViewportSize({width:844,height:390});await page.screenshot({path:'docs/quality/evidence/terrain-shared-crowd-landscape.png'});
 await page.selectOption('#damageModel','individual');expect((await snap(page)).tick).toBe(0);expect((await snap(page)).damageModel).toBe('individual');const old=await impact();expect(old.events.filter(e=>e.type==='damage').reduce((n,e)=>n+e.amount,0)).toBeGreaterThan(sharedTotal);
 await page.selectOption('#damageModel','shared');const replay=await impact();expect(replay).toEqual(shared);
});
