import { Effect } from 'effect';
import { createEffectActor, join, send } from '@xstate/effect';
import { publishMachine, PublishingDemo } from './approval.js';

const program = Effect.gen(function* () {
  const actor = yield* createEffectActor(publishMachine, {
    input: { documentId: 'demo-document', operationId: 'demo-operation' }
  });
  yield* send(actor, { type: 'APPROVE' });
  return yield* join(actor);
});

const result = await Effect.runPromise(
  program.pipe(Effect.scoped, Effect.provide(PublishingDemo))
);
console.log(result);
