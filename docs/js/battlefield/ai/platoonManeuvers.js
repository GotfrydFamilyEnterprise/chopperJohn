// PL-07/08: shared physical cohesion and loss-triggered withdrawal. No buffs or RNG.
export const MANEUVER_RULES=Object.freeze({radius:280,leaderRadius:240,retreatAt:.6,resumeAt:.8,withdrawDistance:320,coverSearch:500,regroupSeconds:6});
const alive=(w,id)=>w.units.find(u=>u.id===id&&u.hp>0);
const median=xs=>{xs.sort((a,b)=>a-b);return xs.length?(xs[Math.floor((xs.length-1)/2)]+xs[Math.floor(xs.length/2)])/2:null;};
export function compactOffset(g,slot){const list=g.slots.filter(s=>s.type===slot.type),i=list.indexOf(slot);if(list.length<=2)return slot.type==='rifle'?24+i*24:-30-i*30;return (slot.type==='rifle'?1:-1)*(18+54*i/(list.length-1));}
const slotAssembled=(w,g,s)=>{const u=alive(w,s.unitId),dir=g.team===0?1:-1,goal=Math.max(80,Math.min(w.level.world.width-80,g.retreatX+dir*compactOffset(g,s)));return s.joined&&u&&Math.abs(u.x-goal)<=12;};
export function combatMembers(w,g){return g.slots.filter(s=>s.joined).map(s=>alive(w,s.unitId)).filter(u=>u&&u.guardBase===null);}
export function maneuverCenter(w,g){return median(combatMembers(w,g).map(u=>u.x))??alive(w,g.leaderId)?.x??g.rallyX;}
export function withdrawalPoint(w,g){
 const dir=g.team===0?1:-1,center=maneuverCenter(w,g)*dir,rear=g.rallyX*dir;
 const covers=w.bases.filter(b=>b.team===g.team&&!b.main&&b.defensePoints>0).map(b=>b.x*dir-140).filter(p=>p>=rear&&p<=center-80&&center-p<=MANEUVER_RULES.coverSearch&&!w.units.some(u=>u.hp>0&&u.team!==g.team&&Math.abs(u.x-p*dir)<180)).sort((a,b)=>b-a);
 return dir*(covers[0]??Math.min(center,Math.max(rear,center-MANEUVER_RULES.withdrawDistance)));
}
export function updateManeuver(w,g,emit){
 const leader=alive(w,g.leaderId);if(!leader||g.launchedAt===null)return;
 const total=1+g.slots.length,ready=1+combatMembers(w,g).length;g.combatReady=ready;g.totalStrength=total;
 if(!['retreat','regroup'].includes(g.phase)&&g.retreatEnabled!==false&&ready/total<=MANEUVER_RULES.retreatAt){g.phase='retreat';g.retreatX=withdrawalPoint(w,g);g.retreatStartedAt=w.time;g.regroupStartedAt=null;g.retreatCount=(g.retreatCount||0)+1;emit({type:'platoonRetreat',groupId:g.id,team:g.team,ready,total,goalX:g.retreatX});}
 if(g.phase==='retreat'&&Math.abs(leader.x-g.retreatX)<=12&&g.slots.filter(s=>s.joined&&alive(w,s.unitId)).every(s=>slotAssembled(w,g,s))){g.phase='regroup';g.regroupStartedAt=w.time;emit({type:'platoonRegroup',groupId:g.id,team:g.team});}
 if(g.phase==='regroup'){
  const assembled=1+g.slots.filter(s=>slotAssembled(w,g,s)).length;
  if(assembled/total>=MANEUVER_RULES.resumeAt&&Math.abs(leader.x-g.retreatX)<=12&&w.time-g.regroupStartedAt>=MANEUVER_RULES.regroupSeconds){g.phase='advance';g.resumedAt=w.time;emit({type:'platoonResumed',groupId:g.id,team:g.team,ready:assembled,total});}
 }
}
