---
name: work-dag
description: Track long, multi-step work as a main course (trunk) of ordered steps with branches for refinement, a cursor showing where we are, and a history log. Use when the user wants to steer multi-step work step by step, asks to "show the tree", "where are we", "what's the plan/status", wants to go down a branch to refine or revise a step, park something, return to the trunk or go to the next step, or says things like "trunk and branch", "work DAG", "task tree", "back to the main line". Also use proactively at the start of any long multi-step effort the user wants to keep steerable.
---

# work-dag: trunk-and-branch task tracking

The user steers long work as a **trunk** of ordered steps. When a step needs refinement they go down a **branch** (possibly several levels), revise it, then **return to the trunk** and continue. This skill keeps that structure in a small JSON file and renders it as a tree, so both of you always know where the work stands.

## Codex workflow integration

Invoke with `$work-dag` followed by a goal or request. Resolve `scripts/dag.py` relative to this SKILL.md's actual directory and quote that path when running Python. Run from the project root so state stays with the project.

Before `init`, check the state path selected by `--state`, `WORK_DAG_STATE`, or `.work-dag/dag.json`. If it exists, run `show --notes` and `where` and resume it. Never use `--force` without an explicit reset request. If no plan exists for ongoing work, reconstruct a concise plan from the current task and evidence; mark completed steps only when evidence supports completion. Keep unverified work pending or active and record the gap in a note.

Continue already authorized work through routine checkpoints. Ask for a branch choice only when the user's preference is needed. Existing project instructions, requirement IDs, verification gates, and acceptance rules remain in effect. A node marked done is a tracking entry, not independent proof of feature acceptance or deployment. This skill records work; it does not execute a pipeline or enforce dependency prerequisites. DAG links record extra parent relationships and `next` only selects pending trunk steps.

Use a single writer for each state file. Do not have parallel agents mutate the same state; send updates to the coordinating agent. State is not shared automatically between repositories, branches, or running cloud sessions. Commit `.work-dag/dag.json` when the plan should persist for future tasks; otherwise keep it local deliberately. Avoid secrets and personal data in tracked state.

## Concepts

- **Trunk**: the main course. Ids `T1, T2, ...`, done in order. The root is `R0` (the overall goal).
- **Branch**: a refinement under any node (trunk step or another branch). Ids `B1, B2, ...`. Branches nest to any depth.
- **Cursor** `▶`: the node being worked on now. `where` prints it with its path from the root.
- **DAG link**: a branch's outcome sometimes feeds a later trunk step. `link PARENT CHILD` gives CHILD an extra parent. The tree shows the node under its first (primary) parent and marks other appearances `(also under X)`. Cycles are rejected.
- **Statuses**: `○ pending`, `● active`, `✓ done`, `✎ revising`, `⏸ parked`.
- **Notes** (decisions and why) and **outputs** (file paths) hang off any node. The **history** log records every move.

## When Codex should update the DAG

Update as the work happens, not afterwards:

- Starting a task the user wants tracked: `init` with the trunk steps you agreed on.
- Moving to a step: `next` (or `go ID`). Opening a refinement: `branch "title"`.
- A decision is made or a reason is given: `note` it immediately.
- A file is produced: `out ID path`.
- A step is finished: `done --note "result"`.
- The user changes their mind about finished work: `revise ID --note "why"`.
- Something is set aside or out of scope: `park ID --note "why"`.
- A branch result is needed by a later step: `link`.

Show the tree when the user asks, and at natural checkpoints (a step or branch closes, before choosing what is next, after a revision). At a checkpoint, present branch and trunk options when a user decision is needed; otherwise continue the authorized plan.

## Commands

The examples use `$DAG` as shorthand for `python3 "<skill-dir>/scripts/dag.py"`; substitute that actual command rather than storing a shell command in a string (`<skill-dir>` is the folder containing this SKILL.md, e.g. `~/.agents/skills/work-dag` or `<project>/.agents/skills/work-dag`). State file, first match wins: `--state PATH`, then `$WORK_DAG_STATE`, then `./.work-dag/dag.json`. Every change prints the new tree; `add` and `branch` print the new id on the first line. `-q` suppresses the tree. IDs are case-insensitive. Mistakes give a one-line `error:` and exit 1.

```
$DAG init "Plan a website migration" --trunk "Audit" "Build" "Launch"   # root title first; refuses to overwrite without --force
$DAG next                                   # move to the next pending trunk step (T1), mark active
$DAG branch "Crawl the old site" --note "need a URL inventory"          # new branch under the cursor, cursor moves into it
$DAG branch "Map redirects"                 # nested branch
$DAG done --note "301 map in redirects.csv" # finish the cursor (or: done ID)
$DAG out B2 docs/redirects.csv              # record an output file
$DAG trunk                                  # cursor back to the nearest trunk ancestor
$DAG revise B1 --note "crawl missed subdomains"   # reopen, record why, cursor moves there
$DAG park T3 --note "waiting on DNS access"       # set aside
$DAG go B1                                  # move the cursor anywhere
$DAG add T2 "Pick a CMS"                    # add a branch under any node (--trunk for a trunk step, under R0)
$DAG link T2 B2                             # B2 also feeds T2 (extra parent); cycles rejected
$DAG note T2 "decided: static site, owner: A, 2025-03-01"
$DAG rename B1 "Crawl old site and subdomains"
$DAG show                                   # the tree (--notes adds notes and outputs, --mermaid for a diagram)
$DAG export --markdown                      # snapshot for pasting into a doc or chat
$DAG where                                  # cursor, path, notes, outputs, children
$DAG log 10                                 # last 10 history events
```

Ordering: `init "title" --trunk a b c` (put the title before `--trunk`). `next` skips steps that are not pending, so after `revise` use `trunk`/`go` to return deliberately.

## Presenting the tree

Paste the `show` output in a code block, then one line saying where the cursor is and, when a decision is needed, the options (e.g. "On B2 under T1. Revise here, or back to the trunk for T2?"). For longer notes use `show --notes`; for a document or ticket use `export --markdown`; for a diagram use `show --mermaid` in a mermaid code fence. Do not paraphrase the tree from memory; run the command.

## Conventions

- Titles are short (under about 60 characters), verb-first for steps, noun phrases for branches. Detail goes in notes.
- Record decisions as notes with who and when and the reason: `decided: X because Y (owner, date)`. Dates are prefixed automatically; add the who.
- Outputs are paths relative to the project root.
- Facts, sources and unresolved questions that outlive a step belong in the optional evidence ledger (below), referenced from the node by id.
- Never rewrite `dag.json` by hand; use the commands so the history stays truthful.
- Do not put secrets or personal data in titles, notes or paths; the file may be committed.

## Set up in a new project

1. Copy this folder to `~/.agents/skills/work-dag/` (all projects) or `<project>/.agents/skills/work-dag/` (one project). Python 3.9+, standard library only.
2. In the project root run `$DAG init "Overall goal" --trunk "Step 1" "Step 2"`. This creates `.work-dag/dag.json`; commit it to share the plan, or gitignore `.work-dag/` to keep it private.
3. Optionally point at another file with `WORK_DAG_STATE`.
4. Tests: `python3 -I -m unittest discover -s <skill-dir>/tests -v`.

## Optional companion: evidence ledger

`templates/evidence-ledger.md` is a markdown template: facts with id, claim, status (VERIFIED / INFERRED / NOT MEASURED), source and the DAG step that produced them; a review queue for out-of-scope findings needing a human decision; and open questions. Copy it into the project (e.g. `docs/evidence-ledger.md`) when the work must be auditable, and link rows to nodes via the "DAG step" column. Skip it for lightweight work.
