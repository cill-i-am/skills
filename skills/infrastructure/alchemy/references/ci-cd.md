# CI/CD, previews, production, and cleanup

## Design the trust boundaries first

Use independent lanes for untrusted checks, approved preview deployment, production deployment, and preview cleanup. Validation needs no provider secrets. A fork pull request does not become trusted because tests passed. Same-repository branches still contain executable code, so use a protected preview environment with reviewer approval when contributors can modify deployment scripts or dependencies.

Never combine `pull_request_target` credentials with checkout and execution of the pull request's code. Do not execute a PR-supplied script to decide whether that PR may receive secrets. Keep cleanup logic on a trusted default-branch revision. Restrict workflow, infrastructure, and dependency changes through repository review policy.

The bundled workflows are **templates requiring repository-specific configuration**, not an immediately enabled deployment system. They live under `assets/`, not an active `.github/workflows/` directory. They include event-driven examples, so copying them into a repository can enable deployments; configure protected environments and credentials first. Installing the skill by itself does not activate them. Read the setup and authorization comments in each template before copying it into `.github/workflows/`.

## Reproducible toolchain

Use the project's `packageManager` field and committed lockfile. Install with `pnpm install --frozen-lockfile`, `npm ci`, or the matching manager's frozen mode. Invoke the installed `alchemy`; do not use `dlx alchemy`, `npx ...@latest`, or a floating remote install script during deployment. An upgrade should be a reviewed dependency change, not an accidental property of the next CI run.

Pin third-party actions to reviewed full commit SHAs under repository policy. The supplied templates use full commit SHAs resolved from official action tags on 7 October 2026; update them through review rather than treating a historical pin as permanently safe. Pin container images and remote build inputs as well. Keep credentials out of dependency installation where feasible, and do not share writable caches from untrusted jobs with privileged jobs.

## State and concurrency

All jobs managing one continuing stage must use the same remote state backend. Do not rely on an ephemeral runner's `.alchemy/` directory. Bootstrap state through a separate authorized operation; CI deployment tokens should not routinely hold account-wide administrative rights.

Use one concurrency key per **stack and stage**, identical across deploy and cleanup workflows. Set `cancel-in-progress: false` while applying changes. A newer push should not kill an in-flight cloud update. Backend locks still matter when a developer laptop or another pipeline can write the same target.

Keep live test stages separate from previews: `test-pr-42-run-123` is disposable test infrastructure; `pr-42` is a persistent preview until closure. A smoke test against an existing preview must never call the harness's destroy operation on that preview.

## Credential preflight

After obtaining credentials, check the providers actually used:

```sh
pnpm exec alchemy provider check-env --provider Cloudflare
# AWS jobs should obtain short-lived credentials before checking AWS.
pnpm exec alchemy provider check-env --provider AWS
```

Cloudflare deployment and state access can require different permissions. The current state-store secret-binding path may require `Secrets Store Write`; a token that can deploy a Worker may still fail state authentication. Grant only resources and permissions the selected account/stage needs. Keep admin token-minting credentials outside normal app CI.

For AWS, prefer GitHub OIDC over long-lived keys. Restrict `aud` and `sub` in the IAM trust policy. An environment-based job uses an environment-shaped subject; a branch-shaped condition will not match it. Current AWS action guidance also documents repository/owner ID suffixes for newer or opted-in repositories. Inspect the actual repository OIDC subject configuration instead of copying a legacy subject string or printing a raw token. Do not use `repo:org/repo:*` or `AdministratorAccess` as a production default. Provision the bootstrap role and CI secrets/variables separately from app deployments.

## Preview flow

Establish the PR number from authenticated event/API data, not a title or branch string. Verify repository identity, that the PR is open, that its head belongs to the expected repository, and the approved immutable head SHA. Validate `pr-<positive integer>` using the supplied guard. Review the exact code that will run with preview credentials. Deploy under the preview environment and state namespace, then check readiness and representative functionality.

Expose a preview URL through a safe stack output. An optional `GitHub.Comment` with a stable logical ID updates one comment rather than creating duplicates; add GitHub provider and permissions only when comments are needed. Never publish secrets or full provider outputs in comments. Private previews need authentication or Access even when the URL is hard to guess.

## Production flow

Deploy an approved immutable commit from the protected release branch. Require environment protection and a reviewed plan for consequential changes. Select production credentials and state explicitly. Apply committed database migrations; do not generate schema changes during the release. Readiness, a smoke test, telemetry, and any canary progression are separate gates after the CLI succeeds.

A code rollback does not automatically undo migrations, queued messages, resource replacement, or external side effects. Prefer backward-compatible schema changes and a documented roll-forward path. Before gradual rollout, ensure both versions can read the same data and messages.

## Cleanup flow

On a closed PR, verify its number and repository using trusted code. Use exactly the same preview target and concurrency group. Recheck the PR state after acquiring the job slot: a reopened PR should not be destroyed by an old queued cleanup. Deny `prod`, `production`, `staging`, empty values, path fragments, shell metacharacters, and arbitrary names by accepting only the preview pattern—not by listing a few forbidden words.

Use a trusted stack config capable of resolving the old deployment's resource types and state; a breaking provider upgrade can make cleanup of older previews require a retained compatible toolchain. Ensure cleanup credentials include state access. Report orphaned resources on failure and provide a scheduled janitor design with ownership checks and an age threshold, not an account-wide deletion command.

## Sources

- [environments/ci](https://alchemy.run/environments/ci/)
- [cloudflare/tutorial/part-5](https://alchemy.run/cloudflare/tutorial/part-5/)
- [aws/tutorial/part-5](https://alchemy.run/aws/tutorial/part-5/)
- [state-store](https://alchemy.run/state-store/)
- [environments/stages](https://alchemy.run/environments/stages/)
- [https://docs.github.com/en/actions/reference/security/secure-use](https://docs.github.com/en/actions/reference/security/secure-use)
- [https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

Workflow setup: [template guide](workflow-templates.md). Current external references: [pnpm/setup](https://github.com/pnpm/setup), [AWS credential action](https://github.com/aws-actions/configure-aws-credentials), [checkout](https://github.com/actions/checkout).
