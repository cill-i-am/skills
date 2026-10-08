# Production readiness and review checklist

## Use this for a release or requested audit, not every small edit

Scope the review to the system and change. Record what is already satisfied, what changed, what remains an assumption, and which checks were performed. Do not invent approvals, measurements, backups, or test results.

## Identity and lifecycle

Confirm account/project, region, stack/stage, state backend, credentials, and source revision. Explain every create/delete/replace affecting data, security, networking, or service identity. Check explicit physical names and cross-stack references for collisions. Retention and backup are separate decisions. Rehearse risky renames, ownership transfers, and state migrations.

## Security

Review deployment, bootstrap, runtime, and user identities separately. Inspect actual generated bindings/IAM. Protect public endpoints, preview environments, webhook handlers, and administrative RPC. Check tenant isolation, input validation, secret redaction, state access, and revocation. Make browser-visible environment variables explicitly non-secret.

## Data and asynchronous work

Generate, review, and commit migrations. Test both fresh and upgrade paths. Back up important data and test restoration. Establish duplicate handling and retry limits for queues/workflows; define dead-letter and compensation ownership. Keep message/schema formats compatible across a rollout. Do not call an accepted job completed until its terminal result is known.

## Reliability

Define readiness, timeouts, bounded concurrency, resource limits, dependency failure behaviour, and graceful shutdown. Check whether a replacement is delete-first. Ensure persistent data survives the intended process/container/VM lifecycle. Review one-writer guarantees for state and migrations. Keep a bounded recovery runbook with exact targets.

## CI/CD

Freeze the dependency graph and pin reviewed actions/images. Separate untrusted validation from privileged deployment. Use protected environments, exact source revisions, and narrow credentials. Serialize applies and cleanup. Require a strict preview-stage guard and current PR-state check. Test only disposable live stages unless explicitly observing an existing deployment without teardown.

## Observability and cost

Verify actual telemetry delivery, useful identifiers, alert routing, and a runbook. Monitor user-impacting failures rather than every expected validation error. Set ownership, retention, budgets/limits, and cleanup for previews, test resources, model usage, volumes, and retained data. Obtain current prices/quotas when a decision depends on them; do not use a stale figure from this skill.

## Completion evidence

Report source review, syntax, typecheck, local tests, live tests, and deployed verification separately. Identify skipped checks and why. A useful final record names the changed files, the target when applicable, the important lifecycle/security implications, actual test output, and remaining decisions. Do not equate a generated template with an installed or deployed system.

## Sources

- [infrastructure-as-code/resource-lifecycle](https://alchemy.run/infrastructure-as-code/resource-lifecycle/)
- [environments/ci](https://alchemy.run/environments/ci/)
- [state-store](https://alchemy.run/state-store/)
- [testing](https://alchemy.run/testing/)
- [testing/observability](https://alchemy.run/testing/observability/)
- [sql/drizzle/migrations](https://alchemy.run/sql/drizzle/migrations/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
