#!/usr/bin/env python3
"""work-dag: track multi-step work as a trunk of main steps plus branches (a DAG).

A node has one primary parent (its home in the tree) and optionally extra parents
added with `link`, so the structure is a DAG. `show` renders it as a tree and marks
second-parent appearances with "(also under X)". A cursor marks where work is now.

State file, first match wins:  --state PATH  >  $WORK_DAG_STATE  >  ./.work-dag/dag.json

Commands:
  init "root title" [--trunk "step 1" "step 2" ...] [--force]
  show [--mermaid] [--notes]       render the tree (cursor marked >)
  export [--markdown]              markdown snapshot, for pasting into a doc or chat
  where                            cursor, path from root, notes, outputs, children
  add PARENT "title" [--trunk] [--note TEXT]   add a node under PARENT
  branch "title" [--note TEXT]     add a branch under the cursor and move into it
  go ID                            move the cursor to ID (pending/parked -> active)
  done [ID] [--note TEXT]          mark ID (default: cursor) done
  revise ID --note TEXT            reopen ID, record why, move the cursor there
  park ID [--note TEXT]            set ID aside without finishing it
  trunk                            move the cursor to the nearest trunk ancestor
  next                             move to the next pending trunk step
  link PARENT CHILD                add an extra parent to CHILD (rejects cycles)
  note ID TEXT                     append a dated note to ID
  out ID PATH                      record an output (file path) produced by ID
  rename ID "new title"            change a node's title
  log [N]                          last N history events (default 15)
"""
import argparse
import datetime as dt
import json
import os
import pathlib
import re
import sys

MARK = {"pending": "○", "active": "●", "done": "✓", "revising": "✎", "parked": "⏸"}
STATUSES = list(MARK)
SCHEMA_VERSION = 1


class DagError(Exception):
    """A user-facing mistake; reported as one line, never a traceback."""


# ---------------------------------------------------------------- state I/O

def state_path(arg):
    if arg:
        return pathlib.Path(arg)
    env = os.environ.get("WORK_DAG_STATE")
    if env:
        return pathlib.Path(env)
    return pathlib.Path.cwd() / ".work-dag" / "dag.json"


def now():
    return dt.datetime.now().isoformat(timespec="minutes")


def load(path):
    if not path.exists():
        raise DagError(f"no state file at {path}. Create one with: init \"root title\"")
    try:
        s = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        raise DagError(f"cannot read state file {path}: {e}")
    if (not isinstance(s, dict) or not all(k in s for k in ("root", "cursor", "nodes", "history"))
            or s["root"] not in s["nodes"] or s["cursor"] not in s["nodes"]):
        raise DagError(f"{path} is not a valid work-dag state file")
    return s


def save(path, s):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(s, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(str(tmp), str(path))


def event(s, kind, node, text=""):
    s["history"].append({"at": now(), "event": kind, "node": node, "text": text})


def clean(text, what="title"):
    text = " ".join(str(text).split())
    if not text:
        raise DagError(f"{what} must not be empty")
    return text


def dated(text):
    return f"[{dt.date.today().isoformat()}] {text}"


# ---------------------------------------------------------------- graph helpers

def num(nid):
    m = re.search(r"(\d+)$", nid)
    return int(m.group(1)) if m else 0


def resolve(s, nid):
    """Return the canonical ID for user input (case-insensitive) or raise."""
    if nid in s["nodes"]:
        return nid
    if nid.upper() in s["nodes"]:
        return nid.upper()
    known = ", ".join(sorted(s["nodes"], key=lambda k: (k[0], num(k))))
    raise DagError(f"unknown node '{nid}'. Known IDs: {known}")


def new_id(s, trunk):
    prefix = "T" if trunk else "B"
    nums = [num(k) for k in s["nodes"] if k.startswith(prefix) and re.fullmatch(prefix + r"\d+", k)]
    return f"{prefix}{max(nums, default=0) + 1}"


def children(s, nid):
    return sorted((k for k, v in s["nodes"].items() if nid in v["parents"]),
                  key=lambda k: (not s["nodes"][k]["trunk"], num(k)))


def descendants(s, nid):
    out, stack = set(), [nid]
    while stack:
        for k in children(s, stack.pop()):
            if k not in out:
                out.add(k)
                stack.append(k)
    return out


def trunk_ancestor(s, nid):
    seen = set()
    while not s["nodes"][nid]["trunk"] and s["nodes"][nid]["parents"] and nid not in seen:
        seen.add(nid)
        nid = s["nodes"][nid]["parents"][0]
    return nid


def path_to(s, nid):
    out = [nid]
    while s["nodes"][out[-1]]["parents"] and len(out) <= len(s["nodes"]):
        out.append(s["nodes"][out[-1]]["parents"][0])
    return list(reversed(out))


def add_node(s, parent, title, trunk=False, note=""):
    parent = resolve(s, parent)
    nid = new_id(s, trunk)
    s["nodes"][nid] = {"title": clean(title), "trunk": trunk, "status": "pending",
                       "parents": [parent], "notes": [dated(note)] if note else [], "outputs": []}
    event(s, "add", nid, s["nodes"][nid]["title"])
    return nid


# ---------------------------------------------------------------- rendering

def render(s, notes=False):
    lines = []

    def walk(nid, prefix, last, via):
        n = s["nodes"][nid]
        here = "▶ " if nid == s["cursor"] else ""
        tag = "" if n["trunk"] or nid == s["root"] else " ·branch"
        primary = n["parents"][0] if n["parents"] else None
        also = f"  (also under {primary})" if via is not None and via != primary else ""
        conn = "" if nid == s["root"] else ("└─ " if last else "├─ ")
        lines.append(f"{prefix}{conn}{here}{MARK[n['status']]} {nid} {n['title']}{tag}{also}")
        sub = prefix + ("" if nid == s["root"] else ("   " if last else "│  "))
        if also:
            return  # children are drawn once, under the primary parent
        if notes:
            for t in n["notes"]:
                lines.append(f"{sub}   · {t}")
            for o in n["outputs"]:
                lines.append(f"{sub}   → {o}")
        kids = children(s, nid)
        for i, k in enumerate(kids):
            walk(k, sub, i == len(kids) - 1, nid)

    walk(s["root"], "", True, None)
    legend = "  ".join(f"{v} {k}" for k, v in MARK.items())
    return "\n".join(lines) + f"\n\n{legend}   ▶ cursor"


def render_markdown(s):
    root = s["nodes"][s["root"]]
    cur = s["nodes"][s["cursor"]]
    out = [f"# {root['title']}", "",
           f"_Snapshot {now()} · cursor: {s['cursor']} {cur['title']}_", ""]

    def walk(nid, depth, via):
        n = s["nodes"][nid]
        pad = "  " * depth
        primary = n["parents"][0] if n["parents"] else None
        also = f" (also under {primary})" if via != primary else ""
        here = " ◀ here" if nid == s["cursor"] else ""
        kind = "" if n["trunk"] else " _(branch)_"
        out.append(f"{pad}- {MARK[n['status']]} **{nid}** {n['title']}{kind}{also}{here}")
        if also:
            return
        for t in n["notes"]:
            out.append(f"{pad}  - _note:_ {t}")
        for o in n["outputs"]:
            out.append(f"{pad}  - _output:_ `{o}`")
        for k in children(s, nid):
            walk(k, depth + 1, nid)

    if root["notes"]:
        out += [f"_{t}_" for t in root["notes"]] + [""]
    for k in children(s, s["root"]):
        walk(k, 0, s["root"])
    out += ["", "Legend: " + "  ".join(f"{v} {k}" for k, v in MARK.items())]
    return "\n".join(out)


def mermaid(s):
    out = ["graph TD"]
    for k, v in s["nodes"].items():
        label = f"{MARK[v['status']]} {k} {v['title']}".replace('"', "'")
        shape = f'["{label}"]' if (v["trunk"] or k == s["root"]) else f'("{label}")'
        out.append(f"  {k}{shape}")
    for k, v in s["nodes"].items():
        for i, p in enumerate(v["parents"]):
            out.append(f"  {p} {'-->' if i == 0 else '-.->'} {k}")
    out += ["  classDef done fill:#d9f2d9,stroke:#2e7d32",
            "  classDef active fill:#fff3c4,stroke:#b58900",
            "  classDef revising fill:#ffe0b2,stroke:#e65100",
            "  classDef parked fill:#eeeeee,stroke:#888,stroke-dasharray:4"]
    for st in ("done", "active", "revising", "parked"):
        ids = [k for k, v in s["nodes"].items() if v["status"] == st]
        if ids:
            out.append(f"  class {','.join(ids)} {st}")
    out.append(f"  style {s['cursor']} stroke-width:4px")
    return "\n".join(out)


# ---------------------------------------------------------------- commands

def cmd_init(a):
    path = state_path(a.state)
    if path.exists() and not a.force:
        raise DagError(f"{path} already exists; use --force to overwrite it")
    root = clean(a.title, "root title")
    s = {"version": SCHEMA_VERSION, "root": "R0", "cursor": "R0", "history": [],
         "nodes": {"R0": {"title": root, "trunk": True, "status": "active",
                          "parents": [], "notes": [], "outputs": []}}}
    event(s, "init", "R0", root)
    for t in a.trunk or []:
        add_node(s, "R0", t, trunk=True)
    save(path, s)
    return s, None


def cmd_add(s, a):
    return add_node(s, a.parent, a.title, a.trunk, a.note), True


def cmd_branch(s, a):
    nid = add_node(s, s["cursor"], a.title, False, a.note)
    s["cursor"] = nid
    s["nodes"][nid]["status"] = "active"
    event(s, "enter", nid)
    return nid, True


def cmd_go(s, a):
    nid = resolve(s, a.id)
    s["cursor"] = nid
    if s["nodes"][nid]["status"] in ("pending", "parked"):
        s["nodes"][nid]["status"] = "active"
    event(s, "go", nid)
    return None, True


def cmd_done(s, a):
    nid = resolve(s, a.id) if a.id else s["cursor"]
    s["nodes"][nid]["status"] = "done"
    if a.note:
        s["nodes"][nid]["notes"].append(dated(a.note))
    event(s, "done", nid, a.note)
    return None, True


def cmd_revise(s, a):
    nid = resolve(s, a.id)
    s["nodes"][nid]["status"] = "revising"
    s["nodes"][nid]["notes"].append(dated(f"revise: {a.note}"))
    s["cursor"] = nid
    event(s, "revise", nid, a.note)
    return None, True


def cmd_park(s, a):
    nid = resolve(s, a.id)
    s["nodes"][nid]["status"] = "parked"
    if a.note:
        s["nodes"][nid]["notes"].append(dated(a.note))
    event(s, "park", nid, a.note)
    return None, True


def cmd_trunk(s, a):
    s["cursor"] = trunk_ancestor(s, s["cursor"])
    event(s, "trunk", s["cursor"])
    return None, True


def cmd_next(s, a):
    steps = sorted((k for k, v in s["nodes"].items()
                    if v["trunk"] and k != s["root"] and v["status"] == "pending"), key=num)
    if not steps:
        raise DagError("no pending trunk steps (all are done, active, revising or parked)")
    s["cursor"] = steps[0]
    s["nodes"][steps[0]]["status"] = "active"
    event(s, "next", steps[0])
    return steps[0], True


def cmd_link(s, a):
    parent, child = resolve(s, a.parent), resolve(s, a.child)
    if child == s["root"]:
        raise DagError("the root cannot have a parent")
    if parent == child:
        raise DagError(f"cannot link {child} to itself")
    if parent in s["nodes"][child]["parents"]:
        raise DagError(f"{parent} is already a parent of {child}")
    if parent in descendants(s, child):
        raise DagError(f"link {parent} -> {child} would create a cycle ({parent} is below {child})")
    s["nodes"][child]["parents"].append(parent)
    event(s, "link", child, f"extra parent {parent}")
    return None, True


def cmd_note(s, a):
    nid = resolve(s, a.id)
    s["nodes"][nid]["notes"].append(dated(clean(a.text, "note")))
    event(s, "note", nid, a.text)
    return None, True


def cmd_out(s, a):
    nid = resolve(s, a.id)
    s["nodes"][nid]["outputs"].append(clean(a.path, "path"))
    event(s, "output", nid, a.path)
    return None, True


def cmd_rename(s, a):
    nid = resolve(s, a.id)
    old = s["nodes"][nid]["title"]
    s["nodes"][nid]["title"] = clean(a.title)
    event(s, "rename", nid, f"{old} -> {s['nodes'][nid]['title']}")
    return None, True


MUTATORS = {"add": cmd_add, "branch": cmd_branch, "go": cmd_go, "done": cmd_done,
            "revise": cmd_revise, "park": cmd_park, "trunk": cmd_trunk, "next": cmd_next,
            "link": cmd_link, "note": cmd_note, "out": cmd_out, "rename": cmd_rename}


def cmd_where(s):
    n = s["nodes"][s["cursor"]]
    print(" → ".join(f"{k} {s['nodes'][k]['title']}" for k in path_to(s, s["cursor"])))
    print(f"  status: {n['status']}")
    for t in n["notes"]:
        print(f"  · {t}")
    for o in n["outputs"]:
        print(f"  → {o}")
    for k in children(s, s["cursor"]):
        print(f"  child: {MARK[s['nodes'][k]['status']]} {k} {s['nodes'][k]['title']}")


def cmd_log(s, a):
    for e in s["history"][-a.n:] if a.n > 0 else []:
        print(f"{e['at']}  {e['event']:<7} {e['node']:<4} {e['text']}")


# ---------------------------------------------------------------- CLI

def build_parser():
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--state", type=pathlib.Path, default=argparse.SUPPRESS,
                        help="state file (default: $WORK_DAG_STATE or ./.work-dag/dag.json)")
    common.add_argument("-q", "--quiet", action="store_true", default=argparse.SUPPRESS,
                        help="do not print the tree after a change")
    ap = argparse.ArgumentParser(prog="dag.py", parents=[common], description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", metavar="COMMAND")
    sub.required = True

    def P(name, **kw):
        return sub.add_parser(name, parents=[common], **kw)

    p = P("init"); p.add_argument("title")
    p.add_argument("--trunk", nargs="*", metavar="STEP", help="trunk steps to create")
    p.add_argument("--force", action="store_true", help="overwrite an existing state file")
    p = P("show"); p.add_argument("--mermaid", action="store_true")
    p.add_argument("--notes", action="store_true", help="include notes and outputs")
    p = P("export"); p.add_argument("--markdown", action="store_true", help="(default and only format)")
    P("where")
    p = P("log"); p.add_argument("n", nargs="?", type=int, default=15)
    p = P("add"); p.add_argument("parent"); p.add_argument("title")
    p.add_argument("--trunk", action="store_true"); p.add_argument("--note", default="")
    p = P("branch"); p.add_argument("title"); p.add_argument("--note", default="")
    p = P("go"); p.add_argument("id")
    p = P("done"); p.add_argument("id", nargs="?"); p.add_argument("--note", default="")
    p = P("revise"); p.add_argument("id"); p.add_argument("--note", required=True)
    p = P("park"); p.add_argument("id"); p.add_argument("--note", default="")
    P("trunk"); P("next")
    p = P("link"); p.add_argument("parent"); p.add_argument("child")
    p = P("note"); p.add_argument("id"); p.add_argument("text")
    p = P("out"); p.add_argument("id"); p.add_argument("path")
    p = P("rename"); p.add_argument("id"); p.add_argument("title")
    return ap


def run(a):
    a.state, a.quiet = getattr(a, "state", None), getattr(a, "quiet", False)
    path = state_path(a.state)
    if a.cmd == "init":
        s, _ = cmd_init(a)
        if not a.quiet:
            print(render(s))
        return
    s = load(path)
    if a.cmd == "show":
        print(mermaid(s) if a.mermaid else render(s, a.notes))
    elif a.cmd == "export":
        print(render_markdown(s))
    elif a.cmd == "where":
        cmd_where(s)
    elif a.cmd == "log":
        cmd_log(s, a)
    else:
        first, _ = MUTATORS[a.cmd](s, a)
        save(path, s)
        if first:
            print(first)
        if not a.quiet:
            print(render(s))


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass
    a = build_parser().parse_args(argv)
    try:
        run(a)
    except DagError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    except OSError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
