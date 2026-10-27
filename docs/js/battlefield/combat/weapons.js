// RC-01..08, BC-01..05: approved rocket and bunker-cover rules.
export const WEAPONS = Object.freeze({
  rifleRange: 250, rocketMinRange: 225, rocketMaxRange: 600,
  rocketAimSeconds: 0.7, rocketReloadSeconds: 3,
  rocketAngle: 50 * Math.PI / 180, gravity: 240,
  blastRadius: 25, blastDamage: 2,
  bunkerBulletChance: 1 / 20, bunkerBulletDamage: 0.5,
  bunkerRocketDamage: 1 / 3, bunkerHalfWidth: 80,
});

// QA-01: all gameplay randomness comes from this resettable, observable stream.
export function createRandom(seed = 0xc0ffee) {
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  random.state = () => state;
  return random;
}

export function selectTarget(unit, units, minRange, maxRange) {
  const direction = unit.team === 0 ? 1 : -1;
  let target = null, nearest = Infinity;
  for (const enemy of units) {
    const distance = (enemy.x - unit.x) * direction;
    if (enemy.hp > 0 && enemy.team !== unit.team && distance >= minRange && distance <= maxRange && distance < nearest) {
      target = enemy;
      nearest = distance;
    }
  }
  return target;
}

export function rocketSpread(distance) {
  distance = Math.max(225, Math.min(WEAPONS.rocketMaxRange, distance));
  if(distance <= 350) return 5 + (distance - 225) * 15 / 125;
  if(distance <= 500) return 20 + (distance - 350) * 30 / 150;
  return 50 + (distance - 500) * 0.16;
}

// RC-09: keep a chosen eligible target while aiming; choose another autonomously
// when it dies, leaves the firing band or passes behind the soldier.
export function chooseRocketTarget(unit, units) {
  const locked = units.find(enemy => enemy.id === unit.rocketTargetId);
  return selectTarget(unit, locked ? [locked] : [], WEAPONS.rocketMinRange, WEAPONS.rocketMaxRange) ||
    selectTarget(unit, units, WEAPONS.rocketMinRange, WEAPONS.rocketMaxRange);
}

// Solve the moving ground intercept and ballistic time together. Observed ground
// velocity is measured from actual movement; guards and stopped rocketeers lead 0.
export function planRocketShot(unit, target, error = 0) {
  const direction = unit.team === 0 ? 1 : -1, angle = WEAPONS.rocketAngle;
  const originX = unit.x + direction * 34 * Math.cos(angle);
  const originY = unit.y - 42 - 34 * Math.sin(angle), drop = unit.y - originY;
  const targetVelocity = target.observedVelocity || 0;
  let flightTime = 0, aimedX = target.x, impactX, vx, vy;
  for (let iteration = 0; iteration < 12; iteration++) {
    aimedX = target.x + targetVelocity * flightTime;
    // Keep the fixed-facing launch forward even for unusual externally set speed.
    impactX = originX + direction * Math.max(1, (aimedX + error - originX) * direction);
    const distance = Math.abs(impactX - originX);
    const speed = Math.sqrt(WEAPONS.gravity * distance * distance /
      (2 * Math.cos(angle) ** 2 * (drop + distance * Math.tan(angle))));
    vx = direction * speed * Math.cos(angle); vy = -speed * Math.sin(angle);
    flightTime = distance / Math.abs(vx);
  }
  return {originX, originY, vx, vy, flightTime, aimedX, impactX, targetVelocity};
}

export function launchRocket(unit, target, random) {
  const spread = rocketSpread(Math.abs(target.x - unit.x));
  const error = (random() * 2 - 1) * spread;
  const plan = planRocketShot(unit, target, error);
  return {team: unit.team, shooterId: unit.id, ...plan, x: plan.originX, y: plan.originY,
    ground: unit.y, targetId: target.id, targetX: target.x, spread, error, age: 0};
}

export function rocketPosition(rocket, age) {
  const t = Math.min(age, rocket.flightTime);
  return {x: rocket.originX + rocket.vx * t,
    y: rocket.originY + rocket.vy * t + WEAPONS.gravity * t * t / 2};
}

// Returns a projectile only after uninterrupted aim, then waits a full reload.
export function updateRocketWeapon(unit, target, dt, random) {
  const previousCooldown = unit.rocketCooldown || 0;
  unit.rocketCooldown = Math.max(0, previousCooldown - dt);
  const aimStep = Math.max(0, dt - previousCooldown);
  if (!target || target.id !== unit.rocketTargetId) {
    unit.rocketAimTime = 0;
    unit.rocketTargetId = target?.id ?? null;
  }
  unit.rocketGoal = target ? {targetId: target.id, ...planRocketShot(unit, target)} : null;
  if (!target || unit.rocketCooldown > 1e-9) return null;
  unit.rocketAimTime = (unit.rocketAimTime || 0) + aimStep;
  if (unit.rocketAimTime + 1e-9 < WEAPONS.rocketAimSeconds) return null;
  unit.rocketAimTime = 0;
  unit.rocketCooldown = WEAPONS.rocketReloadSeconds;
  return launchRocket(unit, target, random);
}

export function stationedBase(unit, bases) {
  if (!unit.arrived || unit.hp <= 0) return null;
  return bases.find(base => !base.main && base.defensePoints!==0 && base.team === unit.team && base.x === unit.guardBase &&
    base.slots[unit.type]?.includes(unit.id)) ?? null;
}

export function applyDamage(unit, amount) {
  const previous = unit.hp;
  const remaining = previous - amount;
  unit.hp = remaining < 1e-9 ? 0 : remaining;
  if (amount > 0) unit.hitFlash = 0.15;
  return {id: unit.id, amount: previous - unit.hp, hp: unit.hp};
}

export function resolveRifleHit(unit, bases, random) {
  const cover = stationedBase(unit, bases);
  const damage = cover ? (random() < WEAPONS.bunkerBulletChance ? WEAPONS.bunkerBulletDamage : 0) : 1;
  if (cover) cover.coverFlash = 0.12;
  return {covered: !!cover, ...applyDamage(unit, damage)};
}

export function resolveRocketBlast(impactX, team, units, bases, random) {
  const hits = [];
  // BC-02: one shared event per affected bunker, not one event per occupant.
  for (const base of bases) {
    if (base.main || base.team === team || Math.abs(impactX - base.x) > WEAPONS.bunkerHalfWidth + WEAPONS.blastRadius) continue;
    const defenders = units.filter(unit => stationedBase(unit, [base]));
    if (!defenders.length) continue;
    const selected = defenders[Math.floor(random() * defenders.length)];
    base.coverFlash = 0.2;
    hits.push({covered: true, baseX: base.x, ...applyDamage(selected, WEAPONS.bunkerRocketDamage)});
  }
  for (const unit of units) {
    if (unit.hp <= 0 || unit.team === team || stationedBase(unit, bases)) continue;
    const distance = Math.abs(unit.x - impactX);
    if (distance < WEAPONS.blastRadius) {
      hits.push({covered: false, ...applyDamage(unit, WEAPONS.blastDamage * (1 - distance / WEAPONS.blastRadius))});
    }
  }
  return hits;
}
