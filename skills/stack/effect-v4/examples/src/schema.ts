// Baseline: effect@4.0.2. See ../../references/04-schema-and-domain-models.md
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
