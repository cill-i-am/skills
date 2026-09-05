# Repository Records

Use this guide only when the project declares `repo`: versioned Markdown is authoritative for planning and delivery state. Use the declared paths and branch. Follow an existing file format and state vocabulary; do not introduce a second task index, YAML schema, or status database.

For a new project, useful defaults are `docs/plans/` for PRDs and discovery maps and `docs/work/` for work items, with the remote default branch as the shared published record. Record the chosen paths and branch in the workflow declaration. Create files as work arises, without empty scaffolding. Each work item owns its status; a plan may link items without repeating their status.

## Work Records

A compact Markdown work item needs a stable unique identifier, outcome title, kind (`delivery`, `decision`, or an aggregate outcome), current state, plan/parent link if applicable, dependencies, acceptance criteria, scope, owner when assigned, and proof expectations. Record product decisions and external gates where they affect readiness. Use the [work-item template](../assets/docs/agents/issue-template.md) as a starting point, omitting unused fields.

Use the project's identifier convention. When none exists, use an outcome slug with a short random suffix, such as `export-saved-plan-a7c2f9`, and check for collisions in the current work set. Keep the identifier stable across title changes. Link to actual files and use the identifier in branch/PR references; do not manufacture Linear-like issue keys. Avoid a shared incrementing counter when independent branches can create work.

Express grouping as a plan/parent link and execution order as explicit dependency links. Read the linked records before declaring work unblocked. Check new dependencies for missing targets and cycles. A closed or cancelled dependency satisfies the dependent work only when its required outcome is established or the dependency is deliberately revised. Decision records do not enter the implementation queue.

Reuse the project's states. Without an existing vocabulary, `needs-grooming`, `needs-decision`, `ready`, `in-progress`, `in-review`, `done`, `blocked`, and `cancelled` are sufficient. This list is a starting convention, not an extra state system to impose on established projects.

## Shared State And Concurrent Work

Before dispatch or a state-changing decision, refresh the declared shared branch and relevant active branches/PRs. Unmerged changes are proposed updates, not shared published state. In a dirty checkout, inspect fetched snapshots or use an isolated worktree; never reset or overwrite unrelated changes to refresh a record.

The coordinator owns assignments and shared state transitions. One delivery owner edits an assigned work item with its implementation and evidence. Do not let several workers rewrite a central board or claim the same item from stale copies. Consult current owner/task/PR evidence before assigning work. Git alone does not provide a distributed claim lock: if ownership cannot be verified across coordinators, resolve that conflict before dispatch.

Keep record changes in the same scoped branch/PR as their related implementation where practical. Reconcile intervening record edits before publishing, preserving newer decisions and exposing genuine conflicts. Report whether an update is local, committed, or published; editing a file does not make the shared tracker current. Commit and push only within the user's authorization and repository policy.

## Delivery And Completion

The work item carries concise acceptance-to-proof results, blockers, PR links, reviewed implementation commit, and residual risks. Refer to a known implementation commit; do not try to embed the hash of the commit containing that reference into itself. Inspect later code changes before reusing its proof.

Before merge, use `in-review` with the pending shipping decision. After an authorized merge or other defined acceptance event, the coordinator records the confirmed result and moves the item to `done` through the repository's authorized publication path. A separate small record update may be needed because the merge outcome was unknowable beforehand. If that update cannot yet be published, report the stale shared state and pending action instead of claiming it is current. Projects may define a different completion event, but it must be explicit and evidenced.

Refresh PR/check state when reconciling work; PRs supply evidence and do not become a second manually maintained task tracker. Parent outcomes complete only when the combined claimed outcome is proven. Retain completed records and their links under the existing convention rather than deleting evidence or relocating files unnecessarily.
