# Serialization, Stately tools, SCXML, and adjacent packages

## Keep tooling subordinate to the runtime contract

Stately visualization can help review a model with product/support engineers. Use it to make states, transitions, failure paths, and cancellation understandable. The application still owns the Effect service implementations, runtime, security boundary, and tests. A diagram is neither executable authorization nor proof that the implementation matches the intended behavior.

Do not round-trip code through a visual tool and assume all Effect-specific types, Layers, schemas, invocations, and action semantics survive. Review generated diffs and compile/test against the real installed packages. Keep the source of truth and synchronization policy explicit.

## Machine serialization is not actor persistence

v6 documentation describes `serializeMachine`, `machineConfigToJSON`, and construction from serialized config. These concern machine definitions/configuration, not a live actor's persisted continuation. A restored definition still needs trusted implementations and an Effect host. `createMachineFromConfig` is not a reason to replace `createEffectActor` with a vanilla runtime.

The inspected serialization guide lists state input, listener/subscription enqueue helpers, and choice functions as not fully portable in ordinary machine JSON. Runtime-loaded definitions also lose static event/context specificity; re-establish validation at boundaries.

Inline implementations can be represented as textual `@code` values, while functions, schemas, and actor logic may require reconstruction/rebinding. Never evaluate untrusted machine JSON or arbitrary function text. Prefer named local actor/action implementations and a reviewed allowlist. Validate schema/version, implementation names, and allowed transitions before executing externally edited models.

If an export/import workflow cannot preserve an Effect-specific feature, document the limitation and retain the authored source. Do not silently replace a service-backed task with a Promise callback to fit a visual editor.

## Inspection and sharing

A live inspector can expose events, context, state history, actor addresses, and machine definitions. Hosted inspector examples may transmit this data to a relay. Use synthetic data by default, redact protected fields, and obtain the appropriate approval for external sharing. Disable accidental production connections. See [observability](17-observability.md).

A diagram generated from a machine may omit details embedded in arbitrary JS branches. Include human-readable state/transition descriptions and separate decision tables where necessary. Avoid using a visually simple graph to conceal complex untested conditionals.

## SCXML interoperability

The v6 SCXML guide documents `createMachineFromSCXML` from the separate `@xstate/scxml` package. Its ECMAScript expressions and script elements execute JavaScript; only trusted documents belong here. External data/script/invoke references require a synchronous resource resolver. The SCXML representation is not losslessly interchangeable with ordinary MachineJSON. This skill does not supply an unverified package pin or alternate host for that path.

SCXML is useful as an interoperability/reference format for statecharts, but do not assume round-trip equivalence with arbitrary XState v6 functions, Effect schemas, dependency injection, task scopes, or stream semantics. Treat conversion as a constrained adapter: enumerate supported node/transition features, bind actions through trusted names, and compare behavior with fixtures.

Do not import foreign executable content as trusted Effect service code. Test hierarchical targets, history defaults, parallel completion, delays, and event matching where an interchange path claims support. A format-level conversion does not create runtime compatibility.

## Adjacent actor-logic and state-store options

Core documentation also covers async, callback, observable, custom actor logic, compact FSMs, state stores, framework bindings, and durability adapters. In this codebase, their concepts must be evaluated through the Effect-first constraint:

- Tasks map to `fromEffect`; changing values to `fromEffectStream`; parent events to `fromEffectEventStream`.
- A callback/SDK integration belongs behind an Effect service with scope cleanup, not an unmanaged alternate actor host.
- A simple store/reducer may be enough for local data; do not introduce a workflow machine solely to replace an existing Effect atom.
- Compact `xstate/fsm` is a constrained pure state primitive, not a substitute for the full statechart/Effect lifecycle described here.
- React/Vue/Svelte/Solid bindings that start their own host are not automatically compatible with Effect-backed logic. Consume an already-owned actor through a compatible external-store/selector adapter instead.
- Backend durable adapters require a verified Effect-host story; core capability does not establish integration parity.

These are coverage decisions, not hidden alternative defaults. Use the official integration for all live XState workflow instances in this skill. Verify optional package exports, peers, and hosting assumptions before implementation.

Sources: [serialization](27-source-index.md#serialization), [Stately/SCXML/tooling](27-source-index.md#tooling), [actor logic alternatives](27-source-index.md#actor-composition), [inspection](27-source-index.md#inspection).
