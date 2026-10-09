#!/usr/bin/env python3
"""Fetch a candidate official v4 module index. Never overwrite reviewed evidence."""
import argparse
import datetime
import json
import re
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

URL = "https://effect.website/docs/v4/api/effect"
MAX_BYTES = 5_000_000

class IndexParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.modules = set()
    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        href = dict(attrs).get("href", "")
        target = urllib.parse.urlsplit(urllib.parse.urljoin(URL, href))
        if target.scheme != "https" or target.netloc != "effect.website":
            return
        match = re.fullmatch(r"/docs/v4/api/effect/([A-Za-z0-9_/-]+)/?", target.path)
        if match:
            self.modules.add(match.group(1).rstrip("/"))

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--output", type=Path, default=Path("module-index.candidate.json"))
args = parser.parse_args()
if args.output.name in {"module-index.json", "source-manifest.json"}:
    parser.error("Write a candidate file, not a reviewed manifest")
if args.output.exists():
    parser.error("Output already exists; choose a new candidate path")
try:
    request = urllib.request.Request(URL, headers={"User-Agent": "effect-v4-skill-inventory-review/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        final = urllib.parse.urlsplit(response.url)
        if final.scheme != "https" or final.netloc != "effect.website" or "/docs/v4/" not in final.path:
            raise ValueError("Unexpected redirect outside the official v4 documentation")
        raw = response.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise ValueError("Documentation response exceeds the size limit")
    html = raw.decode("utf-8")
    index = IndexParser()
    index.feed(html)
    if len(index.modules) < 100:
        raise ValueError("Too few modules found; review possible website structure changes")
    payload = {
        "source": URL, "fetched_on": datetime.date.today().isoformat(),
        "status": "candidate only; package version, signatures, stability, and behaviour not verified",
        "count": len(index.modules),
        "modules": [{"path": item, "api_url": URL + "/" + item} for item in sorted(index.modules)]
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("x", encoding="utf-8") as target:
        target.write(json.dumps(payload, indent=2) + "\n")
    print(f"Wrote {len(index.modules)} candidate entries to {args.output}. Compare with the reviewed index before adopting changes.")
except Exception as error:
    raise SystemExit(f"Refresh failed without updating reviewed files: {error}")
