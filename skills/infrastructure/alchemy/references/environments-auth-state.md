# Environments, Authentication, And State

Use this file when deciding where infrastructure lives, how commands authenticate, how secrets enter runtimes, and where deployment state is stored.

## Keep The Axes Separate

- Stage: which isolated instance of the stack is targeted.
- Profile: which credentials and provider auth methods are used.
- State store: where Alchemy records resource props and attributes.
- Configuration/secrets: values made available to plan, initialization, or runtime.

Do not collapse these into one `NODE_ENV`-style switch. A `prod` stage can intentionally be targeted with a particular production profile; the pairing must be explicit.

## Stages

The default stage is `dev_$USER`. Useful patterns:

- `dev_<name>` for personal development.
- `dev_shared` only for intentionally shared resources.
- `pr-<number>` or `ci-<run>` for previews/tests.
- `prod` for trunk production.

Stages isolate state and contribute to generated physical names. Use stack context for stage-aware props rather than scattered environment branching. Long-lived databases, domains, or shared services can live in separate ownership stacks and be referenced deliberately.

Rules:

- CI always passes `--stage`.
- Production commands validate the expected branch/event and profile.
- Preview cleanup refuses `prod` and shared stages.
- Stage names derived from external input are normalized to the documented character set.
- Do not pin a cross-stack reference to `prod` unless that coupling is intentional and documented.

## Profiles

Profiles are stored under `~/.alchemy/profiles.json`; sensitive stored credentials live separately. Use:

```sh
pnpm alchemy login --profile sandbox --configure
pnpm alchemy profile show --profile sandbox
```

- Prefer browser login or SSO locally when supported.
- Prefer workload identity/OIDC or environment-provided short-lived credentials in CI.
- Keep an explicit production profile when account separation matters.
- Never commit profile or credential files.
- Treat `profile clear` as an authentication mutation requiring confirmation.

## Auth Provider Model

An Auth Provider integrates a provider with `alchemy login` and profiles. Its contract is five Effect-returning operations:

- `configure`: choose and persist a non-secret auth method.
- `login`: establish or refresh credentials.
- `logout`: remove stored session/secret material.
- `prettyPrint`: render redacted profile information.
- `read`: lazily resolve usable credentials.

Register it with `AuthProviderLayer`. Keep the provider's credential service lazy:

```ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

export class ServiceCredentials extends Context.Service<
  ServiceCredentials,
  Effect.Effect<{ apiKey: Redacted.Redacted<string> }>
>()("ServiceCredentials") {}
```

Provider Layers are built before a profile necessarily exists, so do not resolve credentials while constructing the Layer. Lifecycle handlers double-yield the lazy credential Effect only when an operation runs.

Persist only the chosen method in the profile. Store secret material in the credentials store or obtain it from the environment/session at resolution time. Wrap resolved secrets in `Redacted`.

## Secrets And Config

For Effect runtimes, resolve configuration during platform initialization:

```ts
const apiKey = yield* Config.redacted("API_KEY");
```

This lets Alchemy discover and bind the secret. Capturing the resulting `Redacted` value in returned handlers is correct; first yielding the Config inside `fetch` is too late for deploy-time discovery.

For async Workers, declare configuration in the resource's `env` and infer the environment type from the Worker resource.

Rules:

- Prefer `Config.redacted` for tokens, passwords, connection strings, and generated credentials.
- Transform/validate configuration before runtime work starts.
- Do not put raw secrets in resource props, outputs, logs, snapshots, or error messages.
- Use provider-native secret stores when secrets are shared, generated, or rotated independently of deployment.

## State Stores

State is the persisted record the next plan diffs against. It is not a live inventory of the cloud.

- `Cloudflare.state()`: a remote Worker backed by a Durable Object with embedded SQLite, with auth and encryption material in Cloudflare Secrets Store.
- `AWS.state()`: account/region-scoped S3 state.
- `Alchemy.localState()`: on-disk `.alchemy/` state for isolated local work and examples.
- In-memory state: provider/unit tests.
- Custom state Layer: unusual governance or storage requirements.

Use one authoritative state store per stack/stage. Do not casually switch stores: an empty store can make every resource appear new and trigger recovery/adoption behavior.

Remote bootstrap can itself create cloud resources and credentials, so it requires confirmation. Keep `.alchemy/` gitignored even when remote state is the normal path.

## Custom State Store

A custom state service must implement the complete `StateService` contract, including:

- `get` and `set` of resource records;
- resource, stack, and stage listing;
- resource/stage/stack deletion;
- replaced-resource tracking;
- deterministic serialization and concurrency behavior.

Expose an Effect that lazily constructs the service and cache the initialized service. Test the full round trip, not just individual methods. State writes must be atomic enough that interrupted deploys do not silently corrupt the graph.

## Local Development

`alchemy dev` combines real cloud dependencies with local supported runtimes and hot reload. Resource adaptation may replace a deployed binding with a local transport, but it does not make cloud data or permissions fake.

- Use a personal stage and sandbox account.
- Confirm ports and generated local URLs.
- Verify frontend traffic in the browser/network panel.
- Keep production-only secrets out of local profiles.
- Treat dev startup as cloud-mutating unless a plan proves otherwise.

## CI

- Pin Node and pnpm versions.
- Use provider-supported OIDC/workload identity where possible.
- Set stage and profile explicitly.
- Use remote state accessible to every runner that participates in the workflow.
- Run plan/typecheck/tests before deploy.
- Require `--yes` only after event/stage guards pass.
- Give previews unique stages and destroy them on close.
- Make cleanup idempotent and impossible to aim at production.
- Keep admin credentials in a separate bootstrap/credentials stack when credentials-as-code is needed.

## Verification

- Stage and profile are printed before mutation.
- Cloud account/region/team is independently verified.
- State tree contains the expected stack/stage.
- Config is discovered during initialization and remains redacted.
- CI can authenticate non-interactively without local credential files.
- Preview stages do not share mutable state unless explicitly designed to do so.
