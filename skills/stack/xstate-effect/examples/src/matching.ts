import { Match, Schema } from 'effect';
import { setupEffect, type TaggedState } from '@xstate/effect';

export const reviewMachine = setupEffect({
  schemas: { events: { ACCEPT: Schema.Struct({ reviewer: Schema.String }) } },
  states: {
    accepted: { schemas: { context: Schema.Struct({ reviewer: Schema.String }) } }
  }
}).createMachine({
  initial: 'pending',
  states: {
    pending: {
      on: {
        ACCEPT: ({ event }) => ({
          target: 'accepted', context: { reviewer: event.reviewer }
        })
      }
    },
    accepted: { type: 'final' }
  }
});

export const describeReview = Match.type<TaggedState<typeof reviewMachine>>().pipe(
  Match.tag('pending', () => 'Review is waiting'),
  Match.tag('accepted', ({ context }) => `Reviewed by ${context.reviewer}`),
  Match.exhaustive
);
