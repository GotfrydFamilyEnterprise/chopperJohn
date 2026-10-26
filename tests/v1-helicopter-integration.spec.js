import {test,expect} from '@playwright/test';import {writeFileSync} from 'node:fs';
const state=p=>p.evaluate(()=>battlefieldTest.snapshot());
test('HG-COVER real helicopter gun distinguishes contact absorption and penetrating casualty with vacancy',async({page})=>{
 await page.goto('/battlefield.html?test');const ids=await page.evaluate(()=>{battlefieldTest.reset();battlefieldTest.clear();const ids=['rifle','rifle','rocket'].map(type=>battlefieldTest.spawn(1,type,2570));battlefieldTest.step(500);battlefieldTest.aircraft(true);battlefieldTest.patchHelicopter({x:2350,y:350,angle:.42,grounded:false});battlefieldTest.systems({flight:false,troops:false});battlefieldTest.combat(true);battlefieldTest.airRandomValue(.5);battlefieldTest.pilot({fire:true});return ids;});
 await page.evaluate(()=>battlefieldTest.step(120));let s=await state(page);expect(s.combatEvents.some(e=>e.type==='helicopterHit'&&e.covered&&e.amount===0)).toBe(true);expect(s.units.filter(u=>ids.includes(u.id)).map(u=>u.hp).sort()).toEqual([3,3,4]);
 await page.evaluate(()=>battlefieldTest.view(2415,.7));await page.screenshot({path:'docs/quality/evidence/v1-bunker-absorbed.png'});
 await page.evaluate(()=>{battlefieldTest.airRandomValue(0);battlefieldTest.step(120);});s=await state(page);expect(s.combatEvents.some(e=>e.type==='helicopterHit'&&e.covered&&e.amount===1)).toBe(true);expect(s.units.filter(u=>ids.includes(u.id)).length).toBeLessThan(3);expect(s.bases.find(b=>b.x===2480).state).toBe('UNDERSTAFFED');
 await page.screenshot({path:'docs/quality/evidence/v1-bunker-casualty.png'});
});
test('H-INPUT simultaneous real touch joystick and fire, cancellation and blur release both',async({page,context})=>{
 await page.goto('/battlefield.html?test');const stick=await page.locator('#pilotStick').boundingBox(),fire=await page.locator('#heliFire').boundingBox();const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:0,x:stick.x+stick.width*.5,y:stick.y+10},{id:1,x:fire.x+fire.width*.5,y:fire.y+fire.height*.5}]});
 await page.evaluate(()=>battlefieldTest.step(60));let s=await state(page);expect(s.helicopter.y).toBeLessThan(400);expect(s.combatEvents.filter(e=>e.type==='helicopterShot')).toHaveLength(8);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const count=s.combatEvents.filter(e=>e.type==='helicopterShot').length;await page.evaluate(()=>battlefieldTest.step(30));s=await state(page);expect(s.pilotInput).toEqual({x:0,y:0,fire:false});expect(s.combatEvents.filter(e=>e.type==='helicopterShot')).toHaveLength(count);
 await page.keyboard.down('Space');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));expect((await state(page)).pilotInput.fire).toBe(false);await page.keyboard.up('Space');
});
test('AA-FUSE ordinary launch remains unguided after target death and explodes at actual600 reach',async({page})=>{
 await page.goto('/battlefield.html?test');const result=await page.evaluate(()=>{battlefieldTest.reset();battlefieldTest.clear();battlefieldTest.aircraft(true);battlefieldTest.combat(true);battlefieldTest.systems({flight:false,troops:false,damage:false});battlefieldTest.patchHelicopter({x:1800,y:220,grounded:false});battlefieldTest.spawn(1,'rocket',2200);battlefieldTest.airRandomValue(.5);battlefieldTest.step(42);const launch=battlefieldTest.snapshot().rockets[0];battlefieldTest.patchHelicopter({hp:0,respawnRemaining:10});battlefieldTest.step(150);return {launch,s:battlefieldTest.snapshot()};});
 expect(result.launch.kind).toBe('airRocket');const event=result.s.combatEvents.find(e=>e.type==='explosion'&&e.id===result.launch.id);expect(event.cause).toBe('range');expect(Math.hypot(event.x-result.launch.originX,event.y-result.launch.originY)).toBeCloseTo(600,5);expect(result.s.rockets).toHaveLength(0);
});
test('QA-H01 complete mixed flight/weapon/controller replay is deterministic',async({page})=>{
 await page.goto('/battlefield.html?test');const runs=await page.evaluate(()=>{const runs=[];for(let k=0;k<2;k++){battlefieldTest.reset(981);battlefieldTest.aircraft(true);battlefieldTest.redAI(true);battlefieldTest.blueAI(true);battlefieldTest.combat(true);battlefieldTest.patchHelicopter({x:2000,y:180,grounded:false,vx:80,observedVx:80});battlefieldTest.pilot({x:.3,y:-.15,fire:true});const trace=[];for(let i=0;i<12;i++){battlefieldTest.step(60);trace.push(battlefieldTest.snapshot());}runs.push(trace);}return runs;});expect(runs[0]).toEqual(runs[1]);
});
test('V1-NATURAL actual joystick flies from pad into ordinary paid battle and draws anti-air fire',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/battlefield.html?test');
 const box=await page.locator('#pilotStick').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 const result=await page.evaluate(({box})=>{const checkpoints=[];let firstAir=null,damage=null;
  for(let i=0;i<550;i++){
   const s=battlefieldTest.snapshot(),h=s.helicopter,targetX=2400,targetY=150;
   const ax=Math.max(-180,Math.min(180,(targetX-h.x)*.8-h.vx*1.5));
   const ay=Math.max(-220,Math.min(220,(targetY-h.y)*.8-h.vy*1.5));
   const collective=(1-ay/330)/Math.max(.5,Math.cos(h.rotorAngle));
   const x=Math.max(-1,Math.min(1,Math.asin(Math.max(-.9,Math.min(.9,ax/(395*Math.max(.2,collective)))))/.61));
   const y=Math.max(-1,Math.min(1,(1-collective)/.8));
   const stick=document.getElementById('pilotStick'),radius=box.width*.38;
   stick.dispatchEvent(new PointerEvent('pointermove',{pointerId:1,clientX:box.x+box.width/2+x*radius,clientY:box.y+box.height/2+y*radius}));
   battlefieldTest.step(6);const now=battlefieldTest.snapshot();
   if(i%50===0)checkpoints.push({time:now.time,helicopter:now.helicopter,red:now.redCommander.supply});
   if(!firstAir&&now.combatEvents.some(e=>e.type==='launch'&&e.targetKind==='air'))firstAir=now;
   if(firstAir&&now.helicopter.hp<100){damage=now;break;}
  }
  return {firstAir,damage,final:battlefieldTest.snapshot(),checkpoints};
 },{box});await page.mouse.up();
 expect(result.firstAir).not.toBeNull();expect(result.firstAir.helicopter.x).toBeGreaterThan(1000);expect(result.firstAir.redCommander.supply.purchases).toBeGreaterThan(0);expect(result.damage).not.toBeNull();expect(errors).toEqual([]);
 await page.screenshot({path:'docs/quality/evidence/v1-natural-pilot.png'});writeFileSync('docs/quality/evidence/v1-natural-flight.json',JSON.stringify(result,null,2));
});
