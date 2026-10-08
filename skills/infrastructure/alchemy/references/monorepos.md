# Project structure, feature Layers, and multiple stacks

## Keep the composition root readable

Use `alchemy.run.ts` to choose providers/state and assemble the app. Put a runtime in a module matching its entrypoint, and keep resources that share lifecycle near the feature that owns them. A resource declaration can be imported by multiple consumers without introducing a separate stack for every file.

An illustrative layout is:

```text
alchemy.run.ts
src/
  uploads/
    Bucket.ts
    Uploads.ts
  api/
    Api.ts
  contracts/
    ApiSchema.ts
test/
  app.test.ts
migrations/
```

Do not force this tree onto an existing project. Preserve its naming and feature boundaries. Avoid a central file containing every binding, secret, and domain operation simply because the first tutorial starts in one file.

## One stack or multiple

Use one stack when resources share deployment ownership and cadence. Split when teams, access rights, lifecycle, retention, or independent deployment require it. A shared database often has a longer lifecycle than a preview frontend, but that alone does not mandate a complex multi-stack platform.

For multiple stacks, define typed contracts for safe outputs and an explicit deployment order. A consumer reference reads persisted producer state; it does not deploy the producer. Cross-stack dependencies need CI orchestration and a teardown order because they are not automatically one transaction.

## Stage propagation

Decide whether a consumer references the same stage or a deliberately shared one. A preview referencing `staging` is a shared dependency with data and availability implications. Do not silently fall back to `prod` when a preview producer is missing. Fail clearly or provision the intended preview dependency.

Avoid fixed physical names reused across stacks. Keep stack, stage, namespace, and logical IDs stable during file/package moves. Check renaming metadata and plan effects before treating a package refactor as purely structural.

## Shared services and packages

Export domain-facing service contracts and schema/client modules separately from infrastructure implementations. Keep provider credentials, database admin clients, and state backends out of public entrypoints. Use supported package exports rather than consumers reaching into arbitrary internal paths.

A feature Layer can carry its own resource and capability implementation. Provide it once at the platform boundary, and use a fake in unit tests. Avoid generic factories that hide which cloud objects they create or generate unstable IDs. A helper earns its place by removing real repetition without obscuring ownership.

## Build roots and workspaces

Preserve the workspace package manager, toolchain, and lockfile. Check working directory assumptions for Website resources, Docker contexts, migration paths, and `main`. A command run from repository root may resolve a different file than the same command inside an app package.

Typecheck shared contracts without deployment imports. Build the smallest changed application plus affected dependencies. Do not upgrade the whole workspace to satisfy one example copied from moving docs. Record version-specific compatibility and use the matching upstream example when a build integration changes.

## Delivery proof

For a structural change, verify unchanged resource identities, import/bundle boundaries, command roots, and relevant tests. A full cloud deployment is not mandatory for every file movement, but a plan may be useful when namespace semantics are in doubt and its effects are authorized. Report what the evidence actually establishes.

## Sources

- [project-structure/file-layout](https://alchemy.run/project-structure/file-layout/)
- [project-structure/monorepo](https://alchemy.run/project-structure/monorepo/)
- [project-structure/monorepo-single-stack](https://alchemy.run/project-structure/monorepo-single-stack/)
- [project-structure/monorepo-multi-stack](https://alchemy.run/project-structure/monorepo-multi-stack/)
- [infrastructure-as-effects/layers](https://alchemy.run/infrastructure-as-effects/layers/)
- [infrastructure-as-code/references](https://alchemy.run/infrastructure-as-code/references/)
- [infrastructure-as-code/renaming](https://alchemy.run/infrastructure-as-code/renaming/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
