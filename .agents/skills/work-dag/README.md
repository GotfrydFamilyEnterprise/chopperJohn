# work-dag for Codex

Track long work as ordered trunk steps, nested refinement branches, a cursor, decisions, outputs, and history. Python 3.9+, standard library only; no network access needed.

## Use in this repository

Invoke `$work-dag` followed by your task, or ask to show the tree, revise a step, or return to the trunk. The repository's AGENTS.md directs agents to use this skill for substantial multi-step work.

A running session may need to refresh its checkout and read `.agents/skills/work-dag/SKILL.md` explicitly. New tasks must use a branch containing the skill. Existing running sessions do not automatically receive repository changes.

From the project root:

```sh
python3 .agents/skills/work-dag/scripts/dag.py show --notes
python3 .agents/skills/work-dag/scripts/dag.py where
```

If there is no state, initialize a plan for the actual task:

```sh
python3 .agents/skills/work-dag/scripts/dag.py init "Overall goal" --trunk "Investigate" "Implement" "Verify"
python3 .agents/skills/work-dag/scripts/dag.py next
```

State defaults to `.work-dag/dag.json`; `--state` overrides `WORK_DAG_STATE`, which overrides the default. Resume existing state rather than reinitializing. Commit state to persist a plan between tasks, or deliberately keep it local. Never store secrets. Only one process should write a state file at a time.

## Tests

```sh
python3 -I -m unittest discover -s .agents/skills/work-dag/tests -v
```

The optional `templates/evidence-ledger.md` records evidence and unresolved questions. Tracking does not replace project tests, independent review, acceptance criteria, or deployment verification. DAG links are relationships, not executable dependency gates. No gameplay or CI configuration is changed by installing the skill.

To reuse elsewhere, copy this entire directory to `<project>/.agents/skills/work-dag/`. Local desktop/CLI installations may use `~/.agents/skills/work-dag/`.
