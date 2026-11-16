# Independent review: Codex work-dag installation

## Scope

Reviewed the proposed `.agents/skills/work-dag/` directory and appended Work DAG tracking section in each repository's AGENTS.md. This is developer workflow tracking; it changes no game source, CI configuration, art, or deployment. Gameplay acceptance, screenshot criteria, and production deployment are not evaluated and no claims are made about them.

The existing ChopperJohn and Manufacturing Shop Story instructions were inspected, along with relevant requirements/acceptance/QA documents. The new guidance explicitly preserves requirement IDs, verification gates, acceptance rules, and the distinction between a tracking status and evidence of completion. Existing sessions are correctly documented as requiring updated checkout contents and an explicit skill read rather than automatic synchronization.

## Independent evidence

- Executed `python3 -I -m unittest discover -s work/repo-content/chopperJohn/.agents/skills/work-dag/tests -v`: **16 tests passed**.
- Executed `python3 work/reviewer-probes.py`: both repository skill trees are byte-identical; `scripts/dag.py`, `tests/test_dag.py`, and `templates/evidence-ledger.md` match the uploaded original ZIP exactly.
- Targeted probes: `show --notes`, `where`, `log`, and Markdown export preserve state bytes/history; duplicate initialization refuses overwrite and preserves bytes; a rejected cyclic link preserves bytes; configured state is isolated from default state; paths with spaces work. **PASS**.
- Python helper uses the standard library and has no network calls or subprocess execution. The output-recording command records a path without reading or publishing that file.

## Findings

No introduced blocking defect found in the reviewed conversion or workflow instructions.

1. **Low, inherited documentation limitation:** SKILL.md says mistakes always give a one-line error and exit 1. Existing argparse usage errors exit 2, and malformed object-shaped JSON with missing node fields can produce a traceback. Reproduced malformed node schema using `{"root":"R0","cursor":"R0","nodes":{"R0":{}},"history":[]}`; `show` fails without modifying the state. The helper is unchanged from the user's ZIP. Prefer narrowing that documentation claim rather than treating successful valid-state tests as full corruption recovery.
2. **Existing operational limit:** writes use a fixed temporary filename without concurrency locking. The new skill explicitly directs one coordinating writer per state file; do not claim safe concurrent mutation.
3. **Repository completion reminder:** ChopperJohn requires a PR and user acceptance before merge, plus an implementation-status evidence update for each PR. These remain requirements for the submitting agent; the reviewed skill does not waive them.

## Recommendation

No blocking change requested for this workflow-only installation. This recommendation is limited to valid-state task tracking and the Codex integration instructions. It is not gameplay acceptance, automatic CI adoption, deployment verification, or permission to merge without the repository's required user acceptance.

## Documentation follow-up

After independent review, the inherited blanket error-handling claim in SKILL.md was narrowed to distinguish handled errors, argparse usage errors, and malformed state schemas. The Python helper and tests remain unchanged. Game/browser suites were not run for this workflow-only addition; no game source, art, or CI configuration changed and no gameplay acceptance is claimed.
