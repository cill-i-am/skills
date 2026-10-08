# Fly, Railway, Hetzner, and managed databases

## Match the operational model, not only the API shape

These providers all support TypeScript declarations, but they do not offer interchangeable runtime, storage, networking, or replacement semantics. Start from the provider's setup guide, pin the installed version, then read the resource-specific API immediately before writing props. Do not translate a Cloudflare or AWS sample by swapping its import namespace.

## Fly

A Fly App is a namespace; a Machine runs a container; a Service hosts an Effect program on Machines; a Sprite is an org-scoped sandbox with a different deployment lifecycle. Choose Service for a managed application process, Machine for an existing image, and Sprite for a suitable hibernating sandbox workload.

Services can be private and call one another through the documented stack network/binding mechanism. Do not make all services public merely to obtain a convenient URL. Set region and capacity intentionally. Region changes can replace resources, and volume locality matters.

Volumes are not a shared filesystem automatically mounted across replicas. The documented model attaches a volume to one Machine; multiple replicas require a deliberate state strategy. Use snapshots/backups and separate persistent data from disposable compute. Fly's managed Postgres, Redis, and Tigris integrations are distinct services with their own cost, identity, and retention.

For a frontend, choose the provider's Website adapter and check the resulting Node service behaviour. Verify the public domain, internal service calls, readiness, and data continuity after a replacement. Test what happens when a sleeping sandbox or Machine is restarted.

## Railway

A Project owns Services and related resources. The Project already has its production environment; use the returned environment identity instead of creating another resource named production. Extra staging environments are separate resources. Verify the selected workspace explicitly rather than relying unnoticed on the account's first workspace.

Services can use an image, repository build, or bundled Effect program. Match health checks, cron configuration, build commands, and runtime ports to that mode. Database helpers may compose container images, volumes, variables, and optional public proxies; do not assume a database helper implies the operational properties of every fully managed database product.

Use private networking for internal data access where possible. Expose a public TCP proxy only deliberately. The documented `Railway.ref` creates cross-service variable references without persisting their plaintext as ordinary attributes; keep that distinct from copying an actual credential string into a public output.

Review volume ownership, backup, and deletion with its service. A preview environment that shares a database or volume is not isolated. Test process readiness, private connectivity, variable changes, and cleanup without deleting a shared Project.

## Hetzner

A Server is a VM; a Service deploys an Effect program over SSH and runs it under systemd. Multiple Services can share one Server. This saves duplication but shares a failure and maintenance domain. Do not assume the platform provides a serverless isolation boundary between applications.

Verify server type, image, location, SSH access, firewall, private network, and patching responsibility. Alchemy's deployment key is sensitive operational access. Separate application credentials from SSH/admin access and never publish the private key in state diagnostics.

Attach a Volume for durable disk state and design its mount and backup lifecycle. Use stable addresses, load balancers, TLS, and DNS where needed; a raw `http://IP:port` tutorial URL is not the production security design. Validate graceful restart, service health, firewall denial, and access after server replacement.

## Neon, PlanetScale, and Prisma

Provision only the projects/databases/branches Alchemy should own. Use references or a supported adoption path for existing data. Decide whether every preview gets its own database, a branch of staging, or no database at all. Record how schema changes and cleanup affect the parent.

Keep runtime connection identity narrow and migration identity separately controlled. For Prisma Compute, distinguish deployed application lifecycle from Prisma ORM used inside a Worker or another provider. A similarly named provider and library do not imply the same hosting or transport.

## Cross-provider applications

A Cloudflare frontend plus a database or worker on another platform can be one stack when ownership is shared. Merge provider Layers deliberately and choose one state backend. Outputs describe dependencies; they do not remove network latency, regional failure, authentication, or egress cost.

Test the actual cross-provider path with the intended runtime credentials. Do not use a deployment admin API as the application's data path. Keep cost and quota facts live rather than freezing vendor pricing in a reusable skill.

## Sources

- [fly](https://alchemy.run/fly/)
- [fly/compute/services](https://alchemy.run/fly/compute/services/)
- [fly/data/volumes](https://alchemy.run/fly/data/volumes/)
- [railway](https://alchemy.run/railway/)
- [railway/compute/environments](https://alchemy.run/railway/compute/environments/)
- [railway/data/variables](https://alchemy.run/railway/data/variables/)
- [hetzner](https://alchemy.run/hetzner/)
- [hetzner/compute/services](https://alchemy.run/hetzner/compute/services/)
- [neon](https://alchemy.run/neon/)
- [planetscale](https://alchemy.run/planetscale/)
- [prisma](https://alchemy.run/prisma/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
