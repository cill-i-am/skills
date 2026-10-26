import { Stream } from 'effect';
import { fromEffectEventStream, fromEffectStream, setupEffect } from '@xstate/effect';

// Values are intentionally synthetic and finite. This is not an upload SDK.
export const progressLogic = fromEffectStream(Stream.make(0, 25, 70, 100));

type FeedEvent = { readonly type: 'ONLINE' } | { readonly type: 'OFFLINE' };
const feed = fromEffectEventStream(Stream.make<FeedEvent>(
  { type: 'ONLINE' }, { type: 'OFFLINE' }
));

// The invocation belongs to monitoring, not each leaf; it survives child changes.
export const connectionMachine = setupEffect({ actors: { feed } }).createMachine({
  id: 'connectionFeed',
  output: () => 'disconnected',
  initial: 'monitoring',
  states: {
    monitoring: {
      invoke: { src: 'feed', onError: { target: 'feedFailed' } },
      initial: 'waiting',
      states: {
        waiting: { on: { ONLINE: { target: 'online' } } },
        online: {}
      },
      on: { OFFLINE: { target: 'disconnected' } }
    },
    disconnected: { type: 'final' },
    feedFailed: { type: 'final' }
  }
});
