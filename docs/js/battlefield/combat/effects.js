import {WEAPONS, rocketPosition} from './weapons.js';

// RC-06: analytic trails share the projectile's real trajectory; no visual RNG.
export function drawCombatEffects(ctx, rockets, explosions, impacts) {
  for (const rocket of rockets) {
    ctx.strokeStyle = '#e9c88d'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const p = rocketPosition(rocket, Math.max(0, rocket.age - (8 - i) * 0.025));
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.save(); ctx.translate(rocket.x, rocket.y);
    ctx.rotate(Math.atan2(rocket.vy + WEAPONS.gravity * rocket.age, rocket.vx));
    ctx.fillStyle = '#ffad42'; ctx.beginPath();
    ctx.moveTo(-7, -3); ctx.lineTo(-17, 0); ctx.lineTo(-7, 3); ctx.fill();
    ctx.fillStyle = '#e6e6c4'; ctx.fillRect(-7, -2.5, 11, 5);
    ctx.beginPath(); ctx.moveTo(4, -3); ctx.lineTo(10, 0); ctx.lineTo(4, 3); ctx.fill();
    ctx.restore();
  }
  for (const explosion of explosions) {
    const life = explosion.age / 0.65;
    ctx.save(); ctx.globalAlpha = Math.max(0, 1 - life);
    ctx.fillStyle = explosion.age < 0.12 ? '#ffed9c' : '#b49a74';
    ctx.beginPath(); ctx.ellipse(explosion.x, explosion.y - 7, 8 + 17 * Math.min(1, life * 4), 8 + 20 * life, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f1b265'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(explosion.x, explosion.y, WEAPONS.blastRadius, explosion.air?WEAPONS.blastRadius:5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#a68c68';
    for (let i = 0; i < 6; i++) {
      const x = explosion.x + (i - 2.5) * life * 14;
      const y = explosion.y - Math.sin(Math.PI * life) * (12 + i % 3 * 7);
      ctx.fillRect(x, y, 3, 3);
    }
    ctx.restore();
  }
  for (const impact of impacts) {
    ctx.save(); ctx.globalAlpha = Math.max(0, 1 - impact.age / 0.16);
    ctx.strokeStyle = impact.covered ? '#f3ce83' : '#fff0bc'; ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(impact.x, impact.y);
      ctx.lineTo(impact.x + i * 7, impact.y - 6 - Math.abs(i) * 3); ctx.stroke();
    }
    ctx.restore();
  }
}
