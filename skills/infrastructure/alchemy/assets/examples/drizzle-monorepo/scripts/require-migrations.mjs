import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dialect = process.argv[2];
if (process.argv.length !== 3 || !["sqlite", "postgres"].includes(dialect)) {
  console.error("Usage: node scripts/require-migrations.mjs sqlite|postgres");
  process.exit(2);
}
const root = fileURLToPath(new URL("../", import.meta.url));
if (path.resolve(process.cwd()) !== path.resolve(root)) {
  console.error("Run the example deployment scripts from the workspace root.");
  process.exit(2);
}
function hasSql(dir) {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir, { withFileTypes: true }).some(entry => {
    if (entry.isSymbolicLink()) return false;
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? hasSql(full) : entry.isFile() && entry.name.endsWith(".sql");
  });
}
if (!hasSql(path.join(root, "packages/notes/drizzle", dialect))) {
  console.error(`Generate and review migrations first: pnpm db:generate:${dialect}`);
  process.exit(1);
}
// Existence only: this does not validate SQL, snapshots, schema drift, or history.
