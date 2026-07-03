---
name: review-swarm
description: Read-only multi-perspective review. Use for broad, risky, cross-boundary, or user-requested review of a diff, PR, or file scope covering regressions, security/privacy, reliability, contract drift, and test gaps before merge.
---

# Review Swarm

Run a high-signal, read-only review. Do not edit files as part of this skill.
This skill finds broad risk; it has no merge authority and does not replace
`code-review` for standards-backed changed-code review.

## Scope

Prefer the smallest clear scope:

1. user-named files or PR
2. current git diff
3. branch diff against the target branch
4. recently touched files only if no better scope exists

Read the closest repo instructions and the relevant spec/Linear issue before
reviewing. State any inferred intent.

## Review Lenses

Use subagents in parallel when available and useful; otherwise run the same
lenses yourself.

- **Intent and regression:** does the diff satisfy the spec without extra drift?
- **Security and privacy:** are auth, authorization, secrets, trust boundaries,
  and sensitive data handled safely?
- **Reliability and performance:** are failure modes, retries, cleanup,
  concurrency, hot paths, and operational risks sound?
- **Contracts and coverage:** do APIs, schemas, config, migrations, routes,
  clients, and tests still line up?

Every reviewer is read-only. Findings should include file/line or symbol, issue,
why it matters, recommended fix, severity, and confidence.

Assign each subagent one lens or one clearly bounded scope. Do not run several
agents with the same broad prompt unless you explicitly want independent
confirmation of a high-risk area.

## Synthesis

The main agent owns the verdict:

- merge duplicates
- discard weak, speculative, or style-only feedback
- turn unclear intent into open questions instead of false findings
- order by severity and confidence

If there are no material issues, say so plainly and name any residual test or
verification risk.

Completion criterion: every lens has either a concrete finding, a stated
no-material-issue result, or a stated reason it did not apply; speculative
findings are dropped or downgraded to questions before output.
