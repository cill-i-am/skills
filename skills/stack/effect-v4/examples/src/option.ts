// Baseline: effect@4.0.2. See ../../references/18-data-types-and-utilities.md
import { Option } from "effect"

export const displayName = (name: Option.Option<string>): string =>
  Option.getOrElse(name, () => "Anonymous")
