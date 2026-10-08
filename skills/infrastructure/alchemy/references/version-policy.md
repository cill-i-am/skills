# Version policy and evidence


## Establish the target before editing

Read the target project's package manifests, lockfile, patches, installed exports, stack entrypoint, and relevant scripts. Do not infer the version from the domain name or from a search result. The researched upstream revision is `fbe6ece368c6898234592e897d852bb47b88ebb1`; its Alchemy package reports `2.0.0-beta.81`. This is a reference baseline, not an instruction to upgrade projects.

Use this order when evidence disagrees:

1. Installed package source/types and the lockfile for the project being changed.
2. Official documentation and examples from the matching release or commit.
3. Current official guide for the specific task, checked for version drift.
4. This package's explanation and recipes.

The website is a moving target. Source URLs in this package can be reconstructed as `https://github.com/alchemy-run/alchemy/blob/<revision>/website/src/content/docs/<path>.mdx`; directory hubs usually use `index.mdx`. Verify the path rather than assuming the mapping. The curated source index includes guide URLs, not an assertion that every page's prose was independently verified line by line.

## Distinguish v1 from v2

V1 commonly imports the default `alchemy`, uses `await alchemy(...)`, lowercase provider paths such as `alchemy/cloudflare`, and ends with `app.finalize()`. V2 uses `Alchemy.Stack`, `Effect.gen`, `yield*`, and case-sensitive paths such as `alchemy/Cloudflare`. V2 can still host ordinary async Worker handlers. An async handler is not evidence that the infrastructure is v1.

Do not mix v1's `entrypoint`/`bindings` props with a v2 example using `main`/`env`. Do not migrate merely because this skill was invoked. For an explicitly requested migration, read [the migration procedure](migration.md).

## Resolve the Effect release as a family

The getting-started guide still shows `effect@rc` and platform `@rc` packages, but the pinned upstream workspace catalogue declares `effect`, `@effect/platform-bun`, and `@effect/platform-node` as `^4.0.0`. Treat that as an observed documentation/source mismatch, not a reason to install stale RC tags. It is not safe to combine arbitrary Effect v3, v4 beta, v4 RC, and stable packages. For a new application, check current peer dependencies, choose a compatible set, pin the resulting versions, and commit the lockfile. For an existing application, keep its package manager and installed versions unless the user scoped an upgrade.

Examples here use current documented spellings such as `Config.String`, `Config.Redacted`, and `effect/http/...`. Older snippets may use different names or import paths. Never silence an incompatible API with `as any`.

## Record the evidence level

Use explicit labels when reporting completion:

| Evidence | What it establishes |
|---|---|
| Source-reviewed | Compared with the cited documentation or implementation. |
| Syntax-checked | The parser accepts the file; imports and types may still be wrong. |
| Type-checked | Compiled against the project's actual dependency graph. |
| Emulated | Exercised against local providers; not proof of live IAM or cloud limits. |
| Live-tested | Exercised in an authorized cloud account, stack, and stage. |

The bundled cloud examples are reference implementations, not a claim of a live deployment or universal compatibility. The package's validation report states the checks actually performed.

## Known documentation conflicts to avoid

Some overview pages still describe `dev_$USER` as the deploy default. The dedicated stages and CLI pages describe `live_$USER` for live operations and `dev_$USER` for local development. Use an explicit stage.

Some testing prose calls Cloudflare state R2-backed. The dedicated state-store guide describes a Worker with a Durable Object and embedded SQLite, plus Secrets Store credentials. Do not design backups from the stale description.

Some D1 prose mentions automatic migration generation during deployment. The dedicated migration guide recommends generating, reviewing, and committing migrations before CI. Prefer the latter as this skill's operational recommendation; schema generation is a separate optional capability.

Some quick-start CI snippets use floating `dlx` invocations, broad IAM policies, or only a `stage != prod` cleanup guard. The templates here deliberately use the installed CLI, separate trust boundaries, and exact preview-stage validation. These are hardening choices, not claims that upstream examples are secure production policies.


## Sources

- [getting-started](https://alchemy.run/getting-started/)
- [environments/stages](https://alchemy.run/environments/stages/)
- [state-store](https://alchemy.run/state-store/)
- [testing/test-harness](https://alchemy.run/testing/test-harness/)
- [sql/drizzle/migrations](https://alchemy.run/sql/drizzle/migrations/)
- [migrating-from-v1](https://alchemy.run/migrating-from-v1/)

Documentation snapshot: 7 October 2026. Resolve exact APIs against the target project’s installed version; see [version policy](version-policy.md).

Pinned dependency catalogue: [pnpm-workspace.yaml](https://github.com/alchemy-run/alchemy/blob/fbe6ece368c6898234592e897d852bb47b88ebb1/pnpm-workspace.yaml).
