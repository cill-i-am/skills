# HTTP, HttpApi, RPC, And Clients

Use this file for outbound HTTP, Effect HttpClient, HttpApi, RPC, generated clients, status handling, Schema decoding, retry, rate limiting, and transport adapters.

## Exact-Pin Gate

Effect v4 HTTP, HttpApi, RPC, and platform modules often live under `effect/unstable/*` and can change between betas, release candidates, and stable releases.

Before choosing imports or copying an example:

1. inspect the target package and lockfile;
2. read installed module exports, implementation, and tests;
3. inspect nearby compiling project code;
4. compile a narrow target-project probe;
5. use current upstream only to clarify semantics.

Do not add a v3 import fallback. Align package versions and use the API for the installed pin.

## Adapter Owns The Boundary

A named client operation should:

1. accept domain input;
2. encode the request contract;
3. attach base URL, auth, and required headers;
4. execute the request;
5. classify status;
6. decode the response with Schema;
7. map transport, status, and decode failures into typed adapter errors;
8. apply retry or rate-limit policy only when safe.

```ts
const encodeProfileId = Schema.encodeEffect(ProfileId)
const decodeProfileResponse = Schema.decodeUnknownEffect(ProfileResponse)

const getProfile = Effect.fn("ProfileProvider.get")(function* (id: ProfileId) {
  const client = yield* HttpClient.HttpClient
  const encodedId = yield* encodeProfileId(id)

  return yield* client.get(`/profiles/${encodedId}`).pipe(
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.flatMap((response) => response.json),
    Effect.flatMap(decodeProfileResponse),
    Effect.mapError(
      (cause) => new ProfileProviderError({ operation: "getProfile", cause }),
    ),
    Effect.map(decodeProfileDomain),
  )
})
```

The response APIs above are illustrative; verify the target pin's JSON body helpers. Hoist static encoders and decoders rather than recompiling them per request.

## Configured Client Layer

Apply cross-cutting request transforms once when constructing the adapter:

```ts
const makeProviderClient = Effect.gen(function* () {
  const baseUrl = yield* Config.schema(ProviderBaseUrl, "PROVIDER_BASE_URL")
  const token = yield* Config.redacted("PROVIDER_TOKEN")
  const client = yield* HttpClient.HttpClient

  return configureProviderClient(client, { baseUrl, token })
})
```

Base URL, auth, common headers, telemetry, cookies, redirect policy, and standard status behavior belong in client construction. Domain-specific payload and error mapping stay in each operation.

Keep the token Redacted until the narrow request transform that needs the raw value.

## Request And Response Schemas

- use Schema-backed body encoders where the target pin provides them;
- classify non-success status before decoding a success payload;
- decode unknown response bodies with Schema;
- model provider error bodies separately from success bodies;
- preserve only evidence needed for diagnosis and recovery;
- keep provider DTOs private and map them to domain values before returning inward;
- annotate shared schemas with stable identifiers for generated protocols and documentation.

Do not let raw `Response`, unknown JSON, provider SDK payloads, or Promise errors escape the adapter.

## Retry And Rate Limits

The audited upstream revision exposes HTTP retry and rate-limiter helpers, but option shapes and semantics are exact-pin APIs. Compile the chosen policy.

Use client-level policy for cross-cutting transport concerns when it fits. Use operation-level Schedule retry when policy depends on domain errors, provider-specific payloads, retry-after data, or idempotency.

Do not retry non-idempotent requests without an idempotency key or equivalent guarantee. Test exhaustion, cancellation, and whether a 429 response is returned or retried.

## Protocol And Package Direction

Keep one authoritative Schema-backed protocol contract:

```text
Schema / domain ───────────────> Core application services
       │
       └────────> Protocol ────> Generated Effect / Promise clients

Core + Protocol ───────────────> Server handlers and host adapters
```

Arrows mean permitted dependency direction. A generated client must not depend on Core or Server implementations.

- handlers decode transport input and call application services;
- application services do not import handler implementations;
- Effect clients depend on protocol and Schema packages, not Core or Server implementation packages;
- Promise facades, when needed, derive from the same contract rather than duplicating models;
- generated files are regenerated, never hand-edited;
- architecture tests should prevent the client package importing server or adapter internals;
- public error variants have stable tags, status mapping, and redaction behavior.

Handlers remain thin:

```ts
const handler = Effect.fn("HttpApi.Users.get")(function* ({ path }) {
  const users = yield* UserService
  return yield* users.get(path.userId)
})
```

## Raw Fetch Exception

Raw `fetch` is acceptable only for a deliberate platform, browser, edge, or dependency-minimizing adapter where the target pin's Effect HTTP modules are unsuitable.

Keep it inside an Effect-native capability and preserve cancellation:

```ts
const response = yield* Effect.tryPromise({
  try: (signal) => fetch(url, { signal, headers }),
  catch: (cause) =>
    new ProviderTransportError({ operation: "request", cause }),
})
```

Then classify status and decode the body with Schema. Scope any raw-fetch lint rule to packages where Effect HTTP is the intended abstraction; do not ban a reviewed host boundary globally.

## HttpApi And RPC Tests

For ordinary HttpApi handler tests, prefer the target pin's in-memory typed test client, such as `HttpApiTest`, when available. It can exercise request encoding, middleware, routing, handler execution, response decoding, and typed failures without a socket.

Use a live test server for actual transport behavior: streaming, sockets, TLS, redirects, proxies, platform adapters, deployment routing, or interoperability with an external client.

For RPC, test both protocol encoding and the chosen transport separately. Regenerate clients after protocol changes and include a check that generated output is clean.

## Verification

Test:

- request path, encoded body, query, headers, and auth;
- success decoding and domain mapping;
- non-success status classification;
- malformed success and error payloads;
- cancellation and timeout;
- retry bounds, retry-after policy, and idempotency keys;
- rate-limit behavior;
- public protocol error encoding and redaction;
- generated-client regeneration and package-direction checks;
- in-memory handler behavior plus live transport only where needed.
