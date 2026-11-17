#!/usr/bin/env python3
"""Verify that an unresolved provider import makes the fixture typecheck fail."""
import subprocess
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "assets/examples"
with tempfile.TemporaryDirectory(dir=root) as scratch:
    file = Path(scratch) / "negative.ts"
    module = "@alchemy.run/cloudflare/NonexistentAcceptanceModule"
    file.write_text(f'import * as provider from "{module}";\nexport {{ provider }};\n')
    result = subprocess.run([root/"node_modules/.bin/tsc", "--noEmit", "--skipLibCheck",
                             "--module", "esnext", "--moduleResolution", "bundler", file],
                            capture_output=True, text=True, cwd=root)
    if result.returncode == 0 or "TS2307" not in result.stdout or module not in result.stdout:
        raise SystemExit("The compiler did not reject the missing provider import as expected.")
print("The pinned compiler rejected the missing provider import with TS2307.")
