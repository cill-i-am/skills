# Effect Source Lookup

Use opensrc for Effect source code. This skill intentionally does not require a project-local `./.repos/effect` checkout.

## Commands

Resolve the installed `effect` package source:

```sh
pnpm exec opensrc path --cwd . effect
```

The returned path may live under `Effect-TS/effect-smol/.../packages/effect` because that is the npm package's source repository metadata. Do not fetch `Effect-TS/effect-smol` separately for the target project; treat the `effect` package path as the single source reference.

Fetch it if missing:

```sh
pnpm run opensrc:effect
```

In a fresh worktree or cloud environment, run `pnpm install` first so the local `opensrc` binary exists, then run `pnpm run opensrc:effect` if the source path is still missing. Missing `opensrc` is a setup failure and should not be ignored.

## Path Mapping

Many local guides were originally written against a vendored checkout at `./.repos/effect`.

When a guide says:

```txt
./.repos/effect/packages/effect/src/Effect.ts
```

Use:

```sh
EFFECT_PACKAGE_ROOT="$(pnpm exec opensrc path --cwd . effect)"
EFFECT_REPO_ROOT="$(cd "$(dirname "$(dirname "$EFFECT_PACKAGE_ROOT")")" && pwd)"
"$EFFECT_REPO_ROOT/packages/effect/src/Effect.ts"
```

For core package files, prefer the installed package source:

```sh
EFFECT_PACKAGE_ROOT="$(pnpm exec opensrc path --cwd . effect)"
"$EFFECT_PACKAGE_ROOT/src/Effect.ts"
```

## Guidance

- Use local guide files first.
- Use opensrc source only when the guides do not answer the question, exact API signatures matter, or a type/runtime behavior must be confirmed.
- Use `pnpm exec opensrc path --cwd . effect` as the single Effect source reference.
- Prefer the package root for core APIs.
- Derive the repository root from the package root for examples, tests, tools, platform packages, vitest, opentelemetry, and cross-package usage.
- Treat opensrc as required agent tooling: worktrees and cloud environments should install dev dependencies before using this skill, and missing `opensrc` should hard fail.
- Do not create, require, or commit `./.repos/effect` in the target project.
