# Effect v4 skill

A standalone Effect 4 programming skill built from the official versioned documentation and selected upstream source. It is an original task-oriented synthesis, not a copied documentation dump. The technical baseline is `effect@4.0.2`, observed on **7 October 2026**. Use the actual installed v4 version when applying it to a project.

## Contents

The entry file [SKILL.md](SKILL.md) routes work into **40 focused reference files**. The package also includes **33 TypeScript example files**, **three Node test suites**, **30 agent evaluation scenarios**, a **357-module core-package discovery index**, source provenance, read-only helpers, and CI/review templates.

```text
effect-v4/
  SKILL.md                 Agent instructions and task routing
  agents/openai.yaml       Optional UI/invocation metadata
  references/              Topic guides, coverage map, module/source inventories
  examples/                Pinned package, TypeScript sources, Node tests
  scripts/                 Read-only inspection, lookup and offline validation
  evals/                   Skill evaluation prompts and rubric
  templates/               CI step fragment and change-review checklist
  SOURCES.md               Source provenance and reading map
  VERIFICATION.md          Actual checks and explicit limitations
  NOTICE.md                Upstream attribution
```

The guides cover core Effect programming, Schema, services/Layers, resources and runtime boundaries, concurrency, scheduling, caches/batching, streams/sinks/channels, config, utilities, observability, HTTP/RPC, SQL, persistence/event logs, CLI/processes, workers, reactive UI/SSR/forms, testing, production/CI, AI/tools/MCP, workflows, and clustering.

## Install locally

Extract the archive and place the complete `effect-v4` directory in the agent's skill directory. Keep the references and scripts beside `SKILL.md`; copying only the entry file discards most of the skill.

For Codex, use a repository-local `.agents/skills/effect-v4/` or a personal `~/.agents/skills/effect-v4/` folder. The official authoring guide documents both locations. Preserve any existing folder rather than overwriting it blindly. This package does not install itself or modify any repository.

After local discovery, invoke it explicitly in Codex with a prompt such as:

```text
$effect-v4 Review this service for incorrect resource lifetimes, lost transaction
context, unsafe retries, and missing cancellation tests. Use the installed v4 APIs.
```

Other useful prompts:

```text
$effect-v4 Implement a schema-first HTTP endpoint with a repository service,
request-scoped authorization, and tests for invalid input and cancellation.
```

```text
$effect-v4 Design a durable approval workflow. Separate completed activity replay,
external idempotency, authorization, and persistence guarantees.
```

For other agents, use their supported skill-folder/import mechanism. This ZIP is a portable skill source bundle, not a submitted marketplace plugin or an automatic cross-product installation.

## Validate the examples

Read [the verification record](VERIFICATION.md) first. The fixture pins Effect `4.0.2` and TypeScript `7.0.2`; the compiler follows the pinned upstream repository's development version. No dependency install, semantic typecheck, or Effect runtime test succeeded in the authoring environment because dependency downloads were unavailable.

In an environment with registry access:

```sh
cd effect-v4/examples
npm install
npm run check
npm test
```

Review the generated lockfile and commit it when adopting the fixture. Subsequent reproducible CI installs should use `npm ci`. No fake lockfile is included. These tests do not call a real AI provider, database, or public API, and they do not prove a production integration works.

The optional CLI and Vitest snippets in the guides require compatible additional packages. They are not imported by the minimal fixture. Confirm those packages' peer dependencies before using them.

## Useful local commands

```sh
python3 effect-v4/scripts/verify-package.py
node effect-v4/scripts/inspect-project.mjs /path/to/project
python3 effect-v4/scripts/find-module.py queue
python3 effect-v4/scripts/find-module.py schema --limit 20
```

The project inspector reads package metadata without importing project code, running scripts, installing dependencies, or editing files. A nonzero exit indicates missing metadata, an unresolved installed Effect package, or an incompatible major; inspect its JSON report rather than assuming a declared range is installed.

The syntax helper requires a TypeScript module exposing the JavaScript parser API. It can use an existing global module through `NODE_PATH` or an explicitly selected module path through `EFFECT_SYNTAX_COMPILER`. It is not a substitute for `npm run check`, including when a native compiler does not expose that parser API.

## Scope and evidence

The module atlas indexes all 357 modules of the baseline **effect** package. It is not a claim that every function, companion package, or deployment adapter was individually reviewed or tested. Low-level/less common modules remain discoverable through exact API and pinned-source links. [The coverage map](references/39-coverage-and-maintenance.md) and [source manifest](references/source-manifest.json) show the distinction.

Use the checklists selectively. A small pure-function change does not need a distributed-systems review; a payment retry or tenant-sensitive cache does need evidence for its failure cases.

## Sources and maintenance

Start with [SOURCES.md](SOURCES.md). When updating within v4, inspect source changes, refresh only the affected guides/examples, run the fixture and real integration tests, then replace the verification record with actual evidence. The optional inventory refresh writes a separate candidate file and refuses to overwrite the reviewed index.

Packaging and Codex discovery reference: [Official skill authoring guide](https://developers.openai.com/codex/build-skills).
