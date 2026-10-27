#!/usr/bin/env python3
"""Run frozen skill cases with Codex; keep execution, assertions and review separate."""
import argparse
import contextlib
import hashlib
import http.server
import json
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from functools import partial

HERE = Path(__file__).resolve().parent


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def relative_path(value):
    path = Path(value)
    if not value or path.is_absolute() or ".." in path.parts:
        raise ValueError("Expected a relative path without '..': " + str(value))
    return path


def hashes(root):
    result = {}
    for path in sorted(root.rglob("*")):
        if ".git" in path.relative_to(root).parts:
            continue
        key = path.relative_to(root).as_posix()
        if path.is_symlink():
            result[key] = "symlink:" + os.readlink(path)
        elif path.is_file():
            result[key] = digest(path.read_bytes())
    return result


def matches_snapshot(root, expected):
    if not isinstance(expected, dict) or root.is_symlink() or not root.is_dir():
        return False
    try:
        return hashes(root) == expected
    except OSError:
        return False


def load_suite(path):
    suite = read_json(path)
    if suite.get("schema_version") != 1 or not suite.get("cases"):
        raise ValueError("Expected schema_version 1 and nonempty cases")
    seen = set()
    for case in suite["cases"]:
        if not isinstance(case, dict) or not isinstance(case.get("id"), str) or not isinstance(case.get("kind"), str):
            raise ValueError("Every case needs string id and kind fields")
        if not re.fullmatch(r"[a-z0-9-]+", case["id"]) or case["id"] in seen:
            raise ValueError("Invalid or duplicate case ID")
        if not isinstance(case.get("prompt"), str) or not case["prompt"].strip() or not isinstance(case.get("rubric"), list) or not case["rubric"] or any(not isinstance(r, str) or not r.strip() for r in case["rubric"]):
            raise ValueError("Every case needs a prompt and review rubric")
        for field in ["expected_skills", "protected"]:
            if not isinstance(case.get(field, []), list) or any(not isinstance(v, str) for v in case.get(field, [])):
                raise ValueError(field + " must be an array of strings")
        if case.get("depends_on") and case["depends_on"] not in seen:
            raise ValueError("Dependencies must precede consumers")
        seen.add(case["id"])
        for key in ["export", "json_keys"]:
            if case.get(key):
                relative_path(case[key])
        for name in case.get("protected", []):
            relative_path(name)
        if case.get("fixture"):
            root = path.parent / "fixtures" / relative_path(case["fixture"])
            if not root.is_dir() or root.is_symlink():
                raise ValueError("Missing fixture or symlink: " + str(root))
            if any(p.is_symlink() or p.name == ".git" for p in root.rglob("*")):
                raise ValueError("Fixtures cannot contain symlinks or Git metadata")
    return suite


def select_cases(suite, ids, kinds):
    cases = suite["cases"]
    if set(ids) - {c["id"] for c in cases}:
        raise ValueError("Unknown case ID")
    selected = {c["id"] for c in cases if (not ids or c["id"] in ids)
                and (not kinds or c["kind"] in kinds)}
    if not selected:
        raise ValueError("No cases matched")
    for case in reversed(cases):
        if case["id"] in selected and case.get("depends_on"):
            selected.add(case["depends_on"])
    return [c for c in cases if c["id"] in selected]


def git(root, *args):
    # Fixture history must not run user hooks, signing programs or templates.
    env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
    env.update(GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull,
               GIT_AUTHOR_DATE="2026-01-01T00:00:00Z", GIT_COMMITTER_DATE="2026-01-01T00:00:00Z")
    return subprocess.check_output(["git", "-c", "user.name=Skill Eval",
        "-c", "user.email=eval@example.invalid", "-c", "commit.gpgsign=false",
        "-c", "core.hooksPath=" + os.devnull, "-C", str(root), *args], env=env,
        stderr=subprocess.STDOUT, text=True).strip()


def prepare_history(root):
    note = (root / "notes.txt").read_bytes()
    (root / "notes.txt").unlink()
    git(root, "init", "-q", "--template=", "--initial-branch=fixture")
    git(root, "add", ".")
    git(root, "commit", "-qm", "Base fixture")
    git(root, "tag", "eval-base")
    path = root / "index.html"
    path.write_text(path.read_text().replace('<label for="email">Email</label>', "")
                    .replace('<button id="submit">', '<button id="submit" disabled>'))
    git(root, "add", "index.html")
    git(root, "commit", "-qm", "Regression fixture")
    git(root, "tag", "eval-head")
    (root / "notes.txt").write_bytes(note)


class FixtureHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def send_head(self):
        target = Path(self.translate_path(self.path)).resolve()
        root = Path(self.directory).resolve()
        if root not in (target, *target.parents) or ".git" in target.relative_to(root).parts:
            self.send_error(403)
            return None
        return super().send_head()


@contextlib.contextmanager
def serve(root, enabled):
    if not enabled:
        yield None
        return
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), partial(FixtureHandler, directory=str(root)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield "http://127.0.0.1:%d/" % server.server_port
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


def stop_process(process):
    # Kill the group even if the parent exited; a child may still hold the server/pipe.
    try:
        os.killpg(process.pid, signal.SIGTERM)
        process.wait(timeout=2)
    except subprocess.TimeoutExpired:
        pass
    except ProcessLookupError:
        return
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    process.wait()


def execute(command, root, logs, timeout):
    start = time.monotonic()
    status = "completed"
    with (logs / "trace.jsonl").open("w") as out, (logs / "stderr.txt").open("w") as err:
        process = subprocess.Popen(command, cwd=root, stdout=out, stderr=err,
                                   stdin=subprocess.DEVNULL, start_new_session=True)
        try:
            code = process.wait(timeout=timeout)
            if code:
                status = "failed"
        except subprocess.TimeoutExpired:
            code, status = None, "timeout"
        except KeyboardInterrupt:
            code, status = None, "interrupted"
        finally:
            stop_process(process)
    return {"execution": status, "exit_code": code, "seconds": round(time.monotonic() - start, 3)}


def structured(result):
    if not isinstance(result, dict):
        return {}
    value = result.get("structured_content", result.get("structuredContent"))
    if isinstance(value, dict):
        return value
    for block in result.get("content", []):
        if block.get("type") == "text":
            try:
                value = json.loads(block["text"])
                if isinstance(value, dict):
                    return value
            except (ValueError, KeyError):
                pass
    return {}


def parse_trace(path, app):
    summary = {"completed_turn": False, "trace_errors": [], "skill_reads": [],
               "calls": [], "tool_errors": [], "usage": [], "final": ""}
    completed = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            event = json.loads(line)
            if not isinstance(event, dict):
                raise ValueError("event is not an object")
        except ValueError:
            summary["trace_errors"].append("Invalid JSONL event at line %d" % number)
            continue
        if event.get("type") == "turn.completed":
            summary["completed_turn"] = True
            summary["usage"].append(event.get("usage", {}))
        if event.get("type") in ["turn.failed", "thread.failed"]:
            summary["trace_errors"].append(event["type"])
        item = event.get("item", {})
        if not isinstance(item, dict):
            summary["trace_errors"].append("Invalid item at line %d" % number)
            continue
        kind = item.get("type", "")
        if event.get("type") in ["item.started", "item.completed"] and kind in ["mcp_tool_call", "command_execution", "web_search", "file_change"]:
            # Include attempted and failed calls in negative-control checks.
            summary["calls"].append({"type": kind, "tool": item.get("tool"), "server": item.get("server")})
        if event.get("type") != "item.completed":
            continue
        if kind == "agent_message":
            summary["final"] = item.get("text", "")
        if kind != "mcp_tool_call":
            continue
        result = item.get("result") or {}
        if not isinstance(result, dict):
            summary["trace_errors"].append("Unsupported tool result at line %d" % number)
            continue
        if item.get("error") or item.get("status") == "failed" or result.get("isError") or result.get("is_error"):
            summary["tool_errors"].append({"tool": item.get("tool"), "error": item.get("error") or result})
            continue
        completed.append(item)
        args = item.get("arguments", {})
        if not isinstance(args, dict):
            continue
        data = structured(result)
        if "executor" in item.get("tool", "") and args.get("app") == app and data.get("content"):
            summary["skill_reads"].append({"name": data.get("name"), "file": data.get("file", "SKILL.md"),
                "revision": data.get("revision"), "deployment": data.get("deployment"),
                "content_sha256": digest(data["content"].encode())})
    return summary, completed


def assertions(case, before, after, trace, revision):
    failures = []
    changed = sorted(k for k in before.keys() | after.keys() if before.get(k) != after.get(k))
    if not trace["completed_turn"] or not trace["final"].strip():
        failures.append("Missing completed turn or final response")
    failures.extend(trace["trace_errors"])
    if case.get("unchanged") and changed:
        failures.append("Read-only fixture changed: " + ", ".join(changed))
    for name in case.get("protected", []):
        if before.get(name) != after.get(name):
            failures.append("Protected file changed: " + name)
    if case["kind"] == "negative" and trace["calls"]:
        failures.append("Negative control attempted tools or edits")
    roots = {r["name"] for r in trace["skill_reads"] if r["file"] == "SKILL.md"}
    for name in case.get("expected_skills", []):
        if name not in roots:
            failures.append("No successful Executor entrypoint read: " + name)
    if revision and any(r["revision"] != revision for r in trace["skill_reads"]):
        failures.append("Executor skill revision differs from requested revision")
    return changed, failures


def result_objects(result):
    """Read structured MCP data and all JSON text blocks without mining arbitrary strings."""
    objects = []
    for key in ["structured_content", "structuredContent"]:
        if isinstance(result.get(key), dict):
            objects.append(result[key])
    for block in result.get("content", []):
        if block.get("type") == "text":
            try:
                value = json.loads(block["text"])
                if isinstance(value, dict):
                    objects.append(value)
            except (ValueError, KeyError):
                pass
    return objects


def check_export(root, name, calls, dependency=None, paper_server="-aper"):
    path = root / name
    if path.is_symlink():
        raise ValueError("Paper export cannot be a symlink")
    value = read_json(path)
    ids = value.get("artboard_ids")
    if not isinstance(value.get("file_id"), str) or not value["file_id"] or not isinstance(ids, list) or not ids or any(not isinstance(i, str) or not i for i in ids) or len(set(ids)) != len(ids):
        raise ValueError("Paper export requires file_id and unique artboard_ids")
    if dependency:
        if value["file_id"] != dependency["file_id"]:
            raise ValueError("State preview changed the dependency file ID")
    file_created = bool(dependency)  # The earlier case already proved this file's creation.
    known_boards = set(dependency.get("artboard_ids", [])) if dependency else set()
    created_boards = set()
    for call in calls:
        if call.get("server") != paper_server or call.get("status") != "completed":
            continue
        result = call.get("result") or {}
        if call.get("error") or result.get("isError") or result.get("is_error"):
            continue
        objects = result_objects(result)
        tool = call.get("tool")
        if tool == "create_file" and any(o.get("fileId") == value["file_id"] for o in objects):
            file_created = True
        returned_files = {o["file"].get("id") for o in objects if isinstance(o.get("file"), dict)}
        if not file_created or returned_files != {value["file_id"]}:
            continue
        if tool == "create_artboard":
            created_boards.update(o["id"] for o in objects if isinstance(o.get("id"), str))
        elif tool == "duplicate_nodes":
            for obj in objects:
                for node in obj.get("duplicatedNodes", []):
                    if node.get("sourceId") in known_boards | created_boards and isinstance(node.get("newId"), str):
                        created_boards.add(node["newId"])
    if not file_created or not set(ids).issubset(created_boards):
        raise ValueError("Paper export must identify artboards created in this run's validated file")
    return value


def instructions(app, revision):
    return ("This is a disposable evaluation workspace. Only this directory is an implementation target. "
        "Do not read sibling workspaces, harness code, scoring rubrics or previous results. "
        "Preserve AGENTS.md, tokens.css, supplied images and product behavior. No dependencies are needed. "
        "Do not send messages, publish, merge, deploy, use live product data or delegate. "
        "Use only a NEW Paper file when explicitly requested, or the IDs supplied in input.json. "
        "Use Executor as the shared-skill source. For substantive tasks discover its tools, read its executor skill, "
        "and list skills({}). Match intent to descriptions; incidental quoted names do not request invocation. "
        "Read relevant skills from app " + json.dumps(app) + " before applying them. "
        + ("Request revision " + json.dumps(revision) + " for all reads from that app. " if revision else "")
        + "Use returned revisions for references. Keep existing approval boundaries. "
        "Use a browser session named after this directory; close it before finishing. "
        "Report actual evidence and limitations.\n")


def run_case(case, suite_path, run_dir, args, dependency=None):
    logs = run_dir / "cases" / case["id"]
    logs.mkdir(parents=True)
    root = Path(tempfile.mkdtemp(prefix="subject-", dir=run_dir / "workspaces"))
    result = {"id": case["id"], "rubric": case["rubric"], "workspace": str(root), "failures": []}
    try:
        if case.get("fixture"):
            shutil.copytree(suite_path.parent / "fixtures" / case["fixture"], root, dirs_exist_ok=True)
        (root / "AGENTS.md").write_text(instructions(args.executor_app, args.revision), encoding="utf-8")
        if dependency:
            write_json(root / "input.json", dependency)
        if case.get("git_history"):
            prepare_history(root)
        shutil.copytree(root, logs / "before", ignore=shutil.ignore_patterns(".git"))
        before = hashes(root)
        refs = git(root, "show-ref", "--head") if case.get("git_history") else None
        keys = set(read_json(root / case["json_keys"])) if case.get("json_keys") else None
        prompt = case["prompt"].replace("{{run_name}}", "Skill eval " + root.name)
        command = [args.codex, "exec", "--json", "--ephemeral", "--skip-git-repo-check"]
        if args.auto_review and case["kind"] != "negative":
            command += ["--approve-for-me"]
        else:
            command += ["--sandbox", "read-only" if case["kind"] == "negative" else "workspace-write"]
        if args.model:
            command += ["--model", args.model]
        for override in args.codex_config:
            command += ["-c", override]
        with serve(root, case.get("serve")) as url:
            if url:
                prompt += " The fixture server is running at " + url + ". Use browser session " + root.name + "."
            command += ["-C", str(root), prompt]
            result.update(command=command, prompt=prompt, before=before, url=url)
            result.update(execute(command, root, logs, args.timeout))
        trace, calls = parse_trace(logs / "trace.jsonl", args.executor_app)
        after = hashes(root)
        changed, failures = assertions(case, before, after, trace, args.revision)
        if refs and refs != git(root, "show-ref", "--head"):
            failures.append("Git refs changed")
        if keys is not None and keys != set(read_json(root / case["json_keys"])):
            failures.append("JSON copy keys changed")
        result.update(trace=trace, after=after, changed=changed, failures=failures)
        if case.get("export"):
            result["export"] = check_export(root, case["export"], calls, dependency, args.paper_server)
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        result.update(execution="error", error=str(error))
    result["status"] = "unreviewed" if result.get("execution") == "completed" and not result["failures"] else "failed"
    write_json(logs / "result.json", result)
    return result


def report(run_dir):
    manifest = read_json(run_dir / "run.json")
    rows = []
    for case in manifest["cases"]:
        path = run_dir / "cases" / case["id"] / "result.json"
        result = read_json(path) if path.exists() else {"status": "not-run"}
        status = result["status"]
        review = path.with_name("review.json")
        if review.exists() and status == "unreviewed":
            decision = read_json(review)
            status = decision["verdict"] if decision["result_sha256"] == digest(path.read_bytes()) else "stale-review"
        if result["status"] == "unreviewed" and not matches_snapshot(Path(result["workspace"]), result.get("after")):
            status = "stale-artifacts"
        rows.append({"id": case["id"], "status": status, "failures": result.get("failures", [])})
    write_json(run_dir / "summary.json", rows)
    (run_dir / "summary.md").write_text("# Skill evaluation\n\nExecution and assertions do not substitute for rubric review.\n\n| Case | Status |\n| --- | --- |\n" + "".join("| %s | %s |\n" % (r["id"], r["status"]) for r in rows))
    return rows


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)
    for action in ["list", "run"]:
        p = sub.add_parser(action)
        p.add_argument("--suite", type=Path, default=HERE / "design-suite.json")
        p.add_argument("--case", action="append", default=[])
        p.add_argument("--kind", action="append", default=[])
    run = sub.choices["run"]
    run.add_argument("--out", type=Path, required=True, help="New directory; never overwritten")
    run.add_argument("--codex", default="codex")
    run.add_argument("--executor-app", default="personal-skills")
    run.add_argument("--revision", help="Required Executor revision for shared-skill reads")
    run.add_argument("--model", help="Otherwise inherit Codex configuration")
    run.add_argument("--codex-config", action="append", default=[])
    run.add_argument("--timeout", type=float, default=900)
    run.add_argument("--auto-review", action="store_true", help="Use Codex automatic approval review for non-negative cases")
    run.add_argument("--paper", action="store_true", help="Allow new Paper artifacts and follow-up mutations in those artifacts")
    run.add_argument("--paper-server", default="-aper", help="Exact native Paper server name in Codex traces")
    review = sub.add_parser("review")
    review.add_argument("run_dir", type=Path)
    review.add_argument("--case", required=True)
    review.add_argument("--reviewer", required=True)
    review.add_argument("--verdict", choices=["passed", "failed"], required=True)
    review.add_argument("--evidence", required=True, help="Rubric-by-rubric findings and evidence paths")
    sub.add_parser("report").add_argument("run_dir", type=Path)
    args = parser.parse_args(argv)
    if args.action in ["review", "report"]:
        if args.action == "review":
            relative_path(args.case)
            path = args.run_dir / "cases" / args.case / "result.json"
            result = read_json(path)
            if result["status"] != "unreviewed":
                raise ValueError("Cannot override execution/assertion failures or skipped cases")
            if not matches_snapshot(Path(result["workspace"]), result.get("after")):
                raise ValueError("Workspace no longer matches the recorded outcome; rerun the case")
            if not args.evidence.strip() or not args.reviewer.strip():
                raise ValueError("Reviewer and evidence are required")
            write_json(path.with_name("review.json"), {"reviewer": args.reviewer, "verdict": args.verdict,
                "evidence": args.evidence, "result_sha256": digest(path.read_bytes()), "time": time.time()})
        print(json.dumps(report(args.run_dir), indent=2))
        return 0
    suite_path = args.suite.resolve()
    suite = load_suite(suite_path)
    cases = select_cases(suite, args.case, args.kind)
    if args.action == "list":
        print("\n".join(c["id"] + (" [Paper opt-in]" if c.get("paper") else "") for c in cases))
        return 0
    if os.name != "posix":
        raise ValueError("Live runner currently requires macOS/Linux process groups")
    if args.timeout <= 0:
        raise ValueError("Timeout must be positive")
    run_dir = args.out.resolve()
    fixture_root = (suite_path.parent / "fixtures").resolve()
    if fixture_root in (run_dir, *run_dir.parents):
        raise ValueError("Run output must not be inside frozen fixtures")
    run_dir.mkdir(parents=True, exist_ok=False)
    (run_dir / "workspaces").mkdir()
    version = subprocess.check_output([args.codex, "--version"], text=True).strip()
    write_json(run_dir / "run.json", {"schema_version": 1, "suite": suite, "cases": cases,
        "suite_sha256": digest(suite_path.read_bytes()), "fixture_hashes": hashes(suite_path.parent / "fixtures"),
        "harness_sha256": digest(Path(__file__).read_bytes()), "codex_version": version,
        "settings": {k: str(v) if isinstance(v, Path) else v for k, v in vars(args).items()}, "started": time.time()})
    results = {}
    for case in cases:
        reason = None
        parent = results.get(case.get("depends_on"), {})
        if case.get("paper") and not args.paper:
            reason = "Paper cases require --paper"
        elif case.get("depends_on") and (parent.get("status") != "unreviewed" or not parent.get("export")):
            reason = "Dependency did not produce a validated export"
        if reason:
            path = run_dir / "cases" / case["id"]
            path.mkdir(parents=True)
            result = {"id": case["id"], "status": "skipped" if not args.paper else "blocked", "reason": reason}
            write_json(path / "result.json", result)
        else:
            result = run_case(case, suite_path, run_dir, args, parent.get("export"))
        results[case["id"]] = result
        print(json.dumps({"id": case["id"], "status": result["status"]}), flush=True)
        report(run_dir)
        if result.get("execution") == "interrupted":
            return 130
    return 1 if any(r["status"] in ["failed", "blocked"] for r in results.values()) else 0


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        sys.exit(main())
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        print("Error: " + str(error), file=sys.stderr)
        sys.exit(2)
