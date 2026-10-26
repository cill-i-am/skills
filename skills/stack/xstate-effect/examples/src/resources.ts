import { Effect } from 'effect';
import { fromEffect, setupEffect, withActorScope } from '@xstate/effect';

/**
 * Instrumentation callbacks execute inside Effects. The session is deliberately
 * root-actor-owned, so task completion must not close it while `ready` is active.
 */
export const makeResourceMachine = (trace: Array<string>) => {
  const acquireSession = Effect.acquireRelease(
    Effect.sync(() => {
      trace.push('acquired');
      return { id: 'demo-session' };
    }),
    (session) => Effect.sync(() => { trace.push(`closed:${session.id}`); })
  ).pipe(withActorScope);

  return setupEffect({
    actors: { open: fromEffect(acquireSession) }
  }).createMachine({
    initial: 'opening',
    states: {
      opening: { invoke: { src: 'open', onDone: { target: 'ready' } } },
      ready: {}
    }
  });
};
