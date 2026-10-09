# Workflow templates: prerequisites and adaptation

## Delivered templates

[Checks](../assets/workflows/checks.yml) runs unprivileged type/unit checks. [Preview deployment](../assets/workflows/preview.yml) handles same-repository PRs using a protected preview environment and the immutable head SHA. [Preview cleanup](../assets/workflows/preview-cleanup.yml) handles closed PRs from trusted base-branch code. [Cloudflare production](../assets/workflows/production-cloudflare.yml) and [AWS production](../assets/workflows/production-aws.yml) are alternative examples; do not enable both for the same target without a deliberate reason.

These are inactive files under `assets/`. Copying one to `.github/workflows/` activates its event triggers when repository configuration permits. Installing this skill alone neither creates an environment nor authorizes cloud operations.

## Required repository preparation

Choose the stack config and stable stack name. Configure a shared remote state backend and perform its first bootstrap as a separate approved operation. Keep credential-bootstrap and shared-state infrastructure out of preview teardown.

Use a committed pnpm lockfile and a `packageManager` declaration. These templates use `pnpm/setup` for pnpm 11+ and Node 24; preserve another existing package manager by adapting setup and frozen-install commands. Pin the runtime patch under the repository's toolchain policy rather than assuming the illustrative `node@24` selector is a byte-for-byte runtime lock.

Provide real `typecheck`, `test:unit`, and, for production, `test:smoke` scripts. `test:unit` must not create cloud resources. The smoke suite must be HTTP-only against the deployed service; it must not destroy the production stage. Supply `PRODUCTION_BASE_URL` for the smoke test and its application authentication inputs separately when needed.

Copy [assert-preview-stage.mjs](../scripts/assert-preview-stage.mjs) to `scripts/assert-preview-stage.mjs`. Keep the same concurrency prefix in preview deployment and cleanup. Change it consistently if the repository manages multiple app stacks.

Configure protected `preview` and `production` environments, required reviewers, allowed refs, secret ownership, and review rules for workflow/infrastructure/dependency changes. The preview environment must accommodate the intended PR deployment and trusted default-branch cleanup paths. A same-repository PR is not automatically trustworthy.

## Cloudflare inputs

Add narrowly scoped `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` values to the appropriate environments. Include the permissions required for the selected state backend, not only Worker deployment. Keep production and preview credentials/accounts separate where practical.

Wire the application's actual `Config.*` inputs at the deploy step. For the R2/Lambda demo, `APP_API_TOKEN` would need a real environment secret; the generic workflow intentionally does not invent an app secret or silently provide an empty one. Do not add all account secrets to every step.

## AWS OIDC inputs

Configure `AWS_ROLE_ARN`, `AWS_REGION`, and `AWS_ACCOUNT_ID` in the protected environment. Use [the trust-policy template](../assets/workflows/oidc-trust.template.json) only after replacing its explicit placeholders. It is a policy shape, not a deployable account-specific policy.

Restrict both audience and exact subject. Current AWS action guidance documents different subject shapes for environment jobs and for newer/opted-in repository-ID formats. Determine this repository's actual claim configuration without logging a raw bearer token. Do not copy a legacy `repo:owner/repo:ref:...` string into an environment-based job or relax the condition to a wildcard when it fails.

Attach only the deployment/state permissions the stack needs. The template does not include AdministratorAccess. Additional providers or a Cloudflare state backend need their own credentials; AWS OIDC does not authenticate unrelated providers.

## Event and source checks

Preview deployment checks the live PR state and head SHA after approval/queueing, so a stale queued run can stop before applying. Cleanup rechecks that the PR remains closed and uses the default branch, never the PR head. The cleanup trigger is `pull_request_target` specifically to use trusted base-branch workflow/source; do not add unsafe PR checkout to it.

The strict target guard proves only that a stage exactly matches its verified PR number. It does not authorize the deployment, validate the entire stack, or sandbox malicious code. Environment approval and code review remain the trust boundary. The same concurrency group serializes preview deployment and destruction; it cannot coordinate an unrelated laptop unless the state backend also provides appropriate locking.

## Remaining integration gates

Wire preview smoke tests to the stage's non-secret URL using a documented output/reference mechanism; do not scrape human-readable CLI logs with a brittle regex. Add a generated-plan review gate for consequential production changes. Environment approval by itself is not a review of a plan generated later in the job.

Rehearse failed deploy, reopened PR, stale head SHA, failed cleanup, missing state permission, and an incompatible provider upgrade. Keep an orphan-cleanup runbook with exact targets. A provider upgrade may require a compatible trusted cleanup toolchain for older previews.

## Pin provenance

The action commits in [action-pins.json](../assets/workflows/action-pins.json) were resolved from official tags on 7 October 2026. Annotated pnpm tags were dereferenced to the commit. This establishes provenance and immutability, not a complete security audit of each action or its dependencies. Review updates as normal dependency changes.

Sources: [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use), [checkout](https://github.com/actions/checkout), [pnpm/setup](https://github.com/pnpm/setup), [AWS credentials action](https://github.com/aws-actions/configure-aws-credentials), [Alchemy CI](https://alchemy.run/environments/ci/).
