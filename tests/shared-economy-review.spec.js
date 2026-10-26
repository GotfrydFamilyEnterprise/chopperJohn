import {test,expect} from '@playwright/test';
const state=page=>page.evaluate(()=>battlefieldTest.snapshot());
test('review EC-06 exact free mirrored grant and independent paid button transaction',async({page})=>{
 await page.goto('/battlefield.html?test');
 let s=await state(page);
 for(const team of [0,1]){const troops=s.units.filter(u=>u.team===team);expect(troops.filter(u=>u.type==='rifle')).toHaveLength(3);expect(troops.filter(u=>u.type==='rocket')).toHaveLength(2);const c=team?s.redCommander:s.blueCommander;expect(c.supply.balance).toBe(120);expect(c.supply.ledger).toEqual([]);}
 expect(s.bases.filter(b=>!b.main).every(b=>Object.values(b.slots).flat().every(x=>x===null))).toBeTruthy();
 expect(s.units.filter(u=>u.team===0).map(u=>u.x)).toEqual(s.units.filter(u=>u.team===1).map(u=>3600-u.x));
 await page.locator('#blueRocket').click();s=await state(page);expect(s.blueCommander.supply.balance).toBe(60);expect(s.redCommander.supply.balance).toBe(120);expect(s.units.filter(u=>u.team===0)).toHaveLength(6);expect(s.blueCommander.supply.spent).toBe(60);await expect(page.locator('#blueRifle')).toBeDisabled();
 await page.locator('#pause').click();const before=await state(page);await page.evaluate(()=>battlefieldTest.step(600));expect(await state(page)).toEqual(before);
 await page.locator('#reset').click();s=await state(page);expect(s.units).toHaveLength(10);expect(s.blueCommander.supply.balance).toBe(120);expect(s.redCommander.supply.balance).toBe(120);expect(s.blueCommander.supply.ledger).toEqual([]);expect(s.redCommander.squads).toEqual([]);
});
test('review EC-07 mirrored no-combat decisions, accounting and physical speed through 120 seconds',async({page})=>{
 await page.goto('/battlefield.html?test');const result=await page.evaluate(()=>{battlefieldTest.combat(false);let prior=battlefieldTest.snapshot(),maxStep=0;for(let i=0;i<7200;i++){battlefieldTest.step();const s=battlefieldTest.snapshot();for(const u of s.units){const p=prior.units.find(p=>p.id===u.id);if(p)maxStep=Math.max(maxStep,Math.abs(u.x-p.x));}prior=s;}return {s:prior,maxStep};});
 const {s,maxStep}=result;expect(maxStep).toBeLessThanOrEqual(47/60+1e-7);
 const a=s.blueCommander,b=s.redCommander;expect(a.supply).toEqual({...b.supply,ledger:b.supply.ledger.map((e,i)=>({...e,unitId:a.supply.ledger[i].unitId}))});expect(a.supply.purchases).toBeGreaterThan(0);
 for(const c of [a,b]){expect(c.supply.balance).toBeCloseTo(120+c.supply.earned-c.supply.spent,7);expect(c.observations.living).toBeLessThanOrEqual(15);for(let i=1;i<c.supply.ledger.length;i++)expect(c.supply.ledger[i].time-c.supply.ledger[i-1].time).toBeGreaterThanOrEqual(2-1e-7);}
 expect(a.strategy.mode).toBe(b.strategy.mode);expect(s.bases.filter(b=>!b.main).every(b=>b.state==='OCCUPIED')).toBeTruthy();
});
test('review EC-08 seeded replay and autonomous bilateral rocket launch within minute',async({page})=>{
 await page.goto('/battlefield.html?test');const run=()=>page.evaluate(()=>{battlefieldTest.reset(93);battlefieldTest.combat(true);battlefieldTest.blueAI(true);battlefieldTest.redAI(true);battlefieldTest.step(3600);return battlefieldTest.snapshot();});const a=await run(),b=await run();expect(a).toEqual(b);for(const team of [0,1])expect(a.combatEvents.some(e=>e.type==='launch'&&e.team===team)).toBeTruthy();
});
test('review EC-08 both HUDs and controls visible portrait landscape',async({page})=>{for(const vp of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(vp);await page.goto('/battlefield.html?test');await page.evaluate(()=>battlefieldTest.step(1800));for(const id of ['blueEconomy','redEconomy','blueRifle','blueRocket']){const b=await page.locator('#'+id).boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.y).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(vp.width);expect(b.y+b.height).toBeLessThanOrEqual(vp.height);}await page.locator('#jumpBlue').click();await page.screenshot({path:`docs/quality/evidence/shared-economy-review-${vp.width}.png`});}});
