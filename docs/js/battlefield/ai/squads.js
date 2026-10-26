import {STRATEGY_RULES} from './strategy.js';
// SQ-01..04: orders affect walking limits, never coordinates, weapons or damage.
export function createSquad(id, role, composition, now) {
  return {id, role, composition: {...composition}, members: [], phase: role === 'defense' ? 'advance' : 'gather',
    rallyX: STRATEGY_RULES.rallyX, goalX: role === 'defense' ? STRATEGY_RULES.defenseX : 170,
    reinforce: true, launched: false, createdAt: now, casualties: 0};
}
export function addMember(squad, unit) {
  squad.members.push(unit.id);
  if(squad.phase === 'advance')squad.launched=true;
  unit.order = {role: squad.role, squadId: squad.id, joined: squad.phase === 'gather'};
}
export function membersOf(squad, units) {
  return units.filter(unit => unit.hp > 0 && squad.members.includes(unit.id));
}
export function detachForGarrison(squads, unit) {
  for (const squad of squads) {
    squad.members = squad.members.filter(id => id !== unit.id);
    if (!squad.members.length && squad.phase === 'advance') squad.phase = 'retired';
  }
  unit.order = {role: 'garrison'};
}
export function refreshSquads(squads, units, now) {
  let losses = 0, wipes = 0;
  for (const squad of squads) {
    if (squad.phase === 'retired') continue;
    const previous = [...squad.members];
    const survivors = membersOf(squad, units);
    const dead = previous.length - survivors.length;
    if (squad.launched && squad.role !== 'defense') {losses += dead; squad.casualties += dead;}
    squad.members = survivors.map(unit => unit.id);
    for (const unit of survivors) if (unit.guardBase !== null) detachForGarrison(squads, unit);
    if (squad.launched && !squad.members.length) {
      squad.phase = 'retired'; squad.retiredAt = now;
      if (dead && !survivors.length && squad.role !== 'defense') wipes++;
      continue;
    }
    const members = membersOf(squad, units);
    const joined = members.filter(unit => unit.order?.joined);
    if (squad.phase === 'advance' && members.length && !joined.length) members[0].order.joined = true;
    const rear = Math.max(...members.filter(unit => unit.order?.joined).map(unit => unit.x));
    for (const unit of members) if (Math.abs(unit.x - rear) <= 120) unit.order.joined = true;
    if (squad.phase === 'gather' && now >= (squad.holdUntil || 0) && ['rifle','rocket'].every(type => members.filter(unit => unit.type === type).length >= squad.composition[type]) &&
      members.every((unit, index) => unit.x <= squad.rallyX + index * 14 + 0.001)) {
      squad.phase = 'advance'; squad.launched = true; squad.launchedAt = now;
      for (const unit of members) unit.order.joined = true;
    }
  }
  return {losses, wipes};
}
export function movementOrder(unit, units, squads, dt) {
  const squad = squads.find(value => value.id === unit.order?.squadId && value.phase !== 'retired');
  if (!squad || unit.guardBase !== null) return null;
  const members = membersOf(squad, units);
  if (squad.phase === 'gather') {
    const index = members.findIndex(value => value.id === unit.id);
    const goal = squad.rallyX + Math.max(0, index) * 14;
    return {maxSpeed: Math.min(Math.abs(unit.velocity), Math.max(0, (unit.x - goal) / dt)), waiting: true};
  }
  const joined = members.filter(value => value.order?.joined);
  const ownSpeed = Math.abs(unit.velocity);
  const groupSpeed = Math.min(...joined.map(value => Math.abs(value.velocity)), ownSpeed);
  const rear = Math.max(...joined.map(value => value.x));
  const tooFarAhead = unit.order?.joined && rear - unit.x > STRATEGY_RULES.maxFormationGap;
  const speed = tooFarAhead ? 0 : unit.order?.joined ? groupSpeed : ownSpeed;
  return {maxSpeed: Math.min(speed, Math.max(0, (unit.x - squad.goalX) / dt)), waiting: tooFarAhead};
}
