import {test,expect} from '@playwright/test';
const snap=page=>page.evaluate(()=>platoonLabTest.snapshot());
const url='/platoon-lab.html?test&study=combined&seed=7001';
async function start(page,query=''){await page.goto(url+query);await expect.poll(()=>page.evaluate(()=>!!window.platoonLabTest?.snapshot())).toBe(true);}
async function select(page,id,value){await page.locator('#'+id).scrollIntoViewIfNeeded();expect((await page.evaluate(([id,value])=>platoonLabTest.interact.select(id,value),[id,value])).ok).toBe(true);}

test('PL-11 actual selectors reset and legacy controls cannot affect the paid study',async({page})=>{
 await start(page);await page.click('#menuToggle');await expect(page.locator('#case')).toBeHidden();await expect(page.locator('#case')).toBeDisabled();
 expect((await page.evaluate(()=>platoonLabTest.interact.select('controller','independent'))).ok).toBe(false);
 for(const[id,value,field]of[['layout','support','layout'],['release','staggered','release'],['resupply','1','resupply']]){await select(page,id,value);const s=await snap(page);expect(s.world.time).toBe(0);expect(s.result[field]).toBe(value==='1'?true:value);expect(s.result.spent).toEqual([25,0]);}
 await select(page,'mirror','1');expect((await snap(page)).world.units[0].team).toBe(1);
 await page.locator('#seed').scrollIntoViewIfNeeded();await page.fill('#seed','7002');await page.locator('#seed').blur();expect((await snap(page)).result.seed).toBe(7002);
 await page.fill('#seed','');await page.locator('#seed').blur();await expect(page.locator('#error')).toContainText('Seed must');await expect(page.locator('#play')).toBeDisabled();await expect(page.locator('#step')).toBeDisabled();await page.evaluate(()=>platoonLabTest.interact.advance(10));expect((await snap(page)).world.time).toBe(0);await expect(page.locator('#play')).toBeDisabled();await expect(page.locator('#step')).toBeDisabled();const invalid=await snap(page);await page.evaluate(()=>platoonLabTest.interact.advance(5));expect(await snap(page)).toEqual(invalid);
 await page.fill('#seed','7001');await page.locator('#seed').blur();await select(page,'study','legacy');expect((await snap(page)).lab.study).toBe('legacy');await expect(page.locator('#layout')).toBeHidden();await select(page,'mix','rocket');expect((await snap(page)).result.initialCost[0]).toBe(230);
});
for(const layout of['one','two','support'])test(`PL-11 ${layout}: real lab stepping exactly matches shared paid fixture in both directions`,async({page})=>{
 test.setTimeout(90000);
 for(const mirrored of[false,true]){
  await start(page,`&layout=${layout}&mirror=${Number(mirrored)}`);await page.click('#step5');expect((await snap(page)).world.time).toBe(5);
  const same=await page.evaluate(async({layout,mirrored})=>{
   const {createCombinedAssault,stepCombinedAssault,combinedAssaultResult}=await import('/js/battlefield/platoons/combinedAssaultStudy.js?v=2.2.0');const {worldSnapshot}=await import('/js/battlefield/campaign/world.js?v=2.2.0');
   const level=await(await fetch('/campaign/first-assault.json')).json(),direct=createCombinedAssault(level,{layout,mirrored,seed:7001});
   stepCombinedAssault(direct,120*90);platoonLabTest.interact.advance(85);const displayed=platoonLabTest.snapshot();
   return JSON.stringify(displayed.world)===JSON.stringify(worldSnapshot(direct.world))&&JSON.stringify(displayed.result)===JSON.stringify(combinedAssaultResult(direct));
  },{layout,mirrored});expect(same).toBe(true);const checkpoint=await snap(page);
  await expect(page.locator('#economy')).toContainText('Spent 340/110');await expect(page.locator('#forces')).toContainText('340 / 110');
  if(layout==='two'){await expect(page.locator('#strength')).toContainText('Sgt 1');await expect(page.locator('#strength')).toContainText('Sgt 2');}
  await page.evaluate(()=>platoonLabTest.interact.advance(150));const a=await snap(page);expect(a.result.outcome).toBe('capture');expect(a.result.ledgerValid).toBe(true);expect(a.result.breachAt).toBeLessThan(a.result.captureAt);await expect(page.locator('#outcome')).toContainText('Outpost captured');await expect(page.locator('#play')).toBeDisabled();
  await page.click('#reset');expect((await snap(page)).world.time).toBe(0);await page.evaluate(()=>platoonLabTest.interact.advance(90));expect(await snap(page)).toEqual(checkpoint);
 }
});
test('PL-11 paid defenders produce honest unfinished outcome and reset replays identically',async({page})=>{
 test.setTimeout(60000);await start(page,'&layout=two&resupply=1');await page.evaluate(()=>platoonLabTest.interact.advance(90));const before=await snap(page);await page.click('#reset');await page.evaluate(()=>platoonLabTest.interact.advance(90));expect(await snap(page)).toEqual(before);
 await page.evaluate(()=>platoonLabTest.interact.advance(150));const s=await snap(page);expect(s.result.outcome).toBe('unfinished');expect(s.result.seconds).toBe(240);expect(s.result.spent[0]).toBeGreaterThan(340);expect(s.result.spent[1]).toBeGreaterThan(110);expect(s.result.ledgerValid).toBe(true);await expect(page.locator('#outcome')).toContainText('Unfinished at time limit');
});
test('PL-11 mobile controls/settings fit, diagram pans/zooms and screenshots show actual assembly and combat',async({page})=>{
 await start(page,'&layout=two');
 for(const[name,size]of[['portrait',{width:390,height:844}],['landscape',{width:844,height:390}]]){
  await page.setViewportSize(size);await page.click('#reset');await page.click('#step5');await page.screenshot({path:`docs/quality/evidence/playable-assault-${name}-assembly.png`});
  await page.evaluate(()=>platoonLabTest.interact.advance(85));const fit=(await snap(page)).lab.view;await page.click('#zoom');const zoom=(await snap(page)).lab;expect(zoom.zoom).toBe(true);expect(zoom.view.scale).toBeGreaterThan(fit.scale);await page.screenshot({path:`docs/quality/evidence/playable-assault-${name}-combat.png`});
  const camera=(await snap(page)).lab.view.camera;await page.mouse.move(250,200);await page.mouse.down();await page.mouse.move(160,200);await page.mouse.up();const pan=(await snap(page)).lab;expect(pan.auto).toBe(false);expect(pan.view.camera).not.toBe(zoom.view.camera);await page.click('#fit');const restored=(await snap(page)).lab;expect(restored.auto).toBe(true);expect(restored.zoom).toBe(false);expect(restored.view).toEqual(fit);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const id of['play','step','step5','reset','fit','zoom']){const r=await page.locator('#'+id).boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(size.width);expect(r.y+r.height).toBeLessThanOrEqual(size.height);}
  await page.click('#menuToggle');await page.locator('#resupply').scrollIntoViewIfNeeded();await expect(page.locator('#resupply')).toBeInViewport();await page.screenshot({path:`docs/quality/evidence/playable-assault-${name}-settings.png`});await page.click('#menuToggle');
 }
});
test('PL-11 normal Run/Pause advances and freezes the actual study without production test hooks',async({page})=>{
 await page.clock.install();await page.goto('/platoon-lab.html?study=combined&layout=two&seed=7001');await expect(page.locator('#time')).not.toContainText('Loading');expect(await page.evaluate(()=>typeof window.platoonLabTest)).toBe('undefined');await page.click('#play');await page.clock.runFor(1200);expect(Number.parseFloat(await page.locator('#time').textContent())).toBeGreaterThan(.5);await page.click('#play');const time=await page.locator('#time').textContent();await page.clock.runFor(2000);await expect(page.locator('#time')).toHaveText(time);await page.click('#reset');await expect(page.locator('#time')).toHaveText('0.0s');
});
