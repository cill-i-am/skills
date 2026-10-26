# Version and source workflow

## Start with the project, not a remembered API

This skill is exclusively for Effect 4. Its documentation baseline is `effect@4.0.2`, observed on 7 October 2026. This is an evidence anchor, not an instruction to change a project's dependencies. Use the exact installed v4 release and compatible integration packages. A current website page can move ahead of a lockfile; a source link pinned to the baseline cannot.

Read the nearest `package.json`, workspace configuration, package-manager lockfile, TypeScript configuration, and application entrypoints. Identify the execution host: Node, Bun, Deno, browser, serverless request, background worker, or embedded runtime. Find the existing test command before introducing tooling.

Run the non-mutating helper from this bundle:

```sh
node /path/to/effect-v4/scripts/inspect-project.mjs /path/to/project
```

Resolve these questions before changing code: Which v4 version is installed? Which package owns the relevant API? Is the service application-scoped or request-scoped? Who runs the program and disposes its resources? Which existing test proves the behaviour?

## Toolchain compatibility

The pinned upstream repository declares TypeScript `^7.0.2` for development and runs its type-test target against `>=5.9`. The example fixture pins TypeScript `7.0.2` accordingly. The authoring environment only had TypeScript `5.8.3` available for syntax parsing; that check does not establish dependency compatibility. Do not substitute an older compiler and report the fixture typechecked.

## Evidence order

Prefer installed declarations and source, followed by official source at the matching release tag, the versioned API reference, and the v4 guides. Use official `ai-docs` examples to understand composition, not as infallible production templates. Check implementation details when examples and types appear to disagree. Read relevant upstream tests when lifecycle behaviour matters.

The baseline package exports core modules from `effect`, and domain families from `effect/http`, `effect/http-api`, `effect/rpc`, `effect/sql`, `effect/cli`, `effect/ai`, `effect/reactivity`, `effect/workflow`, and the other namespaces in the module index. Concrete drivers and platform adapters may still be separate `@effect/*` packages. A barrel's existence does not promise that every family is stable.

Source JSDoc stability annotations matter. For example, the baseline workflow module is explicitly marked unstable even though it ships inside Effect 4. Pin and test unstable integrations; do not infer stability from the package's major version or import path.

## A tight implementation loop

Read the relevant reference, inspect the exact signature, implement the smallest coherent change, typecheck the affected production code, and run meaningful tests. A tiny scratch example is useful when overload inference or interruption semantics remain ambiguous; it is not a substitute for compiling the actual application.

Never use `any`, a double cast, an invented compatibility wrapper, or `@ts-ignore` to make an uncertain API look valid. If a necessary declaration cannot be verified, describe the intended composition and mark that specific snippet as a sketch rather than presenting guessed code as runnable.

Keep dependencies and source evidence aligned. When updating within v4, inspect release changes, align peer dependencies, rerun examples, contract tests, and lifecycle tests, and update the provenance date. Do not overwrite a source snapshot and continue reporting the old checks as current.

## Do / don't

**Do** use ordinary TypeScript for pure calculations, and Effect for operations that need errors, dependencies, cancellation, resource ownership, concurrency, or instrumentation. **Don't** turn every small helper into a service or an Effect solely for stylistic uniformity.

**Do** inspect the exported module before inventing a helper. **Don't** replace clear native code with a more abstract library call without a benefit.

**Do** distinguish documentation review, syntax checking, TypeScript checking, runtime tests, integration tests, and deployment verification. **Don't** call all of them “tested.” See the package's verification report for what was actually run during preparation.

## Official sources

- [v4 API reference](https://effect.website/docs/v4/api)
- [Baseline package exports](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/package.json)
- [Official coding guide](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)
- [Workflow stability](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/workflow/Workflow.ts)

- [Pinned upstream toolchain](https://github.com/Effect-TS/effect/blob/effect@4.0.2/package.json)
