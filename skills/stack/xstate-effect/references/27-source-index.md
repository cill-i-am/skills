# Source index, provenance, and authority

Audit date: **7 October 2026**. This skill is an original synthesis and set of examples, not a copied mirror of the documentation. Topic references explain the integration-first policy, recommended architecture, and relevant caveats. Links below identify the primary sources used; recommendations about application security, ownership, and delivery are not claims of built-in library guarantees.

The live website can change independently of a published package. Prefer the installed declarations and matching tags for implementation. The source-preview commit is frozen here so it cannot silently become evidence for a later feature. The environment could read official web/GitHub sources but could not resolve npm downloads for local dependency installation.

## Release and source records

- [Supplied XState documentation entrypoint](https://stately.ai/docs/xstate)
- [Repository release listing](https://github.com/statelyai/xstate/releases)
- [XState 6.0.0-alpha.64 release](https://github.com/statelyai/xstate/releases/tag/xstate%406.0.0-alpha.64) — release listing dated 3 October 2026.
- [Effect integration 0.1.0-alpha.6 release](https://github.com/statelyai/xstate/releases/tag/%40xstate/effect%400.1.0-alpha.6) — 1 October 2026; stable Effect 4 peer and `effect/reactivity` change.
- [Tagged integration example manifest](https://github.com/statelyai/xstate/blob/%40xstate/effect%400.1.0-alpha.6/examples/effect-workflows/package.json) — source of Effect/React/toolchain reference pins.
- [Inspected source-preview changelog](https://github.com/statelyai/xstate/blob/7bb5f0c5e331e0e216c55a7b5f1b4c351bd0abcf/packages/xstate-effect/CHANGELOG.md) — alpha.7 restoration, not proof of npm publication.
- [Inspected source-preview package manifest](https://github.com/statelyai/xstate/blob/7bb5f0c5e331e0e216c55a7b5f1b4c351bd0abcf/packages/xstate-effect/package.json)

These release pins are the latest entries retrieved in the relevant listing during the audit, not a guarantee about future dist-tags. The guide does not call Effect 4.0.0 the latest Effect version.

## Released actor source

[alpha.6 createEffectActor implementation](https://github.com/statelyai/xstate/blob/%40xstate/effect%400.1.0-alpha.6/packages/xstate-effect/src/createEffectActor.ts) — input-only constructor options; Scope ownership; Effect-clock scheduling; asynchronous root mailbox; unbounded Queue; internal use of durable transition machinery. Internal machinery does not establish durable external storage.

## Integration exports

[alpha.6 public index](https://github.com/statelyai/xstate/blob/%40xstate/effect%400.1.0-alpha.6/packages/xstate-effect/src/index.ts) — source for the root public API inventory. Subpath usage is cross-checked against the atom guide below.

## Effect guides

[Official integration README at the inspected source commit](https://github.com/statelyai/xstate/blob/7bb5f0c5e331e0e216c55a7b5f1b4c351bd0abcf/packages/xstate-effect/README.md). Prefer the tagged guides for released behavior; this current README contains source-preview restoration.

## Effect actors

[Tagged actor guide](https://github.com/statelyai/xstate/blob/%40xstate/effect%400.1.0-alpha.6/packages/xstate-effect/docs/actors.md) — owner, Layer/runtime, root actor scope, cleanup, inferred requirements. [Website actor guide](https://stately.ai/docs/xstate/v6/effect/actors) is useful for navigation but may reflect a different publication state.

## Effect logic

[Effect actor logic guide at the inspected commit](https://github.com/statelyai/xstate/blob/7bb5f0c5e331e0e216c55a7b5f1b4c351bd0abcf/packages/xstate-effect/docs/effect-logic.md) — task/stream adapters, their outputs/contexts, interruption, scopes, source arguments. [Quick start](https://stately.ai/docs/xstate/v6/effect/quick-start) supplies conceptual workflow orientation, with version caveats noted in this skill.

## Effect observation

[Observing actors guide](https://stately.ai/docs/xstate/v6/effect/observing-actors) — Effect command/result/stream surface. Cross-check stop/error behavior against the tagged testing guide and exports, especially where similarly named core helpers return Promises instead of Effects.

## Effect testing

[alpha.6 testing and errors guide](https://github.com/statelyai/xstate/blob/%40xstate/effect%400.1.0-alpha.6/packages/xstate-effect/docs/testing-and-errors.md) — TestClock import/layer, retries, fresh-scope supervision, typed errors, root error observation, spans, and explicit lack of restoration in that release.

## Effect schemas actions

[alpha.6 schemas and actions guide](https://github.com/statelyai/xstate/blob/%40xstate/effect%400.1.0-alpha.6/packages/xstate-effect/docs/schemas-and-actions.md) — decoded types, validator restrictions, declared action parameters, forked execution, current-state error routing, source registration and override inference. [Tagged setupEffect implementation](https://github.com/statelyai/xstate/blob/%40xstate/effect%400.1.0-alpha.6/packages/xstate-effect/src/setupEffect.ts) confirms the constrained `EffectActionArgs` signature. The guide also describes a source-only oxlint rule; the rule is not a separately published package.

## Effect schemas

See [the tagged schemas/actions guide](#effect-schemas-actions). Effect schemas do not automatically enable runtime checks, perform authorization, or apply transformations inside the XState validator.

## Effect atoms

[Atoms and React guide at the inspected commit](https://github.com/statelyai/xstate/blob/7bb5f0c5e331e0e216c55a7b5f1b4c351bd0abcf/packages/xstate-effect/docs/atoms-and-react.md) — atom fields, readiness, ownership, stable Effect 4 reactivity import, React hooks, and reading an existing actor with useSelector. [Tagged example manifest](https://github.com/statelyai/xstate/blob/%40xstate/effect%400.1.0-alpha.6/examples/effect-workflows/package.json) confirms binding reference pins.

## Effect matching

[alpha.6 matching guide](https://github.com/statelyai/xstate/blob/%40xstate/effect%400.1.0-alpha.6/packages/xstate-effect/docs/matching-states.md) — tagged-state view, per-state context, exhaustive matching, parallel tag boundaries.

## Matching states

See [the matching guide](#effect-matching). The differently named link exists to keep topic references stable.

## Effect primitives

[Effect 4 Effect API](https://effect.website/docs/v4/api/effect/Effect) — lazy effects, tryPromise and cancellation signal, scoped fibers, execution boundaries. The current API page can show a newer patch than the example reference pin. Use installed declarations for exact compatibility.

## Effect schema API

[Effect 4 Schema API](https://effect.website/docs/v4/api/effect/Schema) — v4 `Schema.decodeUnknownEffect`, schema contracts and decoding. Do not substitute an Effect 3 decoder example from memory.

## Core reference

[Core cheatsheet at the inspected commit](https://github.com/statelyai/xstate/blob/7bb5f0c5e331e0e216c55a7b5f1b4c351bd0abcf/docs/cheatsheet.md) — v6 topic inventory and conceptual syntax. It is not sufficient evidence for constructor options on the Effect integration. This skill deliberately replaces vanilla runtime/task examples with Effect-host patterns.

## Transitions

- [Core alpha.64 transition guide](https://github.com/statelyai/xstate/blob/xstate%406.0.0-alpha.64/docs/transitions.md) — one transition per event, synchronous branches, re-entry, wildcards, shallow payload matches, unhandled semantics.
- [Core alpha.64 context guide](https://github.com/statelyai/xstate/blob/xstate%406.0.0-alpha.64/docs/context.md) — describes shallow context merging.
- [Data and effects](https://stately.ai/docs/xstate/v6/data-and-effects) and the cheatsheet describe complete returned context. The discrepancy is recorded, not silently resolved without runtime evidence.

## Statecharts

Primary conceptual pages: [statecharts](https://stately.ai/docs/xstate/v6/statecharts), [states](https://stately.ai/docs/xstate/v6/states), [parallel states](https://stately.ai/docs/xstate/v6/parallel-states), [history states](https://stately.ai/docs/xstate/v6/history-states), [choice states](https://stately.ai/docs/xstate/v6/choice-states), [route states](https://stately.ai/docs/xstate/v6/route-states), [state input](https://stately.ai/docs/xstate/v6/state-input), [final states](https://stately.ai/docs/xstate/v6/final-states), and [internal events](https://stately.ai/docs/xstate/v6/internal-events). Cross-check all syntax against the v6 tagged/source reference; older documentation surfaces can coexist.

## Actor composition

Core guides for [invoke](https://stately.ai/docs/xstate/v6/invoke), [spawn](https://stately.ai/docs/xstate/v6/spawn), and [actor logic](https://stately.ai/docs/xstate/v6/actor-logic). These describe core capabilities; this skill uses the Effect adapters/host rather than copying vanilla task/callback/observable examples as defaults.

## Listen and subscribe

[Listen and subscribe](https://stately.ai/docs/xstate/v6/listen-and-subscribe) — listener actors, lifetime, event mapping, completion/error/active-snapshot distinctions, and wildcard differences.

## Systems

[Actor systems](https://stately.ai/docs/xstate/v6/systems) and [v6 systems guide](https://github.com/statelyai/xstate/blob/xstate%406.0.0-alpha.64/docs/systems.md) — addressing/registry concepts. Registry addressing is not authentication or distributed transport.

## Time

[Delays](https://stately.ai/docs/xstate/v6/delays), [timeouts](https://stately.ai/docs/xstate/v6/timeouts), plus the core cheatsheet and tagged Effect tests. Check XState duration strings separately from Effect Duration inputs.

## Testing

[Core testing](https://stately.ai/docs/xstate/v6/testing), [pure transition functions](https://stately.ai/docs/xstate/v6/transitions), and the [tagged Effect test guide](#effect-testing). Pure tests calculate decisions without executing Effect services.

## Model testing

[Model-based testing](https://stately.ai/docs/xstate/v6/model-based-testing) — graph/path generation and newer testing APIs. Optional `@xstate/test` usage is explicitly version-gated; this bundle does not bundle an unverified testing-package pin.

## Backend

[Backend workflows](https://stately.ai/docs/xstate/v6/backend-workflows) — conceptual server workflow patterns. This skill adds an explicit Effect-first command/service boundary and distinguishes local from durable ownership.

## Persistence

[Persistence](https://stately.ai/docs/xstate/v6/persistence), [persist and restore actors](https://stately.ai/docs/xstate/v6/persist-and-restore-actors), the [released testing guide](#effect-testing), and [source-preview changelog](#release-and-source-records). The integration's version-specific restoration support overrides any broader vanilla-runtime assumption.

## Inspection

[Inspection](https://stately.ai/docs/xstate/v6/inspection), [tagged integration tracing](#effect-testing), and release notes. Diagnostic streams, rejection streams, and durable audit records have different contracts.

## Serialization

[Serialization](https://stately.ai/docs/xstate/v6/serialization) — machine-definition serialization/import, implementation rebinding, and textual code representations. Not interchangeable with actor persisted snapshots.

## Tooling

[SCXML](https://stately.ai/docs/xstate/v6/scxml), [compact FSM](https://stately.ai/docs/xstate/v6/fsm), and the [Stately/XState documentation entrypoint](https://stately.ai/docs/xstate). Interoperability/tool coverage is constrained and version-gated; this skill does not promise lossless round-tripping of arbitrary Effect code.

## Evidence limits

No local npm resolution, dependency-aware typecheck, runtime test run, browser UI run, persistence restore run, or full automatic crawl of every reachable website link was completed. The package contains a broad topic coverage map, primary-source references, original examples, and local structural/syntax validation. URLs are references, not a bundled offline copy of the documentation. Exact external URL availability may change; use the repository tags when a website route moves.

## Effect quick start

[Official v6 Effect quick start](https://stately.ai/docs/xstate/v6/effect/quick-start). Use its workflow concepts, but use the alpha.6 release/tag for stable Effect 4 dependency and reactivity imports.
