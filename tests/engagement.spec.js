import {test,expect} from '@playwright/test';
for(const team of [0,1])test(`RI-02 RO-02 entry retains combat posture faction ${team}`,async({page})=>{
 await page.goto('/battlefield.html?test');
 const result=await page.evaluate(team=>{
  const dir=team===0?1:-1,x=team===0?1100:2500;
  const states=[];
  for(const type of ['rifle','rocket']){
   battlefieldTest.reset();battlefieldTest.clear();battlefieldTest.combat(true);
   battlefieldTest.spawn(team,type,x);battlefieldTest.spawn(1-team,'rocket',x+dir*200);
   battlefieldTest.step();states.push(battlefieldTest.snapshot().units[0]);
  }
  return {states,x};
 },team);
 expect(result.states[0].state).toBe('fireWalk');expect(Math.abs(result.states[0].x-result.x)).toBeCloseTo(47*.42/60);
 expect(result.states[1].state).toBe('fireStop');expect(result.states[1].x).toBe(result.x);
});
test('CB-01 muzzle segment damages enemy at close range',async({page})=>{
 await page.goto('/battlefield.html?test');
 const hp=await page.evaluate(()=>{battlefieldTest.reset();battlefieldTest.clear();battlefieldTest.combat(true);battlefieldTest.spawn(0,'rifle',1500);battlefieldTest.spawn(1,'rocket',1520);battlefieldTest.step();return battlefieldTest.snapshot().units.find(u=>u.type==='rocket').hp;});
 expect(hp).toBe(3);
});
