# Schema And Domain Modeling

Use this file for domain values, DTOs, persisted rows, wire contracts, brands, variants, optional fields, and decoders.

## Schema Is The Contract

Define the runtime contract first, then derive the TypeScript type from it.

```ts
import { Schema } from "effect";

export const User = Schema.Struct({
  id: UserId,
  displayName: Schema.NonEmptyString,
  email: Schema.optionalKey(EmailAddress),
});

export interface User extends Schema.Schema.Type<typeof User> {}
```

Do not maintain a handwritten interface beside an equivalent schema. Reuse `.fields`, `Schema.fieldsAssign`, `mapFields`, transforms, or explicit adapters when related contracts encode the same concept differently.

```ts
export const CreateUser = Schema.Struct({
  displayName: User.fields.displayName,
  email: User.fields.email,
});

export const StoredUser = User.pipe(
  Schema.fieldsAssign({
    createdAt: Schema.DateTimeUtcFromString,
  }),
);
```

## Avoid Stringly Typed Domains

Do not use raw `string` for distinct domain concepts merely because their encoded representation is text.

Prefer Schema-backed types for:

- entity, tenant, session, request, job, and correlation IDs
- slugs, email addresses, URLs, currency codes, and provider keys
- roles, states, modes, operations, event names, and bounded categories
- storage keys, queue names, route names, feature names, and protocol handles

Raw strings are appropriate for:

- free-form user-authored text
- logs and human-readable diagnostics
- third-party wire formats before decoding or after encoding
- genuinely unconstrained text fields such as descriptions or comments

Decode a raw string at ingress, then carry the branded or finite type through the application.

## Constrained Brands

Put meaningful validation before the brand. Distinct concepts receive distinct brands even when both encode as strings.

```ts
export const UserId = Schema.String.pipe(
  Schema.check(Schema.isPattern(/^usr_[a-z0-9]+$/)),
  Schema.brand("UserId"),
);
export type UserId = typeof UserId.Type;

export const OrganizationId = Schema.String.pipe(
  Schema.check(Schema.isPattern(/^org_[a-z0-9]+$/)),
  Schema.brand("OrganizationId"),
);
export type OrganizationId = typeof OrganizationId.Type;
```

This makes accidental interchange a type error:

```ts
interface UserRepository {
  readonly findById: (
    id: UserId,
  ) => Effect.Effect<User, UserNotFound | PersistenceError>;
}
```

Rules:

- Constrain before branding when the value has a real format or range.
- Do not use `as UserId`, `as unknown as UserId`, or a brand-only cast.
- Construct trusted values with `UserId.make(...)` only when the caller already owns the invariant.
- Use `UserId.makeEffect(...)` or `Schema.decodeUnknownEffect(UserId)` when validation failure belongs in the error channel.
- Do not brand free-form prose just to eliminate every textual type.

## Finite Strings Become Literals Or Variants

Use literal schemas for small closed sets:

```ts
export const AccountRole = Schema.Literals(["owner", "admin", "member"]);
export type AccountRole = typeof AccountRole.Type;
```

Use `Data.TaggedEnum` for internal control-flow states that do not cross a boundary:

```ts
type DeliveryDecision = Data.TaggedEnum<{
  Deliver: { readonly destination: EmailAddress };
  Suppress: { readonly reason: SuppressionReason };
}>;

export const DeliveryDecision = Data.taggedEnum<DeliveryDecision>();
```

Use `Schema.TaggedUnion` when variants are decoded, encoded, persisted, exposed through a protocol, or used for code generation:

```ts
export const JobEvent = Schema.TaggedUnion({
  Queued: { jobId: JobId },
  Started: { jobId: JobId, workerId: WorkerId },
  Failed: { jobId: JobId, error: PublicJobError },
});
export type JobEvent = typeof JobEvent.Type;
```

Use `Schema.tag(...)` plus `Schema.toTaggedUnion("type")` when an external contract uses a discriminator such as `type` or `kind`. Use `Schema.tagDefaultOmit(...)` only when the encoded contract intentionally omits the tag.

Avoid `Schema.Class` and `Schema.TaggedClass` as default application data-modeling patterns. `Schema.TaggedErrorClass` is the intentional exception for typed errors.

## Decode At Boundaries

Unknown values enter through HTTP, RPC, queues, files, environment variables, databases, SDKs, and persisted JSON. Decode them once before domain use.

```ts
export const decodeCreateUser = Schema.decodeUnknownEffect(CreateUser);

export const registerFromRequest = Effect.fn("Users.registerFromRequest")(
  function* (request: Request) {
    const body = yield* Effect.tryPromise({
      try: () => request.json(),
      catch: (cause) => new InvalidJson({ cause }),
    });
    const input = yield* decodeCreateUser(body);
    return yield* registerUser(input);
  },
);
```

Constructor and decoder chooser:

- `schema.make(...)`: trusted construction where throwing is acceptable.
- `schema.makeEffect(...)`: construction failure stays in Effect.
- `Schema.decodeUnknownEffect(...)`: default for untrusted input.
- `Schema.decodeUnknownResult(...)`: pure code needs explicit success/failure.
- `Schema.decodeUnknownOption(...)`: details are deliberately discarded.
- `Schema.decodeUnknownSync(...)`: startup, scripts, or tests where throw is intentional.

For JSON text, use `Schema.fromJsonString(...)` or the v4 JSON schema helpers rather than `JSON.parse(...) as T`.

## Optionality And Defaults

- `Schema.optionalKey(S)`: the encoded object key may be absent.
- `Schema.optional(S)`: the key may be absent and explicit `undefined` is part of the contract.
- `Schema.NullOr`, `Schema.UndefinedOr`, or `Schema.NullishOr`: the encoded format genuinely carries those values.
- Defaulted domain fields should be required after decoding; apply defaults in the codec or constructor.

Do not make domain fields optional only to make object construction convenient.

## Transformations And Reuse

- Use `.fields` and `Schema.fieldsAssign(...)` for semantically related contracts.
- Use `Schema.encodeKeys(...)` when only encoded property names differ.
- Use a schema transform when encoded and domain representations differ predictably.
- Use an explicit Effect adapter when translation performs I/O, joins data, changes authority, or can fail for domain reasons.
- Annotate schemas with identifiers when HttpApi, RPC, JSON Schema, OpenAPI, diagnostics, or code generation consumes them.

Reject:

- `JSON.parse(raw) as Model`
- `as unknown as Model`
- repeated property probing after the ingress boundary
- raw `string` IDs or finite states in public service contracts
- duplicate interfaces and schemas for the same model
- brands with no meaningful invariant where structural text is actually intended
