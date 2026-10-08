---
name: xstate-effect
description: Design, implement, review, test, and operate XState workflows in Effect-first TypeScript applications. Use for state machines, statecharts, actor lifecycles, approvals, forms, wizards, async orchestration, cancellation, retries, streams, React atoms, persistence, and model-based testing. Requires official @xstate/effect and Effect 4; do not substitute standalone XState runtimes or Effect 3 patterns.
---

# XState in an Effect-first codebase

## Contract

All live XState actors in scope use **the official `@xstate/effect` integration**. Effect 4 is the application foundation. XState contributes explicit, event-driven workflow semantics; it does not replace the application's services, resource model, data-access layer, transport, or existing frontend architecture.

Use `setupEffect` to author machines, `fromEffect` / `fromEffectStream` / `fromEffectEventStream` for work, and `createEffectActor` or `createActorAtoms` for ownership. Core imports such as `SnapshotFrom`, `transition`, and `standardSchemaValidator` remain legitimate. “Use the integration” does **not** mean pretending every XState export lives in `@xstate/effect`.

This skill targets XState **v6 alpha**, not the v5 syntax on older/general documentation pages. It contains no Effect 3 or migration tutorial. Read [the version contract](references/00-version-contract.md) before producing code. Do not silently upgrade a project or claim alpha APIs are stable.

## Mandatory workflow

1. **Inspect the project.** Read its package manifests and lockfile, relevant feature, service interfaces, runtime/Layer composition, tests, UI ownership, and any persisted schema. Identify the installed `effect`, `xstate`, `@xstate/effect`, and optional binding versions. Do not invent repository facts.
2. **Decide whether a machine is justified.** Use [Effect-first design](references/01-effect-first-design.md). A linear operation with retry normally stays an Effect. Add a machine where events over time, state-dependent commands, interruption, hierarchy, or human decisions make an explicit model valuable.
3. **Write the behavioral contract.** Record states, events, data, invariants, allowed outcomes, owner, resource lifetimes, cancellation meaning, and restart policy. Use [the workflow brief](templates/workflow-brief.md). Identify who authorizes externally supplied commands.
4. **Separate decisions from execution.** Pure transition functions decide state/context. Named Effect actions are background work. An invoked `fromEffect` task represents work whose completion matters. Supply narrow services at the composition root.
5. **Implement using verified APIs.** Start from [the examples](examples/README.md), not memorized v5 code. Preserve existing feature boundaries. Prefer named actor sources and inferred types. Decode untrusted inputs before sending them into an actor.
6. **Prove the lifecycle.** Test success, expected failure, timeout, cancellation, ignored/forbidden events, duplicate commands, stale responses, scope closure, and cleanup. Use Effect's `TestClock`, not real sleeps as synchronization.
7. **Review operations.** Where relevant, cover persistence versioning, idempotency, tenant isolation, observer privacy, bounded admission, and process shutdown. An in-memory actor is not a distributed durable workflow engine.
8. **Report accurately.** Separate what was implemented, what was tested, what is a proposal, and what is blocked by a version/capability gap. Never call source-reviewed snippets “compiled” or “tested.”

## Non-negotiable rules

- Do not start Effect-backed logic with `createActor`, `useMachine`, `useActor`, or `useActorRef`. Those start the vanilla host. Read an already-owned actor with `useSelector`, or use Effect atoms.
- Do not bridge every task through `Effect.runPromise` and a Promise actor. Use `fromEffect`. Runtime execution belongs at application, UI, CLI, or test boundaries.
- Do not make transition or guard functions asynchronous. Do not execute I/O, read changing ambient time, or mutate context inside them.
- Do not return an Effect from an arbitrary `enq(() => ...)` callback. It can be discarded. Declare the action in `setupEffect({ actions })`, then enqueue it with explicit arguments.
- Do not spawn inline Effect logic. Register it in `actors`; use the declared source. Inline invocation is supported, but named invocation is usually easier to test and audit.
- Do not assume a successful `send` means a transition happened, a command was accepted, or work finished. Observe an acknowledgement, `waitFor`, or `join`.
- Do not use a background action for required persistence, payment, mandatory audit, or any work that must finish before a terminal outcome. Invoke and wait for it.
- Do not equate cancellation with rollback. Local interruption and remote compensation are different operations.
- Do not expose raw actor snapshots, secrets, actor references, or inspector traffic as public API responses.
- Do not infer snapshot restoration or option parity from vanilla XState. The released `@xstate/effect` baseline and source-preview restoration differ.
- Do not add XState to simple calculations, CRUD calls, or every Effect service merely for consistency.

## Route to the relevant reference

Read only the references needed for the task; the whole bundle is not a prompt to load verbatim.

| Task | References |
| --- | --- |
| Establish versions, resolve contradictory docs | [00 Version contract](references/00-version-contract.md), [27 Sources](references/27-source-index.md) |
| Decide ownership and whether a machine helps | [01 Effect-first design](references/01-effect-first-design.md), [02 Modeling](references/02-machine-modeling.md) |
| Author states, transitions, guards, and actions | [03 Transitions](references/03-transitions-guards-actions.md), [20 Statecharts](references/20-advanced-statecharts.md) |
| Type events/context and validate boundaries | [04 Schemas and types](references/04-schemas-and-types.md) |
| Provide services and manage actor lifetimes | [05 Lifecycle](references/05-actor-lifecycle-services.md) |
| Run tasks, streams, subscriptions, SDK work | [06 Effect logic](references/06-tasks-streams.md) |
| Compose children, messages, systems, notifications | [07 Communication](references/07-actor-communication.md) |
| Handle cancellation, concurrency, retry, deadlines | [08 Concurrency](references/08-concurrency-cancellation-retries.md), [09 Time](references/09-time.md) |
| Observe results and failures | [10 Observation](references/10-observation-errors.md), [17 Observability](references/17-observability.md) |
| React, frontend atoms, SSR and ownership | [11 UI integration](references/11-react-and-atoms.md), [12 Forms](references/12-forms-and-ux.md) |
| Backend, approvals, automation, AI tools | [13 Backend](references/13-backend-workflows.md), [22 Recipes](references/22-recipes.md) |
| Persistence, crash recovery, external durability | [14 Persistence](references/14-persistence-durability.md) |
| Unit, integration, type, graph, property testing | [15 Testing](references/15-testing.md), [16 Model-based testing](references/16-model-based-testing.md) |
| Security, scale, production failure diagnosis | [18 Security](references/18-security.md), [19 Performance](references/19-performance.md), [24 Debugging](references/24-debugging.md) |
| Serialization, Studio, SCXML, adjacent packages | [21 Tools](references/21-serialization-tools.md) |
| Review or enforce repository practices | [23 Dos and don'ts](references/23-dos-donts.md), [25 CI](references/25-repository-ci.md), [30 Review checklist](references/30-review-checklist.md) |
| Look up the integration's public surface | [26 API reference](references/26-api-reference.md) |
| Audit this skill's coverage or behavior | [28 Coverage](references/28-coverage.md), [29 Agent evaluations](references/29-agent-evals.md) |

## Working definition of done

The proposed state model has a reason to exist, a named owner, narrow Effect dependencies, typed boundaries, explicit expected outcomes, and tested cleanup. Each externally important side effect has an idempotency/recovery policy. The UI reads the actor rather than duplicating its lifecycle state. Tests cover the real Effect host, not just pure transitions. Relevant version-sensitive claims are checked against the installed source/declarations.

Use [the example project](examples/README.md) for concrete code and [the validation record](VALIDATION.md) for what has actually been checked in this bundle.
