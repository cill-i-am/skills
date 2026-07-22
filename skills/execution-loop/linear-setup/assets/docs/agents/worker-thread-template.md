# Worker Thread Template

Use this to dispatch one delivery owner for a Ready issue.

## Mission

Implement Linear issue `{ISSUE_ID}` through the smallest proven vertical slice.

## Required Context

- Project or PRD: `{PROJECT_OR_PRD}`
- Issue: `{ISSUE_LINK}`
- Risk tier: `{RISK_TIER}`
- Exact fetched remote-default base SHA: `{BASE_SHA}`
- Worker worktree: `{WORKTREE_PATH}`
- Topic branch: `codex/{ISSUE_ID}-{SLUG}`, created and owned by the worker
- Relevant capability skills: `{SKILLS}`
- Genuine human/external gates: `{EXTERNAL_GATES}`

## Requirements

- Follow `AGENTS.md`, `docs/agents/execution-policy.md`, and the live issue.
- Treat this handoff as orientation. Refresh Linear, fetch/prune the remote,
  dynamically resolve `origin/HEAD`, and prove the isolated tree and branch begin
  clean at the exact dispatched SHA before editing.
- Confirm the issue meets the Ready bar. If it does, begin; do not rewrite the
  issue as a plan. Post at most one compact execution note with the base/branch,
  first tracer or failing test, changed surfaces, intended physical proof, and
  any newly discovered divergence.
- Tier A has no pre-edit reviewer. Tier B may have one already named, focused,
  timeboxed review of the dangerous seam. Tier C gates only the external or
  irreversible effect when safe internal work is separable.
- Build the smallest end-to-end tracer, use capability skills inside Build,
  test through real seams, physically exercise the changed outcome, simplify,
  and open a draft PR once the tracer works.
- Fix reproducible in-scope implementation defects without requesting a new
  planning or authorization cycle.
- Stop for a material product change, scope expansion, unsafe provenance,
  credentials/real data, or an unauthorized destructive/external action.

## Done Evidence

Report the exact head and changed scope, acceptance-to-proof mapping, commands
and results, physical/runtime evidence, draft PR, external gates, and residual
risks. The orchestrator activates exact-head review and owns the final decision.
