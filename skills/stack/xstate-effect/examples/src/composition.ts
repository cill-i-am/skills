import { Effect, Schema } from 'effect';
import { fromEffect, setupEffect } from '@xstate/effect';

const worker = fromEffect({
  schemas: { input: Schema.Struct({ jobId: Schema.String }) },
  effect: ({ input }) => Effect.succeed(input.jobId)
});

/**
 * One dynamically started task and a mapped lifecycle notification.
 * The public transport must expose START only, not accept spoofed child outcomes.
 * Both child and listener belong to this parent's scope/lifecycle.
 */
export const jobMachine = setupEffect({
  schemas: {
    events: {
      START: Schema.Struct({ jobId: Schema.String }),
      CHILD_DONE: Schema.Struct({ jobId: Schema.String }),
      CHILD_FAILED: Schema.Struct({})
    }
  },
  actors: { worker }
}).createMachine({
  initial: 'idle',
  context: { completedJob: '' },
  output: ({ context }) => context.completedJob,
  states: {
    idle: {
      on: {
        START: (args, enq) => {
          const child = enq.spawn(args.actors.worker, {
            id: 'current-job', input: { jobId: args.event.jobId }
          });
          enq.subscribeTo(child, {
            done: (jobId) => ({ type: 'CHILD_DONE', jobId }),
            error: () => ({ type: 'CHILD_FAILED' })
          });
          return { target: 'running' };
        }
      }
    },
    running: {
      on: {
        CHILD_DONE: ({ context, event }) => ({
          target: 'complete', context: { ...context, completedJob: event.jobId }
        }),
        CHILD_FAILED: { target: 'failed' }
      }
    },
    complete: { type: 'final' },
    failed: { type: 'final' }
  }
});
