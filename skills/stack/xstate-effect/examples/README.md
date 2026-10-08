# Original example project

These are **complete source files intended to compile and run against the stated pins**, plus a separately gated preview. They were source-reviewed and syntax-checked when the skill was built. Dependencies could not be installed in that environment; semantic typechecking and runtime tests **have not been executed**. See [VALIDATION](../VALIDATION.md).

## Run in a connected environment

From this directory:

```sh
npm install
npm run typecheck
npm test
npm run demo
```

The first install creates a real `package-lock.json`. Review/commit it after successful resolution and tests; use `npm ci` thereafter. No lockfile is bundled because one could not be truthfully generated from resolved packages. Preserve your own repository's package manager rather than copying npm commands mechanically.

Exact reference pins: `effect@4.0.0`, `xstate@6.0.0-alpha.64`, `@xstate/effect@0.1.0-alpha.6`, `typescript@5.9.3`. These are reference pins, not claims of the latest releases or an executed compatibility certification. Do not downgrade an existing project without approval. See [version contract](../references/00-version-contract.md).

## Files and intended evidence

| File | Demonstrates |
| --- | --- |
| [approval.ts](src/approval.ts) | Schema-defined commands, named service-backed invocation, deadline, cancellation, explicit retry, final output |
| [search.ts](src/search.ts) | Re-entering debounce, current query, latest-wins invocation, result/error/empty states |
| [streams.ts](src/streams.ts) | Latest-value stream versus parent-event stream; enclosing-state lifetime |
| [matching.ts](src/matching.ts) | Per-state context and exhaustive Effect Match |
| [resources.ts](src/resources.ts) | Root actor resource retention with `withActorScope` |
| [actor-service.ts](src/actor-service.ts) | Actor as Layer service, ManagedRuntime ownership/disposal |
| [composition.ts](src/composition.ts) | Registered spawned Effect task, listener actor, mapped child completion |
| [background-actions.ts](src/background-actions.ts) | Declared Effect action with explicit parameters; best-effort-only contract |
| [protocol.ts](src/protocol.ts) | External schema decoding, policy service, identity check, honest enqueue response |
| [statecharts.ts](src/statecharts.ts) | Parallel prerequisites and completion join |
| [retry.ts](src/retry.ts) | Bounded task-level retry with isolated demo attempt state |
| [contracts.typecheck.ts](src/contracts.typecheck.ts) | Negative input/event/service contract assertions; compiled, never invoked |
| [tests.ts](src/tests.ts) | Fourteen original behavioral test cases using the integration host, pure transitions, gates and TestClock |
| [demo.ts](src/demo.ts) | Bounded application boundary; no external operation |

The tests intentionally avoid a test-framework dependency. A small wall-clock watchdog diagnoses a hung test; workflow timing uses Effect Clock/TestClock. The test source is not evidence of a passing test run. Negative type assertions are meant to fail the compiler when expected constraints disappear.

## Optional React example

Install the core example dependencies first, then:

```sh
cd ui
npm install
npm run typecheck
```

[Review.tsx](ui/Review.tsx) is a component source example, not a scaffolded browser application. Integrate it with an existing application/bundler and error boundary. It uses Effect atom-react 4 and `effect/reactivity`; it never starts Effect-backed logic through vanilla XState React hooks. The static demo identity must not become a shared multi-tenant SSR singleton.

## Source-preview restoration

[preview/restore.ts](preview/restore.ts) shows the inspected alpha.7 source API and is deliberately **excluded** from the alpha.6 build. Publication was not established. Do not delete the exclusion to force it into the baseline or cast through the incompatible option. Verify a restore-capable release and add persistence/recovery fixtures first.

## Non-goals and production gaps

Demo services do not call real providers. This project does not implement durable storage, authorization middleware, revision-bound human approval, idempotency storage, network transport, end-to-end UI tests, or a complete deployment host. Recipes describe those designs without pretending they are implemented. Cancellation in the publishing sample reports **local cancellation**, not remote rollback.

Production changes need additional tests from [the test matrix](../templates/transition-test-matrix.md), especially remote ambiguity, stale callbacks, startup failures, late background errors, and recovery. A complete source file is not the same as a production-complete subsystem.
