# HTTP clients and external services

## Put the remote contract behind a service

Use `effect/http` for requests, response handling, transport errors, and interchangeable client implementations. Provide `FetchHttpClient.layer` for a fetch-based host, or the compatible platform-specific adapter. A service should expose the remote operation the application needs, not an unrestricted client carrying privileged credentials.

```ts
import { Effect, Layer, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientResponse } from "effect/http"

const RemoteItem = Schema.Struct({
  id: Schema.Int,
  title: Schema.String
})

export const loadItem = Effect.fn("RemoteItems.loadItem")(
  function*(id: number) {
    const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk)
    return yield* client.get(`https://api.example.com/items/${id}`).pipe(
      Effect.flatMap(HttpClientResponse.schemaBodyJson(RemoteItem))
    )
  }
)

// Composition recipe; example.com is not a real service to call in tests.
export const program = loadItem(1).pipe(Effect.provide(FetchHttpClient.layer))
export const transportLayer: Layer.Layer<HttpClient.HttpClient> = FetchHttpClient.layer
```

This definition keeps network/status/decoding failures visible in the inferred error channel. Map them to a tagged application error when the caller needs a stable domain contract. Do not claim successful JSON parsing proves the payload matches `RemoteItem`.

## Request policy

Apply a trusted base URL, accepted content types, safe headers, an explicit timeout, and an operation-specific retry policy. `HttpClient.mapRequest` and `HttpClientRequest` combinators compose those policies. `HttpClient.retryTransient` is a convenience, not permission to replay every POST. Derive mutation idempotency before adding retries; account for multiple layers of retry multiplying attempts.

Separate connect/attempt limits from an overall deadline. Respect the upstream's documented throttling response and retry delay. Bound response bytes, redirects, pagination, upload sizes, and concurrency. Redact authentication material and sensitive query parameters from logs and error formatting.

When using user-supplied URLs, validate allowed schemes, destinations, and redirect behaviour. A successful Schema decode of a URL does not make its destination safe. Restrict credential forwarding and protect against requests into internal networks according to the deployment's threat model.

## Response lifetime and streaming

Inspect status before decoding the body. Decide how empty responses, redirects, 404s, timeouts, and invalid JSON map to the application's contract. Consume or cancel a body according to the adapter's lifecycle; do not retain a streaming body beyond its owning scope.

For SSE, NDJSON, and large downloads, process incrementally through Stream/Channel adapters. Never retry an already partially consumed stream without a resumption or deduplication plan. Cancelling a UI request should cancel body consumption and the upstream operation where supported.

Uploads need similar care: an open file, multipart source, or one-shot stream might not be replayable. A retry policy that works for an in-memory JSON body can fail for a consumed upload source.

## Testing and review

Use a controllable client Layer to simulate success, malformed payloads, status errors, delayed bodies, cancellation, and failure after headers. Test outgoing authentication and request shape without a public network call. Add integration tests against the real transport for redirect, TLS, proxy, connection reuse, and streaming behaviours that a fake cannot prove.

**Do** reuse transport policy and validate responses. **Don't** use `as RemoteItem` on unknown JSON.

**Do** bound retries and decoding work. **Don't** attach a broad retry middleware to all reads and writes without a replay policy.

**Do** preserve cause information internally. **Don't** expose raw transport errors, tokens, or customer payloads in public responses.

## Official sources

- [Official HTTP client example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/50_http-client/10_basics.ts)
- [HttpClient](https://effect.website/docs/v4/api/effect/http/HttpClient)
- [HttpClientRequest](https://effect.website/docs/v4/api/effect/http/HttpClientRequest)
- [HttpClientResponse](https://effect.website/docs/v4/api/effect/http/HttpClientResponse)
