import {test,expect} from '@playwright/test';
// Independent adversarial checks: FS-01..03.
const open=async page=>{await page.goto('/battlefield.html?test');await page.waitForFunction(()=>!!window.battlefieldTest);};
test('FS-02 unsupported explanation and dismissal preserve paused game and camera',async({page})=>{
 await page.addInitScript(()=>{Element.prototype.requestFullscreen=undefined;Element.prototype.webkitRequestFullscreen=undefined;});
 await open(page);await page.locator('#jumpRed').click();await page.locator('#pause').click();
 const before=await page.evaluate(()=>battlefieldTest.snapshot());
 await page.locator('#fullscreen').click();await expect(page.locator('#fullscreenHelp')).toBeVisible();await expect(page.locator('#fullscreenMessage')).toContainText('Add to Home Screen');await expect(page.locator('#fullscreen')).toHaveAttribute('aria-pressed','false');
 await page.getByRole('button',{name:'Got it'}).click();await expect(page.locator('#fullscreenHelp')).not.toBeVisible();
 expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(before);await expect(page.locator('#pause')).toHaveText('Resume');
});
test('FS-02 rejected request remains inactive and handles Escape',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('denied'));});await open(page);await page.locator('#fullscreen').click();await expect(page.locator('#fullscreenMessage')).toContainText('blocked');await page.keyboard.press('Escape');await expect(page.locator('#fullscreenHelp')).not.toBeVisible();await expect(page.locator('#fullscreen')).toHaveAttribute('aria-pressed','false');expect(errors).toEqual([]);
});
test('FS-02 standalone does not request fullscreen',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'standalone',{value:true});Element.prototype.requestFullscreen=()=>{throw new Error('must not call');};});await open(page);await expect(page.locator('#fullscreen')).toHaveAttribute('aria-pressed','true');await page.locator('#fullscreen').click();await expect(page.locator('#fullscreenMessage')).toContainText('already playing');
});
test('FS-01 vendor change and browser exit synchronize',async({page})=>{
 await page.addInitScript(()=>{Element.prototype.requestFullscreen=undefined;Object.defineProperty(document,'webkitFullscreenElement',{value:null,writable:true,configurable:true});Element.prototype.webkitRequestFullscreen=function(){document.webkitFullscreenElement=this;document.dispatchEvent(new Event('webkitfullscreenchange'));};document.webkitExitFullscreen=()=>{document.webkitFullscreenElement=null;document.dispatchEvent(new Event('webkitfullscreenchange'));};});await open(page);await page.locator('#fullscreen').click();await expect(page.locator('#fullscreen')).toHaveText('Exit fullscreen');await page.locator('#fullscreen').click();await expect(page.locator('#fullscreen')).toHaveText('Fullscreen');await expect(page.locator('#fullscreen')).toHaveAttribute('aria-pressed','false');
});
test('FS-01 actual root fullscreen preserves state and browser exit updates button',async({page})=>{
 await open(page);await page.locator('#jumpRed').click();await page.locator('#pause').click();const before=await page.evaluate(()=>battlefieldTest.snapshot());await page.locator('#fullscreen').click();await expect.poll(()=>page.evaluate(()=>document.fullscreenElement===document.documentElement)).toBe(true);await expect(page.locator('#fullscreen')).toHaveText('Exit fullscreen');expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(before);await page.evaluate(()=>document.exitFullscreen());await expect(page.locator('#fullscreen')).toHaveText('Fullscreen');
});
