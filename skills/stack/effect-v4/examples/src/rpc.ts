// Baseline: effect@4.0.2. See ../../references/23-rpc-and-sockets.md
import { Schema } from "effect"
import { Rpc } from "effect/rpc"

export const GetCount = Rpc.make("GetCount", {
  payload: { counterId: Schema.NonEmptyString },
  success: Schema.Int
})

export const Increment = Rpc.make("Increment", {
  payload: {
    counterId: Schema.NonEmptyString,
    operationId: Schema.NonEmptyString,
    amount: Schema.Int
  },
  success: Schema.Int
})
