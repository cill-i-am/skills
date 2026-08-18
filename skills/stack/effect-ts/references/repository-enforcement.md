# Repository Enforcement

Use this file when a repository wants to turn settled Effect architecture into lint rules, compiler checks, package-boundary tests, or CI audits. Start with a proven invariant and the smallest honest mechanism. Do not turn one exemplar's local style into universal law.

For serializable-contract ownership and decoder provenance, use `schema-enforcement.md`. Those checks may require deeper semantic analysis than ordinary architecture rules.

## Scope Rules By Package Role

Different packages legitimately have different boundaries. Define the repository's roles before writing rules:

| Role | Typical responsibilities | Common allowed boundaries |
|---|---|---|
| Schema / protocol | serializable contracts, public errors, generated clients | Schema construction and code generation |
| Core application | services, workflows, policy, domain orchestration | Effect-native interfaces; no host execution |
| Infrastructure adapter | SQL, HTTP, provider SDK, filesystem, platform APIs | Promise/callback wrapping, driver error mapping |
| Host / application | HTTP, CLI, worker, browser, process lifecycle | Layer provision, managed runtime, `run*` |
| Tooling / scripts | build, migration, code generation | narrow synchronous throws or Promise APIs when appropriate |
| Tests | deterministic fixtures and host-boundary verification | test-runner adapters and explicit live integration |

Apply rules by role and path. An exception is stronger when it names the boundary and reason than when it globally disables a rule.

## High-Value Baseline Rules

Good candidates once the relevant package is Effect-native:

- Service and client contracts do not return raw `Promise` values.
- `Effect.runPromise`, `runSync`, and `runFork` are limited to reviewed host and callback-bridge modules.
- Unknown input is decoded at ingress; reject `JSON.parse(...) as T` and unchecked boundary casts.
- JavaScript `try`/`catch` is not used to handle yielded failures inside `Effect.gen`.
- Time-sensitive Effect workflows use Clock and tests use TestClock rather than wall-clock sleeps.
- Background fibers have a Scope, Layer, `FiberSet`, `FiberMap`, or managed-runtime owner.
- Core packages do not import host, framework, or concrete driver implementations.
- Generated files are excluded by ownership policy and regenerated rather than lint-fixed.
- Schema compiler functions used repeatedly are hoisted when the target pin actually compiles them per call.

## Policy-Sensitive Rules

These need repository-specific analysis rather than blanket adoption:

- **Raw fetch:** prohibit it in core and protocol packages when Effect HttpClient is the architecture; allow it in deliberate browser, worker, dependency-minimizing, or host adapters.
- **Exhaustive matching:** require it for closed domain and public protocol decisions; do not ban all fallbacks in open-ended provider data.
- **Effect escape hatches:** prohibit `orDie` and similar collapse in expected-failure workflows; permit a documented invariant boundary where a defect is truthful.
- **Direct `_tag` access:** prohibit it for Effect-owned internal representations and public error handling when public predicates exist; allow it for locally owned discriminated unions when that is the clearest code.
- **Schema classes:** choose Struct versus Class from runtime semantics; never copy a blanket class ban from a repository with a local serialization constraint.
- **Named spans:** require stable names for operationally meaningful actions, not for every reusable function.

## Do Not Copy Blindly

Do not copy without proving the same target-pin and repository conditions:

- an exemplar's list of unsupported Effect APIs;
- a blanket ban on `Schema.Class` or every `_tag` access;
- a blanket ban on `try`/`catch` across scripts, framework callbacks, and adapter code;
- a requirement that every reusable function use named `Effect.fn`;
- an allowlist based only on filenames or familiar identifier text;
- a diagnostic-count baseline that permanently accepts known violations.

## Enforcement Mechanism

Choose the cheapest tool that proves the invariant:

1. Type signatures, exported contracts, and focused tests.
2. Syntax-aware lint for local, unambiguous patterns.
3. Package-boundary tests for dependency direction.
4. Compiler-backed analysis for canonical symbols, aliases, cross-file ownership, or data-flow provenance.

A syntax rule should resolve imports where possible and defend against lexical shadowing. If it cannot distinguish a real Effect API from a lookalike, narrow the rule or use the compiler rather than pretending text is semantic proof.

## Exception Contract

A suppression should state:

- the foreign or host boundary involved;
- why the general rule is invalid there;
- which semantics are preserved instead;
- the test that protects the exception.

Example:

```ts
// effect-boundary: the database transaction API owns a Promise callback.
// Preserve Exit/Cause and force rollback on non-success; covered by transaction rollback tests.
```

Avoid generic comments such as `// boundary` with no explanation.

## Adversarial Fixtures

For every rule, keep accepted and rejected fixtures covering:

- import aliases and re-exports;
- shadowed `Effect`, `Schema`, `JSON`, or `fetch` identifiers;
- computed and optional property access;
- generated, declaration, test, tooling, and host files;
- a legitimate documented boundary exception;
- a near-miss that must still fail.

When syntax and compiler-backed implementations overlap, run the same fixtures against both and require agreement.

## Rollout

1. Inventory violations without changing code.
2. Classify true violations, architectural exceptions, and checker false positives.
3. Fix the architecture or checker; do not freeze the count.
4. Add adversarial fixtures and documented package-role configuration.
5. Enable CI only after actionable findings reach zero.
6. Review the rules whenever Effect versions, package roles, or host boundaries change.
