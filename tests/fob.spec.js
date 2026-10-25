import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
for(const team of [0,1])test(`FOB-01..10 faction ${team}`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/battlefield.html?test');
 const run=fn=>page.evaluate(fn);
 await run(()=>{battlefieldTest.reset();battlefieldTest.clear();});
 const x=team===0?1120:2480,dir=team===0?1:-1;
 await page.evaluate(x=>battlefieldTest.camera(x),x);
 await page.screenshot({path:`docs/quality/evidence/team-${team}-empty.png`});
 let state=await run(()=>battlefieldTest.snapshot());expect(state.bases.filter(b=>!b.main).every(b=>b.state==='UNCLAIMED'&&b.flagProgress===0)).toBeTruthy();
 const trace=[];
 for(const [i,type] of ['rifle','rocket','rifle'].entries()){
  const id=await page.evaluate(({team,type,x,dir})=>battlefieldTest.spawn(team,type,x-dir*130),{team,type,x,dir});
  let previous=(await run(()=>battlefieldTest.snapshot())).units.find(u=>u.id===id).x;
  for(let tick=0;tick<400;tick++){
   await run(()=>battlefieldTest.step());state=await run(()=>battlefieldTest.snapshot());const u=state.units.find(u=>u.id===id);
   expect(Math.abs(u.x-previous)).toBeLessThanOrEqual(47/60+.00001);previous=u.x;
   const b=state.bases.find(b=>!b.main&&b.team===team);
   if(!u.arrived)expect(b.slots[type]).not.toContain(id);
   if(i<2)expect(b.flagProgress).toBe(0);
   if(u.arrived)break;
  }
  const b=state.bases.find(b=>!b.main&&b.team===team);trace.push(b);
  expect(b.state).toBe(i===2?'OCCUPIED':'ASSEMBLING');
  await page.screenshot({path:`docs/quality/evidence/team-${team}-stage-${i+1}.png`});
 }
 await run(()=>battlefieldTest.step(90));
 await page.screenshot({path:`docs/quality/evidence/team-${team}-occupied.png`});
 const guards=(await run(()=>battlefieldTest.snapshot())).units;expect(new Set(guards.map(u=>u.x)).size).toBe(3);
 await run(()=>battlefieldTest.step(120));expect((await run(()=>battlefieldTest.snapshot())).units.map(u=>u.x)).toEqual(guards.map(u=>u.x));
 for(const type of ['rifle','rocket'])await page.evaluate(({team,type,x,dir})=>battlefieldTest.spawn(team,type,x-dir*130),{team,type,x,dir});
 await run(()=>battlefieldTest.step(600));state=await run(()=>battlefieldTest.snapshot());expect(state.units.slice(3).every(u=>(u.x-x)*dir>100&&u.guardBase===null)).toBeTruthy();
 await page.evaluate(id=>battlefieldTest.kill(id),guards[0].id);await run(()=>battlefieldTest.step(90));state=await run(()=>battlefieldTest.snapshot());expect(state.bases.find(b=>b.team===team&&!b.main).state).toBe('UNDERSTAFFED');
 await page.evaluate(({team,x,dir})=>battlefieldTest.spawn(team,'rifle',x-dir*130),{team,x,dir});await run(()=>battlefieldTest.step(400));state=await run(()=>battlefieldTest.snapshot());expect(state.bases.find(b=>b.team===team&&!b.main).state).toBe('OCCUPIED');
 expect(errors).toEqual([]);
 writeFileSync(`docs/quality/evidence/team-${team}-trace.json`,JSON.stringify(trace,null,2));
 await test.info().attach('lifecycle',{body:JSON.stringify(trace,null,2),contentType:'application/json'});
});
test('CB-01 visible shots damage opposing rocket infantry',async({page})=>{await page.goto('/battlefield.html?test');const s=await page.evaluate(()=>{battlefieldTest.clear();battlefieldTest.combat(true);battlefieldTest.spawn(0,'rifle',1500);battlefieldTest.spawn(1,'rocket',1700);battlefieldTest.step(1);const first=battlefieldTest.snapshot();battlefieldTest.step(120);return {first,last:battlefieldTest.snapshot()};});expect(s.first.bullets.length).toBeGreaterThan(0);expect(s.last.units.find(u=>u.type==='rocket')?.hp??0).toBeLessThan(4);});
