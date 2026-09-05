---
name: worker
description: Implement one ready work item through a verified delivery slice and a reviewable PR.
---

# Worker

Own implementation of the assigned work item. Resolve [workflow selection](../workflow-setup/references/workflow-selection.md), load only the chosen mode's guide, and refresh the actual item, plan, dependencies, and project instructions. Use the project's execution policy for review and shipping authority.

If the outcome, acceptance criteria, boundaries, dependencies, and proof expectations are clear, begin. Investigate ordinary technical uncertainty inside the work; do not replace a ready item with another approval plan.

Use `worktree-isolation` when the assignment needs an isolated lane. Preserve the exact dispatched base, one mutation owner, and unrelated local changes. An existing authorized lane can be reused after checking its state. Follow the repository's dependency and baseline checks.

Build the smallest complete outcome through real seams. Use relevant engineering, debugging, and simplification skills as the changed surface warrants. Exercise the actual changed behavior early, then map acceptance claims to focused tests, runtime/artifact proof, or an explicit unproven external gate.

Open or update the requested PR once a meaningful result is reviewable. Fix reproducible in-scope implementation, test, CI, and review defects without restarting authorization. Changes to scope, product meaning, destructive effects, or external actions still need the applicable authority.

Prepare the exact implementation head, scope, evidence, finding dispositions, and remaining risks for the project's review/acceptance owner. `production-ready` can aggregate that evidence; it does not create another review stack. Use `ci-watch` only when assigned the PR's next check, reusing an existing watcher.

Update the authoritative work item within delegated authority, following the selected mode's concurrency and publication rules. Keep detailed code/check evidence in the PR and link it. Do not mark a repository item done before its declared acceptance event or claim that an unpublished local edit changed shared state.

Continue until the requested delivery outcome is verified and reviewable, or a concrete unresolved scope, authority, provenance, or external dependency prevents it. Report the exact head, proof, record/PR publication state, and any remaining action with its owner.
