# RPC, sockets, networking, and transport boundaries

## Choose the protocol deliberately

Use HttpApi for a broadly consumable HTTP contract with explicit routes and status semantics. Use Effect RPC for schema-defined operations shared between compatible clients and servers, including supported streaming transports. Use a socket directly when the application needs its own lower-level protocol and is prepared to own framing, reconnect, backpressure, and compatibility.

A minimal RPC contract is independent from the transport:

```ts
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
```

`operationId` is only a contract field. The server must enforce its deduplication semantics. A field named “idempotency key” does not make an increment replay-safe.

## Compose an RPC service

Group RPC definitions with the installed `RpcGroup` API, implement the group's handlers, and supply the appropriate `RpcServer`, protocol, serialization, and transport Layers. Generate clients from the same group. Inspect matching upstream examples before writing overload-heavy client/server assembly; do not borrow a transport signature from another release.

Declare safe error schemas. Choose serialization that represents the contract's values without silently losing dates, brands, binary data, or tagged failures. Keep transport-specific decoding failures distinguishable from declared business errors. Do not serialize arbitrary exceptions with internal state.

`RpcMiddleware` can carry authenticated context and enforce an operation boundary. Authorize every operation server-side. For long-lived connections, decide how expiry, credential rotation, revocation, and changed permissions affect already-open sessions.

## Connection and message lifecycle

Set limits for frame size, message size, outstanding requests, subscriptions, connection counts, idle time, and buffered bytes. Identify the owner of heartbeat, reconnect, receive loop, and pending requests. Closing a socket should terminate or resolve waiters rather than leaving fibers blocked forever.

Connection loss after sending a mutation is an ambiguous outcome: the server may have completed it. Automatic reconnect and retry can duplicate work. Use operation IDs, durable result lookup, or another application-level protocol to resolve ambiguity.

Streaming RPCs need a policy for consumer cancellation, slow consumers, and resumption. Backpressure on one subscription should not accidentally block every other subscription unless that is the deliberate protocol design. Make sequence numbers and replay checkpoints part of the contract when required.

## Workers and in-memory testing

`RpcWorker` and worker-related modules can provide a typed boundary to another execution context. They still require serialization and resource ownership. Transferable values can change who owns a buffer; treat that as part of the protocol rather than a free performance optimization.

Use `RpcTest` for handler contract tests, then test the selected HTTP/socket/worker transport for framing, cancellation, disconnect, malformed messages, unauthorized access, and version mismatch. Test both directions of streaming and failures after some output has already been delivered.

**Do** keep the contract separate from network bootstrap. **Don't** equate a TypeScript type with trust in incoming bytes.

**Do** bound outstanding work and reconnect attempts. **Don't** replay a state-changing call merely because its response was lost.

**Do** use `net` address/network helpers when the application genuinely manipulates IP addresses or subnets. **Don't** implement network access control with casual string-prefix tests.

## Official sources

- [RPC definitions in official entity example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/80_cluster/10_entities.ts)
- [Rpc](https://effect.website/docs/v4/api/effect/rpc/Rpc)
- [RpcGroup](https://effect.website/docs/v4/api/effect/rpc/RpcGroup)
- [RpcServer](https://effect.website/docs/v4/api/effect/rpc/RpcServer)
- [RpcTest](https://effect.website/docs/v4/api/effect/rpc/RpcTest)
- [Socket](https://effect.website/docs/v4/api/effect/socket/Socket)
- [IpNetwork](https://effect.website/docs/v4/api/effect/net/IpNetwork)
