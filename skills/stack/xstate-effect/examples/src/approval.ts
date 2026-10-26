import { Context, Data, Effect, Layer, Schema } from 'effect';
import { fromEffect, setupEffect } from '@xstate/effect';
import { standardSchemaValidator } from 'xstate/validation';

export class PublishFailure extends Data.TaggedError('PublishFailure')<{
  readonly message: string;
}> {}

export interface PublishInput {
  readonly documentId: string;
  readonly operationId: string;
}

export class Publishing extends Context.Service<Publishing, {
  readonly publish: (input: PublishInput) => Effect.Effect<string, PublishFailure>;
}>()('example/Publishing') {}

export const publishTask = fromEffect({
  schemas: {
    input: Schema.Struct({ documentId: Schema.String, operationId: Schema.String })
  },
  effect: ({ input }) => Publishing.use((api) => api.publish(input))
});

const safeMessage = (error: unknown): string =>
  error instanceof PublishFailure ? error.message : 'Unexpected publishing failure';

/**
 * Local workflow example. APPROVE is an already-authorized domain command.
 * A production transport must authorize it and bind approval to a revision.
 * `cancelled` means local work was cancelled, NOT that a remote write was undone.
 */
export const publishMachine = setupEffect({
  schemas: {
    input: Schema.Struct({ documentId: Schema.String, operationId: Schema.String }),
    events: {
      APPROVE: Schema.Struct({}),
      REJECT: Schema.Struct({}),
      CANCEL: Schema.Struct({}),
      RETRY: Schema.Struct({})
    }
  },
  actors: { publish: publishTask }
}).createMachine({
  id: 'documentPublishing',
  validator: standardSchemaValidator(),
  context: ({ input }) => ({
    documentId: input.documentId,
    operationId: input.operationId,
    receipt: '',
    failure: '',
    outcome: ''
  }),
  output: ({ context }) => ({
    documentId: context.documentId,
    operationId: context.operationId,
    outcome: context.outcome,
    receipt: context.receipt
  }),
  initial: 'awaitingApproval',
  states: {
    awaitingApproval: {
      after: {
        30_000: ({ context }) => ({
          target: 'expired', context: { ...context, outcome: 'expired' }
        })
      },
      on: {
        APPROVE: { target: 'publishing' },
        REJECT: ({ context }) => ({
          target: 'rejected', context: { ...context, outcome: 'rejected' }
        }),
        CANCEL: ({ context }) => ({
          target: 'cancelled', context: { ...context, outcome: 'cancelledLocally' }
        })
      }
    },
    publishing: {
      invoke: {
        src: 'publish',
        input: ({ context }) => ({
          documentId: context.documentId, operationId: context.operationId
        }),
        onDone: ({ context, event }) => ({
          target: 'published',
          context: { ...context, receipt: event.output, failure: '', outcome: 'published' }
        }),
        onError: ({ context, event }) => ({
          target: 'failed', context: { ...context, failure: safeMessage(event.error) }
        })
      },
      on: {
        CANCEL: ({ context }) => ({
          target: 'cancelled', context: { ...context, outcome: 'cancelledLocally' }
        })
      }
    },
    failed: {
      on: {
        RETRY: ({ context }) => ({
          target: 'publishing', context: { ...context, failure: '', receipt: '' }
        }),
        CANCEL: ({ context }) => ({
          target: 'cancelled', context: { ...context, outcome: 'cancelledLocally' }
        })
      }
    },
    published: { type: 'final' },
    rejected: { type: 'final' },
    expired: { type: 'final' },
    cancelled: { type: 'final' }
  }
});

// Pure demo service: it does NOT perform an external publication.
export const PublishingDemo = Layer.succeed(Publishing, {
  publish: ({ documentId, operationId }) =>
    Effect.succeed(`receipt:${documentId}:${operationId}`)
});
