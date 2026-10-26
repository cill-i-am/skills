// Baseline: effect@4.0.2. See ../../references/22-http-apis.md
import { Effect, Layer, Schema } from "effect"
import { HttpRouter, HttpServer } from "effect/http"
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "effect/http-api"

export class System extends HttpApiGroup.make("system").add(
  HttpApiEndpoint.get("health", "/health", {
    success: Schema.Struct({ status: Schema.Literal("ok") })
  })
) {}

export class Api extends HttpApi.make("example-api").add(System) {}

const handlers = HttpApiBuilder.group(Api, "system",
  Effect.fn(function*(group) {
    return group.handleAll({
      health: () => Effect.succeed({ status: "ok" as const })
    })
  })
)

const routes = HttpApiBuilder.layer(Api).pipe(Layer.provide(handlers))

export const makeWebApi = () => HttpRouter.toWebHandler(
  routes.pipe(Layer.provide(HttpServer.layerServices))
)
