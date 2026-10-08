import * as AWS from "alchemy/AWS";
import * as S3 from "alchemy/AWS/S3";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import { HttpServerRequest } from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

export default class Api extends AWS.Lambda.Function<Api>()(
  "Api", { main: import.meta.url, functionUrl: true },
  Effect.gen(function* () {
    const documents = yield* S3.Bucket("Documents");
    const read = yield* S3.GetObject(documents);
    const write = yield* S3.PutObject(documents);
    const token = yield* Config.Redacted("APP_API_TOKEN");
    return {
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;
        const path = new URL(request.url, "https://example.invalid").pathname;
        if (path === "/health" && request.method === "GET") return HttpServerResponse.text("ok");
        if (request.headers.authorization !== `Bearer ${Redacted.value(token)}`) {
          return HttpServerResponse.text("Unauthorized", { status: 401 });
        }
        const match = /^\/objects\/([a-zA-Z0-9][a-zA-Z0-9._-]{0,99})$/.exec(path);
        if (!match) return HttpServerResponse.text("Not found", { status: 404 });
        const Key = `examples/${match[1]}`;
        if (request.method === "PUT") {
          const Body = yield* request.text;
          // Small-body demo; enforce a pre-buffering limit for production.
          if (new TextEncoder().encode(Body).byteLength > 16_384) {
            return HttpServerResponse.text("Too large", { status: 413 });
          }
          yield* write({ Key, Body });
          return HttpServerResponse.empty({ status: 204 });
        }
        if (request.method === "GET") {
          const result = yield* read({ Key }).pipe(
            Effect.catchTag("NoSuchKey", () => Effect.succeed(undefined)),
          );
          if (!result?.Body) return HttpServerResponse.text("Not found", { status: 404 });
          return HttpServerResponse.stream(result.Body);
        }
        return HttpServerResponse.text("Method not allowed", { status: 405 });
      }).pipe(Effect.orDie),
    };
  }).pipe(Effect.provide(Layer.mergeAll(S3.GetObjectHttp, S3.PutObjectHttp))),
) {}
