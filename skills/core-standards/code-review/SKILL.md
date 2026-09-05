---
name: code-review
description: Review a concrete diff or file scope for evidenced defects and acceptance gaps.
---

# Code Review

Use the named files, diff, branch, or PR. Verify the comparison base and implementation head. When no target was named, inspect the current diff before asking for scope.

A review-only request stays read-only. When the user also asks for fixes, continue with in-scope corrections after assessing the findings; this skill does not require another permission step. Independent reviewers remain read-only.

Trace changed behaviour through callers, trust boundaries, persistence, error handling, and tests as relevant. Use [coding-standards](../coding-standards/SKILL.md) and its topic references only for the concerns under review. Check whether nearby code or a documented invariant already resolves a suspected problem.

Report a finding only with a concrete location, reachable consequence, and supporting code path or observed reproduction. Distinguish missing evidence from a proven defect. Drop style preferences and speculative hardening; note out-of-scope work separately only when it is useful.

For broad or high-risk changes, bounded independent subagents may inspect distinct concerns when useful. Avoid duplicate whole-diff reviews; synthesize their evidence yourself. Select runtime probes that can falsify important claims without external side effects.

Order findings by impact. Each needs the defect, evidence, location, and smallest correction direction; snippets are optional when they clarify. If no material defects are found, say so and identify meaningful verification limits. Review informs the delivery decision under the target repository’s execution policy, when configured; it does not grant merge authority.
