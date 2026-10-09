# Colocating infrastructure with application logic

## What Alchemy encourages—and what it does not require

Alchemy's Infrastructure-as-Effects model lets an implementation Layer declare its resources, bind capabilities, and expose an application service. Providing that Layer brings the resources into the enclosing stack. The same TypeScript program describes deployment and application behavior, but the phases remain distinct.

Colocation means **owning the infrastructure near the capability that uses it**. It does not require a database table, business rule, migration executor, API handler, and secret to share one file. It does not mean provisioning a database for every HTTP request. Existing separate infrastructure modules and async handlers remain valid.

For this skill, prefer feature-local implementation Layers in new code. Use a dedicated owner for infrastructure shared by several features or with a longer lifecycle. Preserve an existing architecture unless the task includes a deliberate refactor.

## Recommended dependency direction

```text
browser / other clients ──> public contracts
HTTP or event host ──> server service contract ──> pure business rules
          │
          └─ provides implementation Layer
                   ├─ declares or references resources
                   ├─ binds the narrow supported capability
                   ├─ constructs lazy Drizzle client/services
                   └─ implements runtime methods
root stack ──> chooses providers, state, stage policy, and hosts
```

The browser must not import the host's root barrel to reach a shared type. Public transport schemas live in their own entrypoint. Server service interfaces may preserve `Alchemy.RuntimeContext` for runtime-only methods; those are not platform-independent domain contracts. Pure calculations and invariants can remain entirely free of Alchemy and Effect runtime dependencies.

## Worked feature-owned Layer

The [Notes D1 implementation](../assets/examples/drizzle-monorepo/packages/notes/src/NotesD1Live.ts) declares the database and its binding in `Layer.effect(Notes, ...)`, then returns `list` and `create` methods. The [service contract](../assets/examples/drizzle-monorepo/packages/notes/src/Notes.ts) exposes operations, not an admin client. [Title normalization](../assets/examples/drizzle-monorepo/packages/notes/src/title.ts) remains a pure function.

The host wiring is short and explicit:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import { NotesD1Live } from "@example/notes/d1";
import * as Effect from "effect/Effect";
import { makeHttp } from "./Http.ts";

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.url },
  makeHttp.pipe(Effect.provide(NotesD1Live)),
);
```

`makeHttp` yields `Notes` during construction and calls its methods inside `fetch`. Supplying `NotesD1Live` privately satisfies the D1 binding requirement; the handler does not receive database credentials. [The Postgres variant](../assets/examples/drizzle-monorepo/apps/api/src/ApiPostgres.ts) uses the same handler with a different implementation and the required compatibility flag. This demonstrates composition, **not** automatic portability of data, migrations, transactions, or provider permissions.

## Three moments to keep separate

| Moment | Appropriate work | Wrong work |
|---|---|---|
| Planning/construction | Register resources, capture configuration, request capabilities, build lazy clients and handlers | Querying customer rows, sending mail, charging a card, loading request-local identity |
| Request/event execution | Authorize, decode input, query Drizzle, map errors, return a response | Creating a new deployment graph or using cloud-admin credentials |
| Deployment/activation migration | Apply reviewed SQL through its single owner; for DOs, initialize before methods are exposed | Generating unreviewed SQL in production CI or executing a migrator on every normal request |

Construction can run during planning and again at cold start. Keep it safe for both. For DOs, capture migration files and state references in the outer Effect; perform storage initialization in the inner instance Effect. File colocation does not make a construction-time I/O operation safe.

## Shared database: one owner, many feature Layers

The sample gives Notes its own small database to show the complete mechanism. **Do not generalize that into one database per feature.** A typical product can have one application database, feature-local tables/repositories, and one migration history.

Put the shared client behind an `AppDatabase` service. For example, within a server-only database package:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle/D1";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { relations } from "./schema.ts";

const makeDatabase = Effect.gen(function* () {
  const resource = yield* Cloudflare.D1.Database("AppDatabase", {
    migrations: "./packages/database/drizzle",
  });
  const binding = yield* Cloudflare.D1.QueryDatabase(resource);
  return yield* Drizzle.D1(binding, { relations });
}).pipe(Effect.provide(Cloudflare.D1.QueryDatabaseBinding));

type Client = Effect.Success<typeof makeDatabase>;
export class AppDatabase extends Context.Service<AppDatabase, Client>()("AppDatabase") {}
export const AppDatabaseLive = Layer.effect(AppDatabase, makeDatabase);
```

This is a composition example; `schema.ts` is the shared schema aggregator. Each feature Layer yields `AppDatabase` instead of independently constructing a Drizzle client. Compose dependent feature Layers with the same database Layer:

```ts
// NotesLive and UsersLive are feature implementations requiring AppDatabase.
const FeaturesLive = Layer.mergeAll(NotesLive, UsersLive).pipe(
  Layer.provide(AppDatabaseLive),
);
```

That second block is a composition fragment, not a complete second application. Keep feature contracts narrow; do not export a generic “everything database” service to browser code. Share the Layer value/build, not a live socket across Worker requests. Layer memoization and resource identity are separate mechanisms.

Centralizing the physical database does not forbid feature-local schemas. The aggregator imports tables from owning packages without importing their Layers or stack entrypoints. Avoid a cycle in which a schema imports its repository, which imports the database service, which imports the schema again.

## Identity and lifecycle are still deployment concerns

A resource is identified by stack, stage, namespace, type, and logical ID—not simply by the filename containing its declaration. Moving a resource into a Layer should preserve all of those. Reusing a stable resource in one stack can let multiple hosts bind to it; the same Layer in a different stack/stage is not automatically a shared physical database.

Removing the last consumer can remove the resource from the desired graph. Retention, backup, data migration, and ownership transfer therefore still need explicit design. Keep long-lived data in an independently owned stack when that lifecycle genuinely differs from disposable apps. Use a reference to share ownership across stacks; do not redeclare the same physical name and hope state deduplicates it.

## How to adopt this without a rewrite

Start with one new capability or a bounded existing feature. Extract its public schema and pure rules first. Give its current storage implementation a narrow service contract. Move the existing resource declaration and binding into the implementation Layer **without renaming it or changing state ownership**. Provide the Layer at the existing host boundary, then check resource identities, bundle boundaries, and behavior.

Do not combine this with an ORM upgrade, schema migration, stack split, and authentication rewrite. If a change requires retention or cross-stack adoption, separate the lifecycle plan and verify its target before applying it. A packaging-only refactor should not produce a surprise data replacement.

## Testing implications and trade-offs

Pure rules can be tested without a runtime or cloud. A fake implementation helps test use-case behavior, but must preserve real requirements rather than casting away `RuntimeContext`. Platform-facing services and binding behavior need a correctly scoped Alchemy test host or local integration test. The new fixture currently executes only its pure title-policy tests; fake-Layer, D1, and Postgres integration proof remain on the checklist.

The benefit is less duplicated binding/configuration wiring and clearer capability ownership. The cost is that an implementation Layer is deployment-aware; dependency choices can change the infrastructure graph, and import boundaries become important. Keep this coupling explicit and local. Do not advertise cloud portability merely because the service interface can be swapped.

## Sources

- [Alchemy Layers](https://alchemy.run/infrastructure-as-effects/layers/)
- [Construction/runtime phases](https://alchemy.run/infrastructure-as-effects/phases/)
- [File layout](https://alchemy.run/project-structure/file-layout/)
- [References](https://alchemy.run/infrastructure-as-code/references/)
- [Connection lifecycle](https://alchemy.run/sql/effect-sql/lifecycle/)

Architecture recommendation researched 9 October 2026 against this skill's pinned Alchemy baseline. Defaults here are project preferences; upstream supports other layouts.
