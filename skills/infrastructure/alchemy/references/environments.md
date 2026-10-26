# Stages, profiles, configuration, and secrets


## Treat the deployment target as a tuple

Record the provider account/project, region, stack, stage, state backend, credential profile/resolver, and source revision. A stage name alone is not a secure deployment boundary. Generated names and state are stage-scoped, but manually fixed names, shared databases, cross-stack references, and broad credentials can still reach shared or production resources.

Current dedicated docs resolve stage from `--stage`, then `ALCHEMY_STAGE`, then `live_$USER` for live commands and `dev_$USER` for local development. Tests default to `test_$USER`. Specify stages explicitly in CI and any destructive command. Do not run `alchemy dev --stage prod`: selecting the same stage can turn a live-to-local transition into resource replacement.

Profiles choose credentials, not infrastructure isolation. Local commands typically use `--profile sandbox` or `--profile prod`. CI uses its explicit environment-credential contract; do not assume a profile stored on a laptop exists on an ephemeral runner.

## Local authentication

Use `alchemy profile edit` or the first authorized interactive operation. Create distinct admin and day-to-day profiles when credential provisioning needs more power. Cloudflare OAuth is appropriate for supported ordinary operations but does not imply permission to mint API tokens. An admin credential may create roles or tokens; do not copy it into routine application CI.

Do not print `~/.alchemy` profiles, token files, or environment file contents into a conversation. Read metadata and the minimum required non-secret fields. Check the installed CLI's output redaction before sharing a profile inspection.

## CI credentials

Use provider-documented variables and validate only the providers the stack uses:

```sh
pnpm exec alchemy provider check-env --provider Cloudflare
```

Cloudflare CI typically needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. AWS should prefer short-lived OIDC role credentials, with its region explicitly supplied. Include state-store access in the permission design. With the current Cloudflare state implementation, a token can need `Secrets Store Write` to bind a secret through the temporary preview Worker; enumerating secrets is not the same permission.

Separate deploy credentials, runtime secrets, state-store credentials, and admin credential-management rights. One “everything” token creates avoidable cross-environment exposure.

## Bind runtime configuration deliberately

```ts
import * as Config from "effect/Config";

// In runtime construction, not at request execution:
const apiKey = yield* Config.Redacted("UPSTREAM_API_KEY");
const deploymentLabel = yield* Config.String("DEPLOYMENT_LABEL");
```

Only unwrap a Redacted value at the smallest API call that actually requires its string. Never return it as a stack output, interpolate it into a command, include it in a public error, or export it to a browser-prefixed variable. Redaction is an application representation, not a complete secrecy boundary: storage, transport, and logging still need protection.

Use `Alchemy.Random` or the provider's documented secret-generation resource for a stable generated credential. A fresh random value evaluated during every plan can cause permanent churn and unexpected rotation.

## Shared secret services

Cloudflare Secrets Store, Doppler, and Infisical have dedicated guides. Determine whether a secret is resolved for deployment, mounted at runtime, or fetched dynamically. Record how rotation propagates, which identities can read it, and whether a redeploy is necessary. Do not assume the same refresh behaviour across providers.

When adopting a secret, establish its owner and rotation procedure. Treat writing a GitHub secret or granting an IAM role as an external mutation, even when represented by a declarative resource.


## Sources

- [environments/stages](https://alchemy.run/environments/stages/)
- [environments/profiles](https://alchemy.run/environments/profiles/)
- [environments/auth-providers](https://alchemy.run/environments/auth-providers/)
- [environments/secrets](https://alchemy.run/environments/secrets/)
- [environments/ci](https://alchemy.run/environments/ci/)
- [environments/secret-providers](https://alchemy.run/environments/secret-providers/)
- [cloudflare/security/secrets-store](https://alchemy.run/cloudflare/security/secrets-store/)

Documentation snapshot: 7 October 2026. Resolve exact APIs against the target project’s installed version; see [version policy](version-policy.md).
