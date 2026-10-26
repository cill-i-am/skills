# Testing strategy and Alchemy test harness

## Choose the cheapest test that proves the claim

Use ordinary pure unit tests for parsing, authorization decisions, stage policy, and domain logic. Use service fakes for code that depends on capability contracts. Use local providers for runtime/binding integration. Use authorized live tests for actual IAM, DNS, cloud lifecycle, external integrations, and gaps in emulation. None of these layers substitutes for all the others.

`Test.make` defaults to **real cloud deployment**. An in-memory state store does not make the provider fake. Inspect provider Layers, explicit `remote()` selections, side effects at module load, and test hooks before running unfamiliar tests.

## End-to-end test shape

The full example at [the example catalogue](examples.md) uses this source-reviewed pattern:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Test from "alchemy/Test/Bun";
import * as Effect from "effect/Effect";
import * as HttpClient from "effect/http/HttpClient";
import { expect } from "bun:test";
import Stack from "../alchemy.run.ts";

const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
  providers: Cloudflare.providers(),
  stage: "test-local-example",
  dev: true,
});
const deployed = beforeAll(deploy(Stack));
afterAll(destroy(Stack));

test("health endpoint", Effect.gen(function* () {
  const { url } = yield* deployed;
  const response = yield* HttpClient.get(`${url}/health`);
  expect(response.status).toBe(200);
}));
```

This local example's fixed stage is for one isolated developer execution. Parallel CI requires a unique, sanitized stage including run/job/suite identity. `beforeAll` returns an Effect accessor: yield it inside a test. Do not await it as a Promise at module initialization. Hook timeouts can be configured with a second argument such as `{ timeout: 300_000 }`.

For Vitest, use `alchemy/Test/Vitest` and the documented `@effect/vitest` adapter. Preserve the repository's runner; do not install a second runner merely to use a sample. Hooks and deploy/destroy follow the same model.

## Useful harness controls

`providers` is required. `state` defaults to local state for top-level deploys; `profile`, `stage`, `dev`, `adopt`, and `sidecar` tune execution. Persistent state can reuse unchanged infrastructure between runs, but then cleanup ownership must be explicit. Adoption is not a generic fix for colliding tests.

`dev: true` selects emulated resources. `ALCHEMY_DEV` can supply the mode when omitted; `ALCHEMY_TEST_DEV` can override it. An explicitly remote resource is still live. The harness's local sidecar is useful for matching development behaviour; in-process execution can simplify provider debugging.

## Assert behaviour, not just status

A storage API test should write a unique key, read the same value, verify missing-key handling, reject unauthenticated/invalid input, and check isolation between tenants. A queue test should verify eventual consumption and duplicate handling. A workflow test should cover a retry and a terminal failure, not merely instance creation. A frontend test should exercise a server route and a deep-link asset path, not only a homepage.

Use bounded readiness polling and deadlines. Distinguish cold-start/transient readiness from an actual authorization or validation failure; retrying every 4xx hides bugs. Inspect `Test.getWhenReady` and `Test.executeWhenReady` in the installed harness before choosing their overloads. Never use unbounded polling or fixed multi-minute sleeps as the main readiness contract.

## Provider lifecycle proof

`test.provider(name, stack => effect)` gives a scratch stack with private in-memory state. Deploy one declaration, deploy it unchanged, update a mutable input, change a replacement-triggering input, and destroy. Compare physical IDs where identity matters. Read the provider API independently to verify the cloud matches reported outputs.

Add adoption/recovery tests, NotFound deletion, partial success followed by retry, throttling, invalid credentials, and secret redaction. A read that treats every error as NotFound can create duplicates during an outage; test that distinction explicitly. Use local fake clients for failure injection, then a narrow live suite for actual semantics.

## Cleanup is part of correctness

Register teardown before assertions can fail. A killed runner may never execute hooks, so use unique stages, ownership metadata, cost limits, and an orphan-cleanup process. Keep credentials available to teardown but not to unrelated logs/artifacts. A debug option that retains test infrastructure must be explicit and report its target.

When testing an already-deployed environment, do not use deploy/destroy hooks at all. Supply its URL through a non-secret input and run an HTTP-only suite. Report separately which checks were syntax-only, typechecked, emulated, and live; a green unit suite is not evidence of a successful cloud deployment.

## Sources

- [testing](https://alchemy.run/testing/)
- [testing/testing-a-stack](https://alchemy.run/testing/testing-a-stack/)
- [testing/test-harness](https://alchemy.run/testing/test-harness/)
- [testing/testing-providers](https://alchemy.run/testing/testing-providers/)
- [cloudflare/tutorial/part-3](https://alchemy.run/cloudflare/tutorial/part-3/)
- [cloudflare/tutorial/part-4](https://alchemy.run/cloudflare/tutorial/part-4/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
