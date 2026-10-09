import { CreateNote } from "@example/contracts/notes";
import { Notes } from "@example/notes/service";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { HttpServerRequest } from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

export const makeHttp = Effect.gen(function* () {
  const notes = yield* Notes;
  const token = yield* Config.Redacted("APP_API_TOKEN");
  if (Redacted.value(token).length === 0) {
    return yield* Effect.die(new Error("APP_API_TOKEN must be non-empty"));
  }
  return {
    fetch: Effect.gen(function* () {
      const request = yield* HttpServerRequest;
      const path = new URL(request.url, "https://example.invalid").pathname;
      if (request.method === "GET" && path === "/health") {
        // Only public health is callable cross-origin by the small browser app.
        return yield* HttpServerResponse.json({ status: "ok" }, {
          headers: { "access-control-allow-origin": "*" },
        });
      }
      // A demo credential for one shared dataset, NOT end-user/tenant authentication.
      if (request.headers.authorization !== `Bearer ${Redacted.value(token)}`) {
        return HttpServerResponse.text("Unauthorized", { status: 401 });
      }
      if (path !== "/notes") return HttpServerResponse.text("Not found", { status: 404 });
      if (request.method === "GET") {
        return yield* HttpServerResponse.json({ notes: yield* notes.list() });
      }
      if (request.method === "POST") {
        // Decode the body before calling the service. Add an ingress body-size limit
        // before exposing this demonstration to arbitrary production traffic.
        return yield* request.json.pipe(
          Effect.flatMap(Schema.decodeUnknownEffect(CreateNote)),
          Effect.matchEffect({
            onFailure: () => Effect.succeed(HttpServerResponse.text("Invalid body", { status: 400 })),
            onSuccess: ({ title }) => notes.create(title).pipe(
              Effect.flatMap(note => HttpServerResponse.json(note, { status: 201 })),
            ),
          }),
        );
      }
      return HttpServerResponse.text("Method not allowed", { status: 405 });
    }).pipe(
      Effect.catchTag("InvalidTitle", () => Effect.succeed(HttpServerResponse.text("Invalid title", { status: 400 }))),
      Effect.catchTag("NotesStorageError", () => Effect.succeed(HttpServerResponse.text("Storage unavailable", { status: 503 }))),
      Effect.orDie,
    ),
  };
});
