import { Context, Layer, ManagedRuntime } from 'effect';
import { createEffectActor, join, send, type EffectActor } from '@xstate/effect';
import { publishMachine, PublishingDemo } from './approval.js';

export class DocumentWorkflow extends Context.Service<
  DocumentWorkflow,
  EffectActor<typeof publishMachine>
>()('example/DocumentWorkflow') {}

export const DocumentWorkflowLive = Layer.effect(
  DocumentWorkflow,
  createEffectActor(publishMachine, {
    input: { documentId: 'owned-document', operationId: 'owned-operation' }
  })
).pipe(Layer.provide(PublishingDemo));

/** A real application would retain this runtime at its application owner. */
export async function runOwnedWorkflow() {
  const runtime = ManagedRuntime.make(DocumentWorkflowLive);
  try {
    const actor = await runtime.runPromise(DocumentWorkflow);
    await runtime.runPromise(send(actor, { type: 'APPROVE' }));
    return await runtime.runPromise(join(actor));
  } finally {
    // Await cleanup before releasing the application owner.
    await runtime.dispose();
  }
}
