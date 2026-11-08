// PL-06: actual campaign combat/economy, identical red platoon commander in all cases.
import {readFileSync,writeFileSync} from 'node:fs';
import {createWorld,stepWorld,buySergeant} from '../docs/js/battlefield/campaign/world.js';
import {activePlatoons} from '../docs/js/battlefield/ai/platoons.js';
import {createSupportPolicy,benchmarkPurchases,supportInput} from './campaign-support-policy.mjs';
const levels=(process.env.PLATOON_LEVELS||'first-assault,ridgeline').split(','),tactics=(process.env.PLATOON_TACTICS||'independent,assault,siege,spread').split(','),count=Number(process.env.PLATOON_SEEDS||3),seconds=Number(process.env.PLATOON_SECONDS||480),rows=[];
if(!Number.isInteger(count)||count<1||count>20||!Number.isFinite(seconds)||seconds<1||seconds>900||tactics.some(t=>!['independent','assault','siege','spread'].includes(t)))throw Error('Invalid experiment');
for(const id of levels)for(let offset=0;offset<count;offset++)for(const tactic of tactics){
 const level=JSON.parse(readFileSync('docs/campaign/'+id+'.json')),w=createWorld(level,{seed:level.seed+offset,platoons:true}),pilot=createSupportPolicy(process.env.PLATOON_AIR||'none');
 while(w.time<seconds&&!w.result){
  if(tactic==='independent')benchmarkPurchases(w,pilot);else if(w.tick%240===0&&activePlatoons(w,0).length<2&&!activePlatoons(w,0).some(g=>g.phase==='rally'))buySergeant(w,0,tactic);
  stepWorld(w,supportInput(w,pilot));
 }
 const row={level:id,seed:w.seed,tactic,air:pilot.mode,time:w.time,finished:!!w.result,winner:w.result?.winner??null,living:[0,1].map(team=>w.units.filter(u=>u.hp>0&&u.team===team).length),supply:w.commanders.map(c=>({spent:c.supply.spent,balance:c.supply.balance,earned:c.supply.earned,purchases:c.supply.purchases})),metrics:w.metrics,stats:w.stats,platoons:w.platoons.stats,activeGroups:w.platoons.groups.filter(g=>g.phase!=='disbanded').map(g=>({team:g.team,strategy:g.strategy,phase:g.phase,missing:g.slots.filter(s=>s.unitId===null).length,joining:g.slots.filter(s=>s.unitId!==null&&!s.joined).length})),bases:w.bases.map(b=>({id:b.id,team:b.team,defenses:b.defensePoints}))};rows.push(row);console.log(JSON.stringify(row));
 writeFileSync(process.env.PLATOON_OUTPUT||'docs/quality/evidence/platoon-strategy-results.json',JSON.stringify({schemaVersion:1,secondsLimit:seconds,seedCount:count,scope:'Same resources/prices/cooldown/cap and red Assault platoon controller. Independent blue uses explicit adaptive manual purchases; other blue strategies explicitly deploy paid sergeants and authorize their normal-price recruitment/replacement. Spending sequences differ and are reported. All cases include the point-blank collision fix. No teleporting, direct damage or forced result. Unfinished is not a draw or victory; bounded sample is not universal balance.',rows},null,2)+'\n');
}
