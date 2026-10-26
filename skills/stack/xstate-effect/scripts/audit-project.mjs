#!/usr/bin/env node
/** Read-only heuristic audit. Findings require review; this is not a compiler/linter. */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const json = args.includes('--json');
const fail = args.includes('--fail-on-findings');
const positionals = args.filter((arg) => !arg.startsWith('--'));
if (positionals.length !== 1 || args.some((arg) => arg.startsWith('--') && !['--json', '--fail-on-findings'].includes(arg))) {
  console.error('Usage: node audit-project.mjs <repository> [--json] [--fail-on-findings]');
  process.exit(2);
}
const root = path.resolve(positionals[0]);
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`Not a directory: ${root}`); process.exit(2);
}
const skip = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.wrangler', 'coverage', 'vendor', 'target']);
const findings = [];
const manifests = [];
const warnings = [];
let scanned = 0;
const limit = 10000;
function report(file, code, message, text = '', offset = 0) {
  findings.push({ file: path.relative(root, file), line: text.slice(0, offset).split('\n').length, code, message });
}
function scan(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (path.basename(file) === 'package.json') {
    try {
      const pkg = JSON.parse(text);
      const declared = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
      const relevant = Object.fromEntries(Object.entries(declared).filter(([key]) =>
        ['effect', 'xstate', '@xstate/effect', '@xstate/react', '@effect/atom-react', '@xstate/test'].includes(key)));
      if (Object.keys(relevant).length) manifests.push({ file: path.relative(root, file), dependencies: relevant });
      if (typeof relevant.effect === 'string' && /^[~^]?3\./.test(relevant.effect))
        report(file, 'effect-major', 'Effect 3 declaration conflicts with this Effect 4 skill. Inspect; do not auto-upgrade.');
      if (typeof relevant.xstate === 'string' && /^[~^]?5\./.test(relevant.xstate))
        report(file, 'xstate-major', 'XState 5 declaration differs from this v6 integration baseline.');
      if (relevant.xstate && !relevant['@xstate/effect'])
        warnings.push(`${path.relative(root, file)}: xstate declared without local @xstate/effect; it may be provided by another workspace.`);
    } catch (error) { warnings.push(`${path.relative(root, file)}: cannot parse package JSON: ${error.message}`); }
    return;
  }
  const rules = [
    ['vanilla-host', /\bcreateActor\s*\(/g, 'Possible vanilla actor host. Confirm the callee and replace only when it starts XState workflow logic.'],
    ['vanilla-react', /\b(?:useMachine|useActorRef|useActor)\s*\(/g, 'Possible hook-owned vanilla actor. Effect-backed logic needs Effect ownership.'],
    ['promise-bridge', /\bfromPromise\s*\(/g, 'Possible Promise actor bridge; use fromEffect for Effect-native work.'],
    ['discarded-effect', /\benq\s*\(\s*\([^)]*\)\s*=>\s*Effect\./g, 'Inline callback appears to return an unexecuted Effect. Register a declared action.'],
    ['inline-spawn', /\benq\.spawn\s*\(\s*fromEffect(?:Stream|EventStream)?\s*\(/g, 'Inline Effect actor source is invisible to requirement inference; register it.'],
    ['legacy-reactivity', /effect\/unstable\/reactivity/g, 'Old reactivity import differs from the stable Effect 4 alpha.6 reference.'],
    ['type-suppression', /@ts-ignore|\bas\s+any\b/g, 'Review type suppression near actor/service contracts; not automatically an XState issue.']
  ];
  // Heuristic by design: matches in comments and unrelated same-name APIs are possible.
  for (const [code, pattern, message] of rules) {
    for (const match of text.matchAll(pattern)) report(file, code, message, text, match.index);
  }
}
function visit(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (scanned >= limit) return;
    if (item.isSymbolicLink()) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !skip.has(item.name)) visit(full);
    else if (item.isFile() && (item.name === 'package.json' || /\.(?:[cm]?js|jsx|ts|tsx)$/.test(item.name))) {
      if (fs.statSync(full).size > 1_000_000) { warnings.push(`Skipped large file: ${path.relative(root, full)}`); continue; }
      scanned += 1;
      scan(full);
    }
  }
}
try { visit(root); }
catch (error) { console.error(`Audit read failed: ${error.message}`); process.exit(2); }
if (scanned >= limit) warnings.push('File-count limit reached; audit is incomplete.');
const result = { read_only: true, root, files_scanned: scanned, manifests, findings, warnings,
  limitations: 'Heuristic text scan; no lockfile resolution, aliases, type analysis, network calls, or proof of correctness. Comments can produce false positives.' };
if (json) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Read-only XState/Effect audit: ${scanned} files, ${findings.length} findings`);
  for (const m of manifests) console.log(`${m.file}: ${JSON.stringify(m.dependencies)}`);
  for (const f of findings) console.log(`${f.file}:${f.line} [${f.code}] ${f.message}`);
  for (const warning of warnings) console.log(`NOTE ${warning}`);
  console.log(result.limitations);
}
process.exit(fail && findings.length ? 1 : 0);
