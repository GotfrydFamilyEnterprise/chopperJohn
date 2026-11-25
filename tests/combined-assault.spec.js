import {test,expect} from '@playwright/test';
for(const layout of['one','two','support'])test(`#44 PL-10 real browser: ${layout}, both factions, paid whole-force outcome`,async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width:844,height:390});await page.goto('/campaign/first-assault.json');
 const results=await page.evaluate(async layout=>{
  const {createCombinedAssault,stepCombinedAssault,combinedAssaultResult}=await import('/js/battlefield/platoons/combinedAssaultStudy.js');
  const {drawCampaign}=await import('/js/battlefield/campaign/renderer.js');
  const level=await(await fetch('/campaign/first-assault.json')).json(),results=[];
  document.body.innerHTML='<canvas width="844" height="390"></canvas>';document.body.style.cssText='margin:0;overflow:hidden';
  for(const mirrored of[false,true]){
   const s=createCombinedAssault(level,{layout,seed:7001,mirrored});stepCombinedAssault(s,120*90);
   if(!mirrored)drawCampaign(document.querySelector('canvas').getContext('2d'),844,390,s.world,{scale:.52,camera:650,offsetY:80});
   while(!s.finished)stepCombinedAssault(s,120);
   const r=combinedAssaultResult(s);results.push({outcome:r.outcome,time:r.seconds,spent:r.spent,ledger:r.ledgerValid,purchases:r.initialPurchases.length,owner:s.world.bases[0].team,team:s.team});
  }return results;
 },layout);
 for(const r of results){expect(r.ledger).toBe(true);expect(r.purchases).toBe(8);expect(r.spent).toEqual([340,110]);expect(['capture','defense','mutual','unfinished']).toContain(r.outcome);if(r.outcome==='capture')expect(r.owner).toBe(r.team);else expect(r.time===240||r.outcome!=='unfinished').toBe(true);}
 await page.screenshot({path:`docs/quality/evidence/combined-assault-${layout}-landscape.png`});
});
