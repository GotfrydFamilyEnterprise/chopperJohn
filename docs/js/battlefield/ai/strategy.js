// AI-01..05: strategic decisions use only current, publicly visible battlefield facts.
export const STRATEGY_RULES = Object.freeze({
  team: 1, hqX: 3490, spawnX: 3430, rallyX: 3320, defenseX: 3270,
  threatRadius: 800, decisionInterval: 3, regroupSeconds: 12,
  fieldLossThreshold: 10, maxFormationGap: 360,
});
// EC-06: identical strategy and economy, mirrored about the battlefield center.
export function factionRules(team) {
  if (team !== 0 && team !== 1) throw new RangeError('Invalid faction');
  return {...STRATEGY_RULES, team, direction: team === 0 ? 1 : -1,
    hqX: team === 0 ? 110 : 3490, spawnX: team === 0 ? 170 : 3430,
    rallyX: team === 0 ? 280 : 3320, defenseX: team === 0 ? 330 : 3270,
    goalX: team === 0 ? 3430 : 170};
}
export const COMPOSITIONS = Object.freeze({
  intercept: Object.freeze({rifle: 3, rocket: 2}),
  assault: Object.freeze({rifle: 2, rocket: 3}),
  defense: Object.freeze({rifle: 3, rocket: 1}),
});
export function observeBattlefield(units, bases, rules = factionRules(1)) {
  const live = units.filter(unit => unit.hp > 0);
  const allies = live.filter(unit => unit.team === rules.team);
  const enemies = live.filter(unit => unit.team !== rules.team);
  const owned=bases.filter(base=>!base.main&&base.team===rules.team).sort((a,b)=>Math.abs(a.x-rules.hqX)-Math.abs(b.x-rules.hqX));
  const enemyFob=bases.filter(base=>!base.main&&base.team!==rules.team).sort((a,b)=>Math.abs(a.x-rules.hqX)-Math.abs(b.x-rules.hqX))[0];
  const count=base=>{const incoming={rifle:0,rocket:0},stationed={rifle:0,rocket:0};
   if(base)for(const unit of allies){if(!(unit.type in incoming))continue;
    if(unit.guardBase===base.x){incoming[unit.type]++;if(unit.arrived&&base.slots[unit.type]?.includes(unit.id))stationed[unit.type]++;}
    else if(unit.order?.role==='garrison'&&(unit.order.baseX===base.x||unit.order.baseX==null&&base===owned[0])&&(unit.x-base.x)*rules.direction<=80)incoming[unit.type]++;
   }return {incoming,stationed};};
  const fob=owned.find(base=>{const {incoming}=count(base);return incoming.rifle<2||incoming.rocket<1;})??owned[0];
  const {incoming,stationed}=count(fob);
  const missing={rifle:fob?Math.max(0,2-incoming.rifle):0,rocket:fob?Math.max(0,1-incoming.rocket):0};
  const threatened = enemies.some(enemy => Math.abs(enemy.x - rules.hqX) <= STRATEGY_RULES.threatRadius);
  const enemyStaffed = !!enemyFob && enemies.some(unit => unit.arrived && unit.guardBase === enemyFob.x && enemyFob.slots[unit.type]?.includes(unit.id));
  return {allies, enemies, fob, enemyFob, missing, incoming, stationed, threatened, enemyStaffed};
}
export function firstMissing(composition, members) {
  for (const type of ['rifle', 'rocket']) if (members.filter(unit => unit.type === type).length < composition[type]) return type;
  return null;
}
export function chooseStrategy(view, squads, now, regroupUntil, stronger) {
  if (view.threatened) return {mode: 'DEFEND', label: 'Defending HQ', role: 'defense'};
  if (view.missing.rifle || view.missing.rocket) return {mode: 'GARRISON', label: 'Reinforcing FOB'};
  if (view.airPressure && (view.allies.filter(u=>u.type==='rocket').length<3||view.allies.filter(u=>u.type==='rifle').length<2)) return {mode:'AIR_DEFEND',label:'Countering helicopter',role:'air-defense'};
  if (now < regroupUntil) return {mode: 'REGROUP', label: 'Regrouping'};
  const gathering = squads.find(squad => squad.phase === 'gather');
  if (gathering) return {mode: 'PREPARE', label: gathering.role === 'assault' ? 'Preparing assault' : 'Preparing interception', squadId: gathering.id};
  const support = squads.find(squad => squad.phase === 'advance' && squad.role !== 'defense' && squad.reinforce && firstMissing(squad.composition, view.allies.filter(unit => squad.members.includes(unit.id))));
  if (support) return {mode: 'SUPPORT', label: 'Reinforcing advancing troops', squadId: support.id};
  const role = view.airPressure ? 'assault' : view.enemyStaffed ? 'assault' : 'intercept';
  const composition = {...COMPOSITIONS[role]};
  if (stronger) {composition.rifle++; composition.rocket++;}
  return {mode: 'PREPARE', label: role === 'assault' ? 'Preparing assault' : 'Preparing interception', role, composition};
}
