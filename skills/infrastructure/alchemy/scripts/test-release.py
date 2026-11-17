#!/usr/bin/env python3
"""Run selected offline upstream acceptance suites against the installed release."""
import argparse
import os
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / "assets/examples"
REVISION = "33c10dd55f5559beee2ec96b155c3a6429e44a93"
FILES = {
    "packages/alchemy/test": ["apply.test.ts", "test.resources.ts", "Sandbox.test.ts"],
    "packages/integration-tests/test/Domain": [
        "Backfill.sim.ts", "Backfill.test.ts", "Api.test.ts", "StoryOrder.test.ts", "Isolation.test.ts", "LiveReads.test.ts"
    ],
}

def run(source):
    head = subprocess.check_output(["git","-C",source,"rev-parse","HEAD"], text=True).strip()
    if head != REVISION:
        raise SystemExit(f"Expected Alchemy release commit {REVISION}")
    with tempfile.TemporaryDirectory(dir=EXAMPLES, prefix=".release-test-") as tmp:
        folder = Path(tmp)
        # Read committed blobs. The user's working tree may have local edits.
        for base, names in FILES.items():
            for name in names:
                code = subprocess.check_output(["git","-C",source,"show",f"HEAD:{base}/{name}"],text=True)
                # Replace the upstream repository-only TypeScript alias with package exports.
                code = re.sub(r'"@/([^"]+)"', lambda m: '"alchemy/'+m[1].removesuffix(".ts")+'"', code)
                (folder/name).write_text(code)
        env = {"PATH":os.environ["PATH"], "USER":"alchemy-fixture", "ALCHEMY_HOME":str(folder/"profile")}
        args = [str(EXAMPLES/"node_modules/.bin/alchemy-test"), "--no-tui", "--concurrency", "1"]
        subprocess.run([*args, *[n for ns in FILES.values() for n in ns if n.endswith(".test.ts")]],
                       cwd=folder, env=env, check=True)

        worktree_acceptance(folder, args[0], env)

def worktree_acceptance(folder, runner, env):
    """Exercise the runner's actual stage selection in two linked checkouts."""
    import concurrent.futures
    repo = folder / "main"
    subprocess.run(["git", "init", "-q", repo], check=True)
    subprocess.run(["git", "-C", repo, "-c", "user.name=Fixture", "-c",
                    "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", "commit", "--allow-empty", "-qm", "fixture"], check=True)
    stages = []
    for name in ("one", "two"):
        worktree = folder / name
        subprocess.run(["git", "-C", repo, "worktree", "add", "--quiet", "--detach", worktree], check=True)
        (worktree / "stage.test.ts").write_text(
            'import { expect, it } from "@alchemy.run/test";\n'
            'import * as Effect from "effect/Effect";\n'
            'import { writeFileSync } from "node:fs";\n'
            'it.effect("records the effective stage", () => Effect.sync(() => {\n'
            '  const stage = process.env.ALCHEMY_TEST_STAGE;\n'
            '  expect(stage).toBeTruthy(); writeFileSync("stage.txt", stage!);\n'
            '}));\n'
        )
        stages.append(worktree)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        runs = [pool.submit(subprocess.run, [runner, "--no-tui", "stage.test.ts"], cwd=w, env=env, check=True)
                for w in stages]
        for run in runs:
            run.result()
    names = [(w/"stage.txt").read_text() for w in stages]
    if len(set(names)) != 2 or any(not stage.endswith("_"+w.name) for stage,w in zip(names,stages)):
        raise RuntimeError(f"Expected independently owned stages, got {names}")
    print("Distinct worktree test stages:", *names)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("release_checkout",type=Path)
    run(parser.parse_args().release_checkout.resolve())
