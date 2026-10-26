import {test,expect} from '@playwright/test';
test('EC-06/08 manual commands reject population cap, cooldown and paused forced events',async({page})=>{
 await page.goto('/battlefield.html?test');
 await page.locator('#blueRocket').click();
 const charged=await page.evaluate(()=>battlefieldTest.snapshot());
 await page.evaluate(()=>document.getElementById('blueRifle').dispatchEvent(new MouseEvent('click')));
 expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(charged);
 await page.locator('#pause').click();
 const paused=await page.evaluate(()=>battlefieldTest.snapshot());
 await page.evaluate(()=>document.getElementById('blueRocket').dispatchEvent(new MouseEvent('click')));
 expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(paused);
 await page.locator('#reset').click();
 await page.evaluate(()=>{battlefieldTest.clear();for(let i=0;i<15;i++)battlefieldTest.spawn(0,'rifle',200);battlefieldTest.step(0);});
 await expect(page.locator('#blueRifle')).toBeDisabled();
 const full=await page.evaluate(()=>battlefieldTest.snapshot());
 await page.evaluate(()=>document.getElementById('blueRifle').dispatchEvent(new MouseEvent('click')));
 expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(full);
});
