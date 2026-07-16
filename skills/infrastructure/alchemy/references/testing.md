# Testing

Alchemy's integration model uses real cloud resources rather than mocks or provider emulators. Test isolation, deployment ownership, and teardown are part of the test design.

## Testing Layers

- Pure domain/unit tests: no Alchemy deployment; use Effect test services as needed.
- Runtime adapter tests: test handlers/services with provided binding or repository Layers.
- Stack integration tests: deploy the real stack once, exercise its outputs, destroy according to policy.
- Provider lifecycle tests: use `test.provider` to prove create/update/no-op/replace/delete/read behavior.
- Observability tests: inspect recorded lifecycle spans and annotations without scraping console text.

Do not replace stack/provider tests with generic Effect tests. They prove different contracts.

## Harness Setup

Use the adapter for the repository's runner:

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Test from "alchemy/Test/Vitest";
import Stack from "../alchemy.run.ts";

const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
  providers: Cloudflare.providers(),
  state: Alchemy.localState(),
  stage: "test",
});

const stack = beforeAll(deploy(Stack));
afterAll.skipIf(!process.env.CI)(destroy(Stack));
```

`alchemy/Test/Bun` and `alchemy/Test/Vitest` expose the same harness shape. Import assertions from the underlying runner.

`Test.make` accepts provider Layers plus optional state, profile, and stage. Its hooks return lazy Effect accessors, so tests can `yield* stack` after the one-time deployment.

## Deployment Ownership

- Deploy once per suite, not once per test.
- Default to a unique stage per PR or concurrent test run.
- Use a sandbox profile/account.
- Share remote state only when multiple files/runners intentionally operate on the same deployed stack.
- Increase hook timeout for containers, IAM propagation, domains, or slow provider reconciliation.
- Decide and document whether local runs preserve a stack for iteration.
- CI should normally destroy its unique stage even after test failure.

Harness `deploy` and `destroy` do not prompt. Running such a suite is therefore a real cloud mutation and requires explicit user authorization in an agent session.

## Exercise Real Behavior

Return operator/test-friendly outputs such as URLs, names, and redacted identifiers from the stack. Tests should drive the public or bound interface rather than inspect implementation details.

```ts
test(
  "health endpoint is ready",
  Effect.gen(function* () {
    const { url } = yield* stack;
    const response = yield* Test.getWhenReady(`${url}/health`);
    expect(response.status).toBe(200);
  }),
);
```

Fresh routes, DNS, and IAM can converge after deployment. Use `getWhenReady`/`executeWhenReady` for initial HTTP availability or a bounded `Schedule` for specific async state. Retry only transient statuses/errors; do not hide authentication, validation, or deterministic failures.

For queues, workflows, streams, and event delivery:

- create a unique correlation ID;
- trigger through the real producer interface;
- poll an observable result with bounded backoff;
- assert duplicate/idempotency behavior when delivery is at-least-once;
- fail before the runner's global timeout;
- clean up test data where the stage does not own the whole store.

## Provider Lifecycle Tests

Use `test.provider` for custom or changed providers. Cover:

1. Create from no state and no cloud resource.
2. No-op reconcile against matching observed state.
3. Mutable update with fresh returned attributes.
4. Drift correction based on observed cloud state.
5. Replacement only for explicitly replacement-requiring fields.
6. Idempotent delete, including already-missing resources.
7. `read` recovery of owned resources.
8. Refusal of unowned resources unless adoption is enabled.
9. Secret redaction and typed provider errors.
10. Partial failure and retry behavior.

Avoid provider tests that merely assert mocked SDK call order. The contract is convergent lifecycle behavior.

## Test State

- Local state speeds repeated local integration runs but must be isolated from normal development state.
- Remote state lets CI files/runners share one deployment when necessary.
- In-memory state is appropriate for provider lifecycle tests that do not need cross-process persistence.
- Never point tests at production state.

When a failed suite leaves resources behind, report the exact stack/stage/profile and obtain confirmation before cleanup. Do not run broad deletion commands as an automatic fallback.

## Observability Tests

Alchemy's testing observability can capture lifecycle spans and annotations. Assert semantic events, resource identity, operation status, and errors rather than terminal formatting. Use this for provider sequencing, retries, replacement, and cleanup evidence.

Runtime observability remains an application concern: test logs/metrics/traces through the configured platform backend when those signals are part of the acceptance criteria.

## CI Pattern

```text
install and cache
  -> format/typecheck/unit tests
  -> plan against explicit preview stage
  -> authorized real-cloud integration suite
  -> publish evidence
  -> destroy preview stage on close/finalization
```

Parallel jobs need distinct stages or one deliberate deployment owner. Avoid races where several jobs deploy or destroy the same stack concurrently.

## Completion Evidence

- Resolved Alchemy version and test adapter.
- Provider Layer, state store, stage, profile/account, and region.
- Whether deployment occurred and who authorized it.
- Assertions run and transient retries used.
- Teardown result or exact resources intentionally retained.
- Any skipped cloud test and the concrete reason.
