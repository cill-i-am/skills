---
name: worker
description: Implement one Ready Linear issue end to end. Use for an assigned delivery slice that needs a narrow tracer, physical proof, draft PR, in-scope fixes, and concise handoff evidence.
---

# Worker

One worker owns one Ready issue through Build. The orchestrator owns the final
decision. Authority and finding disposition come from
`docs/agents/execution-policy.md`.

## Read First

- `docs/agents/execution-policy.md`
- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- the live issue, Project/PRD, blockers, comments, and nearest `AGENTS.md`

If repo-local docs are absent, read the bundled templates under
`../linear-setup/assets/docs/agents/` and state that setup is still needed.

## Dispatch Check

1. Refresh live Linear and confirm the observable outcome, acceptance criteria,
   scope boundaries, dependencies, proof expectations, risk tier, and
   human/external gates.
2. Use `worktree-isolation` to fetch/prune the remote, dynamically resolve
   `origin/HEAD`, prove the isolated tree begins clean at the exact dispatched
   SHA, and create the worker-owned `codex/<issue>-<slug>` branch there.
3. Install dependencies and run the smallest honest baseline required by the
   repository.

If the issue meets the Ready bar, begin. Do not rewrite it as a plan or wait for
a reviewer to grant edit authority. At most, post a compact execution note with
the exact base and branch, first tracer or failing test, likely changed surfaces,
physical proof, and newly discovered divergence.

Tier A has no pre-edit review. If the orchestrator selected Tier B, respect the
single named dangerous seam and begin the smallest safe tracer as soon as that
focused review is bounded. For Tier C, stop only at the unauthorized external or
irreversible effect when safe internal work is separable.

## Build

1. Implement the smallest end-to-end outcome through existing seams. Prefer a
   real vertical tracer over more prose.
2. Use relevant capability skills inside Build: `tdd`, coding standards,
   `effect-ts`, `systematic-debugging`, and `simplify` as the changed surface
   warrants. They do not create workflow gates.
3. Begin physical proof during implementation. Exercise the actual CLI,
   browser, process, service, database, queue, artifact, restart, replay, or
   other real changed seam with disposable resources where practical.
4. Map each material acceptance criterion to automated proof,
   physical/runtime proof, or an explicit unproven external gate.
5. Open a draft PR as soon as a meaningful tracer works.
6. Fix reproducible in-scope implementation, CI, and review defects without
   requesting a new authorization cycle. Use a focused correction rather than
   broad replanning.
7. Simplify before requesting exact-head review. Delete speculative abstraction,
   duplicated paths, and fallbacks that hide broken contracts.

## Review And CI

Run `production-ready` to aggregate evidence; it does not start a review stack.
The orchestrator activates the independent exact-head reviewer. Address concrete
`Fix before merge` findings inside scope, and return other dispositions to the
orchestrator.

After a PR exists, use `ci-watch` only if this worker owns the PR's single next
poll. Reuse an existing watcher; do not create worker and project watchers for
the same event. Keep the watcher delta-only and stop it cleanly.

## Stop Conditions

Stop and report when:

- product meaning or acceptance criteria must materially change;
- the fix crosses issue scope;
- safe fetched-remote provenance cannot be established;
- a destructive, provider, publication, production, credential, customer-data,
  spend, or irreversible effect lacks authority;
- a genuine external dependency is unavailable;
- the claim requires external proof that cannot be safely separated.

A compiler error, flaky tool, ordinary defect, or reviewer preference is not a
human gate. Diagnose, reproduce, fix, and continue when it remains in scope.

## Handoff Evidence

Report the exact head, implemented scope, acceptance-to-proof mapping, commands
and exact results, physical/runtime evidence, PR and CI state, finding fixes,
external gates, residual risks, and the single watcher owner if one remains.
Keep durable evidence concise in Linear and the PR.

Completion criterion: the Ready issue has a narrow implementation head, every
material outcome claim has direct proof or an honest external gate, the diff is
simplified, and the orchestrator has enough current evidence to activate review
and decide.
