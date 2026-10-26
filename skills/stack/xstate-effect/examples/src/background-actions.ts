import { Context, Effect, Schema } from 'effect';
import { setupEffect, type EffectActionArgs } from '@xstate/effect';

export interface TouchRecord {
  readonly documentId: string;
  readonly count: number;
}

export class Telemetry extends Context.Service<Telemetry, {
  // Best effort only. A real implementation handles expected transport failures.
  readonly record: (record: TouchRecord) => Effect.Effect<void>;
}>()('example/Telemetry') {}

export const touchMachine = setupEffect({
  schemas: {
    input: Schema.Struct({ documentId: Schema.String }),
    events: { TOUCH: Schema.Struct({}) }
  },
  actions: {
    recordTouch: ({ context }: EffectActionArgs<TouchRecord, { type: 'TOUCH' }>) =>
      Telemetry.use((api) => api.record({
        documentId: context.documentId, count: context.count + 1
      }))
  }
}).createMachine({
  context: ({ input }) => ({ documentId: input.documentId, count: 0 }),
  initial: 'active',
  states: {
    active: {
      on: {
        TOUCH: (args, enq) => {
          const count = args.context.count + 1;
          enq(args.actions.recordTouch, args);
          return { context: { ...args.context, count } };
        }
      }
    }
  }
});
