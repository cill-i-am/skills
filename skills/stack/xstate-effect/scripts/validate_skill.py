#!/usr/bin/env python3
"""Read-only structural validation. Does not validate remote URLs or TypeScript types."""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


def headings(text: str) -> set[str]:
    result: set[str] = set()
    seen: dict[str, int] = {}
    in_fence = False
    for line in text.splitlines():
        if line.lstrip().startswith('```'):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        m = re.match(r'^#{1,6}\s+(.+?)\s*#*$', line)
        if m:
            title = re.sub(r'[`*_]', '', m.group(1)).lower()
            slug = re.sub(r'[^\w\-\s]', '', title)
            slug = re.sub(r'\s', '-', slug.strip())
            count = seen.get(slug, 0)
            seen[slug] = count + 1
            result.add(slug if count == 0 else f'{slug}-{count}')
    result.update(re.findall(r'<a\s+(?:id|name)=["\']([^"\']+)["\']', text))
    return result


def visible_markdown(text: str) -> str:
    lines: list[str] = []
    in_fence = False
    for line in text.splitlines():
        if line.lstrip().startswith('```'):
            in_fence = not in_fence
        elif not in_fence:
            lines.append(line)
    return '\n'.join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', nargs='?', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    errors: list[str] = []
    for required in ['SKILL.md', 'agents/openai.yaml', 'README.md', 'VALIDATION.md',
                     'examples/package.json', 'examples/README.md', 'references/27-source-index.md']:
        if not (root / required).is_file():
            errors.append(f'Missing required file: {required}')
    skill = root / 'SKILL.md'
    if skill.exists():
        front = re.match(r'\A---\n(.*?)\n---\n', skill.read_text(), re.S)
        if not front:
            errors.append('SKILL.md has no YAML frontmatter')
        else:
            name = re.search(r'^name:\s*(.+)$', front.group(1), re.M)
            desc = re.search(r'^description:\s*(.+)$', front.group(1), re.M)
            if not name or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name.group(1)):
                errors.append('Invalid skill name')
            if name and len(name.group(1)) > 64:
                errors.append('Skill name exceeds 64 characters')
            if not desc or len(desc.group(1)) > 1024:
                errors.append('Missing/overlong description')
    files = [p for p in root.rglob('*') if p.is_file() and not any(
        part in {'node_modules', '.git', 'dist', '__pycache__'} for part in p.relative_to(root).parts)]
    markdown = [p for p in files if p.suffix == '.md']
    texts = {p: p.read_text(encoding='utf-8') for p in markdown}
    anchors = {p: headings(text) for p, text in texts.items()}
    link_count = 0
    for path, text in texts.items():
        fences = sum(line.lstrip().startswith('```') for line in text.splitlines())
        if fences % 2:
            errors.append(f'{path.relative_to(root)}: unclosed code fence')
        if re.search(r'\b(?:TODO_WRITE|PLACEHOLDER_CONTENT|LOREM IPSUM)\b', text):
            errors.append(f'{path.relative_to(root)}: unfinished placeholder')
        for match in re.finditer(r'(?<!!)\[[^\]]*\]\(([^)]+)\)', visible_markdown(text)):
            dest = match.group(1).split(' "', 1)[0].strip('<>')
            split = urlsplit(dest)
            if split.scheme or dest.startswith('//'):
                continue
            if not split.path and not split.fragment:
                continue
            link_count += 1
            target = (path.parent / unquote(split.path)).resolve() if split.path else path
            if not target.is_relative_to(root):
                errors.append(f'{path.relative_to(root)}: link escapes bundle: {dest}')
                continue
            if not target.exists():
                errors.append(f'{path.relative_to(root)}: missing link target: {dest}')
            elif split.fragment and target.suffix == '.md' and unquote(split.fragment) not in anchors.get(target, set()):
                errors.append(f'{path.relative_to(root)}: missing heading: {dest}')
    for path in files:
        if path.suffix == '.json':
            try:
                json.loads(path.read_text())
            except (ValueError, UnicodeError) as exc:
                errors.append(f'{path.relative_to(root)}: invalid JSON: {exc}')
    # These checks apply to authored runtime examples, not warning prose.
    for path in files:
        if 'examples' in path.parts and path.suffix in {'.ts', '.tsx'}:
            text = path.read_text()
            # Remove comments to avoid flagging documentation of forbidden APIs.
            code = re.sub(r'/\*.*?\*/|//[^\n]*', '', text, flags=re.S)
            if re.search(r'\b(?:createActor|useMachine|useActorRef|fromPromise)\s*\(', code):
                errors.append(f'{path.relative_to(root)}: forbidden alternate runtime/bridge')
            if re.search(r'\bas\s+any\b|@ts-ignore', code):
                errors.append(f'{path.relative_to(root)}: unsafe type suppression')
    result = {'markdown_files': len(markdown), 'local_links_checked': link_count,
              'all_files': len(files), 'errors': errors,
              'scope': 'Local structure/links/JSON/basic policy only; no remote URL, type, or runtime checks.'}
    print(json.dumps(result, indent=2))
    return 1 if errors else 0

if __name__ == '__main__':
    sys.exit(main())
