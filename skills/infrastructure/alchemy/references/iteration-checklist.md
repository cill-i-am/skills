# Iteration checklist: prove the common paths first

Research/revision date: 9 October 2026. This is the maintainer backlog for the Alchemy skill, not a claim that every missing item needs implementation in every application. Prioritize Cillian's Drizzle + Effect + Cloudflare + monorepo path before adding more provider summaries.

## Added in this revision

- [x] Drizzle-first routing, with non-Drizzle alternatives left available.
- [x] Stable-release versus Effect-compatible prerelease distinction, exact inspected versions, and explicit installation uncertainty.
- [x] Worked D1 and Neon/Postgres service implementations, binding Layers, shared HTTP handling, driver subpaths, and schema-generation configs.
- [x] Expanded monorepo examples: manifests, exports, root/package paths, build invalidation, single-stack composition, and multi-stack handle excerpts.
- [x] Colocation guidance: phase separation, feature-owned resources, shared database ownership, and bounded adoption without forced rewrites.
- [x] Separate revision evidence and additional authored evaluation scenarios.

These ticks mean content/source was added. They do not certify the sample's runtime behavior. See [revision evidence](../evals/drizzle-monorepo-validation.md).

## Priority 0: establish that the examples work

- [ ] **Resolve and typecheck the dependency tuple.** Install the independent workspace, inspect peer resolution, commit the real lockfile, and run its configured compiler. Gate on actual project compilation, not TypeScript parsing. Include every bundled TypeScript example and eventually extract/check complete Markdown snippets too.
- [ ] **Execute D1 and Postgres acceptance tests.** Generate and review SQL/snapshots; prove authorized CRUD, invalid input, sanitized failures, persistence after restart, and cleanup against the real local runtime/driver. The four title-policy tests are not a substitute. Verify the Postgres provider's local-versus-remote behavior before running it.
- [ ] **Prove migration correctness.** Test fresh schema creation and upgrading seeded previous-version data, constraints/defaults, failure midway, retry/bookkeeping, concurrent migration writers, and backwards-compatible readers. Do not check only that a .sql file exists. Include parallel-branch migration conflicts and review of generated snapshots.
- [ ] **Exercise monorepo boundaries and caching.** Build browser and Worker outputs, detect secret/driver/provider leakage, modify only a sibling contract and then only the lockfile, and prove the relevant build invalidates. Test the supported command roots and emitted-package exports where used.

## Priority 1: finish an application, not just a storage demo

- [ ] **A complete TanStack Start path.** Add the real SSR/framework config, an authenticated Effect HTTP/RPC API, shared public schemas/client, and Drizzle persistence. Verify server-only bindings and browser execution independently; the current plain-Vite health client is not this.
- [ ] **Authentication and tenant authorization.** Add a selected identity integration (for example Better Auth), trusted tenant derivation, tenant-scoped queries and mutations, role/ownership rules, and negative cross-tenant tests. Derived Drizzle schemas must not permit mass assignment of tenant/admin fields. The sample bearer token remains a demo only.
- [ ] **Shared database previews.** Provide an executable Neon or PlanetScale parent/branch example with reference ownership, stage mapping, restricted credentials, reviewed branch data policy, and cleanup that cannot delete the parent. Verify a preview is not accidentally using production data or migrations.
- [ ] **Transaction and retry semantics.** Add driver-specific transaction tests, D1 batch coverage, constraint classification, atomic conditional writes, idempotency keys, and a SQL outbox/Queue/Workflow example with failure injection. Prove behavior after a write succeeds but acknowledgement/checkpoint fails. Include request/task-attempt scope cleanup.
- [ ] **Old/new/no-skill evaluation.** Run identical task fixtures with no skill, the old skill, and the new skill. Hide answer keys and acceptance tests from the agent, include held-out implementation tasks, and record task success, unsafe attempts, token cost, and duration. Extra authored cases are not measured results.

## Priority 2: deepen operational and advanced paths

- [ ] **Lifecycle and disaster recovery drills.** Execute resource-preserving moves into Layers, retention-before-removal, stage/stack ownership transfer, interrupted deploy recovery, state backup/restore, and shared-state writer locking. Existing prose must be backed by proof before suggesting automation of recovery.
- [ ] **Database performance and diagnostics.** Add bounded/keyset pagination, query-plan/index examples, relation/N+1 checks, pool behavior under concurrent requests, read-after-write/cache choices, and redacted SQL telemetry. Prefer actual plan/load evidence over guessed performance recommendations.
- [ ] **Durable Object Drizzle activation.** Add a complete host + DO + schema/migration example, test failed activation and subsequent recovery, older dormant objects, instance concurrency, and transaction behavior. Keep its storage and migration lifetime distinct from Worker D1/Postgres.
- [ ] **Remaining template execution and package gates.** Run the repository-wide packaging/install checks and the inactive workflow templates in disposable fixtures. Verify stale/reopened PR cleanup, protected environments, event trust, and writer concurrency. Add a narrow offline validation workflow only when that activation is separately intended.
- [ ] **Skill efficiency and maintenance.** Use evaluation traces to trim repeated warnings and unnecessary document loads; measure successful completion rather than instruction volume. Add an explicit dependency/source update process. Keep uncommon provider deep-dives secondary until common workflows pass.

## Definition of done for each item

Name the supported version tuple, runnable fixture, independent acceptance assertion, command, result, and environment. Distinguish a source review, a typecheck, a mock, a local emulator, and a real-cloud run. Record skipped/blocked tests and their specific reason. Do not turn a written example or test plan into a passing checkmark.

Suggested next iteration: dependency resolution/typechecking, then D1/Postgres execution and migration-path tests. Those findings may change the code and are more valuable than another batch of broad documentation chapters.
