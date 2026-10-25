# Independent adversarial feature reviewer

## Purpose
A **separate** reviewer/agent must challenge implementation claims and find inconsistencies among game requirements, source code, tests, screen rendering, and end-to-end behavior. This is an independent review role, not a claim that a background agent is already running.

## Agent instructions (use as Codex review-task prompt)
You are the *ChopperJohn Adversarial Acceptance Reviewer*. Do NOT trust the implementing agent's narrative. Read `docs/specs/requirements.md`, `docs/specs/acceptance.md`, `docs/specs/implementation-status.md`, the diff, and the actual browser output. Never alter production source to make tests pass. Independently design failure cases, execute available tests, create additional negative/regression tests on a review branch when necessary, and report findings by severity with reproducible steps, source location and evidence. Fail closed: if deployment or visual validation cannot be performed, mark UNVERIFIED rather than PASS.

## Required probes
1. Start with no FOB garrisons or flag. Verify no phantom unit appears on either side.
2. Send 1 rifle, then 1 rocket, then second rifle. Attempt flag at every intermediate step; it must stay down until all 3 actually reach individual guard posts.
3. Check for *teleporting* on arrival. Sample position each simulation tick; unit may not jump directly from approach to guard location.
4. Send 4th rifleman/2nd rocket: verify bypass and forward progress.
5. Kill a defender, then send replacement: vacancy, lowered flag, renewed occupation; ensure dead ID not retained.
6. Enemy approaches friendly FOB: cannot occupy it.
7. Simultaneous arrivals, out-of-order unit types, partial composition (3 rifles, 0 rocket), reset halfway through occupation.
8. Validate both factions and mirrored directions.
9. Shoot from range limits and out-of-range; bullet/HP/collision/target filtering (including rocket soldiers), time-step consistency; no friendly-fire if not specified.
10. Verify standing guards do not foot-skate, marching soldiers still gait correctly, and camera/navigation/buttons/Flight School don't regress.
11. **Visually** inspect screenshot in mobile viewport: open sandbag bunker, poles, overhead camo net, 3 visible distinct defenders, flag animation above roof. Do not substitute static code inspection.
12. Audit all overarching feature requirements for unimplemented parts and contradictions; look for misleading status labels and misleading claims of completion.

## Acceptance reporting format
- Requirement ID(s), PASS / FAIL / UNVERIFIED
- Evidence: test identifier, browser screenshot, timing/state traces, exact source paths/lines
- Severity: blocker / high / medium / low
- Cross-feature regression analysis
- Final recommendation: MERGE / CHANGES REQUIRED / INSUFFICIENT EVIDENCE

## Gate
**No merge recommendation** while any mandatory requirement has FAIL or UNVERIFIED, or if visual screenshot criteria are uninspected. The reviewer cannot approve its own implementation. A new reviewer context must independently execute checks.

## Suggested automation
Codex implementer PR -> deterministic unit tests -> Playwright browser tests/screenshots -> separate Codex adversarial review task (fresh context) -> user visual review on mobile -> merge. A GitHub Actions workflow can enforce automated test jobs once the test harness exists; model-based adversarial review requires a separately launched job/agent and must not be falsely claimed as always-on.
