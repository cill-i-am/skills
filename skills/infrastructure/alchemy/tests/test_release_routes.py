"""Runtime retrieval and catalogue integrity checks for the pinned release."""
import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class ReleaseRoutes(unittest.TestCase):
    def test_every_shard_is_available_and_every_record_unique(self):
        index = json.loads((ROOT/"references/source-index.json").read_text())
        records = [json.loads(line) for shard in index["shards"]
                   for line in (ROOT/"references"/shard).read_text().splitlines()]
        self.assertEqual(len({(r["url"], r["title"], r["terms"]) for r in records}), index["record_count"])
        for r in records:
            if r["kind"].startswith("release"):
                self.assertIn(index["revision"], r["url"])

    def test_workload_queries_route_to_upstream(self):
        cases = {"Alchemist": "cli/api", "Resource.lookup": "infrastructure-as-code/references",
                 "Turso": "/turso/", "worktrees": "environments/worktrees",
                 "projection replay rebuild": "domain/backfill",
                 "disposable sandbox": "/e2b/", "workload identity keyless": "identity-federation",
                 "DigitalOcean": "beta.87 tag has no DigitalOcean provider"}
        for query, expected in cases.items():
            with self.subTest(query=query):
                result = subprocess.check_output([sys.executable, ROOT/"scripts/find-reference.py",
                                                  "--limit", "5", query], text=True)
                self.assertIn(expected, result)
