import * as Effect from "effect/Effect";

// Keep the guest lifetime scoped to one invocation, including interruptions.
export function scopedJob<A, B, E, E2, E3, R, R2, R3>(
  acquire: Effect.Effect<A, E, R>,
  use: (guest: A) => Effect.Effect<B, E2, R2>,
  close: (guest: A) => Effect.Effect<void, E3, R3>,
) {
  return Effect.scoped(Effect.acquireRelease(
    acquire,
    guest => close(guest).pipe(Effect.tapError(Effect.logError), Effect.ignore),
  ).pipe(Effect.flatMap(use)));
}
