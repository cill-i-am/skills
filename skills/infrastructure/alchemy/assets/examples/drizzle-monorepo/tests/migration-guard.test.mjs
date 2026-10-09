import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const source = fileURLToPath(new URL("../scripts/require-migrations.mjs", import.meta.url));
function fixture(fn) {
  const root = mkdtempSync(path.join(tmpdir(), "alchemy-migrations-"));
  mkdirSync(path.join(root, "scripts"));
  copyFileSync(source, path.join(root, "scripts/require-migrations.mjs"));
  const directory = path.join(root, "packages/notes/drizzle/sqlite");
  mkdirSync(directory, { recursive: true });
  const run = (args, cwd = root) => spawnSync(process.execPath,
    [path.join(root, "scripts/require-migrations.mjs"), ...args], { cwd, encoding: "utf8" });
  try { fn({ root, directory, run }); } finally { rmSync(root, { recursive: true, force: true }); }
}
for (const dialect of ["sqlite", "postgres"]) {
  test(`rejects missing ${dialect} SQL`, () => fixture(({ run }) => {
    const result = run([dialect]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Generate and review migrations first/);
  }));
}
test("rejects an unsupported dialect", () => fixture(({ run }) => assert.equal(run(["mysql"]).status, 2)));
test("rejects extra arguments", () => fixture(({ run }) => assert.equal(run(["sqlite", "extra"]).status, 2)));
test("rejects a package-directory deployment", () => fixture(({ directory, run }) => {
  assert.equal(run(["sqlite"], directory).status, 2);
}));
test("accepts a nested SQL file", () => fixture(({ directory, run }) => {
  const nested = path.join(directory, "20261009_example");
  mkdirSync(nested);
  writeFileSync(path.join(nested, "migration.sql"), "SELECT 1;\n");
  assert.equal(run(["sqlite"]).status, 0);
}));
test("ignores a symlink to SQL", () => fixture(({ root, directory, run }) => {
  const target = path.join(root, "outside.sql");
  writeFileSync(target, "SELECT 1;\n");
  symlinkSync(target, path.join(directory, "linked.sql"));
  assert.equal(run(["sqlite"]).status, 1);
}));
test("ignores a symlinked migration directory", () => fixture(({ root, directory, run }) => {
  const target = path.join(root, "outside");
  mkdirSync(target);
  writeFileSync(path.join(target, "migration.sql"), "SELECT 1;\n");
  symlinkSync(target, path.join(directory, "linked"), "dir");
  assert.equal(run(["sqlite"]).status, 1);
}));
