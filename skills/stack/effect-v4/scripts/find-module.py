#!/usr/bin/env python3
"""Search the bundled module inventory without fetching or executing anything."""
import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("query", help="Case-insensitive module or group substring")
parser.add_argument("--limit", type=int, default=30)
args = parser.parse_args()
if not 1 <= args.limit <= 357:
    parser.error("--limit must be between 1 and 357")
root = Path(__file__).resolve().parents[1]
data = json.loads((root / "references/module-index.json").read_text())
query = args.query.casefold()
results = [m for m in data["modules"] if query in (m["group"] + "/" + m["module"]).casefold()]
for item in results[:args.limit]:
    print(f'{item["group"]}/{item["module"]}\n  API: {item["api_url"]}\n  Source: {item["source_url"]}')
print(f"{len(results)} match(es); displayed {min(len(results), args.limit)}. Inventory baseline: {data['version']}.")
