---
name: triage
description: Clarify, classify, unblock, or close work items using current evidence and the project's readiness rules.
---

# Triage

Make work state truthful in the project's chosen source. Resolve [workflow selection](../workflow-setup/references/workflow-selection.md) and read only that mode's guide. Use the project's state vocabulary and readiness rules; the bundled readiness template is a default only when none exists.

Read the current item, parent plan, dependencies, owner, decisions, and linked PR/evidence. Check relevant source or reproduce a reported bug when that materially improves the recommendation. Read-only requests return recommendations without record updates.

For a ready delivery item, establish an observable outcome, testable acceptance, scope boundaries, resolved product choices, satisfied dependencies, and realistic proof expectations. Keep decision work and aggregate outcomes out of the delivery queue. A fixable implementation defect does not require a new product decision or planning phase.

When asked what needs attention, surface actionable changes: unclear intake, answered questions, changed blockers, missing evidence, conflicting ownership, or stale completion state. Prioritize using the available evidence and the user's requested scope.

Apply authorized corrections to the owning record and its actual relations. Record a material decision and rationale once; do not manufacture comments or duplicate repository status summaries. If scope or ownership would materially change, resolve that choice before applying it.

A rejected or cancelled item retains its reason and links. A dependent item is not automatically unblocked by cancellation. Concrete follow-ups need their own outcome and a link explaining why they fall outside the original scope.

Finish with the next state, supporting evidence, remaining blockers, and next action. Triage does not itself implement code, dispatch workers, or merge changes.
