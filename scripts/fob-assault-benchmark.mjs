// Issue #25: paid assembly, actual engine, bounded diagnostic runs before any tuning.
import{readFileSync,writeFileSync}from'node:fs';
import{tmpdir}from'node:os';
import{join}from'node:path';
import{createAssaultStudy,stepAssaultStudy,assaultStudyResult}from'../docs/js/battlefield/platoons/assaultStudy.js';
const level=JSON.parse(readFileSync('docs/campaign/first-assault.json'));
const mixes=(process.env.FOB_MIXES||'3:2,3:4,4:5').split(',').map(m=>{const [rifle,rocket]=m.split(':').map(Number);return{rifle,rocket};});
const controllers=(process.env.FOB_CONTROLLERS||'independent,siege,siege-no-retreat').split(','),seeds=Number(process.env.FOB_SEEDS||1),seconds=Number(process.env.FOB_SECONDS||480),modes=(process.env.FOB_MODES||'fixed,supplied').split(','),mirrors=process.env.FOB_MIRRORS==='false'?[false]:[false,true];
if(!Number.isInteger(seeds)||seeds<1||seeds>20||modes.some(m=>!['fixed','supplied'].includes(m)))throw Error('Invalid benchmark settings');
const output=process.env.FOB_OUTPUT||join(tmpdir(),'chopperjohn-fob-assault-results.json'),rows=[],started=Date.now();
for(const composition of mixes)for(const controller of controllers)for(const mode of modes)for(let n=0;n<seeds;n++)for(const mirrored of mirrors){
 const s=createAssaultStudy(level,{composition,controller,seed:101+n,mirrored,resupply:mode==='supplied',seconds});while(!s.finished)stepAssaultStudy(s,120);rows.push(assaultStudyResult(s));
 writeFileSync(output,JSON.stringify({schemaVersion:1,scope:'Isolated flat FOB episode. Both accounts start120 and earn5/s,240bank,25/60 prices,2s deployment spacing,15cap. No initial free troops; all initial infantry purchased at HQ and walk physically. All attack policies share paid rally assembly; independent releases the same initial formation. Formation stats, protection, defense/rebuild/capture and damage are unchanged. Fixed disables subsequent recruitment; supplied buys normal same-type HQ replacements. Leader loss ends platoon recruitment; independent continues its roster. Time includes preparation. One seed and its paired mirror are a probe, not balance proof. No helicopter, follow-on wave or natural campaign-victory claim.',seeds,seconds,controllers,mixes,modes,rows},null,2)+'\n');
}
console.log(JSON.stringify({runs:rows.length,wallSeconds:(Date.now()-started)/1000,output,results:rows.map(r=>({mix:r.mix,controller:r.controller,resupply:r.resupply,mirrored:r.mirrored,outcome:r.outcome,seconds:r.seconds,launchAt:r.launchAt,breachAt:r.breachAt,spent:r.spent,alive:r.alive}))}));
