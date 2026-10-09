#!/usr/bin/env python3
"""Validate local package structure, frontmatter, JSON, and Markdown file links."""
import ast
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote

root = Path(__file__).resolve().parents[1]
errors = []
text = (root / "SKILL.md").read_text(encoding="utf-8")
if not text.startswith("---\n"):
    errors.append("SKILL.md is missing frontmatter")
else:
    front = text.split("---", 2)[1]
    name = re.search(r"^name:\s*(.+)$", front, re.M)
    description = re.search(r"^description:\s*(.+)$", front, re.M)
    if not name or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name.group(1)):
        errors.append("Invalid skill name")
    elif len(name.group(1)) > 64 or name.group(1) != root.name:
        errors.append("Name must match the folder and be at most 64 characters")
    if not description or len(description.group(1)) > 1024:
        errors.append("Description is missing or too long")
if len(text.splitlines()) > 500:
    errors.append("Entry point exceeds 500 lines")
links = 0
for p in root.rglob("*"):
    if "__pycache__" in p.parts or "node_modules" in p.parts: continue
    if p.is_symlink(): errors.append(f"Unexpected symlink: {p.relative_to(root)}"); continue
    if not p.is_file(): continue
    if p.suffix == ".json":
        try: json.loads(p.read_text(encoding="utf-8"))
        except (ValueError, UnicodeError) as error: errors.append(f"Invalid JSON: {p.relative_to(root)}: {error}")
    if p.suffix == ".py":
        try: ast.parse(p.read_text(encoding="utf-8"), filename=str(p))
        except SyntaxError as error: errors.append(f"Python syntax: {error}")
    if p.suffix == ".md":
        body = p.read_text(encoding="utf-8")
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", body):
            if target.startswith(("https://", "http://", "mailto:", "#")): continue
            target = unquote(target.split("#", 1)[0])
            if not target: continue
            links += 1
            resolved = (p.parent / target).resolve()
            if not resolved.is_relative_to(root) or not resolved.exists():
                errors.append(f"Broken/outside link: {p.relative_to(root)} -> {target}")
        if body.count("```") % 2:
            errors.append(f"Unbalanced code fences: {p.relative_to(root)}")
for p in (root / "references").glob("*.md"):
    if f"references/{p.name}" not in text:
        errors.append(f"Reference not directly routed from SKILL.md: {p.name}")
result = {"errors": errors, "local_links_checked": links,
          "reference_chapters": len(list((root / "references").glob("*.md"))),
          "entry_lines": len(text.splitlines()),
          "limits": "No external-link, dependency-type, semantic, or cloud validation"}
print(json.dumps(result, indent=2))
sys.exit(1 if errors else 0)
