import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("inspect_project", Path(__file__).parents[1] / "scripts/inspect-project.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class InventoryTests(unittest.TestCase):
    def test_inventory_excludes_secrets_and_script_bodies(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "package.json").write_text(json.dumps({
                "packageManager": "pnpm@12.9.1", "dependencies": {"alchemy": "2.0.0-beta.81", "effect": "4.0.0"},
                "scripts": {"deploy": "echo NEVER_PRINT_THIS"}}))
            (root / ".env").write_text("TOKEN=NEVER_PRINT_THIS")
            (root / "alchemy.run.ts").write_text("// no execution")
            (root / "pnpm-lock.yaml").write_text("lockfileVersion: '9.0'")
            (root / ".alchemy").mkdir()
            (root / ".alchemy" / "package.json").write_text("invalid")
            result = module.inspect(root)
            self.assertNotIn("NEVER_PRINT_THIS", json.dumps(result))
            self.assertEqual(result["stack_files"], ["alchemy.run.ts"])
            self.assertEqual(result["lockfiles"], ["pnpm-lock.yaml"])
            self.assertEqual(result["manifests"][0]["script_names"], ["deploy"])
    def test_malformed_manifest_reports_no_contents(self):
        with tempfile.TemporaryDirectory() as directory:
            (Path(directory) / "package.json").write_text("not json SECRET")
            result = module.inspect(Path(directory))
            self.assertEqual(len(result["warnings"]), 1)
            self.assertNotIn("SECRET", json.dumps(result))
    def test_symlink_is_not_followed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            outside = root / ".hidden"
            outside.mkdir()
            (outside / "package.json").write_text('{"scripts":{"secret":"hidden"}}')
            (root / "linked").symlink_to(outside, target_is_directory=True)
            self.assertEqual(module.inspect(root)["manifests"], [])
    def test_scan_is_bounded(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for i in range(4): (root / f"file{i}").write_text("")
            self.assertTrue(module.inspect(root, 1)["truncated"])
    def test_invalid_limit(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(ValueError): module.inspect(Path(directory), 0)
    def test_dependency_url_credentials_are_not_echoed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "package.json").write_text(json.dumps({
                "dependencies": {"alchemy": "https://user:SECRET@example.invalid/alchemy.tgz"},
                "packageManager": "https://user:SECRET@example.invalid/manager"}))
            result = module.inspect(root)
            self.assertNotIn("SECRET", json.dumps(result))
            self.assertIn("non-version spec omitted", json.dumps(result))

    def test_node_modules_symlink_is_not_followed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            outside = root / ".hidden_modules"
            (outside / "alchemy").mkdir(parents=True)
            (outside / "alchemy/package.json").write_text('{"version":"2.0.0"}')
            (root / "node_modules").symlink_to(outside, target_is_directory=True)
            result = module.inspect(root)
            self.assertIsNone(result["installed_alchemy"])
            self.assertTrue(any(w["problem"] == "symlink_not_followed" for w in result["warnings"]))

    def test_nonobject_installed_manifest_does_not_crash(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            package = root / "node_modules/alchemy"
            package.mkdir(parents=True)
            (package / "package.json").write_text('[]')
            result = module.inspect(root)
            self.assertIsNone(result["installed_alchemy"])
            self.assertTrue(result["warnings"])

if __name__ == "__main__": unittest.main()
