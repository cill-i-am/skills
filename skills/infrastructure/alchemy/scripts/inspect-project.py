#!/usr/bin/env python3
"""Read-only inventory. Never executes project scripts or prints env-file values."""
from __future__ import annotations
import argparse
import json
import os
import re
from pathlib import Path

SKIP = {"node_modules", ".git", ".alchemy", ".next", ".nuxt", "dist", "build", ".output", ".turbo"}
LOCKS = {"pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lock", "bun.lockb"}

def version_summary(value: object) -> str | None:
    """Do not echo credentialed registry URLs or arbitrary nested metadata."""
    if value is None:
        return None
    if isinstance(value, str) and len(value) <= 200:
        if value in {"latest", "next", "beta", "alpha", "rc", "canary", "catalog:", "workspace:*"}:
            return value
        if re.fullmatch(r"(?:workspace:)?[0-9*^~<>=][0-9A-Za-z.*^~<>=| +_-]*", value):
            return value
    return "[non-version spec omitted]"

def package_manager_summary(value: object) -> str | None:
    if value is None:
        return None
    if isinstance(value, str) and re.fullmatch(r"(?:pnpm|npm|yarn|bun)@[0-9][0-9A-Za-z.+_-]{0,180}", value):
        return value
    return "[non-version spec omitted]"

def inspect(root: Path, max_files: int = 1000) -> dict:
    root = root.resolve(strict=True)
    if not root.is_dir():
        raise ValueError("Project root must be a directory")
    if not 1 <= max_files <= 10000:
        raise ValueError("max_files must be between 1 and 10000")
    out = {"manifests": [], "lockfiles": [], "stack_files": [], "installed_alchemy": None,
           "warnings": [], "files_examined": 0, "truncated": False}
    for directory, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in SKIP and not d.startswith(".")
                         and not (Path(directory) / d).is_symlink())
        for name in sorted(names):
            path = Path(directory) / name
            if path.is_symlink():
                continue
            out["files_examined"] += 1
            if out["files_examined"] > max_files:
                out["truncated"] = True
                return out
            relative = path.relative_to(root).as_posix()
            if name in LOCKS:
                out["lockfiles"].append(relative)
            elif name == "package.json":
                try:
                    if path.stat().st_size > 1_000_000:
                        raise ValueError("manifest exceeds 1 MB")
                    data = json.loads(path.read_text(encoding="utf-8"))
                    if not isinstance(data, dict):
                        raise ValueError("manifest must be an object")
                    selected = {}
                    for group in ("dependencies", "devDependencies", "peerDependencies", "overrides"):
                        values = data.get(group, {})
                        if isinstance(values, dict):
                            selected[group] = {k: version_summary(v) for k, v in values.items()
                                if isinstance(k, str) and (k == "alchemy" or k == "effect"
                                  or k.startswith("@effect/") or k.startswith("@alchemy.run/"))}
                    scripts = data.get("scripts", {})
                    out["manifests"].append({"path": relative, "packageManager": package_manager_summary(data.get("packageManager")),
                        "dependencies": selected,
                        "script_names": sorted(scripts) if isinstance(scripts, dict) else []})
                except (OSError, ValueError, UnicodeError) as error:
                    out["warnings"].append({"path": relative, "problem": type(error).__name__})
            elif name in {"alchemy.run.ts", "alchemy.run.mts", "alchemy.run.js"}:
                out["stack_files"].append(relative)
    # Read only a direct, non-symlink installed package manifest. pnpm commonly
    # uses symlinks; report that limit rather than following arbitrary targets.
    installed = root / "node_modules" / "alchemy" / "package.json"
    if (root / "node_modules").is_symlink() or installed.parent.is_symlink():
        out["warnings"].append({"path": "node_modules/alchemy", "problem": "symlink_not_followed"})
    elif installed.is_file() and not installed.is_symlink():
        try:
            if installed.stat().st_size > 1_000_000:
                raise ValueError("manifest exceeds 1 MB")
            data = json.loads(installed.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                raise ValueError("manifest must be an object")
            out["installed_alchemy"] = {"version": version_summary(data.get("version"))}
        except (OSError, ValueError, UnicodeError):
            out["warnings"].append({"path": "node_modules/alchemy/package.json", "problem": "unreadable"})
    return out

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--max-files", type=int, default=1000)
    args = parser.parse_args()
    try:
        print(json.dumps(inspect(Path(args.root), args.max_files), indent=2))
        return 0
    except (OSError, ValueError) as error:
        parser.exit(2, f"Cannot inspect project: {type(error).__name__}\n")
    return 2
if __name__ == "__main__":
    raise SystemExit(main())
