#!/usr/bin/env node
/** Parse TS/TSX only. This is deliberately NOT a semantic TypeScript check. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ownDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] ?? path.join(ownDir, '../examples'));
const require = createRequire(path.join(root, 'package.json'));
let ts;
try {
  ts = process.env.TYPESCRIPT_PATH ? require(process.env.TYPESCRIPT_PATH) : require('typescript');
} catch {
  console.error('TypeScript is not installed. Install the example dependencies, or set TYPESCRIPT_PATH to a local TypeScript module.');
  process.exit(2);
}
if (!fs.existsSync(root)) {
  console.error(`Directory not found: ${root}`); process.exit(2);
}
const skip = new Set(['node_modules', 'dist', '.git', 'build']);
const files = [];
function visit(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.isSymbolicLink()) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !skip.has(item.name)) visit(full);
    else if (item.isFile() && /\.tsx?$/.test(item.name)) files.push(full);
  }
}
visit(root);
const errors = [];
for (const file of files.sort()) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  for (const diagnostic of source.parseDiagnostics) {
    const pos = source.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    errors.push({ file: path.relative(root, file), line: pos.line + 1, column: pos.character + 1,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n') });
  }
}
console.log(JSON.stringify({ typescript: ts.version, files_checked: files.length,
  files: files.map((f) => path.relative(root, f)), errors,
  scope: 'Syntax parsing only. Includes preview syntax, NOT preview compatibility. No dependencies, semantic inference, or runtime behavior validated.' }, null, 2));
process.exit(errors.length ? 1 : 0);
