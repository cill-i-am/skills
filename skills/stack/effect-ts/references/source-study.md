# Source Study

This file records the evidence and design decisions behind the current Effect v4 skill.

## 2026-08-18 Exact-Pin And Reference-Architecture Audit

A new audit compared:

- `cill-i-am/skills@65772bf58135681a0434366087812734af99edac`;
- `UsefulSoftwareCo/executor@5897721991f81aee68952793e3d9e056f5a96d88` for directly fetched architecture-bearing source and lint rules;
- Executor code-search results indexed at `81d4cf9d20a4102ace27bab11c611d6590602ccb`;
- `anomalyco/opencode@0033bb35599a359def31b53d73e885eb4c44d815`;
- `Effect-TS/effect@5f962c8003623488a2251d628b0b872c0152ae51`.

The versions diverged materially: Executor targeted Effect `4.0.0-beta.59`, OpenCode targeted `4.0.0-beta.83`, and Effect upstream at the audited revision reported `4.0.0-rc.110`. Executor continued moving during the audit—the branch head was later observed at `fde44501582cccedaa3d2bb911e184511ac74265`—so the fixed snapshots above, rather than a floating branch, are the evidence for the conclusions below. This made “Effect v4 beta” an unsafe timeless target and exposed concrete API drift, including the Schema error-constructor rename and the audited `Stream.paginate` cursor shape.

### Source hierarchy adopted

1. Target repository instructions, exact package versions, lockfile, and nearby compiling code.
2. Installed package guidance, declarations, implementation, and adjacent tests.
3. A focused compile probe using the target project's own command.
4. Current upstream source and tests for semantic clarification.
5. Exemplar compiling source, tests, package boundaries, and enforced lint configuration.
6. Exemplar prose and embedded skills.

This hierarchy matters because an exemplar can contain valid old-beta code or stale embedded guidance while still offering excellent architecture lessons.

### Durable findings from Executor

- The most reusable lesson is policy scoped by package role, not blanket syntax bans.
- Effect-native core contracts can coexist with Promise, browser, worker, tooling, and host boundaries when exceptions are narrow and documented.
- Foreign transaction callbacks may be local runtime boundaries when they preserve `Exit`, rollback, typed failure, and defects.
- Architectural lint rules need accepted/rejected fixtures and reviewed package-specific overrides.
- Useful typed errors need structured fields, useful messages, public redaction, and exhaustive host mapping.
- Exact race semantics deserve regression tests; Promise assumptions can be wrong for Effect's prefer-success race behavior.

### Durable findings from OpenCode

- Service and resource lifetime should be classified explicitly: global, application runtime, location/workspace, request/session, operation, or cache entry.
- Separately created ManagedRuntimes do not share Layer acquisitions unless a shared MemoMap is deliberately supplied.
- Runtime bridges may need to preserve both Effect FiberRefs/context and host-local AsyncLocalStorage or workspace state.
- `ScopedCache` and keyed Layer maps are strong patterns for keyed resource lifetimes.
- A typed Layer dependency graph with replacements, cycle detection, and lifetime tags can be valuable at large scale, but should not become a default for small graphs.
- Protocol-derived Effect clients and one-way package dependencies make boundaries reviewable.
- Custom test runners must own and close Scope explicitly; shared Layer identity in tests is an opt-in.

### Skill changes derived from the audit

- Replace beta-only wording with exact installed Effect v4 wording.
- Add a mandatory compatibility/compile probe for version-sensitive APIs.
- Distinguish plain functions, inline `Effect.gen`, `Effect.fnUntraced`, and named traced `Effect.fn`.
- Add `return yield*` for terminal effects and reject JavaScript `try/catch` inside generators.
- Add a dedicated runtime/callback bridge reference.
- Add package direction, lifetime taxonomy, Layer scaling, MemoMap sharing, and keyed resource guidance.
- Add repository enforcement separate from Schema provenance enforcement.
- Clarify structural Schema models versus Schema-backed classes.
- Clarify automatic test Scope ownership versus custom-runner ownership.
- Prefer in-memory typed protocol tests before live socket tests.

## 2026-07-19 Schema-Enforcement Pass

A completed repository-wide schema-first migration across shared contracts, runtime workflows, persistence, APIs, CLI consumers, UI state, and tests exposed a gap between writing good Schema code and proving that the invariant remains true across a large TypeScript graph.

The resulting guidance added `schema-enforcement.md` and sharpened cross-package contract ownership. Durable findings were:

- semantic domain strings should become constrained Schema brands at ingress and remain branded inward;
- a decoder elsewhere in a function does not prove that the actual raw value reached the boundary;
- names, paths, familiar methods, structural lookalikes, and counterfeit or shadowed imports are not semantic provenance;
- syntax-aware checks are useful locally, while cross-file ownership and canonical symbol identity may require compiler-backed verification;
- every accepted exception needs a paired adversarial fixture, including disconnected decoders and escaping values;
- migration audits should converge on zero actionable violations without count snapshots, broad suppressions, or grandfathered allowlists.

The enforcement reference remains optional. Do not build a custom checker when ordinary Schemas, focused type checks, package boundaries, and tests already protect the invariant.

## 2026-07-16 Deepening Pass

The pass read Kit Langton's `skills/effect` bundle at commit `30dee8607214c893dd89f6eee65c669ef3dce8c9` and checked relevant APIs against Effect upstream commit `80b539f8aba68f478c75c35c2b4140c4ffc4fada`, whose package version was `4.0.0-beta.98`.

### What we adopted from Kit

- Task-oriented routing from the root skill into focused references.
- Concrete v4 defaults and primitive selection tables.
- Structural Schema modeling plus derived TypeScript types.
- Constrained brands, explicit optionality, and tagged variants.
- `Context.Service`, Layers, ConfigProvider, Schedule, Cache, Stream, HTTP client, and deterministic test patterns.
- The lifecycle rule that long-lived work forks into its owning Scope and Layer acquisition completes.
- Source verification for unstable v4 modules.

### What we extended

- Effect as the default representation of effectful backend operations while total pure leaves remain plain functions.
- Execution at reviewed ownership boundaries rather than Promise escape inside workflows.
- Stronger domain-string, lifecycle, interruption, redaction, protocol, SQL, and runtime guidance.
- Exact-pin verification instead of a timeless prerelease label.
- Separate runtime-bridge and repository-enforcement policies.

Kit's self-exporting module namespace convention was not adopted as a universal rule. Existing repository style remains authoritative.

## Earlier Source Corpus

A prior first-principles rewrite performed a line-oriented pass over OpenCode, Executor, and Effect Smol. It indexed imports, calls, dependencies, and candidate files, then manually reread routed implementation and test files.

| Repo | Files | Lines | Effect import files | Effect call files |
|---|---:|---:|---:|---:|
| OpenCode | 4,098 | 1,156,154 | 1,059 | 1,087 |
| Executor | 1,654 | 867,545 | 760 | 643 |
| Effect Smol | 2,010 | 628,198 | 863 | 1,071 |

Candidate files included TypeScript, JavaScript, Markdown/MDX, manifests, TypeScript configs, and test configs. Vendor, generated, build, cache, media, binary, and lockfile paths were excluded. This was complete line indexing plus focused manual review, not a claim that every line was semantically interpreted.

## Standing Decisions

- Keep the root skill procedural and route detail into focused references.
- Keep one owner for each rule and cross-link instead of duplicating whole sections.
- Prefer complete patterns with ownership, errors, and tests over isolated snippets.
- Treat primitive selection as architecture, not as a syntax contest.
- Verify unstable and non-trivial APIs against the target installation.
- Reject casts, Promise escapes, unowned fibers, hidden live provisioning, and stringly public domain contracts.
- Treat reference repositories as architecture evidence, never as compatibility proof.
