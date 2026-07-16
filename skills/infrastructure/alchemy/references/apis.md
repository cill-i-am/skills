# APIs

Use this file before choosing how Alchemy runtimes communicate. The protocol decision follows the trust boundary, not personal preference for REST or RPC.

## Decision Table

| Situation | Default |
| --- | --- |
| Worker, Durable Object, Container, Lambda, or MicroVM calls another resource in the same controlled system | Schemaless RPC |
| Browser or external Effect/TypeScript client crosses a trust boundary | Effect RPC |
| Browser, partner, webhook, or non-Effect consumer needs ordinary HTTP semantics | Effect HTTP |
| Public API needs API keys, stages, usage plans, or AWS-native gateway controls | AWS API Gateway, often in front of Lambda |

One host can expose schemaless methods and a `fetch` handler. Keep the platform host thin; domain services and API contracts should remain host-agnostic where possible.

## Schemaless RPC

Schemaless RPC is the default for trusted internal communication. A Function or Server returns ordinary functions whose arguments and results are inferred end to end:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

export default class Accounts extends Cloudflare.Worker<Accounts>()(
  "Accounts",
  { main: import.meta.url },
  Effect.gen(function* () {
    return {
      getDisplayName: (accountId: string) =>
        Effect.succeed(`account:${accountId}`),
      fetch: Effect.succeed(HttpServerResponse.text("ok")),
    };
  }),
) {}
```

When another resource binds `Accounts`, the bound class is the typed client. No duplicated route strings or schema declarations are needed.

Rules:

- Use it only when both caller and callee are deployed and versioned together or otherwise mutually trusted.
- Return Effect or Stream values so failures, interruption, and streaming remain typed.
- Prefer branded domain identifiers internally when raw strings could be mixed up, even though wire validation is intentionally absent.
- Do not add Schema merely to recreate types already guaranteed by the bound class.

## Effect RPC

Use Effect RPC when data crosses a trust boundary and consumers are Effect/TypeScript programs.

Own the contract in a platform-neutral module:

```ts
import * as Schema from "effect/Schema";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

export const AccountId = Schema.String.pipe(Schema.brand("AccountId"));

export class Account extends Schema.Class<Account>("Account")({
  id: AccountId,
  displayName: Schema.NonEmptyString,
}) {}

export class AccountNotFound extends Schema.TaggedClass<AccountNotFound>()(
  "AccountNotFound",
  { id: AccountId },
) {}

const getAccount = Rpc.make("getAccount", {
  payload: { id: AccountId },
  success: Account,
  error: AccountNotFound,
});

export class AccountRpcs extends RpcGroup.make(getAccount) {}
```

Then:

- Implement handlers with `AccountRpcs.toLayer(...)`.
- Convert the group to an HTTP effect with `RpcServer.toHttpEffect`.
- Provide the same serialization on client and server.
- Run clients inside `Effect.scoped`.
- Use JSON for ordinary request/response and NDJSON when the API streams.

Keep schemas focused on values that cross the boundary. Do not make cloud resources, Worker classes, database clients, or provider services part of the wire contract.

## Effect HTTP

Use Effect HTTP when the boundary needs real methods, URLs, path/query parameters, headers, content types, and clients that do not run Effect.

Organize it as:

```text
src/
  domain/Account.ts       # Schema classes, branded IDs, typed API errors
  api/AccountApi.ts       # HttpApiEndpoint, group, and HttpApi declarations
  api/AccountHandlers.ts  # handler Layers
  platform/Api.ts         # Worker or Lambda host and platform Layers
  client/AccountClient.ts # optional typed Effect client
```

Rules:

- Use `HttpApiEndpoint` schemas for path/query/header/payload input and success/error output.
- Map domain errors to explicit HTTP statuses through schema annotations rather than string matching.
- Build handler Layers once during runtime initialization.
- Convert the assembled API Layer to the host's `fetch` effect.
- Generate typed Effect clients from the same `HttpApi`; keep plain HTTP usable without generated code.
- Add CORS only at the public HTTP boundary that needs it.

## Trust Boundary Rules

- Validate external input once at ingress, then use decoded domain values internally.
- Prefer `Schema.Class`, `TaggedErrorClass`/`TaggedClass`, branded IDs, unions, and structured records over raw strings and `unknown` objects.
- Do not serialize `Redacted` values, provider credentials, connection strings, or cloud resource objects.
- Keep transport errors distinct from domain errors.
- Define idempotency and authentication at mutation boundaries.
- Use platform-native bindings for internal calls where possible; use URL transports only when the topology requires them.

## Platform Routing

- Cloudflare-specific hosting and Durable Object bridges: `/cloudflare/apis/*`.
- AWS Lambda hosting, Function URLs, DynamoDB/S3 bindings, and API Gateway: `/aws/apis/*`.
- Generic schemas and modality comparison: `/apis/*`.

Always check the current platform guide because the exact host Layers and binding transports differ between Workers and Lambda.

## Verification

- Contract types compile in both server and client packages.
- Boundary schemas reject malformed payloads and preserve branded values.
- Typed errors survive a round trip.
- Client and server serialization agree.
- Internal calls use a native binding when available.
- Public HTTP tests prove method, path, status, headers, success body, and declared failures.
