#!/usr/bin/env python3
"""Find a version-matched guide, example, package export map or service reference."""
from catalogue import unpack
import argparse
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parents[1] / "references"

def search(query, limit):
    manifest = json.loads((BASE/"source-index.json").read_text())
    query = query.lower().strip()
    if "digitalocean" in query:
        print(manifest["availability"]["DigitalOcean"])
    terms = re.findall(r"[a-z0-9]+", query)
    ranked = []
    for shard in manifest["shards"]:
        for line in (BASE/shard).read_text().splitlines():
            row = unpack(line, manifest["revision"])
            title = row["title"].lower()
            subject = (row["terms"]+" "+title+" "+row["url"].rsplit("/", 2)[-2]).lower()
            if not terms or any(t not in subject for t in terms): continue
            score = 12*(query == title) + 6*(query in title) + 4*(query in subject) + sum(t in title for t in terms)
            if row["kind"] == "release guide":
                score += 10
            if row["kind"] == "release symbols" and query in row["terms"].lower().split():
                score += 5
            ranked.append((-score, row["kind"], row["url"], row["title"]))
    for _,kind,url,title in sorted(set(ranked))[:limit]:
        print(f"{title} [{kind}]\n  {url}")
    if not ranked:
        print("Check the installed package export map and matching provider source. Live docs index: https://alchemy.run/llms-full.txt")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("terms", nargs="+")
    parser.add_argument("--limit", type=int, choices=range(1,101), default=10, metavar="1..100")
    args = parser.parse_args()
    search(" ".join(args.terms), args.limit)
