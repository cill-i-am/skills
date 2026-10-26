import { Context, Data, Effect, Schema } from 'effect';
import { send, type EffectActor } from '@xstate/effect';
import { publishMachine } from './approval.js';

export class ApprovalDenied extends Data.TaggedError('ApprovalDenied')<{
  readonly reason: string;
}> {}

export interface TrustedPrincipal {
  readonly subject: string;
  readonly tenantId: string;
}

export class ApprovalPolicy extends Context.Service<ApprovalPolicy, {
  readonly check: (
    principal: TrustedPrincipal,
    documentId: string
  ) => Effect.Effect<void, ApprovalDenied>;
}>()('example/ApprovalPolicy') {}

const ApprovalRequest = Schema.Struct({
  documentId: Schema.String,
  expectedOperationId: Schema.String
});

/**
 * Internal facade illustration, NOT a complete public HTTP handler.
 * The caller must authenticate `principal` and resolve the tenant-bound actor.
 * Returns only "enqueued"; durable acceptance/deduplication is not implemented.
 */
export const authorizeAndEnqueueApproval = (
  actor: EffectActor<typeof publishMachine>,
  principal: TrustedPrincipal,
  raw: unknown
) => Effect.gen(function* () {
  const command = yield* Schema.decodeUnknownEffect(ApprovalRequest)(raw);
  yield* ApprovalPolicy.use((policy) => policy.check(principal, command.documentId));
  const current = actor.getSnapshot().context;
  if (current.documentId !== command.documentId ||
      current.operationId !== command.expectedOperationId) {
    return yield* Effect.fail(new ApprovalDenied({ reason: 'Workflow identity mismatch' }));
  }
  yield* send(actor, { type: 'APPROVE' });
  return { status: 'enqueued' as const };
});
