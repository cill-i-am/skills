# Queues, Workflows, schedules, and durable processing

## Choose the right mechanism

Use a Queue for buffering, retries, fan-out, and asynchronous work distribution. Use a Workflow for a durable sequence with named steps, waits, and recovery. Use a Durable Object for coordinated per-entity state. Use a cron trigger for a schedule, not as a substitute for a durable multi-step process. These can be composed without making every task use all four.

## Queue producer and consumer

```ts
const queueResource = yield* Jobs;
const sender = yield* Cloudflare.Queues.WriteQueue(queueResource);
yield* Cloudflare.Queues.consumeQueueMessages<{ id: string; text: string }>(
  queueResource,
  { batchSize: 10, maxRetries: 3, maxWaitTime: "5 seconds" },
  (messages) => Stream.runForEach(messages, (message) =>
    objects.put(`jobs/${message.body.id}`, message.body.text).pipe(Effect.asVoid),
  ),
);
```

This construction excerpt needs the corresponding `WriteQueueBinding`, `EventSourceLive`, and storage binding Layer. It uses a generic for compile-time shape only; decode untrusted queue payloads in the real handler. The complete asset demonstrates the wiring and keeps its payload intentionally simple.

Successful handler completion acknowledges the batch; failure retries it under consumer settings. Explicit per-message acknowledgement/retry supports finer control. At-least-once delivery means a successful side effect may be repeated. Use a stable operation key and a storage/transaction design that makes duplicates safe. Writing the same body to the same object key is different from incrementing a balance twice.

Set a retry limit, backoff, dead-letter destination, and an operational replay procedure where the provider supports them. Poison messages should not block unrelated work indefinitely. Do not blindly retry validation or authorization failures. Drain streams through the documented QueueSink when batching is appropriate, but fetch current provider batch limits instead of hardcoding remembered values.

## Define a durable Workflow

```ts
export default class Welcome extends Cloudflare.Workflow<Welcome>()(
  "Welcome",
  Effect.gen(function* () {
    return Effect.fn(function* (input: { name: string }) {
      const greeting = yield* Cloudflare.Workflows.task(
        "prepare-greeting",
        Effect.succeed(`Hello, ${input.name}`),
      );
      yield* Cloudflare.Workflows.sleep("cooldown", "30 seconds");
      return { greeting };
    });
  }),
) {}
```

Yield the class in Worker construction; start an instance at runtime with `workflow.create({ params: { name } })`. Use a deterministic instance `id` when the product operation needs deduplication, after checking collision/reuse semantics. Return the instance ID immediately and expose an authorized status endpoint.

Named tasks are replay keys. Keep names stable across code changes and place external side effects inside tasks. Completed task results can be replayed without rerunning their body, but do **not** promise exactly-once external side effects: a crash between an external success and checkpointing still requires idempotency or reconciliation at the external boundary.

## Failures and compensation

Task options can set retries, timeout, and rollback callbacks. A fallible Effect uses the configured retry policy; a defect (`die`/`orDie`) is terminal for the step. Catch a typed failure outside `task` when recovery should occur after retries are exhausted. Do not convert every transient provider failure to a defect.

Keep task results and error data serializable. After replay, use error tags and data fields rather than `instanceof`, prototype methods, or object identity. Store large diagnostic payloads elsewhere and include a reference. Each attempt has its own scope, so do not expect a database connection to survive across tasks or retries.

Compensation is a business operation, not an automatic database rollback. A refund can fail independently of a charge. Give compensating calls their own idempotency, retries, permissions, and audit record.

## Human approval and scheduling

`waitForEvent` can pause for an approval event; a Worker can obtain the instance and call `sendEvent`. Authenticate the actor, check that they may approve this operation, reject stale/duplicate decisions, and define timeout/escalation. Waiting does not confer authorization.

Use Workflow `schedules` when the schedule directly starts instances. Use Worker cron when logic must decide whether to start one. Check cron timezone semantics and use UTC explicitly in operational schedules. Avoid interpreting a schedule string in the user's local timezone without conversion.

## Verification

Test eventual completion with bounded polling, failed and duplicated messages, resumed Workflow execution, timeout, a rejected approval, and successful/failed compensation. Check that repeated execution does not duplicate the business effect. Distinguish `running`, waiting, and terminal statuses using the current API rather than guessing from display labels.

## Sources

- [cloudflare/messaging/queues](https://alchemy.run/cloudflare/messaging/queues/)
- [cloudflare/messaging/cron](https://alchemy.run/cloudflare/messaging/cron/)
- [cloudflare/compute/workflows](https://alchemy.run/cloudflare/compute/workflows/)
- [cloudflare/compute/add-a-workflow](https://alchemy.run/cloudflare/compute/add-a-workflow/)
- [infrastructure-as-effects/event-sources](https://alchemy.run/infrastructure-as-effects/event-sources/)
- [infrastructure-as-effects/sinks](https://alchemy.run/infrastructure-as-effects/sinks/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
