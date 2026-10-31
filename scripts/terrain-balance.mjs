// TL-09: deterministic multi-seed experiments against the actual Terrain Lab engine.
import {writeFileSync} from 'node:fs';
import {BALANCE_CASES,BLAST_RADII,encounterLevel,forceEconomics} from '../docs/js/battlefield/terrain/balance.js';
import {createSimulation,stepSimulation,LAB_STEP} from '../docs/js/battlefield/terrain/simulation.js';
const seedCount=Number(process.env.BALANCE_SEEDS||12),seconds=Number(process.env.BALANCE_SECONDS||90);
if(!Number.isInteger(seedCount)||seedCount<1||seedCount>100||!Number.isFinite(seconds)||seconds<1||seconds>180)throw new Error('Invalid experiment limits');
const selected=process.env.BALANCE_CASE?BALANCE_CASES.filter(c=>c.id===process.env.BALANCE_CASE):BALANCE_CASES;
if(!selected.length)throw new Error('Unknown experiment');
const runs=[];const started=Date.now();
for(const c of selected)for(const radius of BLAST_RADII){
 for(let seed=1;seed<=seedCount;seed++)for(const mirrored of [false,true]){
  const sim=createSimulation(encounterLevel(c.id,seed,mirrored),c.id,{blastRadius:radius});
  stepSimulation(sim,Math.ceil(seconds/LAB_STEP));
  // Attack is the original blue force, even after physically mirroring faction/colors.
  const attackTeam=mirrored?1:0,teams=[attackTeam,1-attackTeam].map(team=>forceEconomics(sim,team));
  runs.push({case:c.id,radius,seed,mirrored,elapsed:sim.time,projectilesRemaining:sim.projectiles.length,outcome:!sim.result?'timeout':sim.result.winner===null?'mutual':sim.result.winner===attackTeam?'attack':'defense',forces:teams,shots:{rifle:sim.stats.rifleShots,rocket:sim.stats.rocketShots},hp:teams.map((_,i)=>sim.units.filter(u=>u.team===(i===0?attackTeam:1-attackTeam)).reduce((n,u)=>n+u.hp,0))});
 }
 process.stdout.write(`${c.id} radius ${radius} done (${((Date.now()-started)/1000).toFixed(1)}s)\n`);
}
const groups=selected.flatMap(c=>BLAST_RADII.map(radius=>{
 const rows=runs.filter(r=>r.case===c.id&&r.radius===radius),mean=f=>rows.reduce((sum,r)=>sum+f(r),0)/rows.length;
 return {case:c.id,name:c.name,radius,runs:rows.length,attackWins:rows.filter(r=>r.outcome==='attack').length,defenseWins:rows.filter(r=>r.outcome==='defense').length,mutual:rows.filter(r=>r.outcome==='mutual').length,timeouts:rows.filter(r=>r.outcome==='timeout').length,fielded:rows[0].forces.map(f=>f.fielded),meanSurvivingValue:[0,1].map(i=>mean(r=>r.forces[i].surviving)),meanLostValue:[0,1].map(i=>mean(r=>r.forces[i].lost)),meanSeconds:mean(r=>r.elapsed)};
}));
const report={schemaVersion:1,engine:'Terrain Lab v0.5',seedCount,mirrorsPerSeed:2,secondsLimit:seconds,prices:{rifle:25,rocket:60},damageModel:'per-soldier-linear-falloff',scope:'Damage model: current per-soldier splash; each overlapping soldier receives its own damage. Preassembled ground forces only. No live income, purchase timing, reinforcements, FOBs, capture or aircraft. Timeouts are unresolved, not draws or wins. Mirrored runs are paired checks, not independent seed samples. Survivors are valued at full replacement cost irrespective of remaining HP; raw HP is also retained.',groups,runs};
const output=process.env.BALANCE_OUTPUT||'docs/quality/evidence/terrain-balance-results.json';
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({games:runs.length,seconds:(Date.now()-started)/1000,output}));
