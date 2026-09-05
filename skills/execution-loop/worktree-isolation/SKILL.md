---
name: worktree-isolation
description: Create or inspect an isolated Git checkout without disturbing existing work.
---

# Worktree Isolation

Inspect Git state, existing worktrees, and the requested starting point. Preserve unrelated changes. Reuse a suitable owned checkout; do not create another lane merely because this skill was loaded.

For new implementation work, fetch the remote default and resolve it dynamically. An explicitly requested branch or continuation takes precedence over the default; record its actual base instead of silently switching it.

```sh
git fetch --prune origin
remote_default=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD)
base_sha=$(git rev-parse --verify "${remote_default}^{commit}")
```

If the remote default is unavailable, resolve it from the remote rather than guessing. If network access fails, distinguish a known local revision from a freshly fetched base and continue only work that does not depend on remote freshness.

Choose an external path or an ignored project worktree directory. Create the checkout at the intended revision and a `codex/<slug>` branch for implementation. For read-only exact-head review, use the immutable requested revision and remain detached.

```sh
git worktree add --detach <worktree-path> <base-sha>
# In the implementation worktree:
git switch -c codex/<slug>
git status --porcelain
git rev-parse HEAD
```

Confirm the new tree is clean and at the intended revision. Install dependencies and establish a relevant baseline only when the task needs them; documentation edits do not need an application install.

Do not reset, clean, stash, force-move, or rebase unrelated work. Remote advancement does not authorize rewriting an active branch. Refresh only when integration depends on it and preserve useful local commits.

Remove a worktree only when no useful uncommitted work, active process, or branch/review dependency needs it. Report the path, branch/revision, and any material provenance limitation.
