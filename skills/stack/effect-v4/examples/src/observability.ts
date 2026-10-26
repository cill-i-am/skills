// Baseline: effect@4.0.2. See ../../references/20-observability.md
import { Effect } from "effect"

export const markBatchAccepted = (batchId: string, itemCount: number) =>
  Effect.logInfo("Batch accepted").pipe(
    Effect.annotateLogs({ batchId, itemCount }),
    Effect.withSpan("batch.accept")
  )
