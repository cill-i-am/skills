# Maintain, validate, and evaluate this skill

## Preserve the skill shape

Keep `SKILL.md` as a compact router and mandatory workflow, not a copy of every provider reference. Put task detail in directly linked references and runnable/supporting files under assets/scripts. Distinguish a complete app, a composition fragment, and a nonfunctional scaffold. Do not turn a documentation refresh into an unrequested cloud deployment or repository upgrade.

Keep sources and the tested baseline explicit. Use [source-map](source-map.md) and the machine-readable index to choose the smallest relevant official page. When updating, compare matching source/types and examples, not only a marketing page. Installed dependencies remain authoritative for the project being changed.

## Updating a fast-moving release

Record the new Alchemy/Effect/platform versions and upstream revision. Identify changed exports, provider props, lifecycle/state behaviour, test harness semantics, and framework adapters. Refresh only affected chapters/examples, then inspect cross-links and runnable snippets for mixed-version assumptions. Keep a dated note where the website and source disagree.

Regenerate dependency lockfiles in an environment that can actually resolve and install them. Run full typechecks against that graph. Exercise local examples where supported, then only the specifically authorized live tests needed for changed provider behaviour. Never change a validation report from syntax-reviewed to live-tested without actual output and target evidence.

Update action pins from the official repository and dereference annotated tags to commits. Review security advisories and runner compatibility; a historical full SHA does not remain a safe recommendation forever.

## Offline helper checks

```sh
python3 scripts/validate-skill.py
python3 -m unittest discover -s tests -p 'test_*.py' -v
node --test tests/preview-stage.test.mjs
python3 scripts/find-reference.py d1 migrations
python3 scripts/inspect-project.py /path/to/project
```

The inspector reads metadata and filenames, never executes scripts, and does not read environment-file values. Its output is an inventory, not a complete lockfile resolution or an audit. Inspect the actual installed dependency graph before selecting APIs.

The example syntax checker needs an available TypeScript package:

```sh
node scripts/check-example-syntax.mjs
```

Run it from a project where TypeScript can be resolved, or set `NODE_PATH` to the intended installation. It checks parsing only. The package validator checks structure and local links; it does not certify external links, types, cloud behaviour, or the correctness of every policy.

## Agent behaviour evaluations

[evals/cases.json](../evals/cases.json) contains trigger and task scenarios with expected behaviour. These are an evaluation set, not a claim that independent agents ran them. Evaluate with a clean session and the relevant test repository fixture. Record the exact model/tooling, dependency versions, inputs, files changed, operations attempted, and observed result.

Score correctness, source/version discipline, proportionality, task completion, and operational safety separately. A safe refusal to do every task is not success; the agent should complete authorized local work and provide useful bounded next steps when a specific external approval is missing.

Include negative triggers: a chemistry question or the unrelated Alchemy blockchain API should not automatically load this infrastructure skill. Include realistic conflicts: v1 source with current v2 docs, a missing binding Layer, real-cloud test defaults, a retained resource, a fork PR, and a changing OIDC subject format.

## Release checklist

Validate frontmatter, all local links, JSON/YAML syntax, script tests, TypeScript parsing, and code/example status labels. Run dependency typechecks and runtime tests where available and report any omitted level honestly. Remove caches, credentials, node_modules, logs, and unrelated build files before packaging. Include license/provenance for adapted material and keep the full folder intact.

Sources: [OpenAI Skill Creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md), [Alchemy documentation](https://alchemy.run/), and the pinned-source map in this package.

## Drizzle/monorepo follow-up

See the [iteration checklist](iteration-checklist.md) and [additional authored cases](../evals/drizzle-monorepo-cases.json). Compare old/new/no-skill on identical fixtures; with/without alone cannot demonstrate that replacing the old skill is better. Keep eval expectations outside the installed skill available to a tested agent. The fixture-backed runner and hidden acceptance suite are still outstanding.
