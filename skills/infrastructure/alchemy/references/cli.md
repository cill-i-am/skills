# CLI workflows and operational boundaries

## Select the operation by its effect

Run the installed CLI through the project package manager, for example `pnpm exec alchemy`. Inspect `--help` for the installed release before introducing flags. Preserve repository wrappers when they enforce target selection or approval. A wrapper named `plan` may still do setup; inspect unfamiliar scripts instead of classifying them by name.

| Need | Command family | Operational distinction |
|---|---|---|
| Compare declarations to state | `plan` | Does not apply the app plan, but state bootstrap and program evaluation can have effects. |
| Converge the deployed graph | `deploy` | Creates, updates, replaces, and deletes resources. |
| Remove one managed graph | `destroy` | Deletes the selected stack/stage in dependency order. |
| Find external changes | `drift` | Reads live provider state. Repair is a separate mutation. |
| Run locally | `dev` | Starts local processes; remote resources can still be selected. |
| Inspect operational output | `logs` | Reads potentially sensitive application logs. |
| Inspect persistence | `state` | Subcommands include reads and destructive modifications. |
| Manage authentication | `profile` | Can create, refresh, rename, or delete credentials. |
| Validate CI variables | `provider check-env` | Checks the provider's declared environment contract. |
| Account-wide cleanup | `nuke` | Much wider blast radius than one stack; not a routine task. |

## A deliberate deployment session

```sh
pnpm exec alchemy plan --config alchemy.run.ts --stage staging --profile sandbox
# After the proposed effects are understood and authorized:
pnpm exec alchemy deploy --config alchemy.run.ts --stage staging --profile sandbox
pnpm exec alchemy logs --config alchemy.run.ts --stage staging --profile sandbox
```

Before applying, identify changes to data stores, IAM, DNS, public endpoints, service identities, and the state backend. Check whether a generated plan includes deletion because a feature was conditionally omitted. Record the source revision used. Do not rely on an earlier plan after changing source, variables, provider credentials, or state.

Non-interactive confirmation is a workflow policy decision, not a convenience for the assistant. Use `--yes` only in a reviewed, authorized automation with an explicit target. Do not bypass a stricter repository wrapper. Some CLI versions detect CI automatically; do not assume all beta versions have identical prompting semantics.

## Drift and recovery

`drift` answers what changed outside the last deployment. `plan` answers how the current declarations compare with persisted desired inputs. A clean plan is not proof of no live drift. A repair may restore the last deployed values rather than the current working tree. Capture the difference first, determine whether the external edit was intentional, then select repair or a reviewed code change.

Inspect state without publishing tokens, connection strings, or full credential-bearing outputs. A state deletion leaves the physical resource behind and changes ownership tracking. Read [state and recovery](state-and-recovery.md) before changing it. Do not clear `.alchemy/` to fix an unexplained deployment conflict.

## Destruction checklist

Confirm account/project, region, stack name, stage, source config, state backend, and the scope of references. Review retained resources, persistent databases, DNS ownership, and orphaned dependencies. Confirm the target is actually disposable. For previews, run the bundled strict stage guard; a string merely different from `prod` is not safe enough. Shared state backends and credential-bootstrap stacks are not preview resources.

Stop an operation when the observed target differs from the approved one. Do not attempt a wider cleanup to compensate for a failed narrow operation. Record failed cleanup as operational debt with exact IDs and a bounded retry path.

## Sources

- [cli](https://alchemy.run/cli/)
- [cli/plan](https://alchemy.run/cli/plan/)
- [cli/deploy](https://alchemy.run/cli/deploy/)
- [cli/destroy](https://alchemy.run/cli/destroy/)
- [cli/drift](https://alchemy.run/cli/drift/)
- [cli/dev](https://alchemy.run/cli/dev/)
- [cli/inspecting-state](https://alchemy.run/cli/inspecting-state/)
- [cli/adopting-resources](https://alchemy.run/cli/adopting-resources/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
