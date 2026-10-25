import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const evidence='docs/quality/evidence';
async function resize(page,size){await page.setViewportSize(size);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function empty(page,seed=123){await page.goto('/battlefield.html?test');await page.evaluate(seed=>{battlefieldTest.reset(seed);battlefieldTest.clear();},seed);}
for(const team of [0,1])test(`RC-01/02/03/05/06 mirrored rocket flight faction ${team}`,async({page})=>{
 await empty(page);
 const setup=await page.evaluate(team=>{
  const x=team?2100:1500,dir=team?-1:1;
  const shooter=battlefieldTest.spawn(team,'rocket',x),target=battlefieldTest.spawn(1-team,'rocket',x+dir*300);
  battlefieldTest.patchUnit(target,{rocketCooldown:999,velocity:0,hp:100});battlefieldTest.combat(true);
  battlefieldTest.step(41);const before=battlefieldTest.snapshot();battlefieldTest.step(1);
  return {shooter,target,before,launch:battlefieldTest.snapshot()};
 },team);
 expect(setup.before.rockets).toHaveLength(0);expect(setup.launch.rockets).toHaveLength(1);
 const projectile=setup.launch.rockets[0];expect(projectile.vy).toBeLessThan(0);
 const direction=team?-1:1;
 expect(projectile.originX).toBeCloseTo((team?2100:1500)+direction*34*Math.cos(50*Math.PI/180));
 await page.evaluate(x=>{battlefieldTest.camera(x);battlefieldTest.step(24);},projectile.originX+direction*70);
 await page.screenshot({path:`${evidence}/rocket-team-${team}-ascent.png`});
 const airborne=await page.evaluate(()=>battlefieldTest.snapshot());expect(airborne.rockets[0].y).toBeLessThan(projectile.originY);
 await resize(page,{width:844,height:390});await page.evaluate(x=>battlefieldTest.camera(x),1800);
 await page.screenshot({path:`${evidence}/rocket-team-${team}-landscape.png`});
 const impact=await page.evaluate(()=>{
  while(battlefieldTest.snapshot().rockets.length)battlefieldTest.step();
  return battlefieldTest.snapshot();
 });
 const blast=impact.combatEvents.find(e=>e.type==='explosion');expect(blast.x).toBeCloseTo(projectile.impactX);
 expect(impact.units.find(u=>u.id===setup.target).hp).toBeLessThan(100);
 await page.evaluate(x=>battlefieldTest.camera(x),blast.x);
 await page.screenshot({path:`${evidence}/rocket-team-${team}-impact.png`});
 await resize(page,{width:390,height:844});await page.evaluate(x=>battlefieldTest.camera(x),blast.x);
 await page.screenshot({path:`${evidence}/rocket-team-${team}-impact-portrait.png`});
 await page.evaluate(()=>battlefieldTest.step(12));
 await page.screenshot({path:`${evidence}/rocket-team-${team}-dust.png`});
 writeFileSync(`${evidence}/rocket-team-${team}-trace.json`,JSON.stringify({before:setup.before,launch:setup.launch,airborne,impact},null,2));
});
for(const team of [0,1])test(`RC-01 browser range boundaries faction ${team}`,async({page})=>{
 await empty(page);
 const outcomes=await page.evaluate(team=>{
  return [224.99,225,250,600,600.01,-250].map(distance=>{
   battlefieldTest.reset(4);battlefieldTest.clear();const x=1800,dir=team?-1:1;
   const id=battlefieldTest.spawn(team,'rocket',x),target=battlefieldTest.spawn(1-team,'rocket',x+dir*distance);
   battlefieldTest.patchUnit(id,{velocity:0});battlefieldTest.patchUnit(target,{velocity:0,rocketCooldown:999});
   battlefieldTest.combat(true);battlefieldTest.step(43);
   return battlefieldTest.snapshot().combatEvents.some(e=>e.type==='launch'&&e.shooterId===id);
  });
 },team);
 expect(outcomes).toEqual([false,true,true,true,false,false]);
});
test('RC-03/06 rockets do not home; shooter death, pause and reset',async({page})=>{
 await empty(page);
 const result=await page.evaluate(()=>{
  const id=battlefieldTest.spawn(0,'rocket',1500),target=battlefieldTest.spawn(1,'rocket',1800);
  battlefieldTest.patchUnit(target,{velocity:0,rocketCooldown:999});battlefieldTest.combat(true);battlefieldTest.step(42);
  const rocket=battlefieldTest.snapshot().rockets[0];battlefieldTest.patchUnit(target,{x:2000});battlefieldTest.kill(id);
  battlefieldTest.step(1);return {rocket,state:battlefieldTest.snapshot()};
 });
 expect(result.state.rockets).toHaveLength(1);
 await page.locator('#pause').click();const paused=await page.evaluate(()=>battlefieldTest.snapshot());
 await page.evaluate(()=>battlefieldTest.step(60));expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(paused);
 await page.locator('#pause').click();
 const state=await page.evaluate(()=>{battlefieldTest.step(180);return battlefieldTest.snapshot();});
 expect(state.combatEvents.find(e=>e.type==='explosion').x).toBeCloseTo(result.rocket.impactX);
 expect(state.units[0].hp).toBe(4);
 await page.locator('#reset').click();const reset=await page.evaluate(()=>battlefieldTest.snapshot());
 expect(reset.rockets).toHaveLength(0);expect(reset.explosions).toHaveLength(0);expect(reset.combatEvents).toHaveLength(0);
 expect(reset.units.every(u=>!u.rocketAimTime&&!u.rocketCooldown)).toBeTruthy();
});
for(const team of [0,1])test(`BC-01/02/04/05 bunker shared hits and casualty faction ${team}`,async({page})=>{
 await empty(page,8);
 const result=await page.evaluate(team=>{
  const x=team?2480:1120,dir=team?-1:1;
  const ids=['rifle','rifle','rocket'].map(type=>battlefieldTest.spawn(team,type,x-dir*90));battlefieldTest.step(400);
  const before=battlefieldTest.snapshot();battlefieldTest.impactRocket(x,1-team);const after=battlefieldTest.snapshot();
  // A nonstationed bystander at the same location takes ordinary blast damage.
  const bystander=battlefieldTest.spawn(team,'rocket',x);battlefieldTest.impactRocket(x,1-team);const exposed=battlefieldTest.snapshot();
  battlefieldTest.kill(bystander);battlefieldTest.step();
  for(const id of ids)battlefieldTest.patchUnit(id,{hp:1/3});
  battlefieldTest.impactRocket(x,1-team);battlefieldTest.step(90);const casualty=battlefieldTest.snapshot();
  return {x,ids,bystander,before,after,exposed,casualty};
 },team);
 const hp=s=>s.units.filter(u=>result.ids.includes(u.id)).map(u=>u.hp);
 expect(hp(result.before).reduce((a,b)=>a+b)-hp(result.after).reduce((a,b)=>a+b)).toBeCloseTo(1/3);
 expect(hp(result.before).filter((v,i)=>v!==hp(result.after)[i])).toHaveLength(1);
 expect(result.after.combatEvents.at(-1).hits).toHaveLength(1);
 expect(result.exposed.units.find(u=>u.id===result.bystander).hp).toBe(2);
 const base=result.casualty.bases.find(b=>b.x===result.x);expect(base.state).toBe('UNDERSTAFFED');expect(base.flagProgress).toBe(0);
 expect(result.casualty.units.filter(u=>result.ids.includes(u.id))).toHaveLength(2);
 await page.evaluate(x=>battlefieldTest.camera(x),result.x);
 await page.screenshot({path:`${evidence}/rocket-cover-team-${team}-casualty.png`});
 writeFileSync(`${evidence}/rocket-cover-team-${team}-trace.json`,JSON.stringify(result,null,2));
});
test('BC-03 real rifle rounds mostly absorbed, occasional half damage',async({page})=>{
 await empty(page,17);
 const state=await page.evaluate(()=>{
  for(const type of ['rifle','rifle','rocket'])battlefieldTest.spawn(0,type,1030);
  battlefieldTest.step(400);
  const shooter=battlefieldTest.spawn(1,'rifle',1300);battlefieldTest.patchUnit(shooter,{velocity:0,hp:10000});
  battlefieldTest.combat(true);battlefieldTest.step(650);return battlefieldTest.snapshot();
 });
 const hits=state.combatEvents.filter(e=>e.type==='bulletHit'&&e.covered);
 expect(hits.length).toBeGreaterThan(15);expect(hits.some(e=>e.amount===0)).toBeTruthy();expect(hits.some(e=>e.amount===.5)).toBeTruthy();
 expect(hits.every(e=>e.amount===0||e.amount===.5)).toBeTruthy();
 writeFileSync(`${evidence}/rocket-rifle-cover-trace.json`,JSON.stringify(state,null,2));
});
test('RC-07 identical browser combat after reset, seeded variation',async({page})=>{
 await empty(page);
 const run=await page.evaluate(()=>{
  const simulate=seed=>{
   battlefieldTest.reset(seed);battlefieldTest.clear();
   const a=battlefieldTest.spawn(0,'rocket',1500),b=battlefieldTest.spawn(1,'rocket',1850);
   battlefieldTest.patchUnit(a,{hp:1000});battlefieldTest.patchUnit(b,{hp:1000});
   battlefieldTest.combat(true);battlefieldTest.step(1200);return battlefieldTest.snapshot();
  };
  return [simulate(123),simulate(123),simulate(124)];
 });
 expect(run[0]).toEqual(run[1]);expect(run[0].combatEvents).not.toEqual(run[2].combatEvents);
 expect(run[0].combatEvents.filter(e=>e.type==='launch').length).toBeGreaterThan(4);
});
test('RC-08 mobile navigation, pan, spawn and reset retain separate scenes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await empty(page);
 await page.locator('#blueRocket').click();await page.locator('#redRifle').click();
 expect((await page.evaluate(()=>battlefieldTest.snapshot())).units).toHaveLength(2);
 await page.locator('#jumpRed').click();await page.locator('#reset').click();
 expect((await page.evaluate(()=>battlefieldTest.snapshot())).units).toHaveLength(10);
 await page.getByRole('link',{name:'Flight School'}).click();await expect(page).toHaveURL(/index.html$/);
 expect(errors).toEqual([]);
});
