# Feature Slice Architecture

Prefer feature-slice-first architecture everywhere: backend apps, frontend apps,
shared packages, integrations, platform capabilities, and generated clients.
Layers are useful inside a slice, but layer-first directory structures are not
the default.

## Contents

- Apply this file
- Vocabulary
- Core rule
- What counts as a feature
- Public API and imports
- App-local feature or package
- Dependency direction
- Backend feature shape
- Frontend feature shape
- Data flow ownership
- Database schema ownership
- Protocol contracts
- Config ownership
- Jobs, queues, workflows, and events
- Generated code
- Tests
- Boundary enforcement
- Rejected framings
- Review checklist

## Apply This File

Use this file when work touches:

- feature folder/package layout;
- public exports, package subpaths, barrels, or import boundaries;
- moving code between app-local features and workspace packages;
- cross-feature dependencies;
- API, RPC, MCP, sync, client, or schema contract placement;
- database schema ownership and migration composition;
- frontend feature organization;
- background jobs, queues, workflows, cron, or event handlers;
- generated code placement;
- feature config schemas.

## Vocabulary

**Feature Slice** - A cohesive capability with a reason to change together. A
feature can be a product domain, platform capability, integration, auth system,
sync engine, email module, billing module, or generated client.

**Public Feature API** - The explicit entrypoint or package export other slices
may import.

**Boundary Subpath** - A package export for a specific boundary such as
`./schema`, `./http`, `./rpc`, `./mcp`, or `./client`.

**Composition Layer** - App/root code that wires feature APIs, infrastructure,
protocol routers, jobs, runtime config, and provider resources together.

**Feature Package** - A workspace package that owns a feature and enforces its
public API through package exports and build checks.

## Core Rule

Organize by feature first, then by layer when useful.

Small feature:

```txt
src/features/email/
  index.ts
  domain.ts
  service.ts
  adapter.ts
```

Grown feature:

```txt
src/features/email/
  index.ts
  domain/
  application/
  infrastructure/
  interfaces/
```

Do not create empty folders just to perform architecture. Start flat, use names
that point toward the intended architecture, and split when the slice earns it.

## What Counts As A Feature

Feature names should describe concrete capabilities, not generic layers:

- product/domain: `meal-planning`, `recipes`, `projects`, `issues`;
- platform capability: `email`, `queues`, `ids`, `clock`, `testing`;
- integration: `tesco`, `stripe`, `linear`;
- cross-cutting product capability: `auth`, `sync`, `billing`.

Avoid catch-all names such as `core`, `common`, `shared`, `utils`, `helpers`,
`services`, and `data`. If a name is vague, ownership is probably vague too.

Generic cross-cutting code should also have a concrete capability name. Prefer
`packages/ids`, `packages/clock`, `packages/result`, or `packages/testing` over
`packages/shared`.

## Public API And Imports

Every feature has one ordinary public entrypoint:

```txt
src/features/tesco/index.ts
```

Other features import only from that public entrypoint or from an explicit
boundary subpath. They do not import internals by relative paths.

Prefer:

```ts
import { TescoService } from "../tesco";
```

Avoid:

```ts
import { parseTescoProduct } from "../tesco/domain/product";
```

For packages, enforce the same rule with `package.json` exports:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema.ts",
    "./http": "./src/http.ts",
    "./rpc": "./src/rpc.ts",
    "./mcp": "./src/mcp.ts",
    "./client": "./src/client.ts"
  }
}
```

Only add subpaths that exist. Do not create empty boundary files.

Public exports are contracts. Export only intentional feature APIs, public
types, schemas, clients, and boundary contracts. Internal DTOs, rows, helper
types, intermediate states, and implementation errors stay private unless
another feature or app genuinely consumes them.

Avoid uncurated barrels. `export *` is acceptable only when the file itself is
the curated public surface.

## App-Local Feature Or Package

Start app-owned features inside the app when they are used by one app and have
no independent lifecycle.

Promote a feature to a workspace package when:

- multiple apps or packages need it;
- its public API needs package-export enforcement;
- it has meaningful internal complexity;
- it benefits from isolated build/tests;
- it owns generated clients or contracts;
- it has a separate ownership or release concern.

Workspace feature packages use pnpm workspace dependencies and `tsdown` by
default. Package exports define the public surface. Internal source files are
private by default.

## Dependency Direction

Keep dependency rules simple:

- no cycles;
- import only public feature exports or explicit boundary subpaths;
- domain/application code does not depend on infrastructure;
- infrastructure implements ports/capabilities needed by domain/application;
- apps compose features, infrastructure, runtime config, and protocol routers;
- feature packages may depend on lower-level platform/capability packages;
- feature-to-feature dependencies are allowed only through explicit public
  contracts.

Use ports only when there is a real reason: external systems, provider
mechanics, cross-feature contracts, meaningful substitution, or tests through a
real seam. Do not create an interface for every function, class, or table.

## Backend Feature Shape

Backend feature internals may use domain/application/infrastructure/interfaces
when the feature is large enough.

Small backend feature:

```txt
features/projects/
  index.ts
  domain.ts
  service.ts
  persistence.ts
  http.ts
```

Grown backend feature:

```txt
features/projects/
  index.ts
  domain/
  application/
  infrastructure/
  interfaces/
```

Domain owns pure concepts, invariants, constructors, state transitions, and
domain-specific parsing. Application owns use cases, commands, queries, typed
expected failures, and ports. Infrastructure owns concrete adapters such as
Drizzle, external APIs, queues, email providers, SDKs, and filesystem/cloud
mechanics. Interfaces own HTTP/RPC/MCP/queue/cron entrypoints and projections.

This is Clean/Hexagonal/DDD taste with TypeScript pragmatism, not ceremony by
default. Do not create a use-case class, repository interface, or folder
taxonomy unless it removes real complexity.

## Frontend Feature Shape

Frontend code is also feature-slice first, but it should use frontend-native
terms when that is clearer.

```txt
features/auth/
  index.ts
  routes/
  components/
  queries/
  forms/
  schemas/
```

Do not force React/UI code into backend-ish `application` or `infrastructure`
folders unless those concerns genuinely exist. Shared contracts and domain
values used by both frontend and backend should live in feature packages or
contract packages when sharing is real.

## Data Flow Ownership

Load [`DATA_FLOW_AND_STATE.md`](DATA_FLOW_AND_STATE.md) when a feature owns
data fetching, caches, persistence, API contracts, sync, MCP resources, local
state, or frontend server state.

The feature that owns a data path owns its boundary parser, projection, cache
policy, invalidation policy, and failure states. Stack-specific skills decide
the concrete API such as Effect HttpApi, Effect RPC, TanStack Query, Drizzle,
or a sync engine.

## Database Schema Ownership

Feature-owned schema must not degrade relational modeling. Choose the correct
physical database model first, then place definitions with the feature that
owns the concept or relationship.

Example:

```txt
features/projects/schema.ts  # projects, project_labels
features/issues/schema.ts    # issues, issue_labels
features/labels/schema.ts    # labels
```

The physical model can still be fully relational:

```txt
issues.project_id -> projects.id
project_labels.project_id -> projects.id
project_labels.label_id -> labels.id
issue_labels.issue_id -> issues.id
issue_labels.label_id -> labels.id
```

Do not choose weaker modeling, such as polymorphic `target_type`/`target_id`,
merely to avoid cross-feature imports.

Database composition imports feature schema subpaths and owns migration
generation:

```txt
packages/db/src/schema.ts
  imports @app/projects/schema
  imports @app/issues/schema
  imports @app/labels/schema
```

Feature domain/application code does not import the global DB composition
package. It depends on feature services, persistence adapters, or ports.

Use DB-enforced foreign keys for core relational integrity by default. Use
application-enforced relationships only for strong reasons such as polymorphic
relations, sync/local-first constraints, event-sourced storage, external IDs,
partitioning, or provider limitations.

## Protocol Contracts

Features own their protocol contracts and handlers where practical:

```txt
features/projects/http.ts
features/projects/rpc.ts
features/projects/mcp.ts
features/projects/client.ts
```

The app-level router/server/MCP layer mounts feature interfaces and owns
transport setup, middleware, request lifecycle, and composition. It does not
own feature behavior.

Use explicit subpaths when protocol contracts are shared:

```ts
import { ProjectsHttpApi } from "@app/projects/http";
import { ProjectsClient } from "@app/projects/client";
```

Use Effect HttpApi for public-ish HTTP APIs, browser/mobile/MCP-adjacent APIs,
or APIs that may need docs, inspection, external callers, or non-TypeScript
consumers. Use Effect RPC for tightly coupled TypeScript-to-TypeScript internal
communication. Avoid hand-rolled clients when a typed contract client, official
SDK, or generated OpenAPI client exists.

Treat MCP tools and resources as protocol boundaries. They parse inputs,
authorize explicitly, call shared application services, and project explicit
MCP-safe output. They do not leak rows, rich domain objects, secrets, or raw
errors.

## Config Ownership

Features may own config schemas for their capability:

```txt
features/tesco/config.ts
features/email/config.ts
```

Runtime/app composition loads and composes feature config schemas once at
startup. Required config missing or invalid is a startup failure before serving
traffic. Optional integrations must be explicit typed states, not silent
`undefined` fallbacks.

Features receive typed config, services, or layers. They do not read raw
`process.env`, Vite env, Cloudflare bindings, provider env, or secrets directly
except in the boundary/composition module that owns config loading.

Secrets stay redacted until the adapter/driver boundary.

## Jobs, Queues, Workflows, And Events

Feature packages may define user-facing commands, background handlers, queue
ports, workflow steps, cron logic, and event handlers when they own the intent.

Provider mechanics live in infrastructure/platform adapters and app/stack
composition.

Example:

```txt
features/notifications/
  commands/cancel-notification.ts
  ports/notification-queue.ts
  jobs/send-notification.ts
```

The feature owns "cancel queued notification for this user/message id." The
Cloudflare Queue, SQS, BullMQ, or other provider adapter implements the queue
capability.

A cohesive command can coordinate multiple ports. Split into named workflows or
command modules when there is durable progress, retries, compensation, human
approval, multiple transaction boundaries, or complexity that needs its own
tests. Do not split just because two adapters are involved.

## Generated Code

Generated code lives at the nearest owning boundary:

- feature-specific generated code lives inside that feature or feature package;
- shared generated clients/contracts live in packages;
- generated migration artifacts live with the database/migration boundary;
- generated route trees live with the app/router that owns them.

Never edit generated code manually. Wrap generated clients only when the wrapper
adds real boundary policy such as parsing, auth, retries, errors,
observability, or ergonomics.

Do not create a central `generated/` dumping ground unless the generator itself
owns a shared package.

## Tests

Colocate focused tests near feature code. Use feature-level integration tests
when behavior crosses domain/service/adapter boundaries. Use app/package-level
integration tests for real runtime or protocol workflows.

Do not move ordinary feature tests into a distant global test folder unless the
test is genuinely system-level.

## Boundary Enforcement

Scale enforcement with maturity:

- convention for tiny local slices;
- `index.ts` or `public.ts` boundaries for app-local features;
- package `exports` for workspace packages;
- `tsdown` builds to prove package public surfaces;
- TypeScript project references where useful;
- focused import-boundary tests when a rule matters or gets violated.

Avoid heavyweight boundary tooling until the codebase needs it.

## Rejected Framings

- **"Feature means only product feature."** Integrations and platform
  capabilities are features too.
- **"Layer-first is cleaner."** It often scatters one capability across many
  folders. Prefer feature locality.
- **"A package export is just convenience."** It is a public contract.
- **"Schema slicing can weaken DB design."** Physical relational modeling wins;
  slice ownership follows after.
- **"Every dependency needs a port."** Ports are for real boundaries and
  substitution, not ceremony.
- **"Generic shared code is harmless."** Vague shared modules usually hide poor
  ownership.

## Review Checklist

- A feature imports another feature's internals instead of its public API.
- A package exports internal rows, DTOs, helper types, or implementation errors.
- A generic `shared`, `utils`, `core`, or `services` module gained domain code.
- A feature was promoted to a package without a public API/export reason.
- Domain/application code imports infrastructure or global DB composition.
- DB schema file placement pushed the design toward weaker constraints.
- HTTP/RPC/MCP/router code owns feature behavior instead of composing it.
- Config is read directly in feature logic instead of composed at startup.
- Generated code is edited manually or dumped in an ownerless folder.
- Tests live far away from the feature without being system-level.
