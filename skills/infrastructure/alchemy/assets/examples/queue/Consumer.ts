import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

export const Jobs = Cloudflare.Queues.Queue("Jobs");
export const Results = Cloudflare.R2.Bucket("Results");
// This example deliberately has no public enqueue endpoint. Bind WriteQueue
// in an authenticated producer, and publish validated { id, text } messages.
export default Cloudflare.Worker("Consumer", { main: import.meta.url },
  Effect.gen(function* () {
    const objects = yield* Cloudflare.R2.ReadWriteBucket(Results);
    const queue = yield* Jobs;
    yield* Cloudflare.Queues.consumeQueueMessages<{ id: string; text: string }>(
      queue,
      { batchSize: 10, maxRetries: 3, maxWaitTime: "5 seconds" },
      (messages) => Stream.runForEach(messages, (message) => {
        // The generic does not decode queue bytes. Fail invalid messages;
        // configure a dead-letter policy in the production consumer.
        const value: unknown = message.body;
        if (typeof value !== "object" || value === null ||
            !("id" in value) || !("text" in value) ||
            typeof value.id !== "string" || typeof value.text !== "string" ||
            !/^[a-zA-Z0-9_-]{1,80}$/.test(value.id) || value.text.length > 4096) {
          return Effect.fail(new Error("Invalid job payload"));
        }
        // Duplicate same-ID/same-body delivery overwrites the same object.
        // Reject conflicting bodies for the same operation ID in a real app.
        return objects.put(`jobs/${value.id}`, value.text).pipe(Effect.asVoid);
      }),
    );
    return { fetch: Effect.succeed(HttpServerResponse.text("consumer healthy")) };
  }).pipe(
    Effect.provide(Cloudflare.Queues.EventSourceLive),
    Effect.provide(Cloudflare.R2.ReadWriteBucketBinding),
  ),
);
