import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.error
import urllib.request

HERE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("harness", HERE / "harness.py")
h = importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)


def event(kind, **item):
    return {"type": "item.completed", "item": {"type": kind, **item}}


def skill_read(revision="v1", **kwargs):
    return event("mcp_tool_call", tool="executor.skills", status="completed",
                 arguments={"app": "test-skills", "name": "test"},
                 result={"structured_content": {"name": "test", "file": "SKILL.md",
                         "content": "Real skill text", "revision": revision}}, **kwargs)


FAKE = '''#!PYTHON
import json, pathlib, subprocess, sys, time
if '--version' in sys.argv:
    print('test-codex 1')
    sys.exit(0)
root=pathlib.Path(sys.argv[sys.argv.index('-C')+1])
prompt=sys.argv[-1]
if 'MUTATE' in prompt: (root/'source.txt').write_text('changed')
if 'TIMEOUT' in prompt:
    subprocess.Popen([sys.executable,'-c',"import time,pathlib; time.sleep(1); pathlib.Path('leaked').write_text('child survived')"],cwd=root)
    print(json.dumps({'type':'test.ready'}), flush=True)
    time.sleep(60)
if 'BROKEN' in prompt: print('{bad json')
if 'CALL' in prompt:
    print(json.dumps({'type':'item.started','item':{'type':'mcp_tool_call','tool':'unexpected'}}))
if 'READ' in prompt:
    print(json.dumps({'type':'item.completed','item':{'type':'mcp_tool_call','status':'completed','tool':'executor.skills','arguments':{'app':'test-skills','name':'test'},'result':{'structured_content':{'name':'test','file':'SKILL.md','content':'instructions','revision':'v1'}}}}))
print(json.dumps({'type':'item.completed','item':{'type':'agent_message','text':'Observed result'}}))
print(json.dumps({'type':'turn.completed','usage':{'input_tokens':5,'output_tokens':2}}))
'''


class HarnessTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="harness test ")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.fake = self.root / "fake-codex"
        self.fake.write_text(FAKE.replace("PYTHON", sys.executable, 1))
        self.fake.chmod(0o755)
        fixture = self.root / "fixtures" / "frozen"
        fixture.mkdir(parents=True)
        (fixture / "source.txt").write_text("original")
        self.case = {"id": "test", "kind": "task", "skill": "test", "fixture": "frozen",
                     "prompt": "READ", "rubric": ["Useful answer"], "expected_skills": ["test"],
                     "protected": ["AGENTS.md"], "unchanged": True}

    def suite(self, cases=None):
        path = self.root / "suite.json"
        h.write_json(path, {"schema_version": 1, "cases": cases or [self.case]})
        return path

    def run_cli(self, *extra, out="run"):
        return subprocess.run([sys.executable, str(HERE / "harness.py"), "run",
            "--suite", str(self.suite()), "--out", str(self.root / out), "--codex", str(self.fake),
            "--executor-app", "test-skills", *extra], capture_output=True, text=True, timeout=60)

    def result(self, out="run"):
        return h.read_json(self.root / out / "cases" / self.case["id"] / "result.json")

    def trace(self, events):
        path = self.root / "trace.jsonl"
        path.write_text("\n".join(json.dumps(e) for e in events))
        return h.parse_trace(path, "test-skills")[0]

    def test_success_is_unreviewed_and_fixtures_are_fresh(self):
        self.assertEqual(self.run_cli().returncode, 0)
        first = self.result()
        self.assertEqual(first["status"], "unreviewed")
        self.assertEqual(first["trace"]["skill_reads"][0]["revision"], "v1")
        self.assertNotIn("test", Path(first["workspace"]).name)
        (Path(first["workspace"]) / "source.txt").write_text("contaminated")
        self.assertEqual(self.run_cli(out="second").returncode, 0)
        second = self.result("second")
        self.assertNotEqual(first["workspace"], second["workspace"])
        self.assertEqual((Path(second["workspace"]) / "source.txt").read_text(), "original")
        self.assertEqual(self.run_cli().returncode, 2, "Never overwrite results")

    def test_readonly_mutation_fails(self):
        self.case["prompt"] = "READ MUTATE"
        self.assertEqual(self.run_cli().returncode, 1)
        self.assertTrue(any("Read-only" in f for f in self.result()["failures"]))

    def test_revision_mismatch_and_missing_read_fail(self):
        self.assertEqual(self.run_cli("--revision", "different").returncode, 1)
        self.case["prompt"] = "No discovery"
        self.assertEqual(self.run_cli(out="missing").returncode, 1)
        self.assertTrue(any("entrypoint" in f for f in self.result("missing")["failures"]))

    def test_failed_tool_does_not_count_as_read(self):
        trace = self.trace([skill_read(error="failed")])
        self.assertEqual(trace["skill_reads"], [])
        self.assertEqual(len(trace["tool_errors"]), 1)

    def test_text_result_fallback_and_references(self):
        e = skill_read()
        data = e["item"]["result"].pop("structured_content")
        data["file"] = "references/example.md"
        e["item"]["result"]["content"] = [{"type": "text", "text": json.dumps(data)}]
        trace = self.trace([e])
        self.assertEqual(len(trace["skill_reads"]), 1)
        self.assertTrue(any("entrypoint" in f for f in h.assertions(self.case, {}, {}, trace, None)[1]))

    def test_negative_control_counts_attempted_tool(self):
        self.case.update(kind="negative", prompt="CALL", expected_skills=[])
        self.assertEqual(self.run_cli("--auto-review").returncode, 1)
        result = self.result()
        self.assertNotIn("--approve-for-me", result["command"])
        self.assertIn("read-only", result["command"])
        self.assertTrue(any("Negative" in f for f in result["failures"]))

    def test_flags_are_mutually_exclusive(self):
        self.assertEqual(self.run_cli("--auto-review").returncode, 0)
        self.assertIn("--approve-for-me", self.result()["command"])
        self.assertNotIn("--sandbox", self.result()["command"])

    def test_malformed_trace_and_failed_turn_never_pass(self):
        self.case["prompt"] = "READ BROKEN"
        self.assertEqual(self.run_cli().returncode, 1)
        self.assertTrue(any("Invalid JSONL" in f for f in self.result()["failures"]))
        trace = self.trace([{"type": "turn.failed"}, {"type": "turn.completed"}])
        self.assertIn("turn.failed", trace["trace_errors"])

    def test_timeout_kills_descendant_and_closes_server(self):
        self.case.update(prompt="TIMEOUT", serve=True)
        self.assertEqual(self.run_cli("--timeout", "0.15").returncode, 1)
        result = self.result()
        self.assertEqual(result["execution"], "timeout", result.get("error"))
        # The outer CLI budget includes cold Python startup and fixture setup.
        # Keep the measured subject timeout/cleanup bounded independently.
        self.assertLess(result["seconds"], 10)
        time.sleep(1.1)
        self.assertFalse((Path(result["workspace"]) / "leaked").exists())
        with self.assertRaises(urllib.error.URLError):
            urllib.request.urlopen(result["url"], timeout=1)

    def test_server_uses_distinct_ports_and_blocks_symlinks(self):
        fixture = self.root / "fixtures" / "frozen"
        (self.root / "private.txt").write_text("not served")
        (fixture / "escape").symlink_to(self.root / "private.txt")
        with h.serve(fixture, True) as first, h.serve(fixture, True) as second:
            self.assertNotEqual(first, second)
            with urllib.request.urlopen(first + "source.txt") as response:
                self.assertEqual(response.read(), b"original")
            with self.assertRaises(urllib.error.HTTPError) as error:
                urllib.request.urlopen(first + "escape")
            self.assertEqual(error.exception.code, 403)
            error.exception.close()

    def test_paths_and_symlinks_rejected(self):
        self.case["fixture"] = "../outside"
        with self.assertRaises(ValueError):
            h.load_suite(self.suite())
        self.case["fixture"] = "frozen"
        (self.root / "fixtures/frozen/link").symlink_to(self.root / "suite.json")
        with self.assertRaises(ValueError):
            h.load_suite(self.suite())

    def test_suite_has_49_cases_and_dependency_closure(self):
        suite = h.load_suite(HERE / "design-suite.json")
        self.assertEqual(len(suite["cases"]), 49)
        cases = h.select_cases(suite, ["build-design--paper"], [])
        self.assertEqual([c["id"] for c in cases], ["design-exploration-swarm-paper--task", "build-design--paper"])
        with self.assertRaises(ValueError):
            h.select_cases(suite, ["typo"], [])

    def test_paper_opt_in_and_failed_dependency(self):
        self.case.update(paper=True, export="paper-result.json")
        self.assertEqual(self.run_cli().returncode, 0)
        self.assertEqual(self.result()["status"], "skipped")
        self.assertEqual(self.run_cli("--paper", out="paper").returncode, 1)
        self.assertEqual(self.result("paper")["execution"], "error")

    def test_failed_dependency_is_blocked_not_run(self):
        parent = dict(self.case, id="parent", paper=True, export="missing.json")
        child = dict(self.case, id="child", paper=True, depends_on="parent")
        suite = self.suite([parent, child])
        out = self.root / "dependency-run"
        code = h.main(["run", "--suite", str(suite), "--out", str(out),
            "--codex", str(self.fake), "--executor-app", "test-skills", "--paper", "--case", "child"])
        self.assertEqual(code, 1)
        self.assertEqual(h.read_json(out / "cases/child/result.json")["status"], "blocked")
        self.assertFalse((out / "cases/child/trace.jsonl").exists())

    def test_invalid_tool_result_is_failure_not_parser_crash(self):
        trace = self.trace([event("mcp_tool_call", result="unexpected")])
        self.assertTrue(trace["trace_errors"])

    def test_images_are_hashed_and_symlinks_not_followed(self):
        (self.root / "target.png").write_bytes(b"image1")
        (self.root / "external").symlink_to("/unavailable/not-read")
        before = h.hashes(self.root)
        (self.root / "target.png").write_bytes(b"image2")
        self.assertNotEqual(before["target.png"], h.hashes(self.root)["target.png"])
        self.assertEqual(before["external"], "symlink:/unavailable/not-read")

    def test_termination_preserves_result_and_stops_process(self):
        self.case["prompt"] = "TIMEOUT"
        suite = self.suite()
        out = self.root / "interrupted"
        process = subprocess.Popen([sys.executable, str(HERE / "harness.py"), "run",
            "--suite", str(suite), "--out", str(out), "--codex", str(self.fake)],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        try:
            deadline = time.monotonic() + 5
            trace = out / "cases/test/trace.jsonl"
            ready = '"type": "test.ready"'
            # The log opens before Popen; its existence does not mean the
            # subject is running. Interrupt only after the fake starts its child.
            while time.monotonic() < deadline and process.poll() is None:
                if trace.exists() and ready in trace.read_text():
                    break
                time.sleep(.02)
            self.assertTrue(trace.exists() and ready in trace.read_text())
            process.terminate()
            _, stderr = process.communicate(timeout=5)
            self.assertEqual(process.returncode, 130, stderr)
            result = h.read_json(out / "cases/test/result.json")
            self.assertEqual(result["execution"], "interrupted")
            time.sleep(1.1)
            self.assertFalse((Path(result["workspace"]) / "leaked").exists())
        finally:
            if process.poll() is None:
                process.kill()
                process.communicate()

    def test_export_ids_need_real_results(self):
        value = {"file_id": "new-file", "artboard_ids": ["a", "b"]}
        h.write_json(self.root / "export.json", value)
        with self.assertRaises(ValueError):
            h.check_export(self.root, "export.json", [])
        calls = [self.paper_call("create_file", {"fileId": "new-file"}),
                 self.paper_call("create_artboard", {"file": {"id": "new-file"}}, {"id": "a"}),
                 self.paper_call("create_artboard", {"file": {"id": "new-file"}}, {"id": "b"})]
        self.assertEqual(h.check_export(self.root, "export.json", calls), value)
        with self.assertRaises(ValueError):
            h.check_export(self.root, "export.json", calls, {"file_id": "different"})

    @staticmethod
    def paper_call(tool, *objects, server="-aper"):
        return {"server": server, "tool": tool, "status": "completed", "result": {
            "content": [{"type": "text", "text": json.dumps(obj)} for obj in objects]}}

    def test_paper_export_rejects_existing_files_wrong_file_and_wrong_provider(self):
        value = {"file_id": "target", "artboard_ids": ["a"]}
        h.write_json(self.root / "export.json", value)
        create = self.paper_call("create_file", {"fileId": "target"})
        board = self.paper_call("create_artboard", {"file": {"id": "target"}}, {"id": "a"})
        invalid = [
            [self.paper_call("get_basic_info", {"file": {"id": "target"}, "artboards": [{"id": "a"}]})],
            [create, self.paper_call("create_artboard", {"file": {"id": "another-file"}}, {"id": "a"})],
            [dict(create, server="unrelated"), dict(board, server="unrelated")],
            [create, self.paper_call("get_basic_info", {"file": {"id": "target"}, "artboards": [{"id": "a"}]})],
        ]
        for calls in invalid:
            with self.subTest(calls=calls), self.assertRaises(ValueError):
                h.check_export(self.root, "export.json", calls)

    def test_state_export_accepts_only_new_copies_of_known_artboards(self):
        value = {"file_id": "target", "artboard_ids": ["new-state"]}
        h.write_json(self.root / "export.json", value)
        dependency = {"file_id": "target", "artboard_ids": ["chosen"]}
        call = self.paper_call("duplicate_nodes", {"file": {"id": "target"}},
                               {"duplicatedNodes": [{"sourceId": "chosen", "newId": "new-state"}]})
        self.assertEqual(h.check_export(self.root, "export.json", [call], dependency), value)
        with self.assertRaises(ValueError):
            h.check_export(self.root, "export.json", [call], dict(dependency, artboard_ids=["different"]))

    def test_modified_artifact_cannot_receive_or_retain_a_passing_review(self):
        self.assertEqual(self.run_cli().returncode, 0)
        run = self.root / "run"
        command = ["review", str(run), "--case", "test", "--reviewer", "tester",
                   "--verdict", "passed", "--evidence", "Reviewed the resulting source"]
        h.main(command)
        (Path(self.result()["workspace"]) / "source.txt").write_text("modified after run")
        self.assertEqual(h.report(run)[0]["status"], "stale-artifacts")
        with self.assertRaises(ValueError):
            h.main(command)

    def test_history_has_two_regressions_and_untracked_note(self):
        root = self.root / "history"
        import shutil
        shutil.copytree(HERE / "fixtures/interface-review--task", root)
        h.prepare_history(root)
        diff = h.git(root, "diff", "eval-base", "eval-head")
        self.assertIn('-<!doctype html>', diff)
        self.assertIn('<button id="submit" disabled>', diff)
        self.assertIn("?? notes.txt", h.git(root, "status", "--porcelain"))

    def test_review_binds_to_result_and_failures_cannot_be_overridden(self):
        self.assertEqual(self.run_cli().returncode, 0)
        run = self.root / "run"
        self.assertEqual(h.main(["review", str(run), "--case", "test", "--reviewer", "tester",
            "--verdict", "passed", "--evidence", "Useful answer: trace.jsonl final inspected"]), 0)
        self.assertEqual(h.report(run)[0]["status"], "passed")
        path = run / "cases/test/result.json"
        result = h.read_json(path)
        result["changed"] = ["new evidence"]
        h.write_json(path, result)
        self.assertEqual(h.report(run)[0]["status"], "stale-review")
        result["status"] = "failed"
        h.write_json(path, result)
        with self.assertRaises(ValueError):
            h.main(["review", str(run), "--case", "test", "--reviewer", "tester",
                "--verdict", "passed", "--evidence", "override"])


if __name__ == "__main__":
    unittest.main()
