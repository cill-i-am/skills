import { Data, Effect, Latch, Option, Stream } from 'effect';
import { TestClock } from 'effect/testing';
import {
  createEffectActor, fromEffect, join, send, snapshots, taggedState, waitFor
} from '@xstate/effect';
import { initialTransition, transition } from 'xstate';
import { publishMachine, Publishing, PublishingDemo, PublishFailure } from './approval.js';
import { searchMachine, Search } from './search.js';
import { progressLogic, connectionMachine } from './streams.js';
import { reviewMachine, describeReview } from './matching.js';
import { makeResourceMachine } from './resources.js';
import { prerequisitesMachine } from './statecharts.js';
import { jobMachine } from './composition.js';
import { touchMachine, Telemetry } from './background-actions.js';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function equal(actual: unknown, expected: unknown, message: string): void {
  assert(Object.is(actual, expected), `${message}: expected ${String(expected)}, got ${String(actual)}`);
}

// A wall-clock watchdog diagnoses a hung TEST. It is not a workflow timer.
async function test(name: string, body: () => Promise<void>): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      body(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Test hung: ${name}`)), 8_000);
      })
    ]);
    console.log(`PASS ${name}`);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

await test('pure transition preserves identity and starts no service', async () => {
  const [initial] = initialTransition(publishMachine, {
    documentId: 'doc', operationId: 'op'
  });
  const [next] = transition(publishMachine, initial, { type: 'APPROVE' });
  assert(next.matches('publishing'), 'approval should enter publishing');
  equal(next.context.documentId, 'doc', 'document identity survives transition');
});

await test('approval completes through the Effect service', async () => {
  await Effect.runPromise(Effect.gen(function* () {
    const actor = yield* createEffectActor(publishMachine, {
      input: { documentId: 'doc', operationId: 'op' }
    });
    yield* send(actor, { type: 'APPROVE' });
    const result = yield* join(actor);
    equal(result.outcome, 'published', 'business outcome');
    equal(result.receipt, 'receipt:doc:op', 'service output');
  }).pipe(Effect.scoped, Effect.provide(PublishingDemo)));
});

await test('explicit retry reuses the operation identity', async () => {
  const calls: Array<string> = [];
  await Effect.runPromise(Effect.gen(function* () {
    const actor = yield* createEffectActor(publishMachine, {
      input: { documentId: 'doc', operationId: 'same-operation' }
    });
    yield* send(actor, { type: 'APPROVE' });
    yield* waitFor(actor, (s) => s.matches('failed'), { timeout: '2 seconds' });
    yield* send(actor, { type: 'RETRY' });
    const result = yield* join(actor);
    equal(result.outcome, 'published', 'retry outcome');
  }).pipe(Effect.scoped, Effect.provideService(Publishing, {
    publish: (input) => Effect.suspend(() => {
      calls.push(input.operationId);
      return calls.length === 1
        ? Effect.fail(new PublishFailure({ message: 'Synthetic failure' }))
        : Effect.succeed('retry-receipt');
    })
  })));
  equal(calls.length, 2, 'attempt count');
  assert(calls.every((id) => id === 'same-operation'), 'stable operation id');
});

await test('deadline uses TestClock and never publishes', async () => {
  let calls = 0;
  await Effect.runPromise(Effect.gen(function* () {
    const actor = yield* createEffectActor(publishMachine, {
      input: { documentId: 'doc', operationId: 'op' }
    });
    yield* waitFor(actor, (s) => s.matches('awaitingApproval'));
    yield* TestClock.adjust('29999 millis');
    assert(actor.getSnapshot().matches('awaitingApproval'), 'not expired early');
    yield* TestClock.adjust('1 millis');
    const result = yield* join(actor);
    equal(result.outcome, 'expired', 'expiry outcome');
  }).pipe(Effect.scoped, Effect.provideService(Publishing, {
    publish: () => Effect.sync(() => { calls += 1; return 'should-not-run'; })
  }), Effect.provide(TestClock.layer())));
  equal(calls, 0, 'no publish without approval');
});

await test('cancel running task waits for observable cleanup', async () => {
  let released = 0;
  await Effect.runPromise(Effect.gen(function* () {
    const started = yield* Latch.make();
    const closed = yield* Latch.make();
    const program = Effect.gen(function* () {
      const actor = yield* createEffectActor(publishMachine, {
        input: { documentId: 'doc', operationId: 'op' }
      });
      yield* send(actor, { type: 'APPROVE' });
      yield* started.await;
      yield* send(actor, { type: 'CANCEL' });
      const result = yield* join(actor);
      equal(result.outcome, 'cancelledLocally', 'does not claim remote rollback');
      yield* closed.await;
    });
    yield* program.pipe(Effect.scoped, Effect.provideService(Publishing, {
      publish: () => Effect.scoped(Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.void,
          () => Effect.gen(function* () {
            released += 1;
            yield* closed.open;
          })
        );
        yield* started.open;
        return yield* Effect.never;
      }))
    }));
  }));
  equal(released, 1, 'task finalizer ran exactly once');
});

await test('root-scoped resource survives task completion, then closes', async () => {
  const trace: Array<string> = [];
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const actor = yield* createEffectActor(makeResourceMachine(trace));
    yield* waitFor(actor, (s) => s.matches('ready'), { timeout: '2 seconds' });
    equal(trace.join(','), 'acquired', 'resource retained after task completion');
  })));
  equal(trace.join(','), 'acquired,closed:demo-session', 'root cleanup awaited');
});

await test('search waits for debounce and returns latest query results', async () => {
  const calls: Array<string> = [];
  await Effect.runPromise(Effect.gen(function* () {
    const actor = yield* createEffectActor(searchMachine);
    yield* send(actor, { type: 'QUERY', query: 'first' });
    yield* waitFor(actor, (s) => s.matches('debouncing') && s.context.query === 'first');
    yield* TestClock.adjust('200 millis');
    yield* send(actor, { type: 'QUERY', query: 'latest' });
    yield* waitFor(actor, (s) => s.matches('debouncing') && s.context.query === 'latest');
    yield* TestClock.adjust('249 millis');
    equal(calls.length, 0, 'new query reset debounce');
    yield* TestClock.adjust('1 millis');
    const done = yield* waitFor(actor, (s) => s.matches('results'));
    equal(done.context.results[0], 'latest-result', 'latest query result');
    yield* send(actor, { type: 'QUERY', query: '  ' });
    const cleared = yield* waitFor(actor, (s) => s.matches('idle'));
    equal(cleared.context.results.length, 0, 'empty query clears results');
  }).pipe(Effect.scoped, Effect.provideService(Search, {
    lookup: (query) => Effect.sync(() => { calls.push(query); return [`${query}-result`]; })
  }), Effect.provide(TestClock.layer())));
  equal(calls.join(','), 'latest', 'only latest debounced request executed');
});

await test('latest-value stream exposes final context, not output', async () => {
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const actor = yield* createEffectActor(progressLogic);
    const last = yield* snapshots(actor).pipe(
      Stream.filter((s) => s.context !== undefined),
      Stream.map((s) => s.context),
      Stream.runLast
    );
    equal(Option.getOrThrow(last), 100, 'final progress value');
  })));
});

await test('event stream drives parent transitions', async () => {
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const actor = yield* createEffectActor(connectionMachine);
    yield* join(actor);
    assert(actor.getSnapshot().matches('disconnected'), 'OFFLINE reached parent');
  })));
});

await test('task join preserves its tagged failure', async () => {
  class Denied extends Data.TaggedError('Denied')<{ readonly reason: string }> {}
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const actor = yield* createEffectActor(fromEffect(
      Effect.fail(new Denied({ reason: 'No permission' }))
    ));
    const reason = yield* join(actor).pipe(
      Effect.catchTag('Denied', (error) => Effect.succeed(error.reason))
    );
    equal(reason, 'No permission', 'typed failure preserved');
  })));
});

await test('tagged state narrows state-specific context', async () => {
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const actor = yield* createEffectActor(reviewMachine);
    equal(describeReview(taggedState(actor.getSnapshot())), 'Review is waiting', 'initial rendering');
    yield* send(actor, { type: 'ACCEPT', reviewer: 'Reviewer A' });
    const snapshot = yield* waitFor(actor, (s) => s.matches('accepted'));
    equal(describeReview(taggedState(snapshot)), 'Reviewed by Reviewer A', 'narrowed rendering');
  })));
});

await test('parallel prerequisites require approval as well as build', async () => {
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const actor = yield* createEffectActor(prerequisitesMachine);
    yield* waitFor(actor, (s) => s.matches({ checking: { build: 'ready' } }));
    assert(actor.getSnapshot().matches('checking'), 'build alone is insufficient');
    yield* send(actor, { type: 'APPROVE' });
    yield* join(actor);
    assert(actor.getSnapshot().matches('readyToPublish'), 'both prerequisites complete');
  })));
});

await test('registered spawn maps child completion to a parent event', async () => {
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const actor = yield* createEffectActor(jobMachine);
    yield* send(actor, { type: 'START', jobId: 'job-17' });
    const output = yield* join(actor);
    equal(output, 'job-17', 'child completion output');
    assert(actor.getSnapshot().matches('complete'), 'mapped event completed parent');
  })));
});

await test('declared background action runs with its provided service', async () => {
  let recordedDocument = '';
  await Effect.runPromise(Effect.gen(function* () {
    const recorded = yield* Latch.make();
    yield* Effect.gen(function* () {
      const actor = yield* createEffectActor(touchMachine, {
        input: { documentId: 'touch-document' }
      });
      yield* send(actor, { type: 'TOUCH' });
      yield* waitFor(actor, (s) => s.context.count === 1, { timeout: '2 seconds' });
      yield* recorded.await;
    }).pipe(Effect.scoped, Effect.provideService(Telemetry, {
      record: (record) => Effect.gen(function* () {
        recordedDocument = record.documentId;
        yield* recorded.open;
      })
    }));
  }));
  equal(recordedDocument, 'touch-document', 'named action executed');
});

console.log('All example tests completed.');
