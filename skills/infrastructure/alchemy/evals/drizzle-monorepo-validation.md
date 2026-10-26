# Drizzle/monorepo revision evidence

Revision researched and checked on **9 October 2026**, based on PR #13 head `f60bdbf1cfe07a2d0c044affb69cd8d4e0a34a05`. The earlier `validation.md` and `validation.json` describe the initial package, not this revision.

## Scope

Add a Drizzle-first reference, worked monorepo chapter, infrastructure-colocation guide, prioritized iteration checklist, and an independent pnpm example workspace with D1 and Neon/Postgres implementations of one Notes service. Add eight authored implementation-oriented evaluation cases. Preserve the original skill replacement and do not alter other skills or activate deployment workflows.

The example workspace has actual source/manifests/configuration, but still requires dependency resolution and migration generation. It is not represented as a tested production starter. Its browser demonstrates public health, not an authenticated CRUD UI. Its single-dataset bearer token is not end-user/tenant authentication.

## Executed checks

From the skill directory:

```sh
python3 scripts/validate-skill.py
node --test tests/preview-stage.test.mjs
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py'
NODE_PATH="$(npm root -g)" node scripts/check-example-syntax.mjs
node --experimental-strip-types --test assets/examples/drizzle-monorepo/packages/notes/test/title.test.ts
node --test assets/examples/drizzle-monorepo/tests/migration-guard.test.mjs
node --check assets/examples/drizzle-monorepo/scripts/require-migrations.mjs
node --check assets/examples/drizzle-monorepo/tests/migration-guard.test.mjs
```

| Check | Observed result | What it does not establish |
|---|---|---|
| Existing Node preview-stage guard | 26 tests passed | Workflow execution or cloud authorization |
| Existing Python project inspector | 8 tests passed | Dependency resolution |
| New pure title-policy tests | 4 tests passed | HTTP, Effect Layer, or database behavior |
| New migration-input guard | 8 tests passed | SQL/snapshot correctness or migration application |
| TypeScript syntax parser | 37 files, zero parse errors, TypeScript 5.8.3 | Dependency-aware typechecking or compatibility with the selected TypeScript 7 toolchain |
| Package validator | 135 local links, 39 reference chapters, 125 entry-point lines, zero errors | External-link or semantic/API validation |
| YAML/JSON parsing | All 7 YAML files and all JSON files parsed | Executable Actions or pnpm installation |
| New JavaScript syntax | Both new `.mjs` files passed `node --check` | Application integration |

The **46 executed tests** are the four groups above, not 46 Alchemy integration tests. Node was **22.16.0** in this container; the example declares Node 24. The pure tests run here do not certify the example's full selected toolchain. Guard tests create disposable files only in temporary directories and remove them; generated migrations are not added to the example.

## Research evidence versus execution evidence

The stable Drizzle GitHub release was verified as **0.45.4**, published 8 October 2026. The Alchemy guides and pinned source use **ORM and Kit `1.0.0-rc.5-ab785fc`** for the Effect integration. Its source revision and peer declarations were inspected. This is not a claim about the newest npm prerelease or a successful install of that tuple.

Npm registry access failed with DNS resolution errors in the execution container. No dependency installation, package lockfile generation, full typecheck, Vite build, Drizzle generation, migration application, emulator, or cloud database test ran. No lockfile, SQL migration, or Drizzle snapshot was fabricated to substitute for those operations.

The full skills repository checkout/install smoke suite was not run. The checks above cover the locally staged Alchemy package; GitHub tree comparison is used separately to verify the published diff. Existing corrected source-index URLs are preserved by leaving that file unchanged in the revision.

## Evaluation status

`drizzle-monorepo-cases.json` adds eight prompts/expected outcomes; they are **authored, not executed**. Neither these nor the original 24 cases establish agent performance. Keep answer keys and hidden acceptance tests outside the tested agent's readable workspace. Compare no skill, old skill, and revised skill with identical tasks/tooling before claiming a measured improvement.

## Outstanding gates

Use [the iteration checklist](../references/iteration-checklist.md) for exact acceptance criteria. Highest priority: resolve the real toolchain and lockfile, typecheck the examples, run D1/Postgres contract tests, verify fresh/upgrade migration paths, and build the browser to check import boundaries and shared-package cache invalidation.

Nothing in this revision deploys cloud resources, creates credentials, merges the PR, or turns the workflow templates into active repository automation.
