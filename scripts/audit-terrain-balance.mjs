// TL-09: supplement an existing report with observed projectile counts. Settled
// results imply zero by the engine's result gate; unresolved runs are replayed
// and checked against their recorded outcome/HP/cost before enrichment.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {encounterLevel,forceEconomics} from '../docs/js/battlefield/terrain/balance.js';
import {createSimulation,stepSimulation,LAB_STEP} from '../docs/js/battlefield/terrain/simulation.js';
const path='docs/quality/evidence/terrain-balance-results.json',report=JSON.parse(readFileSync(path));
let replayed=0;
for(const row of report.runs){
 if(row.outcome!=='timeout'){row.projectilesRemaining=0;continue;}
 const sim=createSimulation(encounterLevel(row.case,row.seed,row.mirrored),row.case,{blastRadius:row.radius,damageModel:report.damageModel==='per-soldier-linear-falloff'?'individual':report.damageModel});stepSimulation(sim,Math.ceil(report.secondsLimit/LAB_STEP));
 assert.equal(sim.result,null);assert.equal(sim.time,row.elapsed);const attack=row.mirrored?1:0;
 assert.deepEqual([attack,1-attack].map(t=>forceEconomics(sim,t)),row.forces);
 assert.deepEqual([attack,1-attack].map(t=>sim.units.filter(u=>u.team===t).reduce((n,u)=>n+u.hp,0)),row.hp);
 row.projectilesRemaining=sim.projectiles.length;replayed++;console.log(`${row.case} radius${row.radius} seed${row.seed} mirrored${row.mirrored}: ${sim.projectiles.length} in flight`);
}
report.projectileAudit={replayedUnresolvedRuns:replayed,settled:'Zero projectiles guaranteed by engine result gate',unresolved:'Replayed actual engine; exact HP, elapsed and force values verified against original matrix'};
writeFileSync(path,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.projectileAudit));
