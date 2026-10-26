import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import { HttpServerRequest } from "effect/http/HttpServerRequest";
import Welcome from "./Welcome.ts";
// Composition example only: protect job creation with real authentication,
// authorization, input validation, and rate limits before public deployment.
export default Cloudflare.Worker("Api", { main: import.meta.url },
  Effect.gen(function* () {
    const workflow = yield* Welcome;
    return {
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;
        if (request.method !== "POST") return HttpServerResponse.text("Use POST", { status: 405 });
        const instance = yield* workflow.create({ params: { name: "example" } });
        return yield* HttpServerResponse.json({ instanceId: instance.id }, { status: 202 });
      }).pipe(Effect.orDie),
    };
  }),
);
