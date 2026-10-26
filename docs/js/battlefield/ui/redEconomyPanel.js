import {SUPPLY_RULES} from '../economy/supply.js';
// EC-05: a narrow UI adapter; no accounting or strategic decisions live here.
export function renderRedEconomy(element, state) {
  const account = state.supply;
  const squad = state.squads.find(group => group.id === state.strategy.squadId);
  const progress = squad ? ` · ${squad.members.length}/${squad.composition.rifle + squad.composition.rocket} assembling` : '';
  element.textContent = `${state.rules.team === 0 ? "Blue" : "Red"} · ${Math.floor(account.balance + 1e-7)}/${SUPPLY_RULES.capacity} Supply · +${SUPPLY_RULES.income}/s · ${state.observations?.living ?? 0}/${SUPPLY_RULES.unitLimit} troops · ${state.strategy.label}${progress}`;
}
