import { Suspense } from 'react';
import { RegistryProvider, useAtomSet, useAtomSuspense } from '@effect/atom-react';
import { Atom } from 'effect/reactivity';
import { createActorAtoms } from '@xstate/effect/atom';
import { publishMachine, PublishingDemo } from '../src/approval.js';

// Demonstration identity only. For many documents, use a stable keyed owner/family.
const runtime = Atom.runtime(PublishingDemo);
const review = createActorAtoms(runtime, publishMachine, {
  input: { documentId: 'ui-demo', operationId: 'ui-demo-operation' }
});
const status = review.select((snapshot) => snapshot.value);

function ReviewControls() {
  const { value } = useAtomSuspense(status);
  const send = useAtomSet(review.send);
  return <section aria-label="Document review">
    <p role="status">{String(value)}</p>
    <button disabled={value !== 'awaitingApproval'}
      onClick={() => send({ type: 'APPROVE' })}>Approve</button>
    <button disabled={value !== 'failed'}
      onClick={() => send({ type: 'RETRY' })}>Retry</button>
    <button disabled={!['awaitingApproval', 'publishing', 'failed'].includes(String(value))}
      onClick={() => send({ type: 'CANCEL' })}>Cancel locally</button>
  </section>;
}

/** Mount inside the application's error boundary; never share this SSR owner across users. */
export function ReviewExample() {
  return <RegistryProvider>
    <Suspense fallback={<p>Starting workflow…</p>}>
      <ReviewControls />
    </Suspense>
  </RegistryProvider>;
}
