#!/usr/bin/env node
/** Syntax only: does not resolve Alchemy imports or run code. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
const require = createRequire(pathToFileURL(path.join(process.cwd(), "package.json")));
let ts;
try { ts = require("typescript"); }
catch { console.error("TypeScript is not resolvable from this project; use its installed TypeScript or NODE_PATH."); process.exit(2); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets/examples");
const files = [];
function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || entry.name === "node_modules") continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) visit(p);
    else if (p.endsWith(".ts")) files.push(p);
  }
}
visit(root);
let errors = 0;
for (const p of files) {
  const source = ts.createSourceFile(p, fs.readFileSync(p, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const diagnostic of source.parseDiagnostics) {
    errors++;
    console.error(path.relative(root, p) + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
  }
}
console.log(JSON.stringify({ check: "TypeScript syntax only", typescript: ts.version, files: files.length, errors }));
process.exitCode = errors ? 1 : 0;
