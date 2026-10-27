import json
from pathlib import Path
import sys
import subprocess
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from capture import capture


FAKE_BROWSER = '''#!PYTHON
import json,pathlib,sys
log=pathlib.Path(__file__).with_suffix('.log')
with log.open('a') as f: f.write(json.dumps(sys.argv[1:])+'\\n')
if 'screenshot' in sys.argv: pathlib.Path(sys.argv[-1]).write_bytes(b'fake image')
if 'a11y' in sys.argv and 'failing' in __file__:
 print(json.dumps({'success':False,'error':'audit unavailable'}))
else: print(json.dumps({'success':True,'data':{'test':True}}))
'''


class CaptureTests(unittest.TestCase):
    def test_cli_refuses_changed_outcome_before_browser_launch(self):
        from harness import hashes, write_json
        with tempfile.TemporaryDirectory() as tmp:
            run = Path(tmp)
            root = run / "workspace"
            root.mkdir()
            (root / "index.html").write_text("<h1>Original</h1>")
            logs = run / "cases" / "example"
            logs.mkdir(parents=True)
            write_json(logs / "result.json", {"workspace": str(root), "after": hashes(root)})
            (root / "index.html").write_text("<h1>Unrelated edit</h1>")
            browser = run / "working"
            browser.write_text(FAKE_BROWSER.replace("PYTHON", sys.executable, 1))
            browser.chmod(0o755)
            result = subprocess.run([sys.executable, str(Path(__file__).resolve().parents[1] / "capture.py"),
                str(run), "--case", "example", "--phase", "after", "--browser", str(browser)],
                capture_output=True, text=True, timeout=60)
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(browser.with_suffix(".log").exists())
            (root / "index.html").write_text("<h1>Original</h1>")
            restored = subprocess.run(result.args, capture_output=True, text=True, timeout=60)
            self.assertEqual(restored.returncode, 0, restored.stderr)
            self.assertTrue((logs / "browser-after/capture.json").exists())

    def test_capture_and_error_cleanup(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            fixture = root / "fixture"
            fixture.mkdir()
            (fixture / "index.html").write_text("<h1>Fixture</h1>")
            for name in ["working", "failing"]:
                browser = root / name
                browser.write_text(FAKE_BROWSER.replace("PYTHON", sys.executable, 1))
                browser.chmod(0o755)
                output = root / (name + "-output")
                if name == "working":
                    result = capture(fixture, output, str(browser), True)
                    self.assertEqual(result["status"], "captured")
                    self.assertEqual(len(list(output.glob("*.png"))), 4)
                else:
                    with self.assertRaises(RuntimeError):
                        capture(fixture, output, str(browser))
                    result = json.loads((output / "capture.json").read_text())
                    self.assertEqual(result["status"], "error")
                calls = [json.loads(line) for line in browser.with_suffix(".log").read_text().splitlines()]
                self.assertEqual(calls[-1][-1], "close")
                self.assertEqual(len({call[1] for call in calls}), 1)


if __name__ == "__main__":
    unittest.main()
