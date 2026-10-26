import {test,expect} from '@playwright/test';
import {menuAction} from './menu-helper.js';
for(const vp of [{width:844,height:390},{width:740,height:360},{width:390,height:844}])test(`UI-01/02 compact primary controls and expanded menu ${vp.width}`,async({page})=>{
 await page.setViewportSize(vp);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/battlefield.html?test');
 await expect(page.locator('#pause')).not.toBeVisible();await expect(page.locator('#blueRifle')).toHaveAccessibleName(/Deploy rifle.*25/);await expect(page.locator('#blueRocket')).toHaveAccessibleName(/Deploy rocket.*60/);
 const ids=['pilotStick','heliTurn','heliFire','blueRifle','blueRocket','battleHUD','menuToggle'];const boxes=[];
 for(const id of ids){const b=await page.locator('#'+id).boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.y).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(vp.width);expect(b.y+b.height).toBeLessThanOrEqual(vp.height);boxes.push(b);if(['blueRifle','blueRocket'].includes(id)){expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);}}
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);}
 expect(boxes[5].height).toBeLessThanOrEqual(28);
 await page.screenshot({path:`docs/quality/evidence/compact-closed-${vp.width}.png`});
 await page.locator('#menuToggle').click();await expect(page.locator('#blueStrategy')).toContainText('Supply');await expect(page.locator('#redStrategy')).toContainText('Supply');const panel=await page.locator('#menuPanel').boundingBox();expect(panel.x).toBeGreaterThanOrEqual(0);expect(panel.y+panel.height).toBeLessThanOrEqual(vp.height);await page.screenshot({path:`docs/quality/evidence/compact-menu-${vp.width}.png`});
 await page.keyboard.press('Escape');await expect(page.locator('#pause')).not.toBeVisible();await page.locator('#menuToggle').click();await page.locator('#field').click({position:{x:20,y:vp.height/2}});await expect(page.locator('#pause')).not.toBeVisible();
 // Isolate manual purchasing from the automatic commander cooldown.
 await page.evaluate(()=>{battlefieldTest.blueAI(false);battlefieldTest.redAI(false);});
 await page.locator('#blueRifle').click();let s=await page.evaluate(()=>battlefieldTest.snapshot());expect(s.blueCommander.supply.balance).toBe(95);expect(s.units.filter(u=>u.team===0)).toHaveLength(6);
 await expect(page.locator('#blueRocket')).toBeDisabled();await menuAction(page,'#reset');await page.locator('#blueRocket').click();s=await page.evaluate(()=>battlefieldTest.snapshot());expect(s.blueCommander.supply.spent).toBe(60);expect(s.units.filter(u=>u.team===0&&u.type==='rocket')).toHaveLength(3);
 await menuAction(page,'#pause');const before=await page.evaluate(()=>battlefieldTest.snapshot());await page.evaluate(()=>battlefieldTest.step(60));expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(before);await expect(page.locator('#gameMenu')).not.toHaveAttribute('open','');await menuAction(page,'#reset');expect((await page.evaluate(()=>battlefieldTest.snapshot())).helicopter.hp).toBe(100);expect(errors).toEqual([]);
});
test('UI-01 menu releases held fire and keyboard input; camera uses reclaimed landscape area',async({page})=>{
 await page.setViewportSize({width:844,height:390});await page.goto('/battlefield.html?test');await page.keyboard.down('Space');await page.keyboard.down('KeyD');await page.evaluate(()=>battlefieldTest.step(1));expect((await page.evaluate(()=>battlefieldTest.snapshot())).pilotInput.fire).toBe(true);
 await page.locator('#menuToggle').click();await expect.poll(async()=> (await page.evaluate(()=>battlefieldTest.snapshot())).pilotInput.fire).toBe(false);expect((await page.evaluate(()=>battlefieldTest.snapshot())).pilotInput.x).toBe(0);await page.keyboard.up('Space');await page.keyboard.up('KeyD');await page.keyboard.press('Escape');
 const view=await page.evaluate(async()=>{const {pilotView,groundScreenY}=await import('/js/battlefield/ui/battlefieldCamera.js?v=1.0.1');return {view:pilotView({x:1800,y:140,facing:1,grounded:false},844,390),ground:groundScreenY(390)};});expect(view.ground).toBe(338);expect(view.view.scale).toBeGreaterThan(.65);
 await page.evaluate(()=>{battlefieldTest.patchHelicopter({x:1800,y:140,grounded:false});battlefieldTest.step(1);});await page.screenshot({path:'docs/quality/evidence/compact-airborne-844.png'});
});
