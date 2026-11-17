import * as AWS from "@alchemy.run/aws";
import * as GCP from "@alchemy.run/gcp";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

// Composition fragment for an authenticated internal service.
// The binding grants the calling Cloud Run workload access to this queue.
export const Jobs = AWS.SQS.Queue("Jobs");
export default class Dispatcher extends GCP.Run.Service<Dispatcher>()(
  "Dispatcher", { main: import.meta.url },
  Effect.gen(function* () {
    const send = yield* AWS.SQS.SendMessage(Jobs);
    return {
      fetch: send({ MessageBody: "scheduled-job" }).pipe(
        Effect.as(HttpServerResponse.empty({ status: 202 })),
        Effect.orDie,
      ),
    };
  }).pipe(Effect.provide(AWS.SQS.SendMessageHttp)),
) {}
