// Baseline: effect@4.0.2. See ../../references/21-http-clients.md
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
