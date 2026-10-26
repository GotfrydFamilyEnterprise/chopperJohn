import {menuAction} from './menu-helper.js';
import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
test('EC-01..04 equal free opening grant, later income reconciles, no duplicate incoming garrison',async({page})=>{
 await page.goto('/battlefield.html?test');
 const states=await page.evaluate(()=>{
  battlefieldTest.combat(false);const start=battlefieldTest.snapshot();battlefieldTest.step(720);const incoming=battlefieldTest.snapshot();
  battlefieldTest.step(1320);const stationed=battlefieldTest.snapshot();
  return {start,incoming,stationed};
 });
 expect(states.start.units.filter(u=>u.team===1)).toHaveLength(5);expect(states.start.redCommander.supply.balance).toBe(120);
 expect(states.start.redCommander.supply.ledger).toHaveLength(0);
 expect(states.incoming.units.filter(u=>u.team===1)).toHaveLength(5+states.incoming.redCommander.supply.purchases);
 expect(states.incoming.redCommander.events.filter(e=>e.type==='purchase'&&e.role==='garrison')).toHaveLength(0);
 const s=states.stationed,account=s.redCommander.supply;
 expect(account.balance).toBeCloseTo(120+account.earned-account.spent,7);expect(account.balance).toBeGreaterThanOrEqual(60);
 expect(s.bases.find(b=>b.x===2480).state).toBe('OCCUPIED');
 for(let i=1;i<account.ledger.length;i++)expect(account.ledger[i].time-account.ledger[i-1].time).toBeGreaterThanOrEqual(2-1e-8);
 await menuAction(page,'#jumpRed');await page.screenshot({path:'docs/quality/evidence/shared-economy-garrison.png'});
 writeFileSync('docs/quality/evidence/shared-economy-opening.json',JSON.stringify(states,null,2));
});
test('SQ-01/02 actual squads assemble, advance together and keep physical motion bounded',async({page})=>{
 await page.goto('/battlefield.html?test');
 const result=await page.evaluate(()=>{
  battlefieldTest.combat(false);const checkpoints=[];let released=null,maxStep=0;const previous=new Map();
  for(let i=0;i<3100;i++){
   battlefieldTest.step();const s=battlefieldTest.snapshot();
   for(const u of s.units){if(previous.has(u.id))maxStep=Math.max(maxStep,Math.abs(u.x-previous.get(u.id)));previous.set(u.id,u.x);}
   const group=s.redCommander.squads.find(g=>g.role!=='defense'&&g.phase==='advance');
   if(i%600===0)checkpoints.push(s);
   if(group){released=s;break;}
  }
  return {released,maxStep,checkpoints};
 });
 expect(result.released).not.toBeNull();expect(result.maxStep).toBeLessThanOrEqual(47/60+1e-8);
 const group=result.released.redCommander.squads.find(g=>g.phase==='advance');expect(group.members).toHaveLength(5);
 const members=result.released.units.filter(u=>group.members.includes(u.id));expect(members.every(u=>u.x<=3380)).toBe(true);
 await page.evaluate(x=>battlefieldTest.camera(x),3330);await page.screenshot({path:'docs/quality/evidence/shared-economy-wave.png'});
 writeFileSync('docs/quality/evidence/shared-economy-wave.json',JSON.stringify(result,null,2));
});
test('AI-01 replacement counts in transit; EC-05 UI and pause/reset stay coherent',async({page})=>{
 await page.goto('/battlefield.html?test');
 const result=await page.evaluate(()=>{
  battlefieldTest.combat(false);battlefieldTest.step(2040);let s=battlefieldTest.snapshot();
  const base=s.bases.find(b=>b.x===2480),dead=base.slots.rifle[0];battlefieldTest.kill(dead);battlefieldTest.step(180);
  s=battlefieldTest.snapshot();return {dead,state:s};
 });
 expect(result.state.bases.find(b=>b.x===2480).state).toBe('UNDERSTAFFED');
 const replacements=result.state.units.filter(u=>u.team===1&&u.type==='rifle'&&u.order?.role==='garrison'&&u.guardBase===null&&u.x>=2400);
 expect(replacements).toHaveLength(1);
 await expect(page.locator('#redEconomy')).toHaveAttribute('aria-label',/Supply/);
 await menuAction(page,'#pause');const before=await page.evaluate(()=>battlefieldTest.snapshot());
 await page.evaluate(()=>battlefieldTest.step(600));expect(await page.evaluate(()=>battlefieldTest.snapshot())).toEqual(before);
 await menuAction(page,'#reset');const reset=await page.evaluate(()=>battlefieldTest.snapshot());
 expect(reset.redCommander.supply.balance).toBe(120);expect(reset.redCommander.supply.ledger).toHaveLength(0);expect(reset.redCommander.squads).toHaveLength(0);
 expect(reset.units.filter(u=>u.team===1)).toHaveLength(5);
});
test('AI-02 HQ danger buys defense using reserve; red cap remains15 in prolonged play',async({page})=>{
 await page.goto('/battlefield.html?test');
 const result=await page.evaluate(()=>{
  const enemy=battlefieldTest.spawn(0,'rifle',2900);battlefieldTest.patchUnit(enemy,{velocity:0,hp:1000});battlefieldTest.combat(false);
  battlefieldTest.step(1);const danger=battlefieldTest.snapshot();let largest=0;
  for(let i=0;i<100;i++){battlefieldTest.step(120);largest=Math.max(largest,battlefieldTest.snapshot().units.filter(u=>u.team===1).length);}
  return {danger,largest,state:battlefieldTest.snapshot()};
 });
 expect(result.danger.redCommander.strategy.mode).toBe('DEFEND');expect(result.danger.redCommander.supply.ledger[0].type).toBe('rifle');expect(result.largest).toBeLessThanOrEqual(15);
 expect(result.state.redCommander.supply.balance).toBeGreaterThanOrEqual(0);
});
