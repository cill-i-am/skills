import { cp, mkdir, mkdtemp, readFile, rm, writeFile, chmod, readdir, realpath } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { assessBehavior, selection, startupInjections, assertionSource } from './scoring.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const args = process.argv.slice(2);
if (args.some((arg) => !['--smoke', '--prepare', '--recovery'].includes(arg))) throw new Error('Use --smoke, --recovery or --prepare only.');
const allCases = JSON.parse(await readFile(join(here, 'cases.json'), 'utf8'));
const cases = args.includes('--recovery') ? allCases.filter((c) => c.id.startsWith('recovery-')) : args.includes('--smoke') ? allCases.filter((c) => ['missing-fact-implicit', 'missing-fact-explicit', 'design-sibling', 'release-negative'].includes(c.id)) : allCases;
const stamp = new Date().toISOString().replaceAll(':', '-');
const outputDir = join(here, 'results', stamp);
await mkdir(outputDir, { recursive: true });
const temporary = await mkdtemp(join(await realpath(tmpdir()), 'skill-eval-'));
const codexHome = join(temporary, 'codex-home');
try {
  await mkdir(codexHome, { mode: 0o700 });
  // No settings or global skills are copied. Never print or retain auth material.
  if (!args.includes('--prepare')) {
    const authHome = process.env.CODEX_HOME || join(homedir(), '.codex');
    await cp(join(authHome, 'auth.json'), join(codexHome, 'auth.json'));
    await chmod(join(codexHome, 'auth.json'), 0o600);
  }
  const tests = [];
  for (const c of cases) {
    const workspace = join(temporary, c.id);
    for (const [category, skill] of [['documentation', 'diataxis'], ['planning', 'effective-design-docs']]) {
      await cp(join(repo, 'skills', category, skill), join(workspace, '.agents/skills', skill), { recursive: true });
    }
    tests.push({ description: c.id, vars: { request: c.prompt, workspace },
      assert: [{ type: 'javascript', value: assertionSource(c.required) }] });
  }
  const config = {
    description: 'Diataxis pilot: behavior and invocation evidence scored separately',
    prompts: ['{{request}}'],
    providers: [{ id: 'openai:codex-sdk', config: {
      model: 'gpt-6-sol', model_reasoning_effort: 'low', working_dir: '{{workspace}}',
      codex_path_override: join(here, 'node_modules/.bin/codex'),
      skip_git_repo_check: true, sandbox_mode: 'read-only', approval_policy: 'never',
      network_access_enabled: false, web_search_mode: 'disabled', persist_threads: false,
      enable_streaming: true, maxRetries: 0,
      cli_env: { CODEX_HOME: codexHome, HOME: temporary, XDG_CONFIG_HOME: join(temporary, 'config') },
      cli_config: { 'features.apps': false, 'features.multi_agent': false },
    } }], tests,
    tracing: { enabled: true },
    evaluateOptions: { maxConcurrency: 1 },
  };
  const configPath = join(temporary, 'promptfooconfig.json');
  await writeFile(configPath, JSON.stringify(config, null, 2));
  const skill = await readFile(join(repo, 'skills/documentation/diataxis/SKILL.md'));
  const manifest = { date: stamp, commit: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).stdout.trim(),
    skillSha256: createHash('sha256').update(skill).digest('hex'),
    caseSuiteSha256: createHash('sha256').update(await readFile(join(here, 'cases.json'))).digest('hex'),
    model: 'gpt-6-sol', reasoning: 'low',
    catalog: ['diataxis', 'effective-design-docs'], cases: cases.map((c) => c.id),
    auth: 'Existing ChatGPT login copied into temporary private home; deleted after run',
    versions: JSON.parse(await readFile(join(here, 'package.json'), 'utf8')).devDependencies };
  await writeFile(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  if (args.includes('--prepare')) { console.log(`Prepared ${cases.length} fresh fixtures; no inference. Manifest: ${outputDir}`); }
  else {
    const env = { ...process.env, PROMPTFOO_DISABLE_TELEMETRY: '1', PROMPTFOO_CONFIG_DIR: join(temporary, 'promptfoo') };
    delete env.OPENAI_API_KEY; delete env.CODEX_API_KEY;
    const result = spawnSync(join(here, 'node_modules/.bin/promptfoo'), ['eval', '-c', configPath, '--no-cache', '--max-concurrency', '1', '--output', join(outputDir, 'results.json')],
      { cwd: here, env, stdio: 'inherit', timeout: 600_000 });
    if (result.error) throw result.error;
    const raw = JSON.parse(await readFile(join(outputDir, 'results.json'), 'utf8'));
    const rows = raw.results?.results ?? raw.results;
    if (!Array.isArray(rows)) throw new Error('Unknown Promptfoo export shape; retain results for inspection.');
    const startup = [];
    async function collect(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = join(directory, entry.name);
        if (entry.isDirectory()) await collect(file);
        else if (entry.name.endsWith('.jsonl')) {
          const events = (await readFile(file, 'utf8')).trim().split('\n').map((line) => JSON.parse(line));
          startup.push(...startupInjections(events));
        }
      }
    }
    try { await collect(join(codexHome, 'sessions')); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await writeFile(join(outputDir, 'startup-evidence.json'), JSON.stringify(startup, null, 2));
    const summary = rows.map((row, i) => {
      const c = cases.find((c) => c.id === row.testCase?.description) ?? cases[i];
      const response = row.response ?? {};
      return { id: c.id, mode: c.mode, behavior: assessBehavior(response, row.error, c.required),
        selection: selection(c.expectedSkill, response.metadata, startup.filter((s) => s.sessionId === response.sessionId).map((s) => s.name)), sessionId: response.sessionId ?? response.metadata?.sessionId,
        usage: response.tokenUsage, estimatedApiCost: response.cost, rubric: c.rubric };
    });
    const ids = summary.map((r) => r.sessionId).filter(Boolean);
    if (new Set(ids).size !== ids.length || ids.includes('unknown')) throw new Error('Invalid/repeated session IDs: fresh-session invariant violated.');
    await writeFile(join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(`Results and review rubric: ${outputDir}`);
    process.exitCode = result.status ?? 1;
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
