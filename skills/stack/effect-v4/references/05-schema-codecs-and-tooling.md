# Schema codecs, transformations, and generated tooling

## Define both directions deliberately

A codec is not just a parser with a type annotation. Decide how to decode external data and how to encode domain data. Normalisation may intentionally lose information: trimming a string means the encoded output need not preserve the original whitespace. Write the round-trip law that actually applies instead of assuming byte-for-byte identity.

```ts
import { Schema, SchemaTransformation } from "effect"

export const TrimmedLabel = Schema.String
  .decode(SchemaTransformation.trim())
  .check(Schema.isMinLength(1), Schema.isMaxLength(120))

export const decodeLabel = Schema.decodeUnknownEffect(TrimmedLabel)
export const encodeLabel = Schema.encodeEffect(TrimmedLabel)
```

Verify validation order when normalisation and checks interact. A whitespace-only input must not pass a non-empty check merely because checking happened before trimming.

`Schema.decodeTo` connects source and target schemas. Infallible bidirectional transformations use `SchemaTransformation`; fallible or service-dependent directions can use `SchemaGetter` operations. Inspect exact callback signatures in the installed release. Do not throw from an allegedly infallible transformation to implement a normal validation failure.

Use the published codecs for JSON, FormData, URLSearchParams, structured text, dates, and Effect data types where available. A JavaScript `Map`, `Set`, `Date`, `BigInt`, `Option`, or class instance is not automatically its JSON representation. Be explicit about precision, nullability, and wire shape.

## Constructors, defaults, and projections

A schema constructor creates a decoded value, whereas decoding reads an encoded or unknown representation. Do not interchange `make`, effectful construction, and decode operations without checking their inputs and requirements.

A default is a data policy. Decide whether it applies to a missing key, an undefined value, decoding, construction, or more than one path. A default generated from time or randomness must use controlled services when deterministic tests matter. Avoid allocating IDs as an incidental effect of validating the same input twice.

Projections such as `Schema.toType` and `Schema.toEncoded` select a side of a codec. Flipping exchanges decoding and encoding directions. These are useful tools, but removing a transformation can also change accepted inputs and constraints. Test projected schemas rather than assuming they validate exactly the same language.

## Errors that people can use

Preserve paths into nested input. Choose fail-fast or accumulated issues based on the interaction: a form usually benefits from actionable field errors; a hot internal protocol may prefer early rejection. Format issues for the client without leaking raw secrets or enormous submitted payloads. Keep machine-readable issue codes separate from localised messages.

Cross-field issues should point to useful fields and survive array nesting. Test internationalisation, unexpected unions, and input that triggers more than one rule. Limit message length and issue count for untrusted, deeply nested input.

## Derive tools, but verify their limits

JSON Schema and OpenAPI are useful external contracts, but not every Effect transformation, asynchronous rule, class method, or service requirement can be expressed there. Validate generated schemas against the intended consumer; do not call an approximate projection equivalent to the full runtime codec.

Standard Schema allows integration with compatible form and validation tools. Verify whether the consumer supports asynchronous validation, transformations, and issue paths. Keep the Effect schema as the owner of domain validation rather than maintaining a second handwritten validator that can drift.

Use schema-derived arbitraries for property tests, and generated equivalence, formatting, optics, or differs where they remove real duplication. An arbitrary only exercises the model you described; add invalid and adversarial inputs separately. Equality derived from a schema must match the business meaning of equality.

## Optional compiler acceleration

The baseline provides experimental JIT and AOT schema compilation. Use the interpreter as the correctness baseline. Benchmark representative valid, invalid, nested, and transformed data before adopting compilation.

JIT activation is explicit:

```ts
import "effect/schema/SchemaJITCompiler/enable"
```

Do not add that side-effect import indiscriminately to shared libraries. Dynamic function construction may be restricted by the deployment environment. AOT generation is an alternative when dynamic construction is forbidden, but generated modules must be rebuilt when schemas or Effect versions change and their installation must survive bundling.

Generated compiler code trusts the target ASTs and installation ordering. Do not hand-edit it, mix it with a different schema version, or treat generated validation as authorisation. Run the same contract tests against interpreted and compiled configurations before enabling it in production.

## Official sources

- [Schema transformations](https://effect.website/docs/v4/schema/transformations)
- [Schema guide and compiler details](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/SCHEMA.md)
- [SchemaTransformation](https://effect.website/docs/v4/api/effect/SchemaTransformation)
- [SchemaGetter](https://effect.website/docs/v4/api/effect/SchemaGetter)
- [StandardSchema](https://effect.website/docs/v4/api/effect/StandardSchema)
