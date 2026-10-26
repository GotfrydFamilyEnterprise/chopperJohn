import {test,expect} from '@playwright/test';
const snapshot=page=>page.evaluate(()=>battlefieldTest.snapshot());
test('FS-01/03 actual fullscreen enter, button exit and browser exit preserve paused game',async({page})=>{
 await page.goto('/battlefield.html?test');await page.evaluate(()=>battlefieldTest.step(1800));await page.locator('#pause').click();
 const before=await snapshot(page);
 await page.locator('#fullscreen').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.tagName)).toBe('HTML');
 await expect(page.locator('#fullscreen')).toHaveText('Exit fullscreen');
 await expect(page.locator('#fullscreen')).toHaveAttribute('aria-pressed','true');
 expect(await snapshot(page)).toEqual(before);
 await page.screenshot({path:'docs/quality/evidence/fullscreen-active.png'});
 await page.locator('#fullscreen').click();await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(false);
 await page.locator('#fullscreen').click();await page.evaluate(()=>document.exitFullscreen());
 await expect(page.locator('#fullscreen')).toHaveText('Fullscreen');expect(await snapshot(page)).toEqual(before);
 await page.locator('#pause').click();await page.evaluate(()=>battlefieldTest.step(60));expect((await snapshot(page)).time).toBeGreaterThan(before.time);
});
test('FS-02 unsupported browser shows honest iPhone guidance, closes and retains gameplay',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(Element.prototype,'requestFullscreen',{value:undefined,configurable:true});Object.defineProperty(Element.prototype,'webkitRequestFullscreen',{value:undefined,configurable:true});});
 await page.goto('/battlefield.html?test');const before=await snapshot(page);await page.locator('#fullscreen').click();
 await expect(page.locator('#fullscreenHelp')).toBeVisible();await expect(page.locator('#fullscreenMessage')).toContainText('Add to Home Screen');
 await expect(page.locator('#fullscreen')).toHaveAttribute('aria-pressed','false');expect(await snapshot(page)).toEqual(before);
 await page.screenshot({path:'docs/quality/evidence/fullscreen-iphone-help.png'});
 await page.getByRole('button',{name:'Got it'}).click();await expect(page.locator('#fullscreenHelp')).not.toBeVisible();
});
test('FS-02 rejected requests and standalone launch never falsely report native fullscreen',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('denied'));});
 await page.goto('/battlefield.html?test');await page.locator('#fullscreen').click();await expect(page.locator('#fullscreenMessage')).toContainText('blocked');
 await page.getByRole('button',{name:'Got it'}).click();await expect(page.locator('#fullscreen')).toHaveAttribute('aria-pressed','false');
 await page.evaluate(()=>Object.defineProperty(navigator,'standalone',{value:true,configurable:true}));
 await page.locator('#fullscreen').click();await expect(page.locator('#fullscreenMessage')).toContainText('already playing');
 await expect(page.locator('#fullscreen')).toHaveAttribute('aria-pressed','true');expect(errors).toEqual([]);
 const manifest=await page.request.get('/battlefield.webmanifest');expect(manifest.ok()).toBe(true);const data=await manifest.json();expect(data.display).toBe('standalone');expect(data.start_url).toContain('battlefield.html');
});
test('FS-03 portrait and landscape fullscreen button remains visible without overlapping other controls',async({page})=>{
 for(const vp of [{width:390,height:844},{width:844,height:390}]){
  await page.setViewportSize(vp);await page.goto('/battlefield.html?test');
  const boxes=await page.locator('#tools button').evaluateAll(buttons=>buttons.map(b=>{const r=b.getBoundingClientRect();return {id:b.id,x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));
  for(const b of boxes){expect(b.x).toBeGreaterThanOrEqual(0);expect(b.y).toBeGreaterThanOrEqual(0);expect(b.right).toBeLessThanOrEqual(vp.width);expect(b.bottom).toBeLessThanOrEqual(vp.height);}
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];expect(a.right<=b.x||b.right<=a.x||a.bottom<=b.y||b.bottom<=a.y).toBe(true);}
  await page.screenshot({path:`docs/quality/evidence/fullscreen-controls-${vp.width}.png`});
 }
});
