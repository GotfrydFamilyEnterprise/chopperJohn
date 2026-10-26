import {SUPPLY_RULES, createSupply, accrueSupply, purchaseUnit} from '../economy/supply.js';
import {STRATEGY_RULES, COMPOSITIONS, observeBattlefield, chooseStrategy, firstMissing, factionRules} from './strategy.js';
import {createSquad, addMember, membersOf, detachForGarrison, refreshSquads, movementOrder} from './squads.js';
// AI-01..06: deterministic composition root; the scene injects the spawn factory.
export function createCommander(team = 1) {
  return {rules: factionRules(team), supply: createSupply(), squads: [], nextSquadId: 1, strategy: {mode: 'GARRISON', label: 'Reinforcing FOB'},
    nextDecisionAt: 0, regroupUntil: 0, fieldLosses: 0, failedWaves: 0, stronger: false,
    events: [], blockReason: 'ready', observations: null};
}
function record(state, event) {
  state.events.push({time: state.supply.time, ...event});
  if (state.events.length > 128) state.events.shift();
}
export function updateCommander(state, dt, units, bases, deploy) {
  const rules = state.rules;
  accrueSupply(state.supply, dt);
  const now = state.supply.time;
  const outcome = refreshSquads(state.squads, units, now);
  state.fieldLosses += outcome.losses; state.failedWaves += outcome.wipes;
  if (state.fieldLosses >= STRATEGY_RULES.fieldLossThreshold || state.failedWaves >= 2) {
    state.regroupUntil = now + STRATEGY_RULES.regroupSeconds; state.stronger = true;
    state.fieldLosses = 0; state.failedWaves = 0; state.nextDecisionAt = 0;
    for (const squad of state.squads) if (squad.phase === 'advance' && squad.role !== 'defense') squad.reinforce = false;
    for (const squad of state.squads) if (squad.phase === 'gather') squad.holdUntil = state.regroupUntil;
    record(state, {type: 'regroup', until: state.regroupUntil});
  }
  let view = observeBattlefield(units, bases, rules);
  if (!view.threatened) for (const squad of state.squads) if (squad.role === 'defense' && squad.phase !== 'retired') {
    squad.role = 'intercept'; squad.composition = {...COMPOSITIONS.intercept}; squad.phase = 'gather'; squad.goalX = rules.goalX;
    for (const unit of membersOf(squad, units)) unit.order.role = squad.role;
  }
  const critical = (view.threatened && state.strategy.mode !== 'DEFEND') ||
    (!view.threatened && (view.missing.rifle || view.missing.rocket) && state.strategy.mode !== 'GARRISON');
  if (now + 1e-8 >= state.nextDecisionAt || critical) {
    const before = state.strategy.mode;
    state.strategy = chooseStrategy(view, state.squads, now, state.regroupUntil, state.stronger);
    state.nextDecisionAt = now + STRATEGY_RULES.decisionInterval;
    if (before !== state.strategy.mode) record(state, {type: 'objective', mode: state.strategy.mode});
  }
  let type = null, squad = null, role = null;
  if (state.strategy.mode === 'GARRISON') {
    type = view.missing.rifle ? 'rifle' : view.missing.rocket ? 'rocket' : null;
    if (type) {
      const candidate = view.allies.find(unit => unit.type === type && unit.guardBase === null && unit.order?.squadId && (unit.x - view.fob.x) * rules.direction <= 80);
      if (candidate) {
        detachForGarrison(state.squads, candidate); record(state, {type: 'redirect', unitId: candidate.id, role: 'garrison'});
        view = observeBattlefield(units, bases, rules); type = view.missing.rifle ? 'rifle' : view.missing.rocket ? 'rocket' : null;
      }
    }
    role = 'garrison';
  } else if (state.strategy.mode === 'DEFEND') {
    // Already-paid rally troops respond immediately instead of waiting for a full wave.
    for (const group of state.squads) if (group.phase === 'gather') {
      group.phase = 'advance'; group.role = 'defense'; group.goalX = rules.defenseX;
      group.composition = {...COMPOSITIONS.defense}; group.launched = true;
      for (const unit of membersOf(group, units)) {unit.order.role = 'defense'; unit.order.joined = true;}
    }
    squad = state.squads.find(group => group.role === 'defense' && group.phase !== 'retired');
    if (!squad) {squad = createSquad(state.nextSquadId++, 'defense', COMPOSITIONS.defense, now, rules); state.squads.push(squad);}
    type = firstMissing(squad.composition, membersOf(squad, units)); role = 'defense';
  } else if (state.strategy.mode === 'PREPARE' || state.strategy.mode === 'SUPPORT') {
    squad = state.squads.find(group => group.id === state.strategy.squadId && group.phase !== 'retired');
    if (!squad && state.strategy.mode === 'PREPARE') {
      const desired = state.strategy.composition;
      const size = desired ? desired.rifle + desired.rocket : 0;
      if (size && SUPPLY_RULES.unitLimit - view.allies.length >= size) {
        squad = createSquad(state.nextSquadId++, state.strategy.role, desired, now, rules); state.squads.push(squad);
        state.strategy.squadId = squad.id;
      }
    }
    if (squad) {type = firstMissing(squad.composition, membersOf(squad, units)); role = squad.role;}
  }
  state.blockReason = type ? 'ready' : state.strategy.mode === 'REGROUP' ? 'regrouping' : 'awaiting-orders';
  if (type) {
    const reserve = role === 'garrison' || role === 'defense' ? 0 : SUPPLY_RULES.reserve;
    const purchase = purchaseUnit(state.supply, type, view.allies.length, kind => {
      const unit = deploy(kind, rules.spawnX);
      if (!unit) return null;
      if (role === 'garrison') unit.order = {role}; else addMember(squad, unit);
      return unit;
    }, reserve);
    state.blockReason = purchase.reason;
    if (purchase.unit) record(state, {type: 'purchase', unitId: purchase.unit.id, kind: type, role, squadId: squad?.id ?? null});
  }
  state.observations = {living: units.filter(unit => unit.hp > 0 && unit.team === rules.team).length,
    incoming: view.incoming, stationed: view.stationed};
  state.squads = state.squads.filter(squad => squad.phase !== 'retired' || now - (squad.retiredAt ?? 0) < 30);
}
export function commanderMovementOrder(state, unit, units, dt) {
  return movementOrder(unit, units, state.squads, dt);
}

// Compatibility for existing red-only tests and callers; all factions use the same core.
export const createRedCommander = () => createCommander(1);
export const updateRedCommander = updateCommander;
export const redMovementOrder = commanderMovementOrder;
