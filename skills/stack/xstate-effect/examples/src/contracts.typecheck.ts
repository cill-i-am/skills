import { Effect } from 'effect';
import { createEffectActor, send } from '@xstate/effect';
import { publishMachine } from './approval.js';

/** Compiled for negative assertions, never called by the runtime examples. */
export function assertCompileTimeContracts() {
  // @ts-expect-error Required machine input must be supplied.
  createEffectActor(publishMachine);

  // @ts-expect-error The schema requires string documentId.
  createEffectActor(publishMachine, { input: { documentId: 42, operationId: 'op' } });

  const program = Effect.gen(function* () {
    const actor = yield* createEffectActor(publishMachine, {
      input: { documentId: 'doc', operationId: 'op' }
    });
    // @ts-expect-error Arbitrary event names are not in the public protocol.
    yield* send(actor, { type: 'SET_STATUS' });
  });

  // @ts-expect-error Closing Scope does not provide the Publishing service.
  const fullyProvided: Effect.Effect<void, never, never> = Effect.scoped(program);
  return fullyProvided;
}
