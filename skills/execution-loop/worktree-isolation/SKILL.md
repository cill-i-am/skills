---
name: worktree-isolation
description: Git worktree isolation for agent work. Use when creating, validating, or handing off isolated worktrees for Codex worker threads, reviewer threads, feature branches, parallel implementation, or experiments that must not disturb the current workspace.
---

# Worktree Isolation

Use this skill when a worker or orchestrator needs an isolated repository
workspace. The goal is a clean, reproducible starting point, not clever branch
management.

## First Decision

If the Codex thread tool can create a worker with a worktree environment, prefer
that. Include the branch naming convention, issue key, repo path, and setup
expectations in the thread prompt, then let the worker verify the provided
worktree before editing.

Use manual `git worktree` setup when the current thread must create the
workspace itself.

## Manual Worktree Setup

1. **Confirm git state.** Run `git rev-parse --show-toplevel`,
   `git branch --show-current`, and `git status --short`. If the current tree
   has unrelated changes, do not move or clean them; create isolation from the
   current `HEAD` and report the existing dirt when relevant.
2. **Choose the directory.** Prefer an existing ignored `.worktrees/`, then
   existing ignored `worktrees/`, then a global temp/worktree root outside the
   project. Read the nearest `AGENTS.md` for a local preference.
3. **Verify ignore safety.** For project-local directories, run
   `git check-ignore -q .worktrees` or `git check-ignore -q worktrees` before
   creating the worktree. If the chosen directory is not ignored, add the ignore
   entry as part of the normal change or choose an external directory.
4. **Create the branch/worktree.** Use `codex/<issue-key>-<slug>` for Linear
   workers unless instructed otherwise.
5. **Install and verify baseline.** Follow repo instructions. In this bundle's
   default TypeScript projects, use pnpm. Run the smallest documented baseline
   check that proves the worktree starts usable.
6. **Report the handoff.** State worktree path, branch, base commit, install
   command, baseline command/result, and any pre-existing or setup blocker.

Completion criterion: the worker can name the exact isolated path and branch,
the path is safe from accidental tracking, dependencies are available or the
blocker is explicit, and a baseline check has either passed or been reported
with evidence.

## Guardrails

- Do not create project-local worktrees in a tracked directory.
- Do not use `git reset --hard`, `git clean`, or checkout commands that would
  discard user changes unless the user explicitly asked for that operation.
- Do not continue implementation from a baseline that fails without reporting
  whether the failure is pre-existing.
- Do not run package managers other than pnpm in pnpm workspaces unless the repo
  explicitly uses a different manager.
- Do not treat the worktree as cleanup-safe until pushed branches, PRs,
  temporary files, and running processes have been accounted for.

## Cleanup

When a worker is done and the branch/PR no longer needs the local workspace:

```sh
git worktree remove <path>
git worktree prune
```

Only remove a worktree after confirming no uncommitted useful work remains in
that worktree.
