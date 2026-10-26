# Docker, Kubernetes, images, and build tools

## Keep image building and deployment ownership distinct

The Docker provider uses the active Docker CLI context. That may be Docker Desktop, a remote daemon, or an SSH context; “Docker” does not prove the target is local. Inspect the active context before creating or deleting resources. A local Docker container and a Cloudflare Container are different resource types.

Images are the handoff to cloud container platforms. Keep build context small, exclude credentials and local state with `.dockerignore`, pin base images, and avoid secrets in build arguments or layers. Use a proper build-secret mechanism where needed. A successful image build says nothing about runtime readiness or network exposure.

## Docker resources

```ts
const image = yield* Docker.RemoteImage("WebImage", {
  name: "nginx", tag: "alpine", alwaysPull: false,
});
const network = yield* Docker.Network("AppNetwork");
const web = yield* Docker.Container("Web", {
  image,
  ports: [{ external: 18080, internal: 80 }],
  networks: [{ name: network.name, aliases: ["web"] }],
  start: true,
});
```

This is a composition excerpt using a moving illustrative tag. Pin an approved digest/version for reproducible use and check which interface the port binds. Use a stable managed volume for persistent local data, with an explicit deletion policy. Do not assume `alwaysPull: false` makes a registry tag globally immutable.

The documented `Docker.Image` build diff can run `docker build` during planning, then compare image identity. A plan can therefore execute build instructions and contact registries. Inspect the Dockerfile and source trust before running it with credentials available.

Many Docker Network/Volume/Container changes are delete-first replacements. Review downtime and volume/data implications. An unowned same-name resource should not be silently adopted; confirm ownership before `--adopt`.

## Kubernetes clusters and workloads

`Kubernetes.LocalCluster` creates a kind cluster with a registry in Docker. `KubeConfig` or a Connection targets an existing cluster. Every workload's cluster selection is a consequential target, not an incidental config value.

```ts
const cluster = yield* Kubernetes.LocalCluster("Cluster", { name: "alchemy-demo" });
const web = yield* Kubernetes.Deployment("Web", {
  cluster,
  name: "web",
  image: "ghcr.io/stefanprodan/podinfo:6.15.0",
  port: 9898,
  replicas: 2,
  serviceType: "ClusterIP",
});
```

Use a Deployment for a maintained service, a Job for run-to-completion work, and the documented schedule option for CronJobs. A workload selects exactly one of an existing image, Dockerfile context, or bundled Effect entrypoint. Registry access and runtime identity are separate concerns.

Alchemy manages objects through server-side apply. Do not let an unrelated GitOps controller and Alchemy both claim the same fields without an explicit ownership design. Review pruning and deletion before removing a manifest from a managed set. A namespace deletion can cascade far beyond one app resource.

## Manifests and Helm

Use a Manifest for a Namespace, ConfigMap, StatefulSet, Ingress, or custom resource not represented by a higher-level workload. Use HelmChart for a chart whose rendered objects Alchemy should own. Confirm CRDs/controllers exist before dependent custom resources and understand chart hooks versus the integration's supported behaviour.

Pin chart versions and verify values for secrets, privileges, networking, and persistence. Do not set privileged containers, host mounts, or cluster-admin merely to make a sample work. Check deletion ordering for CRDs, finalizers, and persistent volume claims.

## Commands and memoization

Prefer existing build/resource integrations over a shell command wrapped as generic infrastructure. When a Command/Action is justified, identify its inputs, outputs, working directory, environment, rerun conditions, and cleanup. Do not embed user input in shell strings. A cached command result is valid only for the inputs included in its cache key.

## Verification

Check image architecture, startup/readiness probes, port reachability, graceful termination, logs, secret handling, and persistent data across replacement. A ready Deployment requires more than a successful server-side apply. Test local cluster cleanup without changing a remote kubeconfig context or deleting shared namespaces.

## Sources

- [docker](https://alchemy.run/docker/)
- [docker/setup](https://alchemy.run/docker/setup/)
- [docker/build-and-push](https://alchemy.run/docker/build-and-push/)
- [docker/local-services](https://alchemy.run/docker/local-services/)
- [kubernetes](https://alchemy.run/kubernetes/)
- [kubernetes/clusters/connecting](https://alchemy.run/kubernetes/clusters/connecting/)
- [kubernetes/workloads/object-lifecycle](https://alchemy.run/kubernetes/workloads/object-lifecycle/)
- [kubernetes/objects/helm-charts](https://alchemy.run/kubernetes/objects/helm-charts/)
- [command](https://alchemy.run/command/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
