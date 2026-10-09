import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Jobs } from "./Consumer.ts";
// A construction Layer fragment, not a public endpoint. The caller's runtime
// handler is responsible for authorization and a stable operation ID.
export const makeProducer = Effect.gen(function* () {
  const queue = yield* Jobs;
  return yield* Cloudflare.Queues.WriteQueue(queue);
}).pipe(Effect.provide(Cloudflare.Queues.WriteQueueBinding));
