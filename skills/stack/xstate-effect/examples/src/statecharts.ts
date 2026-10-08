import { Effect, Schema } from 'effect';
import { fromEffect, setupEffect } from '@xstate/effect';

/** Independent review and build prerequisites; no external build is performed. */
export const prerequisitesMachine = setupEffect({
  schemas: {
    events: { APPROVE: Schema.Struct({}), CANCEL: Schema.Struct({}) }
  },
  actors: { build: fromEffect(Effect.succeed('artifact-ready')) }
}).createMachine({
  id: 'prerequisites',
  initial: 'checking',
  states: {
    checking: {
      type: 'parallel',
      states: {
        review: {
          initial: 'pending',
          states: {
            pending: { on: { APPROVE: { target: 'accepted' } } },
            accepted: { type: 'final' }
          }
        },
        build: {
          initial: 'running',
          states: {
            running: { invoke: { src: 'build', onDone: { target: 'ready' } } },
            ready: { type: 'final' }
          }
        }
      },
      on: { CANCEL: { target: 'cancelled' } },
      onDone: { target: 'readyToPublish' }
    },
    readyToPublish: { type: 'final' },
    cancelled: { type: 'final' }
  }
});
