// PL-10 / issue40: real-engine Monte Carlo; no combat/economy fork or forced wins.
import{readFileSync,writeFileSync}from'node:fs';
import{tmpdir}from'node:os';
import{join,resolve}from'node:path';
import{fileURLToPath}from'node:url';
import{Worker,isMainThread,parentPort}from'node:worker_threads';
import{createAssaultStudy,stepAssaultStudy,assaultStudyResult}from'../docs/js/battlefield/platoons/assaultStudy.js';

const root=new URL('../',import.meta.url),level=JSON.parse(readFileSync(new URL('docs/campaign/first-assault.json',root)));
export const POLICIES=Object.freeze({independent:null,siege:null,
 reserve600:Object.freeze({standoff:600,rifles:[-180,-220],rockets:[80,160]}),
 reserve640:Object.freeze({standoff:640,rifles:[-180,-220],rockets:[80,160]}),
 reserve680:Object.freeze({standoff:680,rifles:[-180,-220],rockets:[80,160]}),
 rear80:Object.freeze({standoff:680,rifles:[-180,-220],rockets:[120,160],leaderRearGap:80}),
 rear140:Object.freeze({standoff:680,rifles:[-180,-220],rockets:[180,220],leaderRearGap:140})});
export const CASES=Object.freeze({ordinary:{composition:{rifle:3,rocket:2},resupply:false},prepared:{composition:{rifle:3,rocket:4},resupply:false},supplied:{composition:{rifle:3,rocket:4},resupply:true}});
export function wilson(wins,n){
 if(!Number.isInteger(n)||n<1||!Number.isInteger(wins)||wins<0||wins>n)throw Error('Invalid binomial sample');
 const z=1.95996398454,p=wins/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return[Math.max(0,c-h),Math.min(1,c+h)];
}
export function createTrial({caseId='prepared',policy='siege',seed=1,mirrored=false,seconds=240}={}){
 if(!Object.hasOwn(CASES,caseId)||!Object.hasOwn(POLICIES,policy))throw Error('Invalid trial');
 const s=createAssaultStudy(level,{...CASES[caseId],controller:policy==='independent'?'independent':'siege',seed,mirrored,seconds});
 s.mc={caseId,policy,applied:false};return s;
}
export function stepTrial(s,ticks=1){
 if(!Number.isInteger(ticks)||ticks<0||ticks>72000)throw Error('Invalid trial steps');
 for(let i=0;i<ticks&&!s.finished;i++){
  if(s.world.paused||s.world.result)break;stepAssaultStudy(s,1);
  if(!s.mc.applied&&s.study.launchAt!==null){const p=POLICIES[s.mc.policy];if(p)s.study.group.assaultPolicy=structuredClone(p);s.mc.applied=true;}
 }return s;
}
export function runTrial(job){const s=createTrial(job);while(!s.finished)stepTrial(s,120);const r=assaultStudyResult(s);
 return{...job,...r,caseId:job.caseId,policy:job.policy,leaderAlive:s.world.units.some(u=>u.id===s.study.group.leaderId&&u.hp>0),captureRiflesAlive:s.world.units.filter(u=>u.team===s.team&&u.type==='rifle'&&!u.isSergeant&&u.hp>0).length,initialRosterAtStop:s.study.initialAttackIds.map(id=>{const u=s.world.units.find(u=>u.id===id);return{type:u.type,hp:u.hp};}),ledgerValid:r.accounts.every(a=>Math.abs(a.balance-(120+a.earned-a.spent))<1e-6&&Math.abs(a.earned+a.overflow-a.time*5)<1e-6)};
}
const median=xs=>{const a=xs.filter(Number.isFinite).sort((a,b)=>a-b);return a.length?(a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2:null;};
export function summarize(rows){
 const groups=new Map();for(const r of rows){const key=[r.caseId,r.policy,r.mirrored].join('/');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
 return[...groups].sort(([a],[b])=>a.localeCompare(b)).map(([key,rs])=>{if(new Set(rs.map(r=>r.seed)).size!==rs.length)throw Error('Duplicate seed within group');const wins=rs.filter(r=>r.outcome==='capture').length;return{key,seeds:rs.length,captures:wins,rate:wins/rs.length,ci95:wilson(wins,rs.length),breached:rs.filter(r=>r.breachAt!==null).length,unfinished:rs.filter(r=>r.outcome==='unfinished').length,eliminated:rs.filter(r=>['defense','mutual'].includes(r.outcome)).length,leadersAlive:rs.every(r=>typeof r.leaderAlive==='boolean')?rs.filter(r=>r.leaderAlive).length:null,medianCaptureRifles:median(rs.map(r=>r.captureRiflesAlive)),medianCapture:median(rs.filter(r=>r.outcome==='capture').map(r=>r.seconds)),medianSpent:median(rs.map(r=>r.spent[0])),medianSurvivingValue:median(rs.map(r=>r.survivingValue[0])),ledgerValid:rs.every(r=>r.ledgerValid)};});
}
export function pairedDifference(rows,candidate,baseline='siege'){
 const result=[];for(const mirrored of[false,true])for(const caseId of [...new Set(rows.map(r=>r.caseId))].sort()){
  const a=rows.filter(r=>r.caseId===caseId&&r.policy===candidate&&r.mirrored===mirrored),b=new Map(rows.filter(r=>r.caseId===caseId&&r.policy===baseline&&r.mirrored===mirrored).map(r=>[r.seed,r]));
  if(!a.length)continue;if(a.length!==b.size||a.some(r=>!b.has(r.seed)))throw Error('Unmatched paired sample');
  const ds=a.map(r=>Number(r.outcome==='capture')-Number(b.get(r.seed).outcome==='capture')),mean=ds.reduce((n,v)=>n+v,0)/ds.length;
  result.push({caseId,mirrored,candidate,baseline,seeds:ds.length,change:mean,candidateOnly:ds.filter(x=>x===1).length,baselineOnly:ds.filter(x=>x===-1).length});
 }return result;
}

export function comparisonBaseline(policies,requested){const selected=requested??(policies.includes('siege')?'siege':policies[0]);if(!policies.includes(selected))throw Error('Baseline must be a selected policy');return selected;}

async function main(){
 const count=Number(process.env.MC_SEEDS||20),start=Number(process.env.MC_START||1001),seconds=Number(process.env.MC_SECONDS||240),workers=Number(process.env.MC_WORKERS||4),cases=(process.env.MC_CASES||'ordinary,prepared,supplied').split(','),policies=(process.env.MC_POLICIES||'independent,siege,reserve640').split(','),phase=process.env.MC_PHASE||'holdout';
 if(!Number.isInteger(count)||count<1||count>1000||!Number.isInteger(start)||start<0||start+count>0xffffffff||!Number.isInteger(workers)||workers<1||workers>8||!Number.isInteger(seconds)||seconds<60||seconds>600||cases.some(c=>!Object.hasOwn(CASES,c))||policies.some(p=>!Object.hasOwn(POLICIES,p))||new Set(cases).size!==cases.length||new Set(policies).size!==policies.length)throw Error('Invalid Monte Carlo settings');
 const baseline=comparisonBaseline(policies,process.env.MC_BASELINE);
 const jobs=[];for(const caseId of cases)for(const policy of policies)for(let n=0;n<count;n++)for(const mirrored of[false,true])jobs.push({caseId,policy,seed:start+n,mirrored,seconds});
 const output=process.env.MC_OUTPUT||join(tmpdir(),'chopperjohn-monte-carlo.json'),rows=[],began=Date.now();let next=0;
 const save=()=>writeFileSync(output,JSON.stringify({schemaVersion:1,phase,settings:{count,start,seconds,workers,cases,policies,baseline},scope:'All infantry paid at HQ; normal120/5s/240bank/25-60/2s/15cap. Same paid compact initial assembly before policy activates; different policy RNG consumption is expected. Fixed cutoff includes preparation, timeout is unfinished, success is actual FOB ownership transfer. Mirrors are paired robustness checks, not independent samples. Flat map and one wave only, no aircraft/terrain variety/full-campaign claim. Opt-in candidate positioning does not change production defaults, damage or60/80 retreat rules.',complete:rows.length===jobs.length,rows:rows.toSorted((a,b)=>a.caseId.localeCompare(b.caseId)||a.policy.localeCompare(b.policy)||a.seed-b.seed||Number(a.mirrored)-Number(b.mirrored)),summary:summarize(rows),paired:policies.filter(p=>p!==baseline).flatMap(p=>{const fullCases=cases.filter(c=>rows.filter(r=>r.caseId===c&&r.policy===p).length===count*2&&rows.filter(r=>r.caseId===c&&r.policy===baseline).length===count*2);return pairedDifference(rows.filter(r=>fullCases.includes(r.caseId)),p,baseline);})},null,2)+'\n');
 await Promise.all(Array.from({length:Math.min(workers,jobs.length)},()=>new Promise((resolve,reject)=>{const w=new Worker(new URL(import.meta.url));let finished=false;
  const send=()=>{if(next<jobs.length)w.postMessage(jobs[next++]);else{finished=true;w.terminate().then(resolve,reject);}};
  w.on('message',row=>{if(row.error){w.terminate();reject(Error(row.error));return;}rows.push(row);if(rows.length%20===0)console.log(JSON.stringify({completed:rows.length,total:jobs.length,wallSeconds:(Date.now()-began)/1000}));save();send();});w.on('error',reject);w.on('exit',code=>{if(!finished&&code)reject(Error('Worker exited '+code));});send();})));
 save();console.log(JSON.stringify({completed:rows.length,wallSeconds:(Date.now()-began)/1000,output,summary:summarize(rows)}));
}
if(!isMainThread){parentPort.on('message',job=>{try{parentPort.postMessage(runTrial(job));}catch(e){parentPort.postMessage({error:e.stack});}});}
else if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){main().catch(e=>{console.error(e);process.exitCode=1;});}
