// Small text-object example, not a large-upload or full identity system.
import * as Cloudflare from "alchemy/Cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { HttpServerRequest } from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import { Uploads } from "./Bucket.ts";

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.url },
  Effect.gen(function* () {
    const objects = yield* Cloudflare.R2.ReadWriteBucket(Uploads);
    const token = yield* Config.Redacted("APP_API_TOKEN");
    return {
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;
        const path = new URL(request.url, "https://example.invalid").pathname;
        if (request.method === "GET" && path === "/health") {
          return HttpServerResponse.text("ok");
        }
        if (request.headers.authorization !== `Bearer ${Redacted.value(token)}`) {
          return HttpServerResponse.text("Unauthorized", { status: 401 });
        }
        const match = /^\/objects\/([a-zA-Z0-9][a-zA-Z0-9._-]{0,99})$/.exec(path);
        if (!match) return HttpServerResponse.text("Not found", { status: 404 });
        const key = `examples/${match[1]}`;
        if (request.method === "PUT") {
          // This check is AFTER buffering. Enforce an ingress/streaming size
          // limit before using this pattern with arbitrary production uploads.
          const text = yield* request.text;
          if (new TextEncoder().encode(text).byteLength > 16_384) {
            return HttpServerResponse.text("Too large", { status: 413 });
          }
          yield* objects.put(key, text, {
            httpMetadata: { contentType: "text/plain; charset=utf-8" },
          });
          return HttpServerResponse.empty({ status: 204 });
        }
        if (request.method === "GET") {
          const object = yield* objects.get(key);
          if (object === null) {
            return HttpServerResponse.text("Not found", { status: 404 });
          }
          return HttpServerResponse.text(yield* object.text());
        }
        return HttpServerResponse.text("Method not allowed", { status: 405 });
      }).pipe(
        Effect.catchTag("R2Error", () =>
          Effect.succeed(HttpServerResponse.text("Storage unavailable", { status: 503 })),
        ),
        Effect.orDie,
      ),
    };
  }).pipe(Effect.provide(Cloudflare.R2.ReadWriteBucketBinding)),
);
