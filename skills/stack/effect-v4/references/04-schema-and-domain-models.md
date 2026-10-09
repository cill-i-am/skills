# Schema and domain models

## Decode where trust changes

Use Schema for request bodies, query parameters, environment-derived values, uploaded files, database rows whose shape matters, messages, and third-party responses. A TypeScript annotation or generic argument is not runtime validation. Treat foreign JSON as `unknown` until decoded.

Model the domain, not just the transport. A string that identifies an account should not be interchangeable with every other string. A positive quantity needs a range rule, not merely `Schema.Number`. A nullable field, an absent property, and an empty string are three different cases.

```ts
import { Schema } from "effect"

export const AccountId = Schema.NonEmptyString.pipe(Schema.brand("AccountId"))
export type AccountId = typeof AccountId.Type

export const Quantity = Schema.Int.check(
  Schema.isGreaterThan(0),
  Schema.isLessThanOrEqualTo(1_000)
)

export class LineItem extends Schema.Class<LineItem>("example/LineItem")({
  accountId: AccountId,
  sku: Schema.NonEmptyString,
  quantity: Quantity,
  state: Schema.Literals(["draft", "confirmed"])
}) {}

export const decodeLineItem = Schema.decodeUnknownEffect(LineItem)
export const encodeLineItem = Schema.encodeEffect(LineItem)
export type LineItemWire = typeof LineItem.Encoded
```

Reuse stable schemas and decoder functions. Avoid rebuilding an identical schema for every row or request. A Class is appropriate when a distinct class value or methods are useful; a Struct is often sufficient for a plain record. Do not choose classes merely to make every file look alike.

## Decoded and encoded types are separate contracts

`typeof S.Type` is the decoded representation. `typeof S.Encoded` is the encoded representation. They can differ because of transformations, defaults, branded values, dates, or custom codecs. Decoding and encoding can also have different service requirements.

Do not replace a codec with its decoded-type projection and assume serialisation still works. Do not accept already-decoded objects at a JSON boundary unless that is the actual contract. Encode responses through the intended public schema so private fields and representation choices are controlled.

Use an Effect-returning decoder when already inside Effect. Synchronous decoding is appropriate only when the schema can be decoded synchronously and the caller's failure policy matches it. A decoder requiring asynchronous services cannot be made synchronous with a cast.

## Shapes and constraints

Use built-in primitive schemas, literal sets, Struct, Array, Tuple, Record, Union, and recursive/suspended schemas as appropriate. Prefer discriminated unions for states with different required data. Make impossible states unrepresentable: a confirmed order should have its confirmation data rather than a collection of unrelated optional properties.

Use `.check(...)` and built-in checks for common constraints. `Schema.Finite` excludes non-finite numeric values; integer checks alone do not define safe monetary ranges. Brands provide type-level distinction; add a validation rule when the branded value has a runtime format or invariant.

For object properties, deliberately select required, optional-key, undefined-allowed, and null-allowed semantics. Test absence and explicit `undefined` separately when `exactOptionalPropertyTypes` is enabled. Test the actual JSON representation as JSON cannot represent every JavaScript value.

Decide how unknown properties are handled. Do not depend on an unexamined parser default for security-sensitive input or forward compatibility. Include a test proving the chosen excess-property policy.

## Cross-field and contextual validation

Use a whole-object check for relations such as `start <= end`. Use effectful validation when a rule depends on a service, but keep pure shape validation separate from changeable business facts where that makes the boundary clearer. A “username is available” check cannot replace a database uniqueness constraint because another request may win the race.

Distinguish validation failure from authorisation failure. A payload matching a schema is not permission to execute it. Do not add current-user permissions to a globally shared schema or cache if that would leak request context.

## Do / don't

**Do** derive types from schemas and validate real boundaries. **Don't** write `JSON.parse(text) as DomainType` and call it checked.

**Do** use brands for meaningful identities and units. **Don't** brand every primitive without a distinction to protect.

**Do** encode with the public contract. **Don't** serialise an entire domain or database object merely because `JSON.stringify` succeeds.

**Do** test valid and invalid examples, Unicode, boundaries, missing fields, nulls, and excessive sizes. **Don't** rely exclusively on a single happy-path fixture.

## Official sources

- [Schema basics example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/01_effect/02_schema/10_schema-basics.ts)
- [Complete official Schema guide](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/SCHEMA.md)
- [Schema API](https://effect.website/docs/v4/api/effect/Schema)
