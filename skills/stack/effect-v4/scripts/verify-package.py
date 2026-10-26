#!/usr/bin/env python3
"""Check bundle structure, local links, inventories, and mirrored examples offline."""
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

root = Path(__file__).resolve().parents[1]
errors = []
markdown = sorted(root.rglob("*.md"))
links_checked = 0

def fail(message):
    errors.append(message)

required = ["SKILL.md", "README.md", "VERIFICATION.md", "SOURCES.md", "agents/openai.yaml",
            "references/module-index.json", "references/source-manifest.json", "evals/scenarios.json",
            "examples/package.json", "examples/tsconfig.json"]
for relative in required:
    if not (root / relative).is_file():
        fail(f"Missing required file: {relative}")

for file in markdown:
    text = file.read_text(encoding="utf-8")
    if not text.strip():
        fail(f"Empty Markdown file: {file.relative_to(root)}")
    if len(re.findall(r"^```", text, re.M)) % 2:
        fail(f"Unbalanced fenced blocks: {file.relative_to(root)}")
    prose = re.sub(r"```[^\n]*\n.*?\n```", "", text, flags=re.S)
    for target in re.findall(r"\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)", prose):
        parsed = urlsplit(target)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        links_checked += 1
        resolved = (file.parent / unquote(parsed.path)).resolve()
        if not resolved.is_relative_to(root):
            fail(f"Local link escapes bundle: {file.relative_to(root)} -> {target}")
        elif not resolved.exists():
            fail(f"Broken local link: {file.relative_to(root)} -> {target}")
    if re.search(r"/docs/v[123]/|\bv3\b|\bEffect 3\b", prose, re.I):
        fail(f"Non-v4 material found: {file.relative_to(root)}")

for file in root.rglob("*.json"):
    if "node_modules" in file.parts or "dist" in file.parts:
        continue
    try:
        json.loads(file.read_text())
    except Exception as error:
        fail(f"Invalid JSON {file.relative_to(root)}: {error}")

skill = root / "SKILL.md"
if skill.exists():
    text = skill.read_text()
    match = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not match or not re.search(r"^name: effect-v4$", match.group(1), re.M):
        fail("Missing or incorrect skill frontmatter name")
    if not match or "description:" not in match.group(1):
        fail("Missing skill activation description")

index_path = root / "references/module-index.json"
if index_path.exists():
    data = json.loads(index_path.read_text())
    entries = data["modules"]
    keys = [(m["group"], m["module"]) for m in entries]
    if data["count"] != len(entries) or len(entries) != 357:
        fail("Reviewed module inventory must contain exactly the 357 baseline entries")
    if len(set(keys)) != len(keys):
        fail("Duplicate module entries")
    if any("/docs/v4/" not in m["api_url"] or "/effect@4.0.2/" not in m["source_url"] for m in entries):
        fail("Module links are not aligned to the v4 baseline")

mapping_path = root / "examples/snippet-map.json"
if mapping_path.exists():
    for mapping in json.loads(mapping_path.read_text()):
        guide = (root / "examples" / mapping["guide"]).resolve()
        codefile = root / "examples" / mapping["file"]
        blocks = re.findall(r"```ts\n(.*?)\n```", guide.read_text(), re.S)
        expected = blocks[mapping["block"]].strip()
        actual = codefile.read_text().split("\n", 1)[1].strip()
        if actual != expected:
            fail(f"Mirrored snippet differs from guide: {codefile.relative_to(root)}")

scenario_path = root / "evals/scenarios.json"
if scenario_path.exists():
    scenarios = json.loads(scenario_path.read_text())["scenarios"]
    if len({item["id"] for item in scenarios}) != len(scenarios):
        fail("Duplicate evaluation IDs")
    for item in scenarios:
        if not all(item.get(key) for key in ["id", "prompt", "expected", "unacceptable", "verification"]):
            fail(f"Incomplete evaluation scenario: {item.get('id')}")

report = {
    "status": "failed" if errors else "passed",
    "markdown_files": len(markdown), "local_links_checked": links_checked,
    "errors": errors,
    "scope": "Offline structure, local-path links, JSON, baseline inventory, and mirrored source snippets only.",
    "not_checked": ["External URL reachability", "Effect semantic typechecking", "Example runtime tests", "Agent evaluations", "Production integrations"]
}
print(json.dumps(report, indent=2))
raise SystemExit(1 if errors else 0)
