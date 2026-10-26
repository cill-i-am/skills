// Baseline: effect@4.0.2. See ../../references/05-schema-codecs-and-tooling.md
import { Schema, SchemaTransformation } from "effect"

export const TrimmedLabel = Schema.String
  .decode(SchemaTransformation.trim())
  .check(Schema.isMinLength(1), Schema.isMaxLength(120))

export const decodeLabel = Schema.decodeUnknownEffect(TrimmedLabel)
export const encodeLabel = Schema.encodeEffect(TrimmedLabel)
