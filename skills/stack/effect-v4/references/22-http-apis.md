# HTTP APIs, contracts, middleware, and web handlers

## Keep contracts independent from the server

Define HTTP groups, endpoints, request schemas, success schemas, and declared errors in a package that clients can import without loading server drivers or startup code. Implement handlers separately. Generate typed clients and OpenAPI from the contract rather than maintaining parallel handwritten descriptions.

The following small API is deliberately a health endpoint, not an authenticated business API:

```ts
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
```

The host owns the returned handler and disposal function. The example does not claim database readiness, authentication, CORS policy, or production deployment. Avoid module-import side effects that start listeners during tests or client builds.

## Design an endpoint as a contract

Use endpoint options for path parameters, query parameters, payload, success, and errors. For example, a GET's query contract is not interchangeable with a POST's JSON body. Be explicit about content type, optional fields, unknown fields, and empty responses. The v4 API can derive string-tree codecs for path/query input; confirm the accepted external representation rather than hand-coercing everything with `Number`.

Use `HttpApiSchema.status` and the appropriate response representation to map declared domain errors. A not-found domain result, an unauthorized request, a validation failure, and an internal defect should not all become an identical HTTP 200 envelope. Public error schemas should contain safe, useful information, not raw database causes.

Separate create, update, read, and internal models when their field permissions differ. Do not allow callers to set generated IDs, ownership, audit timestamps, or administrative fields merely because those fields appear on a database row schema.

## Middleware is not authorization by naming

Use `HttpApiMiddleware` and the declared security schemes to express dependencies and wire implementations. Validate credentials, derive identity from a trusted source, then authorize the requested operation and resource. Bind request identity to the request lifetime. Never accept a body or path tenant ID as authorization evidence.

Authentication failure should stop protected work. Confirm handler construction does not prematurely capture one caller's identity in an application-scoped Layer. Test that concurrent requests with different credentials cannot observe each other's context.

Set CORS, CSRF protections where relevant, cookie attributes, security headers, upload limits, request deadlines, and rate limits according to the actual host and authentication mechanism. Documentation generation does not implement these policies for you.

## Serving and client generation

For an owned Node process, compose `HttpRouter.serve`, `NodeHttpServer.layer`, `Layer.launch`, and `NodeRuntime.runMain`. For a Fetch-style host, use the official web-handler conversion and honour its disposal contract. Select the platform adapter that actually runs in the deployment; do not import a Node listener into an edge bundle.

Use `HttpApiClient.make` to produce a client and supply transport plus client-side middleware Layers. Add trusted base URLs and credentials at the client boundary. Treat generated clients as typed protocol clients, not a guarantee that a separately deployed server is the same version.

For streaming routes, cancellation and response-body lifetime require integration tests. For multipart requests, validate metadata and stream limits before trusting uploaded content. For static files, check path normalization, allowed roots, content types, and cache semantics.

## Tests that matter

Use `HttpApiTest` where an in-memory typed client can exercise handler wiring. Also test raw HTTP requests to catch wire-level encoding, status, headers, invalid inputs, authorization, body-size limits, and cancellation. A typed client cannot generate all the malformed requests an external caller can send.

**Do** share schemas and safe contracts. **Don't** export server Layers from the shared client package.

**Do** distinguish liveness from readiness. **Don't** return “ready” before migrations, credentials, or required resources are available.

**Do** test both declared failures and defects. **Don't** expose arbitrary error objects in the response.

## Official sources

- [Official server and web-handler wiring](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/51_http-server/10_basics.ts)
- [Endpoint definitions](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/51_http-server/fixtures/api/Users.ts)
- [Root API](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/51_http-server/fixtures/api/Api.ts)
- [HttpApiTest](https://effect.website/docs/v4/api/effect/http-api/HttpApiTest)
- [HttpApiMiddleware](https://effect.website/docs/v4/api/effect/http-api/HttpApiMiddleware)
