import {test,expect} from '@playwright/test';
test('QA-01 repeated HQ arrivals have identical fixed-step state traces',async({page})=>{
 await page.goto('/battlefield.html?test');
 const runs=await page.evaluate(()=>{
  const runs=[];
  for(let repeat=0;repeat<2;repeat++){
   battlefieldTest.reset();const trace=[];
   for(let i=0;i<24;i++){battlefieldTest.step(120);trace.push(battlefieldTest.snapshot());}
   runs.push(trace);
  }
  return runs;
 });
 expect(runs[0]).toEqual(runs[1]);
 for(const b of runs[0].at(-1).bases.filter(b=>!b.main))expect(b.state).toBe('OCCUPIED');
 await test.info().attach('repeatable-hq-trace',{body:JSON.stringify(runs[0],null,2),contentType:'application/json'});
});
