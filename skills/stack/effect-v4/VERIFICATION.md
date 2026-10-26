# Verification record

**Baseline:** Effect `4.0.2`, source tag `effect@4.0.2`, research date **7 October 2026**. The fixture declares TypeScript `7.0.2`. The authoring environment provided Node `22.16.0` and a parser-compatible TypeScript `5.8.3` installation.

## What has and has not been established

Source review was performed against the official v4 guides, API inventory, and selected pinned source listed in [SOURCES.md](SOURCES.md). The complete source-file inventory and review scopes are recorded in [source-manifest.json](references/source-manifest.json).

The original archive authoring checks are recorded in [validation-report.json](validation-report.json). These checks validate packaging, local links, JSON/YAML, mirrored guide snippets, and syntax. They do not resolve or execute Effect APIs.

**Not executed:** semantic compilation against the declared Effect/TypeScript dependencies; the three Effect runtime test suites; agent evaluation scenarios; real database, provider, socket, worker, browser, durable-engine, cluster or cloud integrations. Dependency downloads were unavailable in the authoring environment, and no installed Effect package was available. No successful typecheck, test pass, production validation, or benchmark result is claimed for those checks.

## Executed offline checks

At original archive authoring, the bundle validator passed with **48 Markdown files** and **484 valid local-path links**. TypeScript **5.8.3** parsed **67 source files and fenced examples** with no syntax errors. JavaScript syntax checks passed for **5 files**; Python syntax checks passed for **3 helpers**. Skill/agent/CI YAML metadata parsed successfully. Three synthetic-metadata inspector checks and one module-lookup smoke test passed.

These are packaging and syntax results only. No Effect semantic or runtime validation is implied.

## Evidence levels

| Check | Meaning | Limit |
| --- | --- | --- |
| Official-source comparison | APIs/patterns compared with identified guides and source sections | Not every function or deployment configuration was inspected |
| TypeScript syntax parsing | A parser accepted the example source/fenced blocks | Does not resolve imports, overloads, types, or run the code |
| JavaScript/Python syntax checks | Helper/test source parses successfully | Does not execute Effect tests or prove helper behaviour on every host |
| Bundle validation | Local paths, metadata, JSON, counts and snippet mirrors are consistent | Does not prove external links remain reachable |
| Authored runtime tests | There is a runnable set of behaviour assertions | Their assertions have not been observed passing here |
| Authored agent evaluations | There are representative prompts and grading criteria | No model evaluation runs were performed |

## Reproduce offline checks

```sh
python3 scripts/verify-package.py
node --check scripts/inspect-project.mjs
python3 -m py_compile scripts/*.py
```

With an available TypeScript JavaScript-parser module, run `node scripts/check-typescript-syntax.cjs`. Set `NODE_PATH` or `EFFECT_SYNTAX_COMPILER` when using an existing compiler outside the fixture. A native compiler may not expose this JavaScript parser API; the helper reports that limitation rather than pretending to typecheck.

## Complete semantic and runtime validation

```sh
cd examples
npm install
npm run check
npm test
```

Review and commit the generated lockfile before repeatable `npm ci` runs. Record the actual resolved versions, commands, results, and environment. Investigate any failure against the matching source rather than hiding it with casts or ignored diagnostics.

Then run the application's real adapter tests and deployment build for any integration being adopted. In-memory examples cannot prove distributed persistence, real network cancellation, browser hydration, database isolation, or provider behaviour.

## PR publication checks — 9 October 2026

The module atlas was regenerated as a compact grouped view of the existing
machine-readable inventory. All 357 names, including `testing/TestSchema`, are
present; exact API and pinned-source URLs remain in `module-index.json` and the
lookup helper. Other topic guides and examples are unchanged from the ZIP.

[publication-validation.json](publication-validation.json) records the checks rerun
for this publication. The bundle validator passes with 48 Markdown files and 150
local links. TypeScript 5.8.3 parses 67 sources/fenced examples; five JavaScript
files, three Python helpers, and the skill/agent/CI YAML parse successfully. The
atlas names and counts match all 357 inventory entries exactly. A flattened
single-skill copy also passes the bundle validator.

These checks do not run the complete repository validator, the skills installer,
semantic compilation, Effect runtime tests, or model evaluations. Those remain
pending, as do the implementation improvements and comparative benchmark discussed
in review. Opening a draft PR is not evidence that those gates passed.
