# Alchemy skill — coverage and validation

Built from a fresh structure using official Alchemy documentation and source examples. No content from the user's existing Alchemy skill was reused, and no existing repository or installed skill was changed.

## Deliverable

Keep the complete `alchemy/` folder together. `SKILL.md` is the agent entry point; it routes tasks to individual references rather than loading the entire package at once. `agents/openai.yaml` provides optional display metadata. This archive is a portable skill folder, not an automatically installed ChatGPT plugin.

The package contains **36 task references**, approximately **23,030 words across those references**, **19 TypeScript asset files**, **five CI workflow templates**, **five helper scripts**, and **24 behavioural evaluation scenarios**. The source index contains **178 entries** with separate labels for reviewed content, task-specific retrieval links, external primary references, and source-navigation locations. It is not an offline mirror of every API page.

## Coverage

| Area | Included guidance and assets |
|---|---|
| Core Alchemy | Installation and version selection; stacks, resources, Actions, lazy Outputs, references, graph dependencies, identities, reconciliation, retention, adoption and replacement. |
| Effect composition | Construction versus runtime; capabilities and Layers; service ownership, runtime boundaries, secrets and typed errors. |
| Cloudflare | Effect and async Workers; R2, KV, D1, Hyperdrive; Durable Objects and WebSockets; queues, workflows, schedules and approval; containers, browser rendering, AI and dynamic Workers. |
| Other infrastructure | AWS Lambda/S3, data and events, IAM and containers; GCP Cloud Run, data, messaging and identity; Docker and Kubernetes; task routing for Fly, Railway and Hetzner. |
| Applications and integrations | SPA/SSR frameworks including TanStack Start; Effect HTTP/RPC and trusted internal RPC; SQL, Drizzle, Prisma, migrations and managed databases; GitHub, Stripe, Better Auth, secrets and ACME. |
| Operations | Stages, profiles, credentials, local development, remote state, locking, recovery, drift, logs, telemetry, networking, security and production review. |
| Delivery | Trusted/untrusted CI separation, full-SHA action pins, PR previews, exact cleanup guards, current-PR rechecks, production deployment, AWS OIDC, smoke-test integration and orphan recovery. |
| Testing and extension | Unit/local/live test distinctions, Alchemy harness examples, provider-lifecycle guidance, custom provider/auth/state/runtime procedures and maintenance/evaluation instructions. |

### Code assets

Four small application examples cover a first bucket stack, an authenticated Cloudflare R2 API, a D1 read-only fixture API with committed SQL, and an authenticated AWS Lambda/S3 API. The R2 application includes local integration-test source.

Seven further example groups are explicitly marked as fragments or scaffolds: Durable Object, Workflow, queue processing, HTTP contract, Vite Website, GitHub preview comment and custom provider. They identify the application-specific wiring that remains. The custom provider deliberately fails until its lifecycle is implemented; it does not simulate successful provisioning.

### CI templates

The five templates are unprivileged checks, approved preview deployment, trusted preview cleanup, Cloudflare production and AWS production. They remain inactive under `assets/workflows/`. Their guide lists required project scripts, state bootstrap, environment protections, provider/application credentials and smoke-test integration. Copying them into a repository's workflow directory can activate triggers and requires the corresponding authorization.

## Baseline and source policy

Research baseline: **7 October 2026**, Alchemy **2.0.0-beta.81**, upstream commit **`fbe6ece368c6898234592e897d852bb47b88ebb1`**. The pinned workspace catalogue declares Effect **`^4.0.0`**. The package records documentation/source disagreements, including stale Effect RC installation prose, older state-backend descriptions and inconsistent stage-default explanations.

The target project's installed versions and lockfile take precedence. The skill does not silently upgrade projects, mix v1 and v2 APIs, or treat this dated snapshot as permanently current. Action pin provenance is recorded separately; verifying a tag's commit is not a complete audit of the action.

## Checks actually completed

| Check | Result |
|---|---|
| Preview-stage guard tests | **26 passed**, including malformed PR numbers, production targets, mismatch, injection-shaped strings and trailing-newline edge cases. |
| Read-only project inspector tests | **8 passed**, including malformed manifests, bounded scans, symlink rejection and omission of credentialed dependency URLs. |
| TypeScript asset syntax | **19 files parsed; 0 syntax errors**, using TypeScript **5.8.3**. |
| YAML parsing | **6 files parsed**, comprising five workflows and agent metadata. |
| Workflow shell syntax | **18 `run` blocks passed `bash -n`** after expression placeholders were substituted for parsing. No commands in those blocks were executed. |
| Workflow static invariants | Full-SHA pins, non-persisted checkout credentials, matching preview concurrency, closed-only trusted-source cleanup and main-only protected-production declarations passed. |
| Skill structure | Frontmatter, local links, balanced Markdown fences, JSON documents, Python syntax and reference routing passed. Exact counts are in `evals/validation.json`. |

The inspector is a bounded inventory, not a dependency resolver or comprehensive secret scanner. The preview guard validates a target string, not authorization or arbitrary infrastructure code. YAML/static checks are not an actionlint run or a GitHub execution.

## Validation limits

**The cloud examples have not been dependency-typechecked, run in emulators or deployed.** Dependency installation and peer resolution were unavailable in the build environment. The example package therefore contains an illustrative dependency manifest but no fabricated lockfile. Resolve and verify it in the target project before relying on the examples.

The local R2 integration-test source is included but was not run; it is separate from the 34 offline helper tests that passed. The 24 agent-behaviour scenarios are authored evaluation cases, not results from independent agents. No exhaustive check of external links or every generated provider API page was performed. Broader provider guidance routes to current official references for exact resource props.

No cloud resources, credentials, DNS records, repository workflows, existing skills or user repositories were created or modified during packaging.

## Using the package

Extract the archive and place the complete `alchemy/` folder in the skill location supported by the target agent, following that agent's installation process. Read `SKILL.md` first. Use `references/examples.md` for code status and setup, `references/workflow-templates.md` before activating CI, and `references/maintenance.md` to refresh versions and run the validation tools.

Adapt examples inside a separate project rather than deploying from the installed skill directory. Do not leave two skills with the same `alchemy` name enabled without resolving the conflict deliberately.
