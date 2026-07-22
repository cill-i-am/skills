---
name: review-swarm
description: Read-only multi-perspective review. Use for broad, risky, cross-boundary, or user-requested review of a diff, PR, or file scope covering regressions, security/privacy, reliability, runtime/UI behavior, contract drift, and test gaps before merge.
---

# Review Swarm

Run this exceptional capability only when explicitly requested or justified by
broad, security/privacy-sensitive, data-affecting, or genuinely cross-boundary
risk. It is not a routine production-ready dependency or workflow phase. Keep
it read-only; it has no edit, state, or merge authority and does not replace
`code-review` for standards-backed changed-code review.

## Scope

Prefer the smallest clear scope:

1. user-named files or PR
2. current git diff
3. branch diff against the target branch
4. recently touched files only if no better scope exists

Read the closest repo instructions and the relevant spec/Linear issue before reviewing. State any inferred intent.

## Review Lenses

Use subagents in parallel when available and useful; otherwise run the same lenses yourself.

- **Intent and regression:** does the diff satisfy the spec without extra drift?
- **Security and privacy:** are auth, authorization, secrets, trust boundaries, and sensitive data handled safely?
- **Reliability and performance:** are failure modes, retries, cleanup, concurrency, hot paths, and operational risks sound?
- **Contracts and coverage:** do APIs, schemas, config, migrations, routes, clients, and tests still line up?
- **Runtime and interaction verification:** for UI-facing or workflow claims, does the behavior work in a real browser or focused test, without visible jank, flashes of unstyled content, duplicate requests, or double submissions?

Every reviewer is read-only. Findings should include file/line or symbol, issue,
proof, impact, recommended fix, confidence, and one recommended disposition
from `docs/agents/execution-policy.md`: Fix before merge, residual risk,
follow-up, or human decision required.

Assign each subagent one lens or one clearly bounded scope. Do not run several agents with the same broad prompt unless you explicitly want independent confirmation of a high-risk area.

## Runtime Verification

Add a runtime verification lens when the diff touches frontend/UI, routes, forms, auth/session flows, navigation, preview/build config, or when the worker or acceptance criteria claim visible behavior changed.

Use a cheap, fast read-only subagent when available; otherwise run the probe yourself. Prefer the in-app Browser for local or preview targets. Use focused unit, component, or route tests when they are the narrower proof. Do not edit files or mutate production/provider state. If a flow would write external data, stop and report the blocked verification path.

Keep the probe small:

- load the changed route, screen, or preview target
- exercise one happy path and one risk interaction such as submit, retry, cancel, refresh, rapid click, or double submit
- check console errors, failed network requests, loading states, visible FOUC, layout shift, jank during interaction, disabled/loading affordances, duplicate requests, and responsive fit when relevant
- run the narrowest matching test subset when cheap, such as a changed test file, affected package test, component test, or route/form test

Runtime evidence should name the URL or command, flow, viewport when relevant, result, artifacts such as screenshots when useful, and any skipped checks with a reason.

## Synthesis

The main agent owns the verdict:

- merge duplicates
- discard weak, speculative, or style-only feedback
- turn unclear intent into open questions instead of false findings
  - enforce exactly one recommended disposition and order proven defects before
    residual risk and follow-ups
- prevent reviewers from expanding acceptance criteria; route useful unrelated hardening to outcome-named follow-up work

After implementation starts, review the exact working head, tests, runtime
evidence, and focused correction deltas rather than restarting architecture
planning. Treat unproven possibilities as questions to the orchestrator, not
blockers.

If there are no material issues, say so plainly and name any residual test or verification risk.

Completion criterion: every lens has either a concrete finding, a stated no-material-issue result, or a stated reason it did not apply; speculative findings are dropped or downgraded to questions before output.
