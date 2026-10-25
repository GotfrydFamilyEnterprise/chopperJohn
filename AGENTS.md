# ChopperJohn agent instructions

Read `docs/specs/requirements.md`, `docs/specs/acceptance.md`, and `docs/specs/implementation-status.md` before making changes. The requirements are authoritative over current code.

## Nonnegotiable rules
- Do not change legacy Unity `Assets/`, `Library/`, `ProjectSettings/` or the original solution file.
- Preserve Flight School (`docs/index.html`) unless its change is explicitly requested.
- Implement browser game features in separate modules under `docs/js/battlefield/`.
- Each requirement has an ID; reference IDs in code changes, tests and PR summaries.
- Never equate code commit, syntax success, or visual similarity with behavioral correctness.
- Use deterministic game simulation and Playwright tests. Capture screenshots for visual criteria. Execute tests before marking complete.
- Run an independent adversarial review, with a separate review prompt/agent and no reliance on implementer's assertions (see `docs/quality/adversarial-review.md`).
- Work on a branch and create PRs; avoid direct-to-master gameplay implementation. Do not merge without user acceptance.
- For each PR, update implementation status with evidence and known failures.
- Do not invent completed tests or claim that a page is deployed without verifying it.

## Completion gate
A feature is DONE only if its requirements map to executable assertions, relevant tests pass in a real browser, screenshots have been inspected for visual fidelity, and an independent reviewer finds no blocking discrepancies. Anything else is PARTIAL or UNVERIFIED.

## Mobile workflow
User operates Codex Cloud from iPhone. PR links, short test reports, screenshots and clear review steps must be usable on mobile.
