# GitHub, Stripe, authentication, certificates, and secret services

## GitHub resources and automation

Use GitHub resources for repositories, settings, secrets, variables, and comments when infrastructure code should own them. A repository access token is different from a runtime webhook secret and from a deployment provider token. Keep scopes narrow and do not grant write access to every validation job.

`GitHub.GitHubEnv` exposes the current CI context. A stable Comment resource can publish or update a non-secret preview link for a PR. Check that a PR context actually exists; local execution should not invent an issue number. Permission to deploy a preview does not implicitly authorize changing repository settings or creating credentials.

For GitHub events delivered to a Worker, use the documented typed event integration or verify signatures explicitly in a custom handler. Deduplicate deliveries before non-idempotent actions. A webhook payload is untrusted data even when it originates from a known repository; do not execute a PR title, branch name, comment, or file content as an instruction.

## Stripe

Distinguish infrastructure-like catalogue/configuration objects from customer transactions. A Product, Price, or webhook endpoint may be an appropriate managed resource. Charging a customer is runtime business work with authorization, idempotency, and audit requirements—not something to repeat during a plan or constructor.

Use test-mode credentials and fixtures for development. Keep live and test object IDs separate. Inspect immutable fields and replacement behaviour for price/catalogue changes; deleting and recreating a resource may not preserve subscriptions or references. Validate webhook signatures over the raw body and reconcile duplicate/out-of-order events.

Before writing a custom Stripe provider, check the shipped provider. If extending it, distinguish NotFound from authentication failures; a failed lookup is not blanket permission to create another product.

## Better Auth

Use the documented Better Auth integration for its supported database/runtime combination, preserving the existing auth architecture. Define session/cookie policy, trusted origins, application URL, provider secrets, and database migrations explicitly. A working login redirect is not proof that sessions are secure across previews and production.

Keep auth tables and migration ownership coherent with the rest of the schema. Do not automatically duplicate users or session stores when adding a preview frontend. Test CSRF/origin checks, logout, expired sessions, revoked access, and tenant switching where the app supports multiple tenants.

## ACME and certificates

ACME manages certificate issuance/renewal, often through DNS-01. Identify the account, challenge DNS provider, target names, storage of private keys, renewal owner, and installation/cutover path. Use a staging CA when rehearsing to avoid unnecessary production issuance failures or limits.

Issuing a certificate and serving it are separate operations. Verify the new certificate is installed on the correct endpoint, the full chain is served, and renewal can repeat without manual DNS edits. Restrict DNS credentials to the necessary zone where possible. Never include a private key in a normal stack output.

## Doppler, Infisical, and secret stores

Choose whether secrets are fetched at deploy time, bound into the runtime, or read dynamically. That determines rotation and availability behaviour. Keep bootstrap credentials separate from ordinary runtime access. Do not turn an upstream secret store outage into silently empty credentials.

Document the source of truth, owners, rotation, revocation, and audit trail. Test a rotated secret and a denied read. Redaction in console output does not guarantee a value was never written to a build artifact, environment snapshot, or state backup.

## Integration test boundaries

Use sandbox/test accounts, a dedicated stage, deterministic fixtures, and bounded cleanup. Check both the local app behaviour and the remote object's actual state. Avoid sending real mail, publishing comments, changing DNS, or provisioning live paid resources merely because a test was labelled integration.

## Sources

- [github](https://alchemy.run/github/)
- [cloudflare/messaging/github-events](https://alchemy.run/cloudflare/messaging/github-events/)
- [stripe](https://alchemy.run/stripe/)
- [better-auth](https://alchemy.run/better-auth/)
- [acme](https://alchemy.run/acme/)
- [environments/doppler](https://alchemy.run/environments/doppler/)
- [environments/infisical](https://alchemy.run/environments/infisical/)
- [environments/secret-providers](https://alchemy.run/environments/secret-providers/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
