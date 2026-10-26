# Repository structure, CI, and skill maintenance

## Fit the existing Effect architecture

Keep domain Effect services in their existing packages. A feature can own `machine.ts`, its schemas/public projection, Effect actor adapters, composition/owner, and tests. Avoid a universal `machines/` directory that separates workflow behavior from its feature for no reason. Use a shared package only for genuinely reused protocols or tooling.

A useful local arrangement is:

```text
feature/
  contract.ts          # public commands/projection schemas
  machine.ts           # pure state model + named sources
  effects.ts           # fromEffect / stream adapters
  service.ts           # narrow feature command/read interface
  owner.ts             # Layer/runtime or actor atoms
  machine.test.ts      # decisions + integration/lifetimes
  contract.test.ts     # validation and authorization boundary
```

This is a suggested structure, not a directive to reorganize unrelated code. Prefer a small adapter over duplicating an existing service. Keep machine internals private where possible; consumers should not import fragile state paths or reach into children.

## Preflight and audit

Run `node scripts/audit-project.mjs <repo>` from this bundle to inspect package declarations and suspicious code patterns. It is read-only and heuristic: findings require human review. It skips dependency/build directories and does not resolve lockfiles, aliases, all workspace protocols, or semantic types. A clean output is not proof of compliance.

Check the actual installed versions with the project's package manager, inspect peer ranges and relevant declarations, and record whether the task needs source-preview features. Do not auto-upgrade or change unrelated dependencies. Use strict TypeScript; do not relax compiler settings to accommodate an alpha API mismatch.

## CI sequence

In a connected development environment, install the exact reference project dependencies, generate a real lockfile, then run typecheck, runtime tests, and optional UI checks. Commit the lockfile only after successful resolution. In CI, use the package manager's frozen/clean install mode (`npm ci`, equivalent pnpm/yarn mode) so resolution cannot drift.

Run bundle structural checks when editing this skill. For application changes run pure/integration tests, negative type tests, schema/authorization tests, and affected UI/end-to-end tests. Restore-capable projects need recovery fixtures. A deployment rollout should include operational visibility and a way to stop accepting new commands without losing the agreed durable intent.

Do not confuse syntax transpilation with full typechecking. The local `syntax-check.mjs` deliberately reports syntax-only evidence. It cannot verify package exports, generic inference, peer compatibility, or runtime behavior.

## Review and release gates

For a new machine, require a behavior brief and transition/outcome matrix. For a changed machine, identify affected persisted versions, state-path consumers, public event schemas, timers, and side effects. A target rename can be a compatibility change for stored workflows or external tools even when the TypeScript build is green.

For alpha upgrades, read adapter and core release notes together. Re-run contract tests for asynchronous sending, action registration, service inference, task/actor finalizers, errors, atom readiness/lifetime, and restoration where supported. Pin optional testing/UI packages too. Record exceptions with evidence and an owner.

## Maintain the skill as a living package

Keep `SKILL.md` concise and route to references. Add complete examples under `examples/`, not giant inline tutorials in the root. Maintain a sources index and a coverage map so new features are discovered rather than guessed. Distinguish released, source-preview, conceptual, and unverified example status.

When refreshing sources, update exact versions, inspected commit/tag, access date, changed API contracts, test results, and known limitations. Do not silently delete an incompatibility warning until a test proves the gap is closed. Run [agent evaluations](29-agent-evals.md) to ensure the skill still avoids vanilla hosts and hidden detached Effects.

Sources: [version contract](00-version-contract.md), [coverage](28-coverage.md), [review checklist](30-review-checklist.md). Repository and CI policy is recommended practice.
