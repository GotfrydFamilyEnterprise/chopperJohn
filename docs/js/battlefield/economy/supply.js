// EC-01..04: resource accounting is independent of AI, units, rendering and DOM.
export const SUPPLY_RULES = Object.freeze({
  start: 120, income: 5, capacity: 240, deployInterval: 2, unitLimit: 15,
  reserve: 60, costs: Object.freeze({rifle: 25, rocket: 60}),
});
const EPS = 1e-8;
export function createSupply() {
  return {balance: SUPPLY_RULES.start, time: 0, cooldown: 0,
    earned: 0, overflow: 0, spent: 0, purchases: 0, ledger: []};
}
export function accrueSupply(account, dt) {
  if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Invalid simulation timestep');
  const income = SUPPLY_RULES.income * dt;
  const accepted = Math.min(income, Math.max(0, SUPPLY_RULES.capacity - account.balance));
  account.balance += accepted; account.earned += accepted; account.overflow += income - accepted;
  account.time += dt; account.cooldown = Math.max(0, account.cooldown - dt);
}
export function purchaseStatus(account, type, livingUnits, reserve = 0) {
  const cost = SUPPLY_RULES.costs[type];
  if (!Number.isFinite(cost)) return 'invalid-unit';
  if (livingUnits >= SUPPLY_RULES.unitLimit) return 'unit-limit';
  if (account.cooldown > EPS) return 'deployment-cooldown';
  if (account.balance + EPS < cost + reserve) return 'saving-supply';
  return 'ready';
}
// Only a confirmed spawn is charged. The factory is injected by the caller.
export function purchaseUnit(account, type, livingUnits, factory, reserve = 0) {
  const reason = purchaseStatus(account, type, livingUnits, reserve);
  if (reason !== 'ready') return {unit: null, reason};
  const unit = factory(type);
  if (!unit) return {unit: null, reason: 'deployment-failed'};
  const cost = SUPPLY_RULES.costs[type];
  account.balance = Math.max(0, account.balance - cost); account.spent += cost;
  account.cooldown = SUPPLY_RULES.deployInterval; account.purchases++;
  account.ledger.push({time: account.time, unitId: unit.id, type, cost, balance: account.balance});
  if (account.ledger.length > 128) account.ledger.shift();
  return {unit, reason: 'deployed'};
}
