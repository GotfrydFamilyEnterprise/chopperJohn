import json
import os
import pathlib
import subprocess
import sys
import tempfile
import unittest

DAG = pathlib.Path(__file__).resolve().parent.parent / "scripts" / "dag.py"


class DagCase(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = pathlib.Path(self._tmp.name)
        self.env = {k: v for k, v in os.environ.items() if k != "WORK_DAG_STATE"}
        self.state = self.dir / ".work-dag" / "dag.json"

    def tearDown(self):
        self._tmp.cleanup()

    def run_dag(self, *args, env=None, ok=True):
        p = subprocess.run([sys.executable, "-I", str(DAG), *args], cwd=self.dir,
                           env=env or self.env, capture_output=True, text=True, encoding="utf-8")
        if ok:
            self.assertEqual(p.returncode, 0, p.stderr)
        else:
            self.assertEqual(p.returncode, 1, p.stdout + p.stderr)
        self.assertNotIn("Traceback", p.stderr)
        return p

    def data(self):
        return json.loads(self.state.read_text(encoding="utf-8"))

    def init(self):
        self.run_dag("init", "Plan a website migration", "--trunk", "Audit", "Build", "Launch")


class TestDag(DagCase):
    def test_init_creates_default_state_and_trunk(self):
        self.init()
        d = self.data()
        self.assertEqual(d["root"], "R0")
        self.assertEqual([k for k in d["nodes"]], ["R0", "T1", "T2", "T3"])
        self.assertTrue(all(d["nodes"][k]["trunk"] for k in d["nodes"]))

    def test_init_refuses_overwrite_then_force(self):
        self.init()
        p = self.run_dag("init", "Other", ok=False)
        self.assertIn("already exists", p.stderr)
        self.assertEqual(self.data()["nodes"]["R0"]["title"], "Plan a website migration")
        self.run_dag("init", "Other", "--force")
        self.assertEqual(self.data()["nodes"]["R0"]["title"], "Other")

    def test_env_var_state_path_and_flag_precedence(self):
        envpath = self.dir / "elsewhere" / "x.json"
        env = dict(self.env, WORK_DAG_STATE=str(envpath))
        self.run_dag("init", "Env root", env=env)
        self.assertTrue(envpath.exists())
        self.assertFalse(self.state.exists())
        flagpath = self.dir / "flag.json"
        self.run_dag("--state", str(flagpath), "init", "Flag root", env=env)
        self.assertTrue(flagpath.exists())
        self.assertEqual(json.loads(envpath.read_text())["nodes"]["R0"]["title"], "Env root")

    def test_missing_state_is_a_clear_error(self):
        p = self.run_dag("show", ok=False)
        self.assertIn("init", p.stderr)

    def test_trunk_next_branch_nested_done(self):
        self.init()
        self.assertEqual(self.run_dag("next").stdout.splitlines()[0], "T1")
        self.assertEqual(self.data()["cursor"], "T1")
        self.assertEqual(self.run_dag("branch", "Crawl old site").stdout.splitlines()[0], "B1")
        self.assertEqual(self.run_dag("branch", "Handle redirects", "--note", "why: SEO").stdout.splitlines()[0], "B2")
        d = self.data()
        self.assertEqual(d["nodes"]["B2"]["parents"], ["B1"])
        self.assertIn("why: SEO", d["nodes"]["B2"]["notes"][0])
        self.run_dag("done", "--note", "301s mapped")
        self.assertEqual(self.data()["nodes"]["B2"]["status"], "done")
        self.run_dag("trunk")
        self.assertEqual(self.data()["cursor"], "T1")
        self.run_dag("done")
        self.run_dag("next")
        self.assertEqual(self.data()["cursor"], "T2")

    def test_add_under_parent_and_trunk_flag(self):
        self.init()
        self.assertEqual(self.run_dag("add", "T2", "Pick CMS").stdout.splitlines()[0], "B1")
        self.assertEqual(self.run_dag("add", "R0", "Retrospective", "--trunk").stdout.splitlines()[0], "T4")

    def test_revise_park_and_go(self):
        self.init()
        self.run_dag("next"); self.run_dag("done")
        self.run_dag("revise", "T1", "--note", "new requirement")
        d = self.data()
        self.assertEqual(d["nodes"]["T1"]["status"], "revising")
        self.assertEqual(d["cursor"], "T1")
        self.assertIn("revise: new requirement", d["nodes"]["T1"]["notes"][-1])
        self.run_dag("park", "T3", "--note", "later")
        self.assertEqual(self.data()["nodes"]["T3"]["status"], "parked")
        self.run_dag("go", "t3")  # case-insensitive
        self.assertEqual(self.data()["nodes"]["T3"]["status"], "active")
        # --note is required: argparse usage error, exit 2, no traceback
        q = subprocess.run([sys.executable, "-I", str(DAG), "revise", "T1"], cwd=self.dir,
                           env=self.env, capture_output=True, text=True)
        self.assertEqual(q.returncode, 2)
        self.assertNotIn("Traceback", q.stderr)

    def test_next_with_nothing_pending(self):
        self.run_dag("init", "Solo")
        self.assertIn("no pending", self.run_dag("next", ok=False).stderr)

    def test_link_makes_dag_and_rejects_cycles(self):
        self.init()
        self.run_dag("next"); self.run_dag("branch", "Spike"); self.run_dag("trunk")
        self.run_dag("link", "T2", "B1")
        self.assertEqual(self.data()["nodes"]["B1"]["parents"], ["T1", "T2"])
        tree = self.run_dag("show").stdout
        self.assertIn("(also under T1)", tree)
        self.assertEqual(tree.count("B1 Spike"), 2)
        # cycles: B1 -> T1 would make T1 a descendant of itself
        self.assertIn("cycle", self.run_dag("link", "B1", "T1", ok=False).stderr)
        self.assertIn("itself", self.run_dag("link", "T2", "T2", ok=False).stderr)
        self.assertIn("already", self.run_dag("link", "T2", "B1", ok=False).stderr)
        self.assertIn("root", self.run_dag("link", "T1", "R0", ok=False).stderr)
        self.assertEqual(self.data()["nodes"]["T1"]["parents"], ["R0"])

    def test_note_out_where_and_show_notes(self):
        self.init()
        self.run_dag("next")
        self.run_dag("note", "T1", "decided: keep URLs")
        self.run_dag("out", "T1", "docs/audit.md")
        w = self.run_dag("where").stdout
        self.assertIn("T1 Audit", w)
        self.assertIn("decided: keep URLs", w)
        self.assertIn("docs/audit.md", w)
        shown = self.run_dag("show", "--notes").stdout
        self.assertIn("docs/audit.md", shown)
        self.assertNotIn("docs/audit.md", self.run_dag("show").stdout)

    def test_show_marks_cursor_and_mermaid(self):
        self.init()
        self.run_dag("next"); self.run_dag("branch", 'Say "hi"')
        tree = self.run_dag("show").stdout
        self.assertIn("▶ ● B1", tree)
        self.assertIn("·branch", tree)
        m = self.run_dag("show", "--mermaid").stdout
        self.assertTrue(m.startswith("graph TD"))
        self.assertIn("T1 --> B1", m)
        self.assertIn("style B1 stroke-width:4px", m)
        self.assertNotIn('"hi"', m)

    def test_export_markdown(self):
        self.init()
        self.run_dag("next"); self.run_dag("note", "T1", "a decision")
        md = self.run_dag("export", "--markdown").stdout
        self.assertTrue(md.startswith("# Plan a website migration"))
        self.assertIn("**T1** Audit", md)
        self.assertIn("a decision", md)
        self.assertIn("◀ here", md)

    def test_rename_and_log(self):
        self.init()
        self.run_dag("rename", "T2", "Build the new site")
        self.assertEqual(self.data()["nodes"]["T2"]["title"], "Build the new site")
        log = self.run_dag("log", "2").stdout.splitlines()
        self.assertEqual(len(log), 2)
        self.assertIn("rename", log[-1])
        self.assertIn("error", self.run_dag("rename", "T2", "  ", ok=False).stderr)

    def test_unknown_id_errors_everywhere(self):
        self.init()
        for args in (["go", "X9"], ["done", "X9"], ["park", "X9"], ["revise", "X9", "--note", "n"],
                     ["note", "X9", "t"], ["out", "X9", "p"], ["rename", "X9", "t"],
                     ["add", "X9", "t"], ["link", "X9", "T1"], ["link", "T1", "X9"]):
            p = self.run_dag(*args, ok=False)
            self.assertIn("unknown node 'X9'", p.stderr, args)

    def test_ids_use_max_not_count(self):
        self.init()
        d = self.data()
        d["nodes"]["B7"] = {"title": "odd", "trunk": False, "status": "pending",
                            "parents": ["T1"], "notes": [], "outputs": []}
        self.state.write_text(json.dumps(d))
        self.assertEqual(self.run_dag("add", "T1", "new").stdout.splitlines()[0], "B8")

    def test_quiet_and_corrupt_state(self):
        self.init()
        self.assertEqual(self.run_dag("-q", "add", "T1", "x").stdout.strip(), "B1")
        self.state.write_text("{not json")
        self.assertIn("cannot read", self.run_dag("show", ok=False).stderr)


if __name__ == "__main__":
    unittest.main()
