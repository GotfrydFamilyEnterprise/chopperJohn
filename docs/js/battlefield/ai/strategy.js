// AI-01..05: strategic decisions use only current, publicly visible battlefield facts.
export const STRATEGY_RULES = Object.freeze({
  team: 1, hqX: 3490, spawnX: 3430, rallyX: 3320, defenseX: 3270,
  threatRadius: 800, decisionInterval: 3, regroupSeconds: 12,
  fieldLossThreshold: 10, maxFormationGap: 360,
});
export const COMPOSITIONS = Object.freeze({
  intercept: Object.freeze({rifle: 3, rocket: 2}),
  assault: Object.freeze({rifle: 2, rocket: 3}),
  defense: Object.freeze({rifle: 3, rocket: 1}),
});
export function observeBattlefield(units, bases) {
  const live = units.filter(unit => unit.hp > 0);
  const allies = live.filter(unit => unit.team === STRATEGY_RULES.team);
  const enemies = live.filter(unit => unit.team !== STRATEGY_RULES.team);
  const fob = bases.find(base => !base.main && base.team === STRATEGY_RULES.team);
  const enemyFob = bases.find(base => !base.main && base.team !== STRATEGY_RULES.team);
  const incoming = {rifle: 0, rocket: 0}, stationed = {rifle: 0, rocket: 0};
  for (const unit of allies) {
    if (!fob || !(unit.type in incoming)) continue;
    if (unit.guardBase === fob.x) {
      incoming[unit.type]++;
      if (unit.arrived && fob.slots[unit.type]?.includes(unit.id)) stationed[unit.type]++;
    } else if (unit.order?.role === 'garrison' && unit.x >= fob.x - 80) incoming[unit.type]++;
  }
  const missing = {rifle: fob ? Math.max(0, 2 - incoming.rifle) : 0,
    rocket: fob ? Math.max(0, 1 - incoming.rocket) : 0};
  const threatened = enemies.some(enemy => Math.abs(enemy.x - STRATEGY_RULES.hqX) <= STRATEGY_RULES.threatRadius);
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
  if (now < regroupUntil) return {mode: 'REGROUP', label: 'Regrouping'};
  const gathering = squads.find(squad => squad.phase === 'gather');
  if (gathering) return {mode: 'PREPARE', label: gathering.role === 'assault' ? 'Preparing assault' : 'Preparing interception', squadId: gathering.id};
  const support = squads.find(squad => squad.phase === 'advance' && squad.role !== 'defense' && squad.reinforce && firstMissing(squad.composition, view.allies.filter(unit => squad.members.includes(unit.id))));
  if (support) return {mode: 'SUPPORT', label: 'Reinforcing advancing troops', squadId: support.id};
  const role = view.enemyStaffed ? 'assault' : 'intercept';
  const composition = {...COMPOSITIONS[role]};
  if (stronger) {composition.rifle++; composition.rocket++;}
  return {mode: 'PREPARE', label: role === 'assault' ? 'Preparing assault' : 'Preparing interception', role, composition};
}
