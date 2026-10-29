// TL-06: presentation summaries derived from actual shots/HP, never simulated odds.
export function combatSummary(sim){
 const teams=[0,1].map(team=>{
  const units=sim.units.filter(u=>u.team===team),fired=units.filter(u=>u.firstShotAt!==null);
  return {team,hp:units.reduce((sum,u)=>sum+u.hp,0),alive:units.filter(u=>u.hp>0).length,shots:units.reduce((sum,u)=>sum+u.shotsFired,0),firstShot:fired.length?Math.min(...fired.map(u=>u.firstShotAt)):null};
 });
 const outcome=sim.result?(sim.result.winner===null?'Mutual elimination':(sim.result.winner===0?'Blue':'Red')+' survives')+' · '+sim.result.time.toFixed(2)+'s':sim.stats.rifleShots+sim.stats.rocketShots?'Exchange underway':'Waiting for contact';
 return {teams,outcome};
}
