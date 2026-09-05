---
name: to-prd
description: Turn product context into a clear PRD with outcomes, boundaries, and acceptance expectations.
---

# To PRD

Create or update the canonical product brief in the project's chosen source. Resolve [workflow selection](../workflow-setup/references/workflow-selection.md) before durable writes and load only that mode's guidance. An explicitly requested inline draft needs no tracker setup or mutation.

Synthesize the conversation, current plan, relevant source, domain docs, and any discovery map. Ask only about unresolved choices that change product meaning. Use the existing PRD shape or the bundled template linked by the workflow guide.

The result should explain the problem, users and outcomes, goals and non-goals, intended behavior, material decisions, acceptance and proof expectations, risks, references, and open questions. Include implementation details only when they constrain the solution.

If decision discovery still contains uncertainty that would force invented intent, keep the PRD provisional and use `wayfinder` for the unresolved decisions. A resolved discovery map contributes links and decisions; it does not substitute for a coherent PRD.

Within the requested scope, update the existing authoritative brief or create one in the declared location. Verify the write. Keep settled product intent in that owner and link from maps or work items. A read-only request returns a draft without files, tracker comments, or status changes.

Finish when the PRD can be sliced without inventing product meaning, or state the precise unresolved decision. Creating delivery issues is a separate outcome handled by `to-issues` when requested or already authorized.
