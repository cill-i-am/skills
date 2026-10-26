// Baseline: effect@4.0.2. See ../../references/31-ai-and-tools.md
import { Effect, Schema } from "effect"
import { Tool, Toolkit } from "effect/ai"

const NormalizeLabel = Tool.make("NormalizeLabel", {
  description: "Trim surrounding whitespace from a label",
  parameters: Schema.Struct({ label: Schema.String }),
  success: Schema.String
})

export const LabelTools = Toolkit.make(NormalizeLabel)
export const LabelToolsLive = LabelTools.toLayer(Effect.succeed(LabelTools.of({
  NormalizeLabel: ({ label }) => Effect.succeed(label.trim())
})))
