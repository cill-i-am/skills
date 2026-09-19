# CLI Operations

Use this file for planning, deployment, state inspection, adoption, logs, recovery, and v1 migration. Commands below use pnpm; follow the target repository's package manager.

## Command Map

```text
alchemy
  deploy                       plan, approve, apply
  plan                         preview only
  destroy                      delete every resource in a stage
  drift                        detect (and optionally repair) drift
  unsafe nuke                  enumerate and delete tracked or untracked resources
  dev                          hot-reloading local development loop
  logs [--tail]                fetch historical logs or stream live logs
  profile create|rename|edit|refresh|current|list|show|delete
  state list|read|delete
  provider check-env
  provider aws bootstrap|teardown
  provider cloudflare bootstrap|teardown|token|state logs
```

Every command targets `alchemy.run.ts` unless `--config <file>` names an
existing entrypoint. Common options include `--stage`, `--profile`,
`--env-file`, `--config`, `--no-input`, and `--yes`. Upstream defaults are
`live_$USER` for deploy/plan/destroy and `dev_$USER` for `alchemy dev`; pass
stage and profile explicitly in CI, previews, and production.

## Safety Classes

Read-only or non-applying:

- `pnpm alchemy plan`
- `pnpm alchemy state list|read|delete`
- `pnpm alchemy profile show`
- `pnpm alchemy logs` and `pnpm alchemy logs --tail`

Cloud-mutating:

- `deploy`, `destroy`, and most real `dev` sessions
- integration tests that call `deploy`/`destroy`
- provider bootstrap and token creation

Ownership/state-mutating:

- `deploy --adopt`
- `state delete`
- `profile delete`

Catastrophic:

- `unsafe nuke`

Obtain explicit confirmation for every mutating class. For `unsafe nuke`, show the exact provider, stack file, stage, profile/account, and expected resource boundary immediately before running it.

## Plan First

```sh
pnpm alchemy plan --stage pr-42 --profile sandbox
```

`plan` previews the stack without applying it, and `deploy --dry-run` follows
the same plan path. It reads credentials, state, and provider APIs as needed.
A first run using `Cloudflare.state()` can separately offer to bootstrap the
remote state Worker and supporting secrets; decline that prompt unless
bootstrap was explicitly approved. Review:

- target stack, stage, profile, account, and region;
- creates, updates, replacements, deletes, and no-ops;
- logical IDs and physical names;
- generated IAM/binding changes;
- state-store access and unresolved outputs;
- unexpected resources caused by a wrong stage or empty state.

Never convert a successful plan into deploy approval on the user's behalf.

## Interactive And CI Behavior

Interactive terminals use the TUI. Plain/non-interactive mode prints the plan
and cannot approve it without `--yes`; `CI=1`, no TTY, and known agent
environments select plain mode. `ALCHEMY_PLAIN=1` or `ALCHEMY_NO_TUI=1`
forces it; `ALCHEMY_TUI=1` forces the TUI. A repository guard may reject
`--yes` even though the upstream CLI supports it.

Upstream CI deployment commands require `--yes`, but automation must first
guard the stage and event:

```sh
test "$ALCHEMY_STAGE" != "prod" || test "$GITHUB_REF" = "refs/heads/main"
pnpm alchemy deploy --stage "$ALCHEMY_STAGE" --profile ci --yes
```

Cleanup workflows must refuse `prod` and shared long-lived stages before calling destroy.

## Inspect State

Start with:

```sh
pnpm alchemy state list --profile sandbox
pnpm alchemy state read --profile sandbox
```

When a plan wants to create everything, check the stage before changing code. When a diff is surprising, compare desired props, persisted state, and observed cloud state.

`state delete` deletes Alchemy's record, not the cloud resource, but it changes
future ownership/recovery behavior. Treat it as destructive and inspect the
exact stack/stage first. A local-state option selects on-disk state when
repairing an interrupted bootstrap.

## Adoption And Recovery

With no state, providers call `read`:

- missing resource: create;
- resource provably owned by this stack/stage/logical ID: recover automatically;
- existing unowned resource: fail with `OwnedBySomeoneElse` unless adoption is explicitly enabled.

`deploy --adopt` enables takeover for the whole deploy, not one resource. Before adoption:

1. Prove the resource is the intended target.
2. Record its current owner, tags, and configuration.
3. Review what reconcile will overwrite.
4. Confirm state store, stage, profile/account, and logical ID.
5. Obtain explicit approval.

Prefer restoring ownership metadata or choosing a new physical name when takeover is not intended.

## Logs And Incident Work

- Use `tail` for live, interleaved logs.
- Use `logs` for a bounded historical batch.
- Use `cloudflare state logs` for state-store bootstrap/auth issues.
- Correlate runtime logs with stage, stack, resource logical ID, and deployment time.
- Redact request bodies, credentials, connection strings, and provider props before sharing output.

## Local Development

`alchemy dev` runs supported compute locally and emulates supported services by
default; `Alchemy.remote()` opts a resource into live cloud execution. It is
not a universal emulator, and the selected resources may still mutate a cloud
stage, so inspect the command and stack first.

- Use a dedicated development stage.
- Set runtime ports deliberately.
- Verify browser/network traffic reaches the local runtime rather than a deployed URL.
- Expect cloud identity, permissions, data, and queues to remain real.
- Stop the process cleanly and report resources left deployed.

## Migrating From v1

Use the official migration guide rather than reconstructing v1 behavior from memory:

1. Read the current `/migrating-from-v1` guide before changing behavior.
2. Replace the v1 stack wrapper with `Alchemy.Stack`.
3. Convert infrastructure declarations to yielded Resource Effects.
4. Keep async runtime handlers temporarily if useful; migrate runtime internals independently.
5. Preserve logical IDs and pin physical names where identity must not change.
6. Plan against a safe stage and review every replacement.
7. Use adoption only with explicit ownership evidence.

Do not mix migration cleanup, physical renames, and platform redesign in one deployment.
