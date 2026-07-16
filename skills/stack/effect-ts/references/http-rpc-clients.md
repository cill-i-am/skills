# HTTP, RPC, And Clients

Use this file for outbound HTTP, Effect HttpClient, HttpApi, RPC, generated clients, status handling, decoding, retry, and transport adapters.

## Version Gate

Effect v4 HTTP, HttpApi, RPC, and platform modules may live under unstable paths and change between beta releases. Inspect the target pin before choosing imports or copying APIs.

Current v4 source commonly exposes HTTP client modules under:

```ts
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
```

Do not add a v3 import fallback. Align package versions and use the API for the installed v4 beta.

## Adapter Owns The Boundary

A named client operation should:

1. accept domain input
2. encode the request contract
3. attach base URL, auth, and required headers
4. execute the request
5. classify status
6. decode the response with Schema
7. map transport, status, and decode failures into typed adapter errors
8. apply retry or rate-limit policy only when safe

```ts
const getProfile = Effect.fn("ProfileProvider.get")(function* (id: ProfileId) {
  const client = yield* HttpClient.HttpClient;
  const encodedId = yield* Schema.encodeEffect(ProfileId)(id);

  return yield* client.get(`/profiles/${encodedId}`).pipe(
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.flatMap(HttpClientResponse.schemaBodyJson(ProfileResponse)),
    Effect.mapError(
      (cause) => new ProfileProviderError({ operation: "getProfile", cause }),
    ),
    Effect.map(decodeProfileDomain),
  );
});
```

Use a Schema encoder or explicit adapter for branded IDs instead of relying on accidental string coercion.

## Configured Client Layer

Apply cross-cutting request transforms once when constructing the adapter:

```ts
const makeProviderClient = Effect.gen(function* () {
  const baseUrl = yield* Config.schema(ProviderBaseUrl, "PROVIDER_BASE_URL");
  const token = yield* Config.redacted("PROVIDER_TOKEN");
  const client = yield* HttpClient.HttpClient;

  return client.pipe(
    HttpClient.mapRequest(HttpClientRequest.prependUrl(baseUrl)),
    HttpClient.mapRequest(HttpClientRequest.bearerToken(Redacted.value(token))),
  );
});
```

Base URL, auth, common headers, telemetry, and standard status behavior belong in client construction. Domain-specific payload and error mapping stay in each operation.

## Request And Response Schemas

- Use schema-backed JSON body encoders when the v4 module provides them.
- Classify non-success status before decoding a success payload.
- Decode unknown response bodies with Schema.
- Model provider error bodies separately from success bodies.
- Preserve only the provider evidence needed for diagnosis; redact tokens and private payloads.
- Keep provider DTOs private and map them to domain types before returning from the adapter.

## Retry And Rate Limits

Use the current v4 `HttpClient.retryTransient(...)` for common transient transport and server failures when its policy fits. Use `HttpClient.withRateLimiter(...)` when proactive pacing and rate-limit headers should be handled at client level.

Use operation-level Schedule retry when policy depends on domain errors, provider-specific payloads, or idempotency. Do not retry non-idempotent requests without an idempotency key or equivalent guarantee.

## HttpApi And RPC

Keep one authoritative Schema-backed protocol contract. Derive handlers, clients, documentation, and wire error unions from it where the v4 packages support that workflow.

- handlers decode transport input and call application services
- application services do not import server handler implementations
- Effect clients depend on the protocol contract, not the server runtime
- Promise clients, when required for consumers, derive from the same contract without duplicating models
- generated files are regenerated, never hand-edited
- public error variants have stable tags, status mapping, and redaction behavior

Handlers remain thin:

```ts
const handler = Effect.fn("HttpApi.Users.get")(function* ({ path }) {
  const users = yield* UserService;
  return yield* users.get(path.userId);
});
```

Use Schema for path, query, headers, request bodies, responses, and transport-visible errors. Verify exact v4 HttpApi or RPC constructors from the installed source.

## Raw Fetch Exception

Raw `fetch` is acceptable only for a deliberate platform, browser, edge, or dependency-minimizing adapter where unstable Effect HTTP modules are unsuitable. Keep it inside an Effect service and preserve cancellation:

```ts
const response =
  yield *
  Effect.tryPromise({
    try: (signal) => fetch(url, { signal, headers }),
    catch: (cause) =>
      new ProviderTransportError({ operation: "request", cause }),
  });
```

Then classify status and decode JSON with Schema. Do not let raw `Response`, unknown JSON, or Promise errors escape the adapter.

## Testing

Prefer a test HttpClient or local test-server Layer over global fetch monkeypatching. Test:

- request path, encoded body, headers, and auth
- success decoding
- non-success status classification
- malformed success and error payloads
- cancellation and timeout
- retry bounds and idempotency keys
- rate-limit behavior
- public protocol error encoding
