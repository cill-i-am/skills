#!/usr/bin/env python3
"""Build the offline guide and API catalogue from an Alchemy tag and its public index."""
import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE = "2.0.0-beta.87"
REVISION = "33c10dd55f5559beee2ec96b155c3a6429e44a93"
SOURCE = f"https://github.com/alchemy-run/alchemy/blob/{REVISION}/"
ALIASES = {
    "infrastructure-as-code/references": "Resource.lookup unmanaged external ownership Resource.ref shared stack",
    "infrastructure-as-code/resource-lifecycle": "RemovalPolicy.protect retain ProtectedResource replacement delete",
    "cli/api": "Alchemist programmatic headless deployment automation",
    "environments/worktrees": "parallel agents checkout stage collision cleanup",
    "infrastructure-as-effects/identity-federation": "workload identity keyless Cloud Run SQS federation",
    "state-store": "S3 DynamoDB state migrate rollback overflow",
    "domain/backfill": "projection replay rebuild existing event history",
    "domain/view-security": "authorize live views subscribers",
    "e2b": "disposable sandbox run untrusted code",
    "git": "host git server smart HTTP clone push",
    "cloudflare/compute/durable-objects": "rename Durable Object class renamedFrom",
}

def build(source, full_index):
    docs = source / "website/src/content/docs"
    records = {}
    def record(url, title, kind, terms=""):
        records[url] = {"title": title, "url": url, "kind": kind, "terms": terms}
    for path in sorted(docs.rglob("*")):
        if path.suffix not in {".md", ".mdx"}: continue
        text = path.read_text()
        slug = path.relative_to(docs).with_suffix("").as_posix().removesuffix("/index")
        title = re.search(r"^title:\s*(.+)", text, re.M)
        prose = re.sub(r"^```.*?^```[^\n]*", "", text, flags=re.M | re.S)
        headings = re.findall(r"^#{2,4} (.+)", prose, re.M)
        record(SOURCE + path.relative_to(source).as_posix(), title[1].strip('"') if title else slug,
               "release blog" if slug.startswith("blog/") else "release guide",
               " ".join([slug, ALIASES.get(slug, ""), *headings]))
    for title, url in re.findall(r"^- \[([^\]]+)\]\((https://alchemy.run/providers/[^)]+)\)", full_index, re.M):
        record(url, title, "website service reference")
    for path in sorted((source / "examples").iterdir()):
        if path.is_dir():
            record(SOURCE.replace("/blob/", "/tree/") + "examples/" + path.name, path.name, "release example")
    for path in sorted((source / "packages").glob("*/package.json")):
        package = json.loads(path.read_text())
        if package.get("private"): continue
        record(SOURCE + path.relative_to(source).as_posix(), package["name"], "release export map",
               " ".join(package.get("exports", {})))
    return list(records.values())

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("full_index", type=Path)
    args = parser.parse_args()
    head = subprocess.check_output(["git", "-C", args.source, "rev-parse", "HEAD"], text=True).strip()
    if head != REVISION:
        parser.error(f"check out {REVISION} before regenerating")
    records = build(args.source, args.full_index.read_text())
    # Group exact names under service export maps, including public deep imports.
    # Keep navigation entries small enough to retrieve one shard through Executor.
    export_rows = subprocess.check_output(["node", ROOT/"scripts/index-exports.cjs", args.source], text=True)
    services = {}
    for line in export_rows.splitlines():
        module, file, names = json.loads(line)
        parts = module.split("/")
        service = "/".join(parts[:3] if module.startswith("@") else parts[:2])
        group = services.setdefault(service, {"source": file, "names": set()})
        if module == service:
            group["source"] = file
        group["names"].update([module.split("/")[-1], *names])
    for service, group in sorted(services.items()):
        names = sorted(group["names"])
        for start in range(0, len(names), 100):
            records.append({"title": service, "kind": "release symbols",
                            "url": SOURCE + group["source"],
                            "terms": " ".join(names[start:start+100])})
    destination = ROOT / "references" / "catalogue"
    destination.mkdir(exist_ok=True)
    groups = {}
    for r in records:
        url = r["url"]
        if r["kind"].startswith("release ") and "/website/src/content/docs/" in url:
            key = url.split("/docs/")[1].split("/")[0].split(".")[0]
        elif "/providers/" in url:
            key = url.split("/providers/")[1].split("/")[0]
        elif r["kind"] == "release symbols":
            key = "symbols-"+r["title"].removeprefix("@alchemy.run/").split("/")[0].lower()
        elif r["kind"] == "release example":
            key = "examples"
        else: key = "packages"
        groups.setdefault(key, []).append(r)
    shards = []
    for key, items in sorted(groups.items()):
        chunks = [[]]
        length = 0
        for row in items:
            line = json.dumps(row, ensure_ascii=False) + "\n"
            if chunks[-1] and length + len(line.encode()) > 14000:
                chunks.append([])
                length = 0
            chunks[-1].append(line)
            length += len(line.encode())
        for i, chunk in enumerate(chunks, start=1):
            name = f"{key}-{i}.jsonl"
            (destination/name).write_text("".join(chunk))
            shards.append("catalogue/"+name)
    (ROOT/"references/source-index.json").write_text(json.dumps({
        "release": RELEASE, "revision": REVISION, "record_count": len(records), "shards": shards,
        "availability": {"DigitalOcean": "Source-only at this cutoff. The beta.87 tag has no DigitalOcean provider."}
    }, indent=2)+"\n")
    for stale in destination.glob("*.jsonl"):
        if "catalogue/"+stale.name not in shards: stale.unlink()
