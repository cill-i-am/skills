---
name: worktree-isolation
description: Create and validate clean Git worktrees from the exact fetched remote default. Use for worker lanes, reviewers when review begins, refreshes, parallel implementation, and experiments that must not disturb existing work.
---

# Worktree Isolation

Create a clean, reproducible workspace with provable fetched-remote ancestry.
Preserve unrelated user work and use non-destructive Git operations.

## Resolve The Base

Never base a new lane on local `main`, coordinator `HEAD`, or handoff prose.
Fetch and resolve the remote default dynamically:

```sh
git fetch --prune origin
remote_default=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD)
base_sha=$(git rev-parse --verify "${remote_default}^{commit}")
printf 'remote_default=%s\nbase_sha=%s\n' "$remote_default" "$base_sha"
```

If `origin/HEAD` is unavailable or ambiguous, stop and resolve the repository's
actual remote default rather than guessing `main`.

## Coordinator Setup

1. Inspect the repository root, current branch, status, worktree list, and any
   applicable `AGENTS.md`. Do not move, stash, clean, or overwrite unrelated
   coordinator changes.
2. Choose an existing ignored `.worktrees/` or `worktrees/` directory, or an
   external worktree root. Verify project-local ignore safety.
3. Fetch and resolve the exact base once for the lane being created.
4. Create the worker detached at that exact SHA:

   ```sh
   git worktree add --detach <worker-path> "$base_sha"
   ```

5. The worker creates and owns its topic branch inside that worktree:

   ```sh
   git switch -c codex/<issue-key>-<slug>
   ```

6. Install dependencies and run the smallest documented baseline.
7. Report the path, remote default, base SHA, branch, install, baseline, and any
   blocker.

Do not create an idle routine reviewer worktree at worker dispatch. When exact-
head review begins, fetch the current remote default, create one detached
reviewer worktree from it, fetch the requested immutable PR head, and inspect
that head read-only. For a focused Tier B pre-edit review, create the reviewer
only when the orchestrator names the dangerous seam.

## Provenance Proof

After a fresh fetch, run inside a new worker lane before edits:

```sh
git status --porcelain
git branch --show-current
git rev-parse HEAD
git rev-parse "$remote_default"
git merge-base HEAD "$remote_default"
git rev-list --left-right --count HEAD..."$remote_default"
```

Required initial result:

- status is empty;
- branch is the expected worker topic branch;
- `HEAD`, fetched remote default, and merge-base are the same SHA;
- ahead/behind is `0 0`.

For exact-head review, prove the reviewer stays detached, the working tree is
empty, and `HEAD` equals the immutable requested review SHA. The reviewer need
not equal the latest remote default; that remote is the comparison base, not the
implementation head.

## Remote Advance

If the remote default advances before a worker has created commits, refresh only
when the tree is clean and the topic branch can fast-forward:

```sh
git fetch --prune origin
remote_default=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD)
fresh_base_sha=$(git rev-parse --verify "${remote_default}^{commit}")
git merge --ff-only "$fresh_base_sha"
```

Repeat the provenance proof and relevant baseline. Once implementation commits
exist, do not automatically reset, rebase, or force-move them. Report divergence
and let the orchestrator choose the repository's normal integration path.

## Guardrails

- Do not use `git reset --hard`, `git clean`, forced branch movement, or any
  checkout that discards useful work.
- Do not continue from an unexplained failing baseline.
- Do not use another package manager in a pnpm workspace unless instructed.
- Reviewer lanes remain detached and read-only.
- Remove a worktree only after proving it contains no uncommitted useful work
  and no active process or branch/PR dependency still needs it.

## Cleanup

After confirmation that cleanup is safe:

```sh
git worktree remove <path>
git worktree prune
```

Completion criterion: each active lane has one owner, exact fetched-remote or
immutable-head provenance appropriate to its phase, a clean tree, and an honest
baseline or blocker; no existing user work was disturbed.
