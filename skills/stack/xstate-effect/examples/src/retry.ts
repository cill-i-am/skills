import { Effect, Schedule } from 'effect';
import { createEffectActor, fromEffect, join } from '@xstate/effect';

/** Factory keeps attempt state isolated to one demo, not a module-global job. */
export const makeRetryDemo = () => {
  let attempts = 0;
  const task = Effect.suspend(() => {
    attempts += 1;
    return attempts === 1
      ? Effect.fail(new Error('Synthetic transient failure'))
      : Effect.succeed('ready');
  });
  const logic = fromEffect(task.pipe(
    Effect.retry({ schedule: Schedule.exponential('10 millis'), times: 2 })
  ));
  return {
    attempts: () => attempts,
    program: Effect.scoped(Effect.gen(function* () {
      const actor = yield* createEffectActor(logic);
      return yield* join(actor);
    }))
  };
};
