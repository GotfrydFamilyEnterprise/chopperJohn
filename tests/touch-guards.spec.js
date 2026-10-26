import {test,expect} from '@playwright/test';
test('UI-03 long press cannot select control text or open context menus; held fire and turn remain usable',async({page})=>{
 await page.setViewportSize({width:844,height:390});await page.goto('/battlefield.html?test');
 const guard=await page.evaluate(()=>['heliFire','heliTurn','blueRifle','blueRocket','menuToggle'].map(id=>{const el=document.getElementById(id),css=getComputedStyle(el);return {id,selection:css.userSelect,callout:CSS.supports('-webkit-touch-callout','none')?css.getPropertyValue('-webkit-touch-callout'):null,cancelled:['contextmenu','selectstart','dragstart'].every(type=>!el.dispatchEvent(new Event(type,{bubbles:true,cancelable:true})))};}));
 for(const result of guard){expect(result.selection).toBe('none');expect(result.cancelled).toBe(true);if(result.callout!==null)expect(result.callout).toBe('none');}
 const session=await page.context().newCDPSession(page);await session.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
 const fire=await page.locator('#heliFire').boundingBox(),stick=await page.locator('#pilotStick').boundingBox();
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:fire.x+fire.width/2,y:fire.y+fire.height/2,id:1},{x:stick.x+stick.width/2,y:stick.y+10,id:2}]});
 await page.waitForTimeout(1200);await page.evaluate(()=>battlefieldTest.step(60));let s=await page.evaluate(()=>battlefieldTest.snapshot());expect(s.combatEvents.filter(e=>e.type==='helicopterShot')).toHaveLength(8);expect(s.helicopter.y).toBeLessThan(437);expect(await page.evaluate(()=>getSelection().toString())).toBe('');
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});expect((await page.evaluate(()=>battlefieldTest.snapshot())).pilotInput.fire).toBe(false);
 await page.locator('#heliTurn').click();expect((await page.evaluate(()=>battlefieldTest.snapshot())).helicopter.facing).toBe(-1);
 await page.locator('#menuToggle').click();await expect(page.locator('#pause')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#pause')).not.toBeVisible();await session.detach();
});
