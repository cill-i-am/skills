# Schema And Domain Modeling

Use this file for domain values, DTOs, persisted rows, wire contracts, brands, variants, optional fields, classes, decoders, encoders, and compiler hoisting.

## Schema Is The Contract

Define the runtime contract first, then derive the TypeScript type from it:

```ts
import { Schema } from "effect";

export const User = Schema.Struct({
  id: UserId,
  displayName: Schema.NonEmptyString,
  email: Schema.optionalKey(EmailAddress),
});

export interface User extends Schema.Schema.Type<typeof User> {}
```

Do not maintain a handwritten interface beside an equivalent serializable Schema. Reuse fields, field-composition combinators, transformations, or explicit adapters when related contracts encode the same concept differently. Verify exact field-composition APIs against the target pin.

## Contract Ownership Across Packages

Place a serializable contract's owning Schema in the lowest stable package that owns its meaning. Consumers import that Schema or a type derived from it; they do not reconstruct the same shape in a runtime, transport, CLI, UI, or test package.

- A new independently parseable contract needs its own Schema.
- A projection may reuse fields or derive a type when it does not invent a second runtime boundary.
- Function-bearing services and adapters remain capability interfaces.
- Keep provider and framework DTOs private to their adapters when possible.
- Persist and publish encoded serializable data, not class instances, services, clients, fibers, Scopes, or platform handles unless the protocol explicitly defines them.

## Avoid Stringly Typed Domains

Do not use raw `string` for distinct concepts merely because their encoding is text.

Prefer Schema-backed types for:

- entity, tenant, session, request, job, and correlation IDs;
- slugs, constrained URLs, currency codes, and provider keys;
- roles, states, modes, operations, event names, and bounded categories;
- storage keys, route names, feature names, and protocol handles.

Raw strings remain appropriate for free-form user text, logs, diagnostics, descriptions, and provider wire data before decoding.

A brand is justified by meaningful validation or interchangeability risk, not by a goal to eliminate every string.

## Constrained Brands

Put validation before the brand and use distinct brands for distinct concepts:

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

Rules:

- constrain before branding when the value has a real format or range;
- do not use `as UserId`, `as unknown as UserId`, or structural brand spoofing;
- use a trusted constructor only when the caller already owns the invariant;
- decode untrusted data through the target pin's Effect or Result decoder;
- do not brand unconstrained prose merely to create nominal noise.

## Finite Values And Variants

Use literal schemas for small closed sets and a tagged union when variants cross a boundary, are persisted, or drive generated protocols. Use an internal tagged enum or small named union for purely local control flow.

Prefer public guards and matchers over reaching into Effect-owned internal tags. Direct `_tag` matching on your own tagged domain values is not inherently wrong; use exhaustive matching at important domain and public mapping boundaries.

## Structural Schema Versus Schema Class

Prefer structural schemas for DTOs, persistence rows, protocol messages, commands, events, and values that should remain plain data.

Use `Schema.Class` only when nominal class identity, methods, inheritance, or validated class construction is genuinely part of the domain model. Do not introduce a class merely to obtain a namespace, static constructor, or aesthetic grouping.

Do not adopt another repository's blanket class ban as universal Effect guidance. Conversely, do not make every schema a class.

## Schema-Backed Errors

Use the schema-backed tagged-error constructor exported by the target pin when an expected failure is serialized, public, persisted, or protocol-visible.

- Current v4 release-candidate lines use `Schema.TaggedError`.
- Older v4 betas used `Schema.TaggedErrorClass`.

Check the installed declaration and validate the changed constructor through the normal typecheck; use a probe only if inference remains unclear. Lightweight internal expected failures that never cross a boundary may use the target pin's Data tagged-error constructor.

## Decode At Boundaries

Unknown values enter through HTTP, RPC, queues, files, environment variables, databases, SDKs, and persisted JSON. Decode them once before domain use:

```ts
const decodeCreateUser = Schema.decodeUnknownEffect(CreateUser);

export const registerFromRequest = Effect.fn("Users.registerFromRequest")(function* (
  request: Request,
) {
  const body = yield* Effect.tryPromise({
    try: () => request.json(),
    catch: (cause) => new InvalidJson({ cause }),
  });
  const input = yield* decodeCreateUser(body);
  return yield* registerUser(input);
});
```

Constructor and decoder chooser:

- trusted construction where throwing is intentionally acceptable: the Schema's synchronous constructor;
- construction failure belongs in Effect: the target pin's Effect constructor;
- untrusted input: `Schema.decodeUnknownEffect(...)` or the exact installed equivalent;
- pure code needs explicit success/failure: a Result decoder;
- validation details are deliberately discarded: an Option decoder;
- startup, scripts, or tests where throw is intentional: a synchronous decoder.

For JSON text, use the target pin's Schema JSON codec rather than `JSON.parse(...) as T`.

## Optionality And Defaults

- optional key: the encoded object key may be absent;
- optional value: absence and explicit `undefined` are both part of the contract;
- null/undefined/nullish union: the wire format genuinely carries those values;
- decoded domain defaults should normally be required after decoding.

Do not make domain fields optional merely to simplify object construction.

## Transformations And Reuse

- reuse fields for semantically related contracts;
- use encoded-key transformations when only wire names differ;
- use a Schema transform when encoded and domain representations differ predictably;
- use an explicit Effect adapter when translation performs I/O, joins data, changes authority, or can fail for domain reasons;
- annotate schemas with stable identifiers when HttpApi, RPC, JSON Schema, OpenAPI, diagnostics, or code generation consumes them.

Do not force one oversized Schema to represent command, domain, row, and wire contracts when those boundaries have different authority or encoding.

## Hoist Static Compilers

Schema decoders, encoders, and guards are compiled functions. When the Schema is static and the operation is called repeatedly, hoist the compiler to module scope:

```ts
const decodeProfile = Schema.decodeUnknownEffect(ProfileResponse);
const encodeProfile = Schema.encodeEffect(ProfileRequest);
const isProfile = Schema.is(Profile);
```

Inline compilation is acceptable for one-off startup or test setup. Do not rebuild an inline Schema and compiler on every hot-path call.

## Schema Versus Predicate

Use Schema when a value crosses an authoritative boundary or needs encoding, diagnostics, code generation, persistence, or a reusable runtime contract.

Use Effect's public Predicate utilities or a small named local guard for internal, non-load-bearing control flow. Do not force a full Schema decode for every local property check, and do not let repeated ad hoc probing replace one real ingress decoder.

## Reject

- `JSON.parse(raw) as Model`;
- `as unknown as Model`;
- duplicate interfaces and schemas for the same serializable model;
- raw string IDs or finite states in public capability contracts;
- brands without meaningful invariant or interchangeability risk;
- repeated unknown-object probing after ingress;
- class models used only for namespacing;
- rebuilding static decoders and guards in repeated call sites.
