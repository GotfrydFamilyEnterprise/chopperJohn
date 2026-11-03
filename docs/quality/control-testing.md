# Deterministic control hooks (CP-06)

Use `?test` on campaign.html, battlefield.html or terrain-lab.html. Production URLs attach no test controller. The interaction API lives at `campaignTest.interact`, `battlefieldTest.interact` or `terrainTest.interact`.

```js
await page.evaluate(() => campaignTest.interact.click('level-first-assault'));
await expect.poll(() => page.evaluate(() => campaignTest.snapshot().mode)).toBe('play');
await page.evaluate(() => campaignTest.interact.click('blueRifle'));
await page.evaluate(() => campaignTest.interact.advance(2));
await page.evaluate(() => campaignTest.interact.click('blueRocket'));
await page.evaluate(() => campaignTest.interact.joystick(0, -1));
await page.evaluate(() => campaignTest.interact.advance(1.5));
await page.evaluate(() => campaignTest.interact.releaseAll());
await page.evaluate(() => campaignTest.interact.hold('heliFire', 1));
await page.evaluate(() => campaignTest.interact.press('heliTurn'));
```

`list()` reports IDs/accessible text and blocking state. `click`/`select` invoke normal DOM handlers; `press`/`release`/`joystick` use the same pilot action handlers as real controls. Each result includes acceptance and current snapshot. Hidden, disabled, inert and modal-blocked buttons refuse activation. Held inputs retain the same flight/weapon gates and ammo costs. `advance(seconds)` steps the appropriate fixed clock (campaign/lab120Hz, classic60Hz), bounded0–300s and rounded to ticks. Battlefield/campaign pause, menu and result gates remain active. Terrain Lab supports manual stepping while playback is paused, and blocks interaction stepping during loading/editor states. Async level loads still require waiting for mode=play.

These are deterministic action hooks, not trusted pointer gestures. Keep real browser click, keyboard, touch, cancellation, long-press and fullscreen tests. Fullscreen APIs may reject synthetic actions because browser user activation is required; the hooks do not bypass that policy. Physical Safari remains a separate check.

Campaign v2.1 adds `blueSergeant` and `platoonTactic` to the same interaction registry. For example, open `menuToggle`, `select('platoonTactic','siege')`, close the menu, then `click('blueSergeant')`. This real button authorizes normal25/60-Supply recruitment/replacement for its platoon; ordinary manual buttons authorize only one unit. The next-platoon selector leaves existing groups unchanged. Read `snapshot().world.platoons` for roster/phase/queue state; no production URL exposes these hooks. Damage/position patches are fixture tools, used only in isolated lifecycle regressions, never in the natural strategy benchmark.
