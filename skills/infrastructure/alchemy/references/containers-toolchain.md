# Containers, Kubernetes, And Commands

Use this file when infrastructure builds images, runs local services, deploys Kubernetes objects, or owns build/dev/code-generation processes.

## Choose The Surface

- `Docker`: build/push/mirror images and run local Docker containers, networks, and volumes.
- `Kubernetes`: declare resources against a configured cluster, including EKS.
- `Command`: model build outputs, one-off deploy-time commands, and local dev servers as graph resources.
- Cloud platform container resources: use when the workload is deployed directly to Cloudflare Containers, AWS ECS, or another provider rather than a generic cluster.

Do not add Kubernetes for a workload that a platform-native runtime or ECS service can own more simply.

## Docker

Register `Docker.providers()` and any providers required by generated inputs:

```ts
import * as Alchemy from "alchemy";
import * as Docker from "alchemy/Docker";
import * as Layer from "effect/Layer";

providers: Layer.merge(Docker.providers(), Alchemy.RandomProvider())
```

Primary resources:

- `Docker.Image`: build from a Dockerfile and optionally push to a registry.
- `Docker.RemoteImage`: pull, pin, and optionally mirror an existing image.
- `Docker.Container`: run a local container.
- `Docker.Network`: create deterministic local connectivity.
- `Docker.Volume`: preserve local service data.
- `Docker.inspectContainer`: inspect live port bindings and runtime details.

Example build:

```ts
const image = yield* Docker.Image("ApiImage", {
  name: "api",
  build: {
    context: ".",
    dockerfile: "Dockerfile",
    platform: "linux/amd64",
  },
});
```

Rules:

- Pin remote image digests for reproducibility.
- Include only relevant build inputs; avoid hashing the whole monorepo by default.
- Keep registry credentials in profiles/environment and redacted.
- Surface immutable image references to cloud resources.
- Use explicit volumes and networks for local dependencies.
- Treat local containers as machine mutations and clean them up according to the requested lifecycle.

## Kubernetes

Kubernetes resources currently bind to an `AWS.EKS.Cluster`. There is no standalone `Kubernetes.providers()` registration.

Prefer typed resources such as `Kubernetes.Namespace` and `Kubernetes.Job`. `Kubernetes.Object` is a lower-level shape escape hatch for the same supported kinds, not a way to deploy arbitrary CRDs or unsupported APIs:

```ts
const object = yield* Kubernetes.Object("ApiConfig", {
  cluster,
  apiVersion: "v1",
  kind: "ConfigMap",
  metadata: { name: "api-config", namespace: "app" },
  body: {
    data: { LOG_LEVEL: "info" },
  },
});
```

Objects are bindings on the EKS cluster and use server-side apply. Current support is limited to Namespace, ServiceAccount, ConfigMap, Service, Deployment, and Job, and apply does not wait for rollout readiness. Preserve stable logical IDs, explicit namespaces, field ownership, dependency order, and pruning intent. Do not pass unvalidated arbitrary manifests from external input.

For EKS:

- Establish cluster access before applying objects.
- Keep cluster creation and workload ownership boundaries explicit.
- Verify the active AWS profile, region, cluster, and Kubernetes context.
- Use `kubectl` for read-only inspection when useful, not as a competing deployment path.

## Command

`Command.Build`, `Command.Exec`, and `Command.Dev` bring process execution into the resource graph.

`Command.providers()` is already included by `Cloudflare.providers()` and `AWS.providers()`. Register it directly only in a standalone command-only stack.

```ts
import * as Command from "alchemy/Command";

const build = yield* Command.Build("WebBuild", {
  command: "pnpm build",
  cwd: "apps/web",
  outdir: "dist",
});
```

- `Command.Build`: a memoized command that must produce `outdir`.
- `Command.Exec`: memoized deploy-time side effects such as code generation or migrations.
- `Command.Dev`: a long-running process started by `alchemy dev` and omitted from deploy.

Hash inputs deliberately. A command reruns when its declared inputs or command configuration change. `Command.Build` owns its output directory; ensure destroy semantics cannot delete source or shared output.

Use `Command.Exec` for idempotent, input-keyed side effects. If the operation owns a remote lifecycle, implement a Resource instead. Database migrations need one deployment owner and an explicit failure/rollback policy.

## Compose With Cloud Resources

- Feed immutable Docker image outputs into ECS, Cloudflare Container, or Kubernetes resources.
- Feed `Command.Build` output into `Cloudflare.StaticSite`, `Cloudflare.Vite`, or AWS website resources when the higher-level provider does not already create the build resource.
- Bind runtime endpoints and credentials through Alchemy Outputs rather than shell-written `.env` files.
- Keep local dev commands stage-aware and make generated URLs explicit outputs.

## Verification

- Docker engine/context and target platform are correct.
- Images are pinned or content-addressed and registry auth is redacted.
- Builds rerun only when intended and `outdir` is safe to own.
- Exec operations are idempotent under retries.
- Dev processes terminate cleanly and expose a verified URL.
- Kubernetes object namespace, cluster, field ownership, and prune behavior are correct.
- The plan contains no accidental rebuild, replacement, or broad manifest deletion.
