# Version contract and evidence

## Audited baseline — 7 October 2026

| Component | Baseline used in the example manifests | Evidence |
| --- | --- | --- |
| Effect | `4.0.0` | Official integration example and development dependency |
| `@xstate/effect` | `0.1.0-alpha.6` | Latest entry in the GitHub release listing retrieved during this audit; released 1 October 2026 |
| XState | `6.0.0-alpha.64` | Latest core entry in that listing; released 3 October 2026 |
| `@effect/atom-react` | `4.0.0` | Official Effect-workflows example manifest |
| React / React DOM | `19.1.0` | Same example manifest; a reference pin, not a claim about latest React |
| TypeScript | `5.9.3` | Version family used by the official example; not a claim about latest TypeScript |

These are an **audited reference combination, not a locally executed compatibility certification**. Read [VALIDATION.md](../VALIDATION.md). npm metadata could not be retrieved from the build environment. Exact top-level manifests are provided, but no fabricated lockfile: generate and commit a real lockfile after successful installation.

The source tree at `7bb5f0c5e331e0e216c55a7b5f1b4c351bd0abcf` declares `@xstate/effect@0.1.0-alpha.7`. Its changelog adds persisted-snapshot restoration. That source evidence does not, by itself, establish npm publication. The guide labels it **source-preview** rather than presenting it as available in alpha.6.

## Authority order

For a real project: installed lockfile and package declarations → matching release/tag source and tests → matching package docs → current website → general examples and remembered APIs. A current branch can document functionality absent from a published pin. A release page can also lag a registry; verify both when upgrading.

Read these commands as a preflight, not as an instruction to upgrade:

```sh
npm ls effect xstate @xstate/effect @effect/atom-react @xstate/react
npm view @xstate/effect dist-tags --json
npm view @xstate/effect@0.1.0-alpha.6 peerDependencies --json
npm view xstate@6.0.0-alpha.64 version
```

Preserve the project's package manager. In a new isolated example directory, the baseline is:

```sh
npm install --save-exact effect@4.0.0 xstate@6.0.0-alpha.64 @xstate/effect@0.1.0-alpha.6
npm install --save-dev --save-exact typescript@5.9.3
```

Do not use a floating `@alpha`, `@rc`, or caret range as a production reproducibility policy. Resolve deliberately, pin, create a lockfile, run the contract suite, and review the upgrade diff.

## Known documentation conflicts

**Effect version and atom imports.** Some website pages still say Effect 4 RC and `effect/unstable/reactivity`. The alpha.6 release and tagged source use stable Effect 4 and `effect/reactivity`. This bundle uses the latter.

**Context updates.** The retrieved context page describes a shallow top-level merge. The data-and-effects page and cheatsheet say to return the complete next context. Do not build application correctness on this discrepancy. Examples preserve intended shared fields explicitly with `{ ...context, changedField }`; nested objects are rebuilt explicitly. For typestate cleanup, write a regression test proving which keys are retained by the installed runtime. The bundle does not assert a resolution it has not runtime-tested.

**Restoration.** In alpha.6, `EffectActorOptions` exposes only input. Do not paste `snapshot`, `clock`, `inspect`, `logger`, `registryKey`, or `id` from vanilla `createActor` examples into it. Actor methods and the Effect clock provide the supported facilities. Source-preview alpha.7 adds `snapshot`; it does not establish universal options parity.

**Testing packages.** Current v6 docs describe a newer `@xstate/test` surface (`propertyTest`, `testPaths`, replay and coverage). Do not install an unqualified package and assume it matches these docs. Verify its exports and XState peer range first. Pure `xstate/graph` helpers and integration-host tests can be used independently.

## Upgrade acceptance

Record old/new exact versions, release notes, resolved peer ranges, and changed declarations. Re-run input validation, named action execution, task cleanup, background-action failure, TestClock deadlines, asynchronous send, atom startup, emitted-event subscription, and service-requirement type tests. For restore-capable pins, add restart, overdue-deadline, completed-child, and interrupted-task replay tests.

Do not downgrade Effect 4 or substitute another community integration to make an example compile. Narrow the implementation to supported features and report the capability gap.

Sources: [release and source records](27-source-index.md#release-and-source-records).
