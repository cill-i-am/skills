# Cloudflare containers, AI, platforms, and advanced compute

## Containers and long-running processes

Use a Cloudflare Container when a workload needs a long-running process, native executable, or container image beyond the Worker runtime. Alchemy's integration pairs the container with a Durable Object and can build/push the image. This is not the same resource as a local `Docker.Container`.

Start from the dedicated Containers guide and a matching upstream example. Establish the image or Dockerfile, process startup, internal ports, readiness, external reachability, shutdown behaviour, and durable state ownership. Do not keep important data only on an ephemeral container filesystem. Make the Worker/DO-to-container call boundary typed and authenticated as needed.

For video extraction, document rendering, or similar jobs, combine a Queue/Workflow with a container rather than holding a public request open indefinitely. Bound input size, process runtime, concurrency, CPU/memory, and output retention. Never allow arbitrary user strings to become shell commands. Test a failed process, restart, timeout, and duplicate job.

## Browser Rendering

Use the Browser Rendering binding for browser actions or a controlled browser session when that service fits the workload. It is not a universal substitute for arbitrary native binaries in a container. Restrict navigation targets where untrusted URLs are accepted, block access to internal/metadata destinations, cap downloads and session duration, and define cookie/credential isolation.

For screenshots, PDFs, scraping, or automation, check current binding APIs and limits before authoring exact calls. Do not assume examples for a standalone Puppeteer process use the same lifecycle as a Worker browser binding. Persist only necessary output, not full sensitive browser traces by default.

## Worker Loader and Workers for Platforms

Worker Loader supports dynamic execution in ephemeral Worker isolates; Workers for Platforms provides a dispatch-namespace model for customer Workers. Select based on the product's lifecycle and tenancy. Treat code execution as a capability with an explicit resource and network budget.

Decide which bindings customer code can receive, whether outbound network is allowed, how code is validated/versioned, and how tenants are identified. Never pass a broad account credential or privileged storage binding to untrusted code. Isolate tenant namespaces and logs. A sandbox does not replace application authorization or abuse controls.

## AI capability selection

Use Workers AI for model inference through a Worker binding. Use AI Gateway when routing, observability, caching, or policy belongs at a gateway. Use Vectorize for embedding similarity search. Use AI Search for the documented managed retrieval pipeline. Use Effect AI when the application needs a provider-neutral LanguageModel/Chat abstraction.

For each route, identify the inference model, embedding model, vector dimensions, storage source, tenant filters, and credential ownership. Read current model availability, limits, and pricing rather than freezing them in the skill. A vector index is not a source of truth for authorization; filter and verify retrieved records under the caller's permissions.

Handle streaming cancellation and partial failure. Bound tokens, tool calls, retries, and concurrency. Do not retry non-idempotent tool actions simply because model generation restarted. Keep prompt content and personal data out of general logs unless an explicit privacy policy permits them. Cache only responses whose tenant, authorization, and freshness boundaries are safe.

## Agent applications

The upstream release-agent example combines GitHub events, a Worker, a per-release Durable Object, and container-backed tools. Use it as a worked architecture, not a mandate to give every agent every binding. Define bounded tools with explicit inputs, effects, timeouts, and permissions. Place human approval before consequential external actions, and persist the approval decision before resuming work.

Use Workflows for durable orchestration and DOs for per-entity coordination where each solves an actual problem. Avoid implementing a parallel job engine, secret store, or agent protocol when the selected libraries provide suitable supported extensions. Test failed tools, retries, cancelled generations, cross-tenant requests, and recovery after process loss.

## Other compute features

Rate Limiting and Workers Cache are specialised bindings, not a database transaction layer or universal distributed lock. Python Workers use their own package/runtime path; do not bundle a Python entrypoint as if it were TypeScript. Gradual deployments need compatible schemas and metrics per version. Load the smallest current guide immediately before writing resource props.

## Sources

- [cloudflare/compute/containers](https://alchemy.run/cloudflare/compute/containers/)
- [cloudflare/compute/run-a-container](https://alchemy.run/cloudflare/compute/run-a-container/)
- [cloudflare/compute/browser-rendering](https://alchemy.run/cloudflare/compute/browser-rendering/)
- [cloudflare/compute/worker-loader](https://alchemy.run/cloudflare/compute/worker-loader/)
- [cloudflare/compute/workers-for-platforms](https://alchemy.run/cloudflare/compute/workers-for-platforms/)
- [cloudflare/ai/workers-ai](https://alchemy.run/cloudflare/ai/workers-ai/)
- [cloudflare/ai/ai-gateway](https://alchemy.run/cloudflare/ai/ai-gateway/)
- [cloudflare/ai/vectorize](https://alchemy.run/cloudflare/ai/vectorize/)
- [cloudflare/ai/ai-search](https://alchemy.run/cloudflare/ai/ai-search/)
- [cloudflare/ai/effect-ai](https://alchemy.run/cloudflare/ai/effect-ai/)
- [cloudflare/ai/release-agent](https://alchemy.run/cloudflare/ai/release-agent/)
- [cloudflare/compute/python-workers](https://alchemy.run/cloudflare/compute/python-workers/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
