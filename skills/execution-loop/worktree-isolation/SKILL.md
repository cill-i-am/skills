---
name: worktree-isolation
description: Git worktree isolation with exact fetched-remote base provenance for agent work. Use when creating, validating, refreshing, or handing off worker and read-only reviewer worktrees, feature branches, parallel implementation, or experiments that must not disturb the current workspace.
---

# Worktree Isolation

Use this skill when an orchestrator, worker, or reviewer needs an isolated repository workspace. The goal is a clean, reproducible starting point with provable remote ancestry, not clever branch management.

## Non-Negotiable Base

Never base new worker or reviewer worktrees on local `main`, the coordinator's current `HEAD`, or a SHA copied from handoff prose. Before every dispatch or base refresh, fetch the remote and resolve the exact fetched `origin/main` commit:

```sh
git fetch --prune origin
base_sha=$(git rev-parse --verify 'origin/main^{commit}')
printf '%s\n' "$base_sha"
```

Create both the worker and paired reviewer worktrees from that same SHA. A Codex thread tool may provision the worktrees only when it can guarantee the exact fetched SHA. Otherwise, provision them manually before dispatch or stop and report the missing capability.

## Coordinator Setup

1. **Confirm git state.** Run `git rev-parse --show-toplevel`, `git branch --show-current`, and `git status --short`. If the coordinator tree has unrelated changes, do not move or clean them. Its state is not the base.
2. **Choose the directory.** Prefer an existing ignored `.worktrees/`, then existing ignored `worktrees/`, then a global temp/worktree root outside the project. Read the nearest `AGENTS.md` for a local preference.
3. **Verify ignore safety.** For project-local directories, run `git check-ignore -q .worktrees` or `git check-ignore -q worktrees` before creating the worktree. If the chosen directory is not ignored, add the ignore entry as part of the normal change or choose an external directory.
4. **Fetch and resolve the base.** Run the commands in Non-Negotiable Base and record the exact `base_sha`. Do this once for the worker/reviewer pair so both start from identical remote provenance.
5. **Create detached worktrees.** Use the resolved SHA, not a symbolic local branch or the coordinator's `HEAD`:

   ```sh
   git worktree add --detach <worker-path> "$base_sha"
   git worktree add --detach <reviewer-path> "$base_sha"
   ```

6. **Hand off role ownership.** The worker creates and owns `codex/<issue-key>-<slug>` from its detached base. The paired reviewer remains detached and read-only unless a separately authorized narrower task changes that role.
7. **Install and verify baseline.** Follow repo instructions. In this bundle's default TypeScript projects, use pnpm. Run the smallest documented baseline check that proves the worktree starts usable.
8. **Report the handoff.** State both worktree paths, fetched base SHA, worker branch expectation, reviewer detached/read-only state, install command, baseline command/result, and any setup blocker.

## Worker Activation

The worker, not the orchestrator or reviewer, creates the topic branch inside the pre-provisioned worker worktree:

```sh
git switch -c codex/<issue-key>-<slug>
```

Do not create that branch from a local checkout and then attach a worktree to it. The branch must begin at the fetched SHA already checked out in the worker worktree.

## Provenance Proof

Before planning, reviewing a plan, or editing, run this evidence set inside each worktree after a fresh `git fetch --prune origin`:

```sh
git status --porcelain
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git merge-base HEAD origin/main
git rev-list --left-right --count HEAD...origin/main
```

Required result:

- `git status --porcelain` is empty;
- worker branch is the expected `codex/<issue-key>-<slug>` and reviewer branch output is empty because the reviewer is detached;
- `HEAD`, `origin/main`, and `merge-base` are the same exact SHA;
- ahead/behind is `0 0`.

Handoff prose, a local `main` pointer, or an earlier fetch log is never sufficient evidence.

## Remote Advance Before Edit Authority

If a fresh fetch moves `origin/main` before the worker has edit authority, hold both lanes. When both worktrees are clean and the worker branch has no divergent commits, incorporate the exact fresh SHA non-destructively:

```sh
git fetch --prune origin
fresh_base_sha=$(git rev-parse --verify 'origin/main^{commit}')

# Worker topic branch: fast-forward only.
git merge --ff-only "$fresh_base_sha"

# Reviewer worktree: remain detached.
git switch --detach "$fresh_base_sha"
```

If either operation cannot remain a clean fast-forward/detached switch, stop and report the divergence. Do not reset, force-move, or discard work. After refresh, repeat the full provenance proof, dependency install when needed, relevant baselines, existing-plan revalidation, and reviewer/orchestrator gate before edits. Update only plan deltas affected by the fresh base unless product scope or acceptance criteria materially changed.

Completion criterion: both paths and the exact fetched `origin/main` SHA are recorded; the worker owns a topic branch created from that SHA; the reviewer is detached and read-only; clean/equality/ahead-behind proof passes; and the relevant baseline has passed or a blocker is explicit.

## Guardrails

- Do not create project-local worktrees in a tracked directory.
- Do not use local `main`, coordinator `HEAD`, or handoff prose as base evidence.
- Do not use `git reset --hard`, `git clean`, or checkout commands that would discard user changes unless the user explicitly asked for that operation.
- Do not continue implementation from a baseline that fails without reporting whether the failure is pre-existing.
- Do not run package managers other than pnpm in pnpm workspaces unless the repo explicitly uses a different manager.
- Do not treat the worktree as cleanup-safe until pushed branches, PRs, temporary files, and running processes have been accounted for.

## Cleanup

When a worker is done and the branch/PR no longer needs the local workspace:

```sh
git worktree remove <path>
git worktree prune
```

Only remove a worktree after confirming no uncommitted useful work remains in that worktree.
