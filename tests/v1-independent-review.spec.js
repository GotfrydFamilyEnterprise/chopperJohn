import {menuAction} from './menu-helper.js';
import {test,expect} from '@playwright/test';
test('review H-RESPAWN pause freezes pending replacement without resetting battle',async({page})=>{
 await page.goto('/battlefield.html?test');await page.evaluate(()=>{battlefieldTest.damageHelicopter(100);battlefieldTest.step(120);});const before=await page.evaluate(()=>battlefieldTest.snapshot());await menuAction(page,'#pause');await page.evaluate(()=>battlefieldTest.step(1200));expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(before);await menuAction(page,'#pause');await page.evaluate(()=>battlefieldTest.step(480));const a=await page.evaluate(()=>battlefieldTest.snapshot());expect(a.helicopter.hp).toBe(100);expect(a.helicopter.id).toBe('helicopter:2');expect(a.time).toBeCloseTo(10);expect(a.units.length).toBeGreaterThan(0);
});
test('review AA-FUSE committed shot survives disabled aircraft and terminates exactly once',async({page})=>{
 await page.goto('/battlefield.html?test');const s=await page.evaluate(()=>{battlefieldTest.clear();battlefieldTest.combat(true);battlefieldTest.systems({flight:false,weapons:false,damage:false});battlefieldTest.injectProjectile({kind:'airRocket',team:1,originX:1500,originY:200,vx:200,vy:-100,age:0,flightTime:2,terminalCause:'range'});battlefieldTest.aircraft(false);battlefieldTest.step(180);return battlefieldTest.snapshot();});expect(s.rockets).toHaveLength(0);expect(s.combatEvents.filter(e=>e.type==='explosion')).toHaveLength(1);
});
