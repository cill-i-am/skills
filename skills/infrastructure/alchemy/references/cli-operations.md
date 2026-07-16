# CLI Operations

Use this file for planning, deployment, state inspection, adoption, logs, recovery, and v1 migration. Commands below use pnpm; follow the target repository's package manager.

## Command Map

```text
alchemy
  deploy [file]                 plan, approve, apply
  plan [file]                   preview only
  destroy [file]                delete a tracked stack stage
  unsafe nuke [file]            enumerate and delete tracked or untracked provider resources
  dev [file]                    deploy dependencies and run supported runtimes locally
  tail [file]                   stream live logs
  logs [file]                   fetch historical logs
  login [file]                  configure/authenticate providers
  profile show|clear            inspect or clear credential profiles
  state stacks|stages|resources|get|tree|clear
  aws bootstrap                 create AWS deployment assets storage
  cloudflare bootstrap|create-token|state logs
```

Common options include `[file]`, `--stage`, `--profile`, `--env-file`, and `--yes`. Pass stage and profile explicitly in CI and for any production operation.

## Safety Classes

Read-only or non-applying:

- `pnpm alchemy plan`
- `pnpm alchemy state tree|stacks|stages|resources|get`
- `pnpm alchemy profile show`
- `pnpm alchemy logs` and `tail`

Cloud-mutating:

- `deploy`, `destroy`, and most real `dev` sessions
- integration tests that call `deploy`/`destroy`
- provider bootstrap and token creation

Ownership/state-mutating:

- `deploy --adopt`
- `state clear`
- `profile clear`

Catastrophic:

- `unsafe nuke`

Obtain explicit confirmation for every mutating class. For `unsafe nuke`, show the exact provider, stack file, stage, profile/account, and expected resource boundary immediately before running it.

## Plan First

```sh
pnpm alchemy plan --stage pr-42 --profile sandbox
```

`plan` is equivalent to `deploy --dry-run`: it reads credentials, state, and provider APIs as needed but does not apply the stack plan. A first run using `Cloudflare.state()` can separately offer to bootstrap the remote state Worker and supporting secrets; decline that prompt unless bootstrap was explicitly approved. Review:

- target stack, stage, profile, account, and region;
- creates, updates, replacements, deletes, and no-ops;
- logical IDs and physical names;
- generated IAM/binding changes;
- state-store access and unresolved outputs;
- unexpected resources caused by a wrong stage or empty state.

Never convert a successful plan into deploy approval on the user's behalf.

## Interactive And CI Behavior

Interactive terminals use the TUI. Plain/non-interactive mode prints the plan and does not mutate unless `--yes` is passed. `CI=1`, no TTY, and known agent environments select plain mode. `ALCHEMY_PLAIN=1` or `ALCHEMY_NO_TUI=1` forces it; `ALCHEMY_TUI=1` forces the TUI.

CI deployment commands require `--yes`, but automation must first guard the stage and event:

```sh
test "$ALCHEMY_STAGE" != "prod" || test "$GITHUB_REF" = "refs/heads/main"
pnpm alchemy deploy --stage "$ALCHEMY_STAGE" --profile ci --yes
```

Cleanup workflows must refuse `prod` and shared long-lived stages before calling destroy.

## Inspect State

Start with:

```sh
pnpm alchemy state tree --profile sandbox
pnpm alchemy state stages --stack myapp --profile sandbox
pnpm alchemy state resources --stack myapp --stage dev_cillian --profile sandbox
pnpm alchemy state get --stack myapp --stage dev_cillian --fqn Bucket --profile sandbox
```

When a plan wants to create everything, check the stage before changing code. When a diff is surprising, compare desired props, persisted state, and observed cloud state.

`state clear` deletes Alchemy's record, not the cloud resource, but it changes future ownership/recovery behavior. Treat it as destructive and inspect the exact stack/stage first. `--local` selects on-disk state when repairing an interrupted bootstrap.

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

`alchemy dev` deploys or reuses real cloud dependencies while supported runtimes run locally. It is not a complete emulator and may mutate the target stage.

- Use a dedicated development stage.
- Set runtime ports deliberately.
- Verify browser/network traffic reaches the local runtime rather than a deployed URL.
- Expect cloud identity, permissions, data, and queues to remain real.
- Stop the process cleanly and report resources left deployed.

## Migrating From v1

Use the official migration guide rather than reconstructing v1 behavior from memory:

1. Replace the v1 stack wrapper with `Alchemy.Stack`.
2. Convert infrastructure declarations to yielded Resource Effects.
3. Keep async runtime handlers temporarily if useful; migrate runtime internals independently.
4. Preserve logical IDs and pin physical names where identity must not change.
5. Plan against a safe stage and review every replacement.
6. Use adoption only with explicit ownership evidence.

Do not mix migration cleanup, physical renames, and platform redesign in one deployment.
