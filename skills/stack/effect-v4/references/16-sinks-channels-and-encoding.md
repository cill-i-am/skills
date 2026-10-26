# Sinks, channels, framing, and encoding

## Separate consuming from transforming

A Sink describes consuming stream input to produce a result, possibly leaving input unconsumed. A Channel is a lower-level building block for effectful input/output protocols. Start with Stream and Sink; use Channel only when you need protocol-level composition that the higher-level operators do not express clearly.

```ts
import { Sink, Stream } from "effect"

export const sumOfMeasurements = Stream.make(12, 18, 21).pipe(
  Stream.run(Sink.sum)
)
```

A sink that reads only a prefix can leave data for a later consumer. Understand leftover semantics before composing parsers or repeatedly running a sink. Do not silently discard bytes between records because the happy-path test used one record per chunk.

## Chunks are not messages

A network chunk can contain half a UTF-8 code point, part of a JSON record, several records, or a delimiter split across reads. Transport chunk boundaries are not message boundaries. Use incremental decoding and framing operators instead of calling `JSON.parse` on each chunk.

The encoding namespace includes Base64, Base64Url, Hex, structured-text formats, NDJSON, SSE, and schema-backed binary facilities. Choose the actual wire format. Base64 is encoding, not encryption. JSON cannot directly preserve every JavaScript or Effect value without a codec.

NDJSON requires record framing and a policy for an incomplete final line. SSE requires its event format, reconnection semantics, and event IDs when replay matters. Binary formats need explicit schema versions, endianness where relevant, maximum frame sizes, and validation before allocation.

## Decode at the framed boundary

First reconstruct a complete logical frame safely, then decode it with the matching schema. Bound the bytes retained while waiting for a delimiter. A malicious peer can otherwise send an endless line and defeat an otherwise bounded Stream pipeline.

For structured text, specify duplicate-key handling, coercion rules, and whether custom tags or executable extensions are allowed. Prefer a data-only mode for untrusted configuration. Do not treat a permissive parser as proof that the data satisfies the domain schema.

## Channel and Pull protocols

Use the current v4 signatures for Channel, Pull, and terminal causes. Their type parameters and completion protocols are low-level contracts; do not infer them from a high-level Stream example. Distinguish normal end from typed failure and interruption. Swallowing an end marker or treating it as a retryable error can create a spinning pipeline.

When bridging channels or foreign streams, preserve cleanup, backpressure, typed errors, and leftover data. Test both upstream and downstream failure, as either can need to stop the other side.

## Security and performance checks

Bound frame size, decompressed size, nesting depth, field count, and record count. Compressed input needs a decompression-bomb policy. Avoid placing full binary payloads in logs or spans. Parse into reusable schemas rather than creating a parser for each chunk.

Benchmark framing and decoding separately so an apparent schema bottleneck is not actually repeated string concatenation or copying. Use AOT/JIT only after verifying that parsing semantics and deployment restrictions remain correct.

## Test matrix

Split every meaningful delimiter across chunks; combine several messages into one chunk; include Unicode boundaries, empty chunks, truncated input, invalid checksums or schemas, oversized frames, and early cancellation. Compare streamed decoding with the equivalent bounded whole-input decode where the format supports that law.

## Official sources

- [Sink](https://effect.website/docs/v4/api/effect/Sink)
- [Channel](https://effect.website/docs/v4/api/effect/Channel)
- [Pull](https://effect.website/docs/v4/api/effect/Pull)
- [Official stream encoding example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/03_stream/30_encoding.ts)
- [NDJSON](https://effect.website/docs/v4/api/effect/encoding/Ndjson)
- [SSE](https://effect.website/docs/v4/api/effect/encoding/Sse)
