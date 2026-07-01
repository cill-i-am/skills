# Code Samples

Use these samples as compact starting points. Verify exact provider props against the live docs or installed package when editing a real repo, because Alchemy v2 is still moving quickly.

## Contents

- Minimal Cloudflare stack
- Resource modules and stable IDs
- Async Worker with typed bindings
- Effect Worker with binding layers
- Vite and StaticSite
- Neon plus Hyperdrive plus Drizzle Postgres
- PlanetScale Postgres plus Hyperdrive plus Drizzle
- PlanetScale MySQL plus Hyperdrive plus Drizzle
- Durable Object namespace
- Queue producer and consumer
- Outputs and Actions
- GitHub comments, secrets, variables, and events
- Monorepo single-stack and multi-stack
- Vitest integration test
- GitHub Actions preview deploy

## Minimal Cloudflare Stack

```ts
// alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2Bucket("Bucket");

    return {
      bucketName: bucket.bucketName,
    };
  }),
);
```

## Resource Modules And Stable IDs

Keep logical IDs stable, and export resources from modules when the app grows.

```ts
// src/storage.ts
import * as Cloudflare from "alchemy/Cloudflare";

export const Uploads = Cloudflare.R2Bucket("Uploads");
export const Cache = Cloudflare.KVNamespace("Cache");
```

```ts
// alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Cache, Uploads } from "./src/storage.ts";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const uploads = yield* Uploads;
    const cache = yield* Cache;

    return {
      uploadsBucket: uploads.bucketName,
      cacheNamespaceId: cache.namespaceId,
    };
  }),
);
```

## Async Worker With Typed Bindings

Use this when the Worker is plain async JavaScript/TypeScript and should receive native `env` bindings.

```ts
// alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { Config } from "effect";
import * as Effect from "effect/Effect";
import type { Counter as CounterClass } from "./src/worker.ts";

export const Bucket = Cloudflare.R2Bucket("Bucket");
export const Queue = Cloudflare.Queue("Queue");
export const Counter = Cloudflare.DurableObjectNamespace<CounterClass>(
  "Counter",
  { className: "Counter" },
);

export const Worker = Cloudflare.Worker("Worker", {
  main: "./src/worker.ts",
  assets: { directory: "./public" },
  env: {
    API_KEY: Config.redacted("API_KEY"),
    Bucket,
    Queue,
    Counter,
  },
});

export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;

export default Alchemy.Stack(
  "AsyncWorkerApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const queue = yield* Queue;
    const worker = yield* Worker;

    yield* Cloudflare.QueueConsumer("QueueConsumer", {
      queueId: queue.queueId,
      scriptName: worker.workerName,
      settings: {
        batchSize: 10,
        maxRetries: 3,
        maxWaitTimeMs: 5000,
      },
    });

    return { url: worker.url.as<string>() };
  }),
);
```

```ts
// src/worker.ts
import type { WorkerEnv } from "../alchemy.run.ts";

interface QueueMessage {
  id: string;
  text: string;
}

export class Counter {
  constructor(
    private state: DurableObjectState,
    private env: WorkerEnv,
  ) {}

  async fetch() {
    const current = ((await this.state.storage.get<number>("count")) ?? 0) + 1;
    await this.state.storage.put("count", current);
    return Response.json({ count: current });
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const body: QueueMessage = {
        id: crypto.randomUUID(),
        text: await request.text(),
      };
      await env.Queue.send(body);
      return Response.json({ sent: body }, { status: 202 });
    }

    await env.Bucket.put("health.json", JSON.stringify({ ok: true }));
    return Response.json({ ok: true });
  },

  async queue(batch, env) {
    for (const message of batch.messages) {
      const body = message.body as QueueMessage;
      await env.Bucket.put(`queue/${body.id}.json`, JSON.stringify(body));
    }
  },
} satisfies ExportedHandler<WorkerEnv, QueueMessage>;
```

## Effect Worker With Binding Layers

Use this when the Worker code itself is an Effect program.

```ts
// src/Api.ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { Bucket } from "./storage.ts";

export default class Api extends Cloudflare.Worker<Api>()(
  "Api",
  {
    main: import.meta.filename,
    observability: { enabled: true },
  },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.ReadWriteBucket(Bucket);

    return {
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;

        if (request.method === "PUT") {
          yield* bucket.put("payload.txt", request.stream, {
            contentLength: Number(request.headers["content-length"] ?? 0),
          });
          return HttpServerResponse.empty({ status: 201 });
        }

        const object = yield* bucket.get("payload.txt");
        if (!object) {
          return HttpServerResponse.empty({ status: 404 });
        }

        const text = yield* object.text();
        return HttpServerResponse.text(text);
      }),
    };
  }).pipe(Effect.provide(Cloudflare.R2.ReadWriteBucketBinding)),
) {}
```

```ts
// alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import Api from "./src/Api.ts";

export default Alchemy.Stack(
  "EffectWorkerApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const api = yield* Api;
    return { url: api.url.as<string>() };
  }),
);
```

## Vite And StaticSite

```ts
// Vite framework app
const web = yield* Cloudflare.Vite("Web", {
  compatibility: {
    flags: ["nodejs_compat"],
  },
  memo: {},
});

return { url: web.url };
```

```ts
// Arbitrary static build command
const site = yield* Cloudflare.StaticSite("Docs", {
  command: "zola build",
  dev: {
    command: "zola serve",
  },
  outdir: "public",
  assets: {
    notFoundHandling: "404-page",
  },
});

return { url: site.url };
```

## Neon Plus Hyperdrive Plus Drizzle Postgres

Use this as the default development Postgres pattern: one shared Neon project, with per-stage branches and Hyperdrive in front.

```ts
// alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle";
import * as Neon from "alchemy/Neon";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import Api from "./src/Api.ts";
import { Hyperdrive, NeonDb } from "./src/Db.ts";

export default Alchemy.Stack(
  "CloudflareNeonDrizzle",
  {
    providers: Layer.mergeAll(
      Cloudflare.providers(),
      Drizzle.providers(),
      Neon.providers(),
    ),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const { branch } = yield* NeonDb;
    const hd = yield* Hyperdrive;
    const api = yield* Api;

    return {
      url: api.url.as<string>(),
      branchId: branch.branchId,
      hyperdriveId: hd.hyperdriveId,
    };
  }),
);
```

```ts
// src/Db.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle";
import * as Neon from "alchemy/Neon";
import * as Effect from "effect/Effect";

export const NeonDb = Effect.gen(function* () {
  const { stage } = yield* Alchemy.Stack;

  const schema = yield* Drizzle.Schema("app-schema", {
    schema: "./src/schema.ts",
    out: "./migrations",
  });

  const project = stage.startsWith("pr-")
    ? yield* Neon.Project.ref("app-db", { stage: "dev_shared" })
    : yield* Neon.Project("app-db", {
        region: "aws-us-east-1",
      });

  const branch = yield* Neon.Branch("app-branch", {
    project,
    migrationsDir: schema.out,
  });

  return { project, branch, schema };
});

export const Hyperdrive = Effect.gen(function* () {
  const { branch } = yield* NeonDb;
  return yield* Cloudflare.Hyperdrive("app-hyperdrive", {
    origin: branch.origin,
  });
});
```

```ts
// src/Api.ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle";
import { eq } from "drizzle-orm";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { Hyperdrive } from "./Db.ts";
import { relations, Users } from "./schema.ts";

export default class Api extends Cloudflare.Worker<Api>()(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const conn = yield* Cloudflare.Hyperdrive.bind(Hyperdrive);
    const db = yield* Drizzle.postgres(conn.connectionString, { relations });

    return {
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;

        if (request.method === "POST") {
          const [user] = yield* db
            .insert(Users)
            .values({ name: crypto.randomUUID(), email: crypto.randomUUID() })
            .returning();
          return yield* HttpServerResponse.json({ user });
        }

        const id = Number(request.url.split("/").pop());
        if (request.method === "GET" && Number.isFinite(id)) {
          const user = yield* db.query.Users.findFirst({
            where: { id },
            with: { posts: true },
          });
          return yield* HttpServerResponse.json({ user });
        }

        const users = yield* db.select().from(Users);
        return yield* HttpServerResponse.json({ users });
      }),
    };
  }).pipe(Effect.provide(Layer.mergeAll(Cloudflare.HyperdriveBindingLive))),
) {}
```

## PlanetScale Postgres Plus Hyperdrive Plus Drizzle

```ts
// src/Db.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle";
import * as Planetscale from "alchemy/Planetscale";
import * as Effect from "effect/Effect";

export const PlanetscaleDb = Effect.gen(function* () {
  const { stage } = yield* Alchemy.Stack;

  const schema = yield* Drizzle.Schema("app-schema", {
    schema: "./src/schema.ts",
    out: "./migrations",
  });

  const database = stage.startsWith("pr-")
    ? yield* Planetscale.PostgresDatabase.ref("app-db", {
        stage: "dev_shared",
      })
    : yield* Planetscale.PostgresDatabase("app-db", {
        region: { slug: "us-east" },
        clusterSize: "PS_10",
      });

  const branch = yield* Planetscale.PostgresBranch("app-branch", {
    database,
    migrationsDir: schema.out,
  });

  const role = yield* Planetscale.PostgresRole("app-role", {
    database,
    branch,
    inheritedRoles: ["postgres"],
  });

  return { database, branch, role, schema };
});

export const Hyperdrive = Effect.gen(function* () {
  const { role } = yield* PlanetscaleDb;
  return yield* Cloudflare.Hyperdrive("app-hyperdrive", {
    origin: role.origin,
    caching: { disabled: true },
  });
});
```

```ts
// alchemy.run.ts provider set
providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Planetscale.providers(),
)
```

Use the same `Drizzle.postgres(conn.connectionString, { relations })` Worker pattern shown in the Neon sample.

## PlanetScale MySQL Plus Hyperdrive Plus Drizzle

For PlanetScale MySQL, generate migrations with `drizzle-kit` and check them in, then let the branch apply `migrationsDir`.

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "mysql",
});
```

```ts
// src/Db.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Planetscale from "alchemy/Planetscale";
import * as Effect from "effect/Effect";

export const PlanetscaleDb = Effect.gen(function* () {
  const { stage } = yield* Alchemy.Stack;

  const database = stage.startsWith("pr-")
    ? yield* Planetscale.MySQLDatabase.ref("app-db", {
        stage: "dev_shared",
      })
    : yield* Planetscale.MySQLDatabase("app-db", {
        region: { slug: "us-east" },
        clusterSize: "PS_10",
      });

  const branch = yield* Planetscale.MySQLBranch("app-branch", {
    database,
    isProduction: false,
    migrationsDir: "./migrations",
  });

  const password = yield* Planetscale.MySQLPassword("app-password", {
    database,
    branch,
    role: "readwriter",
  });

  return { database, branch, password };
});

export const Hyperdrive = Effect.gen(function* () {
  const { password } = yield* PlanetscaleDb;
  return yield* Cloudflare.Hyperdrive("app-hyperdrive", {
    origin: password.origin,
    caching: { disabled: true },
  });
});
```

```ts
// src/Api.ts
import * as Cloudflare from "alchemy/Cloudflare";
import { drizzle } from "drizzle-orm/mysql2";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { Hyperdrive } from "./Db.ts";
import * as schema from "./schema.ts";
import { relations, Users } from "./schema.ts";

export default class Api extends Cloudflare.Worker<Api>()(
  "Api",
  {
    main: import.meta.filename,
    compatibility: {
      flags: ["nodejs_compat"],
    },
  },
  Effect.gen(function* () {
    const conn = yield* Cloudflare.Hyperdrive.bind(Hyperdrive);

    return {
      fetch: Effect.gen(function* () {
        const connectionString = yield* conn.connectionString;
        const db = drizzle({
          connection: {
            uri: Redacted.value(connectionString),
            disableEval: true,
          },
          schema,
          relations,
          mode: "default",
        });

        const close = Effect.tryPromise({
          try: () => db.$client.end(),
          catch: (cause) => cause,
        }).pipe(Effect.catch(() => Effect.void));

        return yield* Effect.gen(function* () {
          const request = yield* HttpServerRequest;
          const users = yield* Effect.tryPromise({
            try: () => db.select().from(Users),
            catch: (cause) => cause,
          });
          return yield* HttpServerResponse.json({ users, path: request.url });
        }).pipe(Effect.ensuring(close));
      }),
    };
  }).pipe(Effect.provide(Layer.mergeAll(Cloudflare.HyperdriveBindingLive))),
) {}
```

## Durable Object Namespace

```ts
// src/Room.ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default class Room extends Cloudflare.DurableObjectNamespace<Room>()(
  "Rooms",
  Effect.gen(function* () {
    const state = yield* Cloudflare.DurableObjectState;

    return Effect.gen(function* () {
      return {
        fetch: Effect.gen(function* () {
          const [response, socket] = yield* Cloudflare.upgrade();
          socket.serializeAttachment({ id: crypto.randomUUID() });
          return response;
        }),

        alarm: () =>
          Effect.gen(function* () {
            const events = yield* Cloudflare.processScheduledEvents;
            for (const event of events) {
              yield* Effect.log(`scheduled event: ${event.id}`);
            }
          }),

        webSocketMessage: Effect.fnUntraced(function* (
          socket: Cloudflare.DurableWebSocket,
          message: string | ArrayBuffer,
        ) {
          yield* socket.send(
            typeof message === "string"
              ? message
              : new TextDecoder().decode(message),
          );
        }),
      };
    });
  }),
) {}
```

```ts
// in an Effect Worker init
const rooms = yield* Room;
const room = rooms.getByName("default");
return yield* room.fetch(request);
```

## Queue Producer And Consumer

Effect-style producer and subscriber:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Bucket } from "./storage.ts";

interface QueueMessage {
  id: string;
  text: string;
}

export const Queue = Cloudflare.Queue("Queue");

export const QueueConsumer = Effect.gen(function* () {
  const queue = yield* Queue;
  const bucket = yield* Cloudflare.R2.ReadWriteBucket(Bucket);

  yield* Cloudflare.messages<QueueMessage>(queue).subscribe((stream) =>
    Stream.runForEach(stream, (message) =>
      bucket
        .put(`queue/${message.body.id}.json`, JSON.stringify(message.body), {
          httpMetadata: { contentType: "application/json" },
        })
        .pipe(Effect.asVoid),
    ),
  );
}).pipe(Effect.provide(Cloudflare.R2.ReadWriteBucketBinding));
```

Native async Worker consumer:

```ts
yield* Cloudflare.QueueConsumer("QueueConsumer", {
  queueId: queue.queueId,
  scriptName: worker.workerName,
  settings: {
    batchSize: 10,
    maxRetries: 3,
    maxWaitTimeMs: 5000,
  },
});
```

```ts
export default {
  async queue(batch, env) {
    for (const message of batch.messages) {
      await env.Bucket.put(
        `queue/${message.body.id}.json`,
        JSON.stringify(message.body),
      );
    }
  },
} satisfies ExportedHandler<WorkerEnv, QueueMessage>;
```

## Outputs And Actions

Use `Output` helpers instead of forcing values early.

```ts
import * as Alchemy from "alchemy";
import * as Output from "alchemy/Output";
import * as Effect from "effect/Effect";

const AnnounceDeploy = Alchemy.Action(
  "AnnounceDeploy",
  (input: { url: string; bucket: string }) =>
    Effect.gen(function* () {
      yield* Effect.log(`deployed ${input.url}`);
      return { message: `deployed ${input.bucket}` };
    }),
);

const api = yield* Api;
const bucket = yield* Bucket;

const assetUrl = Output.interpolate`${api.url}/assets/${bucket.bucketName}`;
const announcement = yield* AnnounceDeploy({
  url: api.url.as<string>(),
  bucket: bucket.bucketName,
});

return {
  url: api.url.as<string>(),
  assetUrl,
  message: announcement.message,
};
```

## GitHub Comments, Secrets, Variables, And Events

For full guidance, load `references/github.md`.

Provider layer:

```ts
import * as GitHub from "alchemy/GitHub";
import * as Layer from "effect/Layer";

providers: Layer.mergeAll(
  Cloudflare.providers(),
  GitHub.providers(),
)
```

PR preview comment:

```ts
import * as GitHub from "alchemy/GitHub";
import * as Output from "alchemy/Output";

if (process.env.PULL_REQUEST) {
  yield* GitHub.Comment("preview-comment", {
    owner: "your-org",
    repository: "your-repo",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: Output.interpolate`
Preview: ${web.url}

Commit: ${process.env.GITHUB_SHA?.slice(0, 7)}
`,
  });
}
```

Credentials-as-code stack:

```ts
// stacks/github.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as GitHub from "alchemy/GitHub";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

export default Alchemy.Stack(
  "github",
  {
    providers: Layer.mergeAll(
      Cloudflare.providers(),
      GitHub.providers(),
    ),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const accountId = yield* Config.string("CLOUDFLARE_ACCOUNT_ID");
    const token = yield* Cloudflare.AccountApiToken("CIToken", {
      accountId,
      policies: [
        {
          effect: "allow",
          permissionGroups: [
            "Workers Scripts Write",
            "Workers KV Storage Write",
            "Workers R2 Storage Write",
            "D1 Write",
            "Queues Write",
            "Pages Write",
            "Account Settings Write",
            "Secrets Store Write",
            "Workers Tail Read",
          ],
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: "*",
          },
        },
      ],
    });

    yield* GitHub.Secret("cf-api-token", {
      owner: "your-org",
      repository: "your-repo",
      name: "CLOUDFLARE_API_TOKEN",
      value: token.value,
    });

    yield* GitHub.Secret("cf-account-id", {
      owner: "your-org",
      repository: "your-repo",
      name: "CLOUDFLARE_ACCOUNT_ID",
      value: Redacted.make(accountId),
    });
  }),
);
```

GitHub repository event Worker:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as GitHub from "alchemy/GitHub";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

export default class GitHubEvents extends Cloudflare.Worker<GitHubEvents>()(
  "GitHubEvents",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const secret = yield* Config.redacted("GITHUB_WEBHOOK_SECRET");

    yield* GitHub.events({
      owner: "your-org",
      repository: "your-repo",
      events: ["push", "pull_request"],
      secret,
    }).subscribe((event) =>
      Effect.log(`received ${event.name} delivery ${event.id}`),
    );

    return {
      fetch: Effect.succeed(HttpServerResponse.text("ok")),
    };
  }).pipe(
    Effect.provide(
      Layer.mergeAll(Cloudflare.GitHubRepositoryEventSourceLive),
    ),
  ),
) {}
```

## Monorepo Single-Stack And Multi-Stack

For complete rules and package layout guidance, read `references/monorepos.md`. Keep these snippets as the shortest useful patterns.

Single root stack:

```ts
// alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Path } from "effect/Path";
import Api from "./apps/api/src/Service.ts";

export default Alchemy.Stack(
  "App",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const api = yield* Api;
    const path = yield* Path;

    const web = yield* Cloudflare.Vite("Web", {
      rootDir: path.resolve(import.meta.dirname, "apps/web"),
      env: {
        VITE_API_URL: api.url.as<string>(),
      },
    });

    return {
      apiUrl: api.url.as<string>(),
      webUrl: web.url.as<string>(),
    };
  }),
);
```

Typed backend handle for multi-stack:

```ts
// apps/api/src/Stack.ts
import * as Alchemy from "alchemy";

export class Backend extends Alchemy.Stack<
  Backend,
  {
    url: string;
  }
>()("Backend") {}
```

Frontend stack reference:

```ts
// apps/web/alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { Backend } from "@acme/api";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "Frontend",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const backend = yield* Backend;

    const web = yield* Cloudflare.Vite("Web", {
      env: {
        VITE_API_URL: backend.url,
      },
    });

    return {
      url: web.url.as<string>(),
    };
  }),
);
```

Package-level commands:

```sh
pnpm --filter @acme/api exec alchemy deploy --stage pr-147
pnpm --filter @acme/web exec alchemy deploy --stage pr-147
pnpm --filter @acme/web exec alchemy destroy --stage pr-147
pnpm --filter @acme/api exec alchemy destroy --stage pr-147
```

## Vitest Integration Test

```ts
// test/integ.test.ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Test from "alchemy/Test/Vitest";
import * as Effect from "effect/Effect";
import { expect } from "vitest";
import Stack from "../alchemy.run.ts";

const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
  providers: Cloudflare.providers(),
  state: Cloudflare.state(),
  stage: "test",
});

const stack = beforeAll(deploy(Stack), { timeout: 600_000 });

afterAll.skipIf(!!process.env.NO_DESTROY)(destroy(Stack), {
  timeout: 600_000,
});

test(
  "deploys and serves",
  Effect.gen(function* () {
    const { url } = yield* stack;
    const response = yield* Effect.tryPromise({
      try: () => fetch(url),
      catch: (cause) =>
        cause instanceof Error ? cause : new Error(String(cause)),
    });

    expect(response.status).toBe(200);
  }),
  { timeout: 120_000 },
);
```

## GitHub Actions Preview Deploy

```yaml
name: Deploy Application

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, reopened, synchronize, closed]

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false

env:
  STAGE: ${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.number) || (github.ref == 'refs/heads/main' && 'prod' || github.ref_name) }}

jobs:
  deploy:
    if: ${{ github.event.action != 'closed' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
          run_install: false
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Deploy
        run: pnpm exec alchemy deploy --stage ${{ env.STAGE }}
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          PULL_REQUEST: ${{ github.event.number }}
          GITHUB_SHA: ${{ github.sha }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  cleanup:
    if: ${{ github.event_name == 'pull_request' && github.event.action == 'closed' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
          run_install: false
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Safety Check
        run: |
          if [ "${{ env.STAGE }}" = "prod" ]; then
            echo "ERROR: refusing to destroy prod"
            exit 1
          fi
      - name: Destroy Preview Environment
        run: pnpm exec alchemy destroy --stage ${{ env.STAGE }}
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          PULL_REQUEST: ${{ github.event.number }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Optional preview comment in the stack:

```ts
import * as GitHub from "alchemy/GitHub";
import * as Output from "alchemy/Output";

if (process.env.PULL_REQUEST) {
  yield* GitHub.Comment("preview-comment", {
    owner: "your-org",
    repository: "your-repo",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: Output.interpolate`
Preview: ${api.url}

Commit: ${process.env.GITHUB_SHA?.slice(0, 7)}
`,
  });
}
```

Add `GitHub.providers()` to the stack provider layer when using GitHub resources.
