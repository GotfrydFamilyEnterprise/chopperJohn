# Red economy module boundaries

- `economy/supply.js`: sole owner of Supply accrual, cap, costs, reserve affordability, deployment cooldown and transaction ledger. Injected successful-spawn factory; no battlefield imports.
- `ai/strategy.js`: pure current-world observations and objective/composition selection. No money mutations, spawning, DOM or unit physics.
- `ai/squads.js`: squad membership, rally readiness, loss tracking and speed/goal directives. Never writes coordinates or damage.
- `ai/redCommander.js`: composes the preceding modules. Scene provides units/bases and the normal HQ spawn factory. Only this controller connects strategy to checked purchases.
- `ui/redEconomyPanel.js`: read-only presentation adapter; no purchasing or strategy decisions.
- `battlefieldScene.js`: creates/resets/ticks commander, injects spawn, passes movement limits into existing infantry updates and renders status. Existing combat modules retain weapon ownership.

Direct import tests execute economy/AI without a DOM or browser. Unit movement directives cap real step distance; they never teleport or modify underlying weapon stats. Test-mode `clear()` and explicit test reset disable AI so combat/FOB fixtures stay isolated; `redAI(true)` restores the real commander. Normal URLs always start red AI, with no free red army.

## v0.8 shared faction composition
`createCommander(team)` constructs independent accounts and squad state for both factions. `factionRules(team)` mirrors HQ/spawn/rally/defense/attack geometry; observation and movement project coordinates along the faction's direction. The existing red-prefixed file and exports remain compatibility entrypoints, not a second implementation. Scene passes each commander the same pre-purchase observation frame plus its own confirmed deployments, so purchase iteration order cannot reveal an opponent's same-tick purchase. Both opening grants are exactly3 rifles+2 rockets; these count toward population but do not enter the paid ledger. All later AI/manual deployments call `purchaseUnit` against the appropriate account. Blue buttons share the blue AI's balance, cooldown and population cap. The HUD adapter renders the same fields for each faction.
