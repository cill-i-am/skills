import json
from pathlib import Path
import sys
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
