# Streams and backpressured pipelines

## A stream describes a sequence over time

Use Stream for paginated APIs, files, sockets, event subscriptions, incremental responses, and large datasets. Keep source acquisition, decoding, transformation, and consumption in one owned pipeline. The stream's environment and errors are as important as its element type.

```ts
import { Effect, Stream } from "effect"

export const squaredTotal = Stream.fromIterable([1, 2, 3, 4]).pipe(
  Stream.mapEffect((value) => Effect.succeed(value * value),
    { concurrency: 2 }),
  Stream.runFold(() => 0, (total, value) => total + value)
)
```

Use `map` for pure transformations and `mapEffect` for effectful ones. Use `flatMap` to create and flatten streams, with a deliberate concurrency policy. At the baseline, `runCollect` produces an immutable array; do not assume another collection type from memory.

## Choose the source adapter

Use `fromIterable` for a finite collection, `fromAsyncIterable` for a foreign async iterator, `fromEffectSchedule` for repeated effectful sampling, and the pagination facilities for APIs with continuation state. `Stream.callback` and event-listener adapters require cancellation and overflow policies. Platform adapters cover Node streams and other host-specific sources.

A callback source can produce faster than downstream demand. Backpressure only works if the producer can actually be slowed or buffering is bounded. A wrapper around an unstoppable event emitter cannot magically guarantee bounded memory without dropping, disconnecting, or other explicit control.

Paginated APIs need termination rules, token validation, maximum pages or items where appropriate, and protection against repeated tokens. Avoid loading all pages before constructing a stream. Preserve tenant and authentication context across every page.

## Bounded memory and ordering

`runCollect` is suitable for bounded input and tests. On unbounded or very large input it can exhaust memory or never finish. Prefer `runForEach`, a fold, a Sink, bounded batches, or a streaming response.

Every buffer, concurrent transform, group, and fan-out adds memory and latency. A concurrency limit does not guarantee order; inspect the operator's ordering semantics and available options. Test output order when the consumer requires it.

Use batching when a downstream API accepts batches, but impose both a count and a latency budget when low-volume traffic must still flush. A “batch of 100” with no completion or time policy can delay a final small batch indefinitely.

## Errors and restart position

Decide whether one bad item fails the pipeline, is sent to a dead-letter path, or becomes a per-item result. Do not blanket-recover the whole stream and silently drop data. Record rejected items safely without persisting sensitive raw input unnecessarily.

Retrying a stream can replay values emitted before the failure. The source's checkpoint/offset semantics determine what is duplicated or skipped. Use idempotent consumers and durable checkpoints when processing must survive restart. Commit a checkpoint only after the relevant effects have completed according to the delivery contract.

A stream timeout may mean inactivity between elements or total duration depending on the operator. Name the intended contract and choose the matching API. An infinite event stream should not accidentally inherit a short overall request timeout.

## Resource safety

Use resource-aware constructors or bracket acquisition around consumption. Scope file descriptors, sockets, subscriptions, and response bodies through the entire stream lifetime. Early `take`, consumer cancellation, downstream failure, and host abort must release the source.

For HTTP streaming, returning a Response is not the end of the stream. For browser consumption, stopping a reader should abort upstream work where supported. Do not pre-collect a stream merely to avoid getting the lifetime right.

## Tests

Test empty input, one element, partial consumption, invalid items, oversized items, slow consumers, overflow, ordering under concurrency, failure after a prefix, replay after retry, and cancellation while the producer is blocked. Use a bounded test source and explicit completion so a test cannot hang forever.

## Official sources

- [Official stream operators example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/03_stream/20_consuming-streams.ts)
- [Official stream constructors](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/03_stream/10_creating-streams.ts)
- [Stream](https://effect.website/docs/v4/api/effect/Stream)
