# Example catalogue and usage

## Evidence and scope

Both example workspaces ship frozen pnpm lockfiles. Run the typecheck in each workspace. The R2 and D1 fixtures have explicit local-mode HTTP tests. The AWS example compiles against beta.87; a live invocation needs its own target and credentials. See [release evidence](../evals/validation.md).

## Complete small application examples

| Application | Entry point | Supporting files | Scope |
|---|---|---|---|
| Bucket-only stack | [first stack](../assets/examples/first-stack/alchemy.run.ts) | Shared example package/tsconfig | A small infrastructure graph; deployment is a cloud mutation. |
| Cloudflare R2 API | [stack](../assets/examples/cloudflare-r2/alchemy.run.ts) | [Worker](../assets/examples/cloudflare-r2/src/Api.ts), [bucket](../assets/examples/cloudflare-r2/src/Bucket.ts), [test](../assets/examples/cloudflare-r2/test/app.test.ts), [.env example](../assets/examples/cloudflare-r2/.env.example) | Authenticated small-text put/get, health, missing-key handling, local integration-test source. |
| Cloudflare D1 API | [stack](../assets/examples/cloudflare-d1/alchemy.run.ts) | [Worker](../assets/examples/cloudflare-d1/src/Api.ts), [database](../assets/examples/cloudflare-d1/src/Database.ts), [migration](../assets/examples/cloudflare-d1/migrations/0001_notes.sql) | Public read-only tutorial fixture with committed SQL; not an authenticated user-data API. |
| AWS Lambda/S3 API | [stack](../assets/examples/aws-lambda/alchemy.run.ts) | [Lambda](../assets/examples/aws-lambda/src/Api.ts), [.env example](../assets/examples/aws-lambda/.env.example) | Small authenticated write/streaming-read example with explicit S3 capability Layers. |

## Composition fragments and scaffolds

| Fragment | Files | What remains application-specific |
|---|---|---|
| Durable Object | [Counter.ts](../assets/examples/durable-object/Counter.ts) | Host Worker, stack, authorization, and a transaction-safe mutation API. |
| Workflow | [Welcome.ts](../assets/examples/workflow/Welcome.ts), [Api.ts](../assets/examples/workflow/Api.ts) | Stack, authentication/rate limiting, input policy, and meaningful business tasks. |
| Queue processing | [consumer](../assets/examples/queue/Consumer.ts), [producer](../assets/examples/queue/Producer.ts) | Stack, authenticated ingress, dead-letter configuration, conflicting-operation policy. |
| HTTP contract | [NotesApi.ts](../assets/examples/http-contract/NotesApi.ts) | Domain persistence, authorization, host-specific platform Layers, client. |
| Vite Website | [Website.ts](../assets/examples/vite/Website.ts) | Existing framework project, build root, runtime/public config, stack. |
| GitHub preview comment | [PreviewComment.ts](../assets/examples/github/PreviewComment.ts) | GitHub provider/permissions and the actual non-secret preview URL. |
| Custom provider | [Widget.ts](../assets/examples/custom-provider/Widget.ts) | In-memory lifecycle with a [provider test](../assets/examples/custom-provider/Widget.test.ts). Supply durable storage or a real API client, credentials, ownership checks and pagination for a hosted implementation. |

Additional GCP, Kubernetes, Docker, SQL, Outputs, and API snippets are embedded in their task references. They are explanatory composition examples unless stated otherwise.

## Try the local R2 example

Review [package.json](../assets/examples/package.json) and [tsconfig.json](../assets/examples/tsconfig.json), then copy the examples into a disposable working directory. Resolve/install the declared dependencies locally, inspect the resulting peer constraints, and commit a real lockfile for continued use. This installation step was not performed when the package was built.

From the examples directory:

```sh
pnpm install
pnpm run typecheck
# Requires Bun and a working supported local Cloudflare provider toolchain:
pnpm run test:local
```

The supplied integration test explicitly uses `dev: true`, a process-specific test stage, and local non-secret credentials. It still starts real local runtime processes. Inspect environment overrides such as `ALCHEMY_TEST_DEV` and any modifications introducing `remote()` resources before running it. It is not the same as the package's offline helper tests, which were actually executed during creation.

For interactive development, change into the chosen app directory before running its CLI, so migration/build paths resolve correctly. For a live deployment, set a real API secret, select an authorized account/profile/stage, review the plan, and change the local state backend to an appropriate shared backend before continuing deployments from CI.

## Limits to preserve when adapting

The text APIs buffer a small body before their example size check; enforce a pre-buffering/ingress limit for arbitrary production input. The static bearer token is a narrow demo mechanism, not a full multi-user identity or tenant system. D1 fixture data is intentionally non-sensitive. The Workflow and queue fragments do not expose an unauthenticated general-purpose job runner.

Do not copy `--yes` or live-test defaults into an unreviewed script. Read [testing](testing.md), [CI/CD](ci-cd.md), and [production review](production-review.md) for the actual deployment requirements.

## Drizzle-first monorepo revision

The [independent Drizzle workspace](../assets/examples/drizzle-monorepo/README.md)
adds D1 and Neon/Postgres implementation Layers, shared contracts, a small HTTP
service and Vite health client, package exports, generation configs, and a
root-command migration-input guard. Install/typecheck inside that workspace,
not the parent example package. It includes reviewed SQLite and Postgres migration inputs and Drizzle snapshots. See [revision evidence](../evals/drizzle-monorepo-validation.md).

[Cloud Run to SQS](../assets/examples/cloud-run-sqs/Service.ts) compiles the workload-identity binding. [E2B job](../assets/examples/e2b-job/Job.ts) creates a scoped guest with cleanup and a bounded provider timeout. Both are composition fragments. [State migration rehearsal](../scripts/test-state-migration.py) drives the actual tagged AWS state stores against a fresh local emulator.
