# Data Flow and State

Data flow needs ownership. Every value should have a clear source of truth,
boundary parser, projection owner, cache owner, invalidation path, and UI
representation. Do not let convenience fetching grow into hidden architecture.

## Contents

- Scope
- Vocabulary
- Canonical flow
- Non-negotiables
- Strong defaults
- Persistence to service
- Service to protocol
- Protocol to client
- Frontend state
- Queries
- Commands and mutations
- Runtime config and data
- Realtime and events
- Abstraction budget
- Rejected framings
- Review checklist

## Scope

Use this file when work touches:

- database rows, ORM models, repositories, migrations, or persistence reads;
- Service Modules and application use cases;
- HTTP, RPC, MCP, WebSocket, queue, or event APIs;
- typed API clients or SDKs;
- data fetching, cache keys, loaders, server functions, or query options;
- frontend server state, local state, forms, optimistic updates, or realtime
  subscriptions.

Stack-specific skills own concrete APIs. This file owns the architecture:
which boundary owns the data, when to parse, when to cache, when to retry, when
to invalidate, and when not to abstract.

Load [`FEATURE_SLICE_ARCHITECTURE.md`](FEATURE_SLICE_ARCHITECTURE.md) when the
data path crosses feature/package boundaries, introduces a public contract,
adds schema ownership, or changes import/export surfaces.

## Vocabulary

**Source of Truth** - The durable owner of a fact, usually persistence or an
external system.

**Service View** - Domain/service data after persistence rows or external data
have been parsed into meaningful values.

**Protocol View** - A serializable projection for HTTP, RPC, MCP, queues,
events, or another runtime boundary.

**Client View** - The parsed shape a frontend, mobile app, MCP client, SDK, or
other consumer receives from a protocol boundary.

**Server State** - Data owned by a server or external system and cached in a UI
or client runtime.

**Local UI State** - Ephemeral view state owned only by the current interface:
open panels, active tabs, draft input, focus, selection, sorting controls, and
other display concerns.

**Command** - A mutation request with intent, authorization context, idempotency
semantics when needed, and explicit success/failure outcomes.

**Query** - A read request with stable identity, freshness policy, and typed
success/failure outcomes.

**Feature Data Owner** - The feature or package that owns the data path's
parser, projection, cache policy, mutation invalidation, and public contract.

## Canonical Flow

The default flow is:

```txt
Source of Truth
  -> persistence/external adapter parses rows or external responses
  -> Service Module works with domain/service values
  -> protocol adapter projects serializable DTOs
  -> client boundary parses DTOs
  -> cache/query layer owns server state
  -> UI renders derived view state
```

For MCP, mobile, web, CLI, and public API clients, the protocol changes but the
ownership model does not. MCP tools and resources are protocol boundaries, not
domain modules.

Every step in the flow should have a feature owner. Shared platform features,
integrations, and generated clients can own data paths just like product
features.

## Non-negotiables

- Persistence rows and external responses are boundary input. Parse them before
  Service Modules use them.
- Protocol DTOs are not domain models and are not persistence records.
- Each data path has one source of truth and one cache owner per runtime.
- Each data path has one feature owner for its public contract and boundary
  policy.
- Reads and mutations are modeled differently. Do not hide commands behind
  generic "save" or "sync" helpers.
- Frontend server state lives in the chosen query/cache layer, not copied into
  local component state.
- Local UI state never becomes a shadow source of truth for server state.
- Required data, config, and auth context fail loudly when missing. Do not
  invent fallback data to keep the UI rendering.
- Loading, empty, anonymous/unauthorized, not found, dependency failure, and
  defect states are distinct.
- Cache invalidation belongs to the mutation boundary or the feature that owns
  the command, not scattered across unrelated components.
- Retries are deliberate and tied to idempotency. Automatic retries belong
  mostly to reads or explicitly idempotent commands.
- Do not introduce generic clients, repositories, services, event buses, or
  "data providers" until there are multiple real consumers or a real boundary
  translation.
- Feature code imports other data owners through public feature APIs or explicit
  boundary subpaths, not internals.

## Strong Defaults

- TypeScript backends use Effect for service workflows, typed failures, config,
  retries, observability, resource lifetimes, and dependency composition.
- Use Effect Schema for backend boundary parsing and frontend validation when
  practical.
- Use Zod only when a specific library integration makes it materially simpler
  or required.
- Prefer contract-shaped protocol clients over hand-written fetch wrappers
  when the stack provides them.
- Prefer stable query keys built from parsed/branded values.
- Prefer server-derived authorization/session data over client-derived claims.
- Prefer explicit projections over reusing raw rows or domain objects.
- Prefer simple direct calls until repetition proves a deeper module is needed.

## Persistence to Service

Persistence adapters translate storage mechanics into service/domain values.

They own:

- query shape;
- transaction mechanics;
- row parsing;
- persistence projection;
- database-specific error classification;
- translating storage nullability into domain optionality or variants.

Service Modules should not receive raw ORM rows, SQL result objects, or
database-client types unless the service itself is the persistence adapter.

Avoid repository-per-table symmetry. Persistence adapters should expose
behavior the service needs, not table mirrors.

Feature-owned schema should preserve the best physical database model. Put
table definitions with the owning feature, compose them at the database/migration
boundary, and keep database foreign keys for core relational integrity unless a
strong provider/sync/modeling reason prevents it.

## Service to Protocol

Protocol adapters translate service outcomes into serializable protocol views.

They own:

- request parsing;
- auth/session extraction at the protocol seam;
- protocol status codes or MCP tool errors;
- response DTO projection;
- redaction and public/private field selection;
- error translation for the protocol.

Service Modules should not know whether a caller is HTTP, RPC, MCP, mobile,
web, CLI, queue, or cron unless that distinction is part of the domain.

Do not grow separate service logic per protocol. Add a protocol adapter over
shared service behavior.

## Protocol to Client

Client code treats protocol responses as boundary input.

Parse response bodies, MCP results, server-function payloads, local storage
records, and realtime messages before using them as app values. Carry parsed
and branded values inward.

The client boundary owns:

- base URL and runtime config parsing;
- credentials/cookie policy;
- response parsing;
- transport error classification;
- retry policy for reads;
- conversion into query/cache success or failure states.

Do not scatter raw `fetch`, response parsing, credentials, retry policy, and
error mapping across components.

## Frontend State

Use the app's query/cache layer for server state.

Use local UI state only for ephemeral interface concerns:

- controlled input drafts before submission;
- open/closed disclosure;
- selected row or tab;
- local sort/filter controls;
- pending visual affordances.

Avoid:

- copying query data into `useState`;
- using `useState` for derived server data;
- storing server-derived auth/session/user/org state in component state;
- using effects to synchronize two sources of truth;
- using fallback objects to avoid handling loading/error/empty states.

Derived display values should be computed from cached server state and local UI
state, not stored as another mutable state source.

Prefer form libraries for form drafts, router/search params for URL-visible
controls, query keys for server-relevant controls, and render-time derivation
for filtering, sorting, and display values. Use `useState` only for genuinely
local ephemeral UI state. Use `useEffect` only for real external
synchronization, not to copy one React value into another.

## Queries

A query should have:

- a stable identity built from parsed inputs;
- a typed success value;
- a typed or classified failure path;
- a freshness policy;
- a retry policy appropriate to the operation;
- a clear owner for invalidation or refresh.

Query functions should be boring: call the typed client, parse or receive parsed
values, classify failures, and return data. UI components should not learn
transport details.

Do not prebuild broad query factories for hypothetical resources. Add query
helpers when at least two call sites need the same identity, freshness, or
invalidation policy.

## Commands and Mutations

Commands should have:

- parsed/branded inputs;
- explicit actor/auth context at the server boundary;
- idempotency strategy when retries or double-submit can duplicate work;
- typed expected failures;
- cache invalidation or cache update policy;
- user-visible success/failure behavior.

Mutation helpers may invalidate, refetch, or update cache entries owned by the
feature. They should not reach across unrelated features by side effect.

Optimistic updates are allowed only when:

- the command has clear rollback or reconciliation behavior;
- the optimistic value cannot leak unauthorized state;
- conflict and failure states are visible;
- the feature actually benefits from the extra complexity.

Default to post-success invalidation/refetch unless optimistic behavior is a
real product requirement.

## Runtime Config and Data

Runtime config is data crossing a boundary.

Parse it at the server/runtime boundary, expose only the public subset to
clients, and parse again when the value crosses into the client runtime.

Do not bake mutable deployment values into browser bundles when they may need
to change without rebuild. Do not hide missing required config behind disabled
buttons, placeholder URLs, or demo fallbacks.

Features may own config schemas, but runtime/app composition loads and composes
them once at startup. Required config failures fail before serving traffic.
Optional integrations must be explicit typed states, not silent `undefined`
fallbacks. Secrets stay redacted until the adapter or driver boundary.

## Realtime and Events

Events are not replacements for source-of-truth reads.

Use events, WebSockets, queues, and subscriptions to notify or incrementally
update. Preserve a way to refetch or reconcile from the source of truth.

Event payloads are protocol views. Parse them, version them when necessary, and
avoid sending rich local objects across runtime boundaries.

## Abstraction Budget

A data abstraction earns its keep when it owns policy, translation, invariants,
or multiple real consumers.

Do not add:

- generic API clients that only wrap one endpoint;
- generic repositories that mirror tables;
- cache managers before the query layer proves insufficient;
- provider-neutral interfaces before two providers exist;
- fallback adapters for runtimes the app does not use;
- layered "service" files that only forward to another module.

Prefer direct, typed, boring paths. Extract only when duplication is real and
the extracted module becomes deeper than its interface.

## Rejected Framings

- **"The UI needs its own copy."** The query/cache layer owns server state.
- **"A fallback makes it resilient."** Fallbacks often hide broken wiring and
  create false product states.
- **"The API DTO is close enough to the row."** Protocol and persistence shapes
  change for different reasons.
- **"A client wrapper is architecture."** It is architecture only if it owns
  meaningful policy or translation.
- **"We'll make it provider-neutral now."** Provider neutrality is earned by
  real second implementations or hard product requirements.
- **"Effects can sync this later."** Synchronizing duplicate state is usually
  the bug, not the fix.

## Review Checklist

- Raw database rows enter service logic.
- HTTP/RPC/MCP response payloads are cast instead of parsed.
- Query data is copied into component state.
- Required config has a UI fallback instead of a boundary failure.
- Loading, empty, unauthorized, not found, and failure states are collapsed.
- Mutations do not invalidate or update the server-state owner.
- Retried mutations can duplicate work.
- Cache keys use raw strings where branded/domain values exist.
- A generic repository/client/provider was added for one use.
- Protocol adapters duplicate service/domain policy.
- Event or realtime handlers mutate state with no reconciliation path.
