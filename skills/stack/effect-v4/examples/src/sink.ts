// Baseline: effect@4.0.2. See ../../references/16-sinks-channels-and-encoding.md
import { Sink, Stream } from "effect"

export const sumOfMeasurements = Stream.make(12, 18, 21).pipe(
  Stream.run(Sink.sum)
)
