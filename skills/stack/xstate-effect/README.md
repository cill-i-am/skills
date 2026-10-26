# XState–Effect skill

An Effect-first, version-aware skill for designing, implementing, reviewing, testing, and operating XState workflows. It uses the official **`@xstate/effect`** integration and **Effect 4** throughout. It is not a generic XState v5 guide with a Promise bridge appended.

## Start here

Read [SKILL.md](SKILL.md) as the agent entrypoint. It routes to 31 focused references, an original example project, review templates, and read-only validation/audit scripts. [The coverage map](references/28-coverage.md) shows where each topic is handled. [The source index](references/27-source-index.md) records primary documentation, release tags, and the inspected source-preview commit.

## Install as a skill

Extract the entire `xstate-effect` directory into your coding agent's configured skills directory. Keep the relative structure intact: `SKILL.md` links to the references, examples, templates, and validation record. Use the agent's normal skill-discovery/reload process. The optional `agents/openai.yaml` supplies UI metadata for hosts that recognize it; it is not an instruction to install another runtime or grant permissions.

No repository, account, or existing skill was modified by creating this bundle. It is a portable local package. Do not copy only the root Markdown file and lose its referenced content.

## Contents

- **31 topic references** covering the Effect/XState boundary, statecharts, actions, schemas, services, resources, tasks/streams, messaging, concurrency, time, observation, frontend/backend patterns, persistence, tests, tooling, security, performance, recipes, and review.
- **Original TypeScript examples** with exact reference manifests, fourteen test cases, negative type assertions, an optional React atom component, and an isolated source-preview restore example.
- **Three scripts:** local structure/link validation, TypeScript syntax parsing, and read-only repository pattern auditing.
- **Three templates:** workflow brief, transition/test matrix, and review report; plus behavioral agent evaluations and an acceptance checklist.

## Version caveat

Audited on **7 October 2026**. Example reference pins are `@xstate/effect@0.1.0-alpha.6`, `xstate@6.0.0-alpha.64`, and `effect@4.0.0`. The integration is experimental. Current inspected source declares alpha.7 and adds snapshot restoration, but its publication was not established; restoration is source-preview and excluded from the alpha.6 example build.

Several general/live docs differ from the released contract, including older Effect RC/reactivity instructions, context update wording, and restore support. [The version contract](references/00-version-contract.md) explains how to resolve these differences in a real project. Reference pins are not claims of the latest version of every dependency.

## Run checks

```sh
python3 scripts/validate_skill.py
cd examples
npm install
npm run typecheck
npm test
npm run demo
```

After dependencies are installed, run syntax parsing from the skill root with `node scripts/syntax-check.mjs`. The parser is explicitly not a dependency-aware typecheck. Audit an application with `node scripts/audit-project.mjs /path/to/repository`; findings are heuristic and do not modify files.

See [examples/README.md](examples/README.md) for optional UI setup. No fabricated lockfile is provided; generate and review a real one after successful package resolution, then use clean/frozen installs in CI.

## Validation status

Read [VALIDATION.md](VALIDATION.md) for measured checks and limitations. Source review, structural checks, and syntax parsing are distinct from actual typechecking and runtime tests. The build environment could not install the external dependencies, so no passing runtime/semantic-compile claim is made.

## Authoring and maintenance

Keep the root skill small, route by task, preserve primary sources and exact version evidence, and add tests for newly supported capabilities. Do not remove a warning merely because a newer website example looks more convenient. [Repository/CI guidance](references/25-repository-ci.md) and [agent evaluations](references/29-agent-evals.md) explain the maintenance process.
