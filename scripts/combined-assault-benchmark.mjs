// PL-10 / #44: matched 340-Supply force layouts. No gameplay tuning here.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Worker,isMainThread,parentPort} from 'node:worker_threads';
import {createCombinedAssault,stepCombinedAssault,combinedAssaultResult,FORCE_LAYOUTS} from '../docs/js/battlefield/platoons/combinedAssaultStudy.js';
import {summarize,pairedDifference} from './platoon-monte-carlo.mjs';
const level=JSON.parse(readFileSync(new URL('../docs/campaign/first-assault.json',import.meta.url)));
export function runCombinedTrial(job){
 const s=createCombinedAssault(level,job);while(!s.finished)stepCombinedAssault(s,120);
 return {...combinedAssaultResult(s),caseId:`${job.resupply?'supplied':'fixed'}-${job.release}`,policy:job.layout};
}
async function main(){
 const count=Number(process.env.CA_SEEDS||10),start=Number(process.env.CA_START||7001),seconds=Number(process.env.CA_SECONDS||240),workers=Number(process.env.CA_WORKERS||4),phase=process.env.CA_PHASE||'validation',output=process.env.CA_OUTPUT||'/tmp/combined-assault.json';
 if(!Number.isInteger(count)||count<1||count>100||!Number.isInteger(start)||start<0||start+count>0xffffffff||!Number.isInteger(seconds)||seconds<60||seconds>600||!Number.isInteger(workers)||workers<1||workers>8)throw Error('Invalid combined benchmark settings');
 const jobs=[];for(const resupply of[false,true])for(const release of['coordinated','staggered'])for(const layout of FORCE_LAYOUTS)for(let n=0;n<count;n++)for(const mirrored of[false,true])jobs.push({layout,release,resupply,seed:start+n,mirrored,seconds});
 const rows=[],began=Date.now();let next=0;
 const save=()=>{
  const complete=rows.length===jobs.length;
  writeFileSync(output,JSON.stringify({schemaVersion:1,phase,settings:{count,start,seconds,workers},complete,
   scope:'All arms buy 4 rifles + 4 rockets for340 Supply, in RRRRKKKK order at HQ. Sergeant counts as a rifle: one/two/support have3/2/3 capture-eligible rifles. Same120 start,5/s income,240 bank,25/60 costs,2s cooldown,15cap. Rally geometry is layout-specific; grouping, formation and leader count are a treatment package. Coordinated waits for all eight to physically assemble; staggered releases each completed component. All platoons use research-only rear140; independent support advances normally. Defenders buy2R1K for110 and physically garrison. Supplied runs allow normal paid platoon vacancies and independent support/defender replacements, no replacement leaders. Capture is whole-force ownership transfer; all-force elimination or the configured time cutoff ends other runs. maxLeaderGap samples the first active platoon only. Mirrors are paired robustness checks, not independent samples; no aircraft, terrain variety, production activation or universal advantage claim.',
   rows:rows.toSorted((a,b)=>a.caseId.localeCompare(b.caseId)||a.policy.localeCompare(b.policy)||a.seed-b.seed||Number(a.mirrored)-Number(b.mirrored)),summary:summarize(rows),paired:complete?FORCE_LAYOUTS.filter(l=>l!=='one').flatMap(l=>pairedDifference(rows,l,'one')):[]},null,2)+'\n');
 };
 await Promise.all(Array.from({length:Math.min(workers,jobs.length)},()=>new Promise((done,reject)=>{
  const w=new Worker(new URL(import.meta.url));let stopping=false;
  const send=()=>{if(next<jobs.length)w.postMessage(jobs[next++]);else{stopping=true;w.terminate().then(done,reject);}};
  w.on('message',row=>{if(row.error){stopping=true;w.terminate();reject(Error(row.error));return;}rows.push(row);save();if(rows.length%20===0)console.log(JSON.stringify({completed:rows.length,total:jobs.length,wallSeconds:(Date.now()-began)/1000}));send();});w.on('error',reject);w.on('exit',code=>{if(!stopping)reject(Error('Unexpected worker exit '+code));});send();
 })));
 save();console.log(JSON.stringify({completed:rows.length,output,wallSeconds:(Date.now()-began)/1000}));
}
if(!isMainThread&&process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))parentPort.on('message',job=>{try{parentPort.postMessage(runCombinedTrial(job));}catch(e){parentPort.postMessage({error:e.stack});}});
else if(isMainThread&&process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1;});
