#!/usr/bin/env python3
"""Search the local source index. No network or project execution."""
import argparse
import json
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("terms", nargs="+")
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()
    if not 1 <= args.limit <= 100: parser.error("limit must be between 1 and 100")
    path = Path(__file__).resolve().parents[1] / "references/source-index.json"
    try:
        records = json.loads(path.read_text(encoding="utf-8"))["records"]
    except (OSError, ValueError, KeyError):
        parser.exit(2, "Cannot read the packaged source index\n")
    terms = [t.casefold() for value in args.terms for t in value.split()]
    ranked = []
    for record in records:
        text = " ".join([record["title"], record["url"], *record["references"]]).casefold()
        score = sum(1 for term in terms if term in text)
        if score: ranked.append((score, record["url"], record))
    for _, _, record in sorted(ranked, key=lambda row: (-row[0], row[1]))[:args.limit]:
        print(record["title"])
        print("  " + record["url"])
        print("  evidence: " + record["evidence"])
        if record["references"]: print("  local: " + ", ".join(record["references"]))
    if not ranked: print("No local match. Consult the official llms.txt index.")
if __name__ == "__main__": main()
