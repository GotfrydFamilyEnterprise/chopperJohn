# Deterministic browser acceptance

Install Node 22+, Python 3, and Chromium:

```sh
npm ci
npx playwright install --with-deps chromium
npm test
```

Playwright serves `docs/` at localhost:8000 and uses a 390×844 phone viewport. `?test` disables requestAnimationFrame and exposes `window.battlefieldTest`. Each step advances exactly 1/60 second; reset disables combat, and tests opt back into combat explicitly. Combat randomness uses a resettable seeded stream. Normal URLs keep real-time gameplay and expose no test controller.

`reset()` restores initial HQ marching troops and both empty FOBs; `clear()` removes infantry for controlled scenarios; `spawn(team,type,x)` defaults to HQ spawn; `snapshot()` returns a detached state; `kill(id)`, `combat(boolean)`, `step(ticks)`, and `camera(worldX)` support lifecycle and combat probes. Reservations and physically arrived slot IDs are separate fields in snapshots.

- `tests/fob.spec.js`: both faction lifecycles, tick-by-tick movement limits, staged flag timing, distinct posts, stationary guards, bypass, vacancy/replacement, projectile HP damage.
- `tests/determinism.spec.js`: two complete HQ arrival runs compared at every recorded checkpoint.
- `tests/engagement.spec.js`: mirrored rifle slow-fire-walk and rocket stop during entry; close-range muzzle collision.
- Review tests: see the independent review report for extra probes and limitations.

Screenshots are saved in `docs/quality/evidence/`; Playwright attaches lifecycle JSON to results. CI uploads captures and test results. A Chromium phone viewport does not establish Safari or physical iPhone acceptance. GitHub Pages deployment is not implied by these local tests.


v0.7: normal URLs start paid red AI and retain blue manual deployment. Test API `reset()` and `clear()` disable the commander for isolated combat scenarios; `redAI(true)` enables it explicitly. Fresh test page loads use the real opening economy. Snapshots include `redCommander` with account/ledger, strategy, squads and events. `tests/red-economy.spec.js` covers real purchases, rally movement, casualties, cap and pause/reset; independently authored `tests/red-economy-review.spec.js` covers emergency preemption and both HUD orientations. `npm run test:unit` includes isolated economy/controller/order probes and independent negative tests.

v0.8: both factions start with the same free3-rifle/2-rocket grant and120 Supply, then use the same paid commander. `blueAI(true)`/`redAI(true)` independently enable test controllers after reset/clear. Both are enabled on fresh page loads and UI Reset. Existing isolated weapon/FOB tests still disable both controllers. Snapshots expose both accounts; `shared-economy-review.spec.js` independently tests mirrored accounting and movement, manual debit, pause/reset, seeded replay, bilateral natural rockets and both mobile HUD orientations. Local installed Chromium uses `PLAYWRIGHT_BROWSERS_PATH=/workspace/pw-browsers npm test`.
