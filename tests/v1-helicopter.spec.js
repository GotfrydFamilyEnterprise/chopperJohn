import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const snapshot=p=>p.evaluate(()=>battlefieldTest.snapshot());
async function isolate(page){await page.goto('/battlefield.html?test');await page.evaluate(()=>{battlefieldTest.reset(191);battlefieldTest.clear();battlefieldTest.aircraft(true);});}
test('H-START/INPUT/PAD actual opening on helipad, takeoff, pause, reset, economy intact',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/battlefield.html?test');let s=await snapshot(page);
 expect(s.helicopter.x).toBe(400);expect(s.helicopter.y).toBe(437);expect(s.helicopter.hp).toBe(100);expect(s.units).toHaveLength(10);expect(s.blueCommander.supply.balance).toBe(120);
 await page.screenshot({path:'docs/quality/evidence/v1-start-portrait.png'});
 const stick=await page.locator('#pilotStick').boundingBox();await page.mouse.move(stick.x+stick.width/2,stick.y+stick.height/2);await page.mouse.down();await page.mouse.move(stick.x+stick.width/2,stick.y+8);
 await page.evaluate(()=>battlefieldTest.step(120));s=await snapshot(page);expect(s.helicopter.y).toBeLessThan(350);await page.mouse.up();
 await page.locator('#pause').click();const before=await snapshot(page);await page.evaluate(()=>battlefieldTest.step(600));expect(await snapshot(page)).toEqual(before);
 await page.locator('#reset').click();s=await snapshot(page);expect(s.helicopter.y).toBe(437);expect(s.helicopter.hp).toBe(100);expect(s.units).toHaveLength(10);expect(s.blueCommander.supply.balance).toBe(120);expect(errors).toEqual([]);
});
test('H-REPAIR/RESPAWN isolated physics and lifecycle with exact timing',async({page})=>{
 await isolate(page);await page.evaluate(()=>{battlefieldTest.combat(false);battlefieldTest.patchHelicopter({hp:50});battlefieldTest.step(600);});expect((await snapshot(page)).helicopter.hp).toBeCloseTo(100,7);
 await page.evaluate(()=>{battlefieldTest.patchHelicopter({hp:50,x:500});battlefieldTest.step(60);});expect((await snapshot(page)).helicopter.hp).toBe(50);
 await page.evaluate(()=>{battlefieldTest.damageHelicopter(100);battlefieldTest.step(599);});let s=await snapshot(page);expect(s.helicopter.hp).toBe(0);await page.evaluate(()=>battlefieldTest.step());s=await snapshot(page);expect(s.helicopter.hp).toBe(100);expect(s.helicopter.id).toBe('helicopter:2');expect(s.helicopter.x).toBe(400);expect(s.units).toHaveLength(0);
});
test('HG-TEAM/SWEEP isolated gun uses actual 2D hits, no friendly fire or altitude-only hits',async({page})=>{
 await isolate(page);const result=await page.evaluate(()=>{battlefieldTest.combat(true);battlefieldTest.systems({flight:false,troops:false,weapons:false});const friendly=battlefieldTest.spawn(0,'rifle',1500),enemy=battlefieldTest.spawn(1,'rocket',1550),far=battlefieldTest.spawn(1,'rifle',1600);battlefieldTest.injectProjectile({kind:'helicopterBullet',team:0,x:1400,y:430,vx:3000,vy:0,ttl:1,age:0});battlefieldTest.step(6);return {friendly,enemy,far,s:battlefieldTest.snapshot()};});
 expect(result.s.units.find(u=>u.id===result.friendly).hp).toBe(3);expect(result.s.units.find(u=>u.id===result.enemy).hp).toBe(3);expect(result.s.units.find(u=>u.id===result.far).hp).toBe(3);expect(result.s.combatEvents.filter(e=>e.type==='helicopterHit')).toHaveLength(1);
});
test('AA-PRIORITY mixed firefight ground aim preempted by helicopter, rifles continue ground fire',async({page})=>{
 await isolate(page);const result=await page.evaluate(()=>{
  battlefieldTest.aircraft(false);battlefieldTest.combat(true);battlefieldTest.systems({troops:false,flight:false,damage:false});
  const rocket=battlefieldTest.spawn(1,'rocket',2200),redRifle=battlefieldTest.spawn(1,'rifle',2080),blue=battlefieldTest.spawn(0,'rifle',1850);
  battlefieldTest.step(24);const before=battlefieldTest.snapshot();
  battlefieldTest.patchHelicopter({x:1800,y:220,grounded:false});battlefieldTest.aircraft(true);battlefieldTest.step();const switched=battlefieldTest.snapshot();battlefieldTest.step(41);const launched=battlefieldTest.snapshot();
  battlefieldTest.patchHelicopter({x:800});battlefieldTest.step();return {rocket,redRifle,blue,before,switched,launched,fallback:battlefieldTest.snapshot()};
 });
 const u=s=>s.units.find(u=>u.id===result.rocket);expect(u(result.before).rocketTargetKind).toBe('ground');expect(u(result.before).rocketAimTime).toBeGreaterThan(.3);
 expect(u(result.switched).rocketTargetKind).toBe('air');expect(u(result.switched).rocketAimTime).toBeCloseTo(1/60);expect(u(result.launched).rocketCooldown).toBeCloseTo(3);expect(result.launched.rockets.some(r=>r.kind==='airRocket')).toBe(true);
 expect(result.launched.combatEvents.some(e=>e.type==='bulletHit'&&e.team===1)).toBe(true);expect(u(result.fallback).rocketTargetKind).toBe('ground');expect(u(result.fallback).rocketCooldown).toBeGreaterThan(2.9);
 await page.evaluate(()=>battlefieldTest.view(2050,.6));await page.screenshot({path:'docs/quality/evidence/v1-priority-mixed-firefight.png'});writeFileSync('docs/quality/evidence/v1-priority-trace.json',JSON.stringify(result,null,2));
});
for(const [n,air] of [[2,1],[3,2],[6,4]])test(`AA-GROUP mixed threats split${n} launchers into${air} air and${n-air} ground`,async({page})=>{
 await isolate(page);const s=await page.evaluate(n=>{battlefieldTest.combat(true);battlefieldTest.systems({flight:false,troops:false,damage:false});battlefieldTest.patchHelicopter({x:1800,y:220,grounded:false});for(let i=0;i<n;i++)battlefieldTest.spawn(1,'rocket',2200+i*8);battlefieldTest.spawn(0,'rifle',1850);battlefieldTest.step(42);return battlefieldTest.snapshot();},n);
 expect(s.units.filter(u=>u.type==='rocket'&&u.rocketAssignment==='air')).toHaveLength(air);expect(s.units.filter(u=>u.type==='rocket'&&u.rocketAssignment==='ground')).toHaveLength(n-air);
 expect(s.rockets.filter(r=>r.kind==='airRocket')).toHaveLength(air);expect(s.rockets.filter(r=>r.kind!=='airRocket')).toHaveLength(n-air);
});
test('AA-COLLISION/FUSE isolated direct, nearby and maximum-range burst resolve once',async({page})=>{
 await isolate(page);const results=await page.evaluate(()=>{const run=y=>{battlefieldTest.clear();battlefieldTest.aircraft(true);battlefieldTest.patchHelicopter({x:1600,y,hp:100,grounded:false});battlefieldTest.systems({flight:false,weapons:false,damage:true,repairs:false});battlefieldTest.injectProjectile({kind:'airRocket',team:1,originX:1500,originY:200,vx:200,vy:-100,age:0,flightTime:2,terminalCause:'range'});battlefieldTest.step(180);return battlefieldTest.snapshot();};return {direct:run(185),near:run(150),far:run(50)};});
 expect(results.direct.helicopter.hp).toBe(80);expect(results.near.helicopter.hp).toBe(95);expect(results.far.helicopter.hp).toBe(100);
 for(const s of Object.values(results))expect(s.combatEvents.filter(e=>e.type==='explosion')).toHaveLength(1);
});
test('QA-H01 isolation gates freeze projectiles or damage separately and replay deterministically',async({page})=>{
 await isolate(page);const result=await page.evaluate(()=>{battlefieldTest.combat(true);battlefieldTest.systems({flight:false,troops:false,weapons:false,projectiles:false,damage:false});battlefieldTest.patchHelicopter({x:1600,y:185,grounded:false});battlefieldTest.injectProjectile({kind:'airRocket',team:1,originX:1500,originY:200,vx:200,vy:-100,age:0,flightTime:2,terminalCause:'range'});const before=battlefieldTest.snapshot();battlefieldTest.step(60);const frozen=battlefieldTest.snapshot();battlefieldTest.systems({projectiles:true});battlefieldTest.step(180);return {before,frozen,after:battlefieldTest.snapshot()};});
 expect(result.frozen.rockets).toEqual(result.before.rockets);expect(result.after.helicopter.hp).toBe(100);expect(result.after.rockets).toHaveLength(0);
});
test('H-UI portrait/landscape controls visible and distinct; turn and held fire work',async({page})=>{
 for(const vp of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(vp);await page.goto('/battlefield.html?test');
 const ids=['pilotStick','heliFire','heliTurn','followHelicopter','fullscreen','pause','blueRifle','blueRocket'];const boxes=[];
 for(const id of ids){const b=await page.locator('#'+id).boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.y).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(vp.width);expect(b.y+b.height).toBeLessThanOrEqual(vp.height);boxes.push(b);}
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);}
 const fire=await page.locator('#heliFire').boundingBox();await page.mouse.move(fire.x+fire.width/2,fire.y+fire.height/2);await page.mouse.down();await page.evaluate(()=>battlefieldTest.step(60));await page.mouse.up();expect((await snapshot(page)).combatEvents.some(e=>e.type==='helicopterShot')).toBe(true);
 await page.screenshot({path:`docs/quality/evidence/v1-controls-${vp.width}.png`});}
});
