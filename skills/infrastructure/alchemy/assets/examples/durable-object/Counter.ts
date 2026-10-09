import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
// Read-only persistence skeleton. Implement mutations with the installed
// storage transaction/SQL API; a naive asynchronous read/modify/write is not
// a universal concurrency-safe counter.
export default class Counter extends Cloudflare.DurableObject<Counter>()(
  "Counter",
  Effect.gen(function* () {
    const state = yield* Cloudflare.DurableObjectState;
    return Effect.gen(function* () {
      return { get: () => state.storage.get<number>("count") };
    });
  }),
) {}
