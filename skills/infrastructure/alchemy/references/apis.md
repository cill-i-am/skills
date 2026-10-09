# API contracts, native RPC, Effect RPC, and HTTP

## Choose the boundary, then the protocol

Native schemaless RPC is a good default for trusted calls between typed Alchemy runtimes when the platform supports it. Use Effect RPC for schema-driven procedures across a trust boundary, and Effect HTTP for conventional HTTP consumers, URLs, status codes, and content types. Do not expose an internal admin capability just because its client is typed.

A schema is not authorization. Decode input, authenticate the caller, enforce tenant/resource access, execute the operation, and encode a deliberate response. Persisted or external data may need decoding even inside an otherwise trusted call chain.

## Shared HTTP schema

```ts
import * as Schema from "effect/Schema";
import * as HttpApi from "effect/http-api/HttpApi";
import * as HttpApiEndpoint from "effect/http-api/HttpApiEndpoint";
import * as HttpApiGroup from "effect/http-api/HttpApiGroup";

export class Note extends Schema.Class<Note>("Note")({
  id: Schema.String, title: Schema.String,
}) {}
export class NoteNotFound extends Schema.TaggedErrorClass<NoteNotFound>()(
  "NoteNotFound", { id: Schema.String }, { httpApiStatus: 404 },
) {}
const getNote = HttpApiEndpoint.get("getNote", "/:id", {
  params: Schema.Struct({ id: Schema.String }),
  success: Note, error: NoteNotFound,
});
export class Notes extends HttpApiGroup.make("Notes").add(getNote) {}
export class NotesApi extends HttpApi.make("NotesApi").add(Notes) {}
```

This contract module is safe to share with clients because it contains no provider credentials or deployment implementation. Refine strings, identifiers, and payload sizes for the actual domain. Use the installed Effect release's schema APIs; older beta examples can have incompatible constructors.

## Implement and host

`HttpApiBuilder.group` supplies typed handlers. `HttpApiBuilder.layer` assembles the API, and `HttpRouter.toHttpEffect` yields the fetch handler. Supply the platform-specific Layers from the Worker or Lambda guide; do not copy a placeholder `platform` variable into a supposedly complete application.

```ts
const notes = HttpApiBuilder.group(NotesApi, "Notes", (handlers) =>
  handlers.handle("getNote", ({ params }) =>
    Effect.fail(new NoteNotFound({ id: params.id })),
  ),
);
```

This deliberately non-persistent handler illustrates a typed 404. A real implementation delegates to a domain service and applies authorization before querying sensitive data. Do not call a demo's generated UUID response a completed create operation unless the item is actually persisted.

## Effect RPC

Use a shared procedure/schema module, handler Layers on the server, and a derived client. Choose the documented transport and serialization for the target runtime. Validate streaming cancellation, typed error mapping, and client/server version compatibility. Do not assume native Worker RPC and Effect RPC share the same transport or security model.

## Native service calls

Return narrow methods from an Alchemy Function/Server and obtain its typed client through the platform binding. Avoid routing internal calls over public URLs when a private capability is available. Check which values can cross the wire: closures, class identity, and process-local handles are not portable just because TypeScript accepts a structural type.

## Public API operations

For browser callers, define CORS, cookie attributes, CSRF policy where relevant, and session/token validation. For partners, define authentication, versioning, rate limits, idempotency keys, and error formats. For webhooks, verify signatures over the raw body and deduplicate deliveries before side effects.

Do not log entire payloads by default. Validate input before invoking a model, writing a file, or provisioning per-user resources. Keep errors useful without leaking stack traces, SQL, secrets, or internal resource identifiers.

## Verification

Test malformed payloads, missing/invalid authentication, cross-tenant access, not-found responses, unknown routes/methods, expected business failures, cancellation, and a client built from the shared schema. Typecheck the contract and host separately to detect server-only imports escaping into the client bundle.

## Sources

- [apis](https://alchemy.run/apis/)
- [apis/schemaless](https://alchemy.run/apis/schemaless/)
- [apis/effect-rpc](https://alchemy.run/apis/effect-rpc/)
- [apis/effect-http](https://alchemy.run/apis/effect-http/)
- [cloudflare/apis/effect-http-api](https://alchemy.run/cloudflare/apis/effect-http-api/)
- [cloudflare/apis/effect-rpc](https://alchemy.run/cloudflare/apis/effect-rpc/)
- [aws/apis/effect-http-api](https://alchemy.run/aws/apis/effect-http-api/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
