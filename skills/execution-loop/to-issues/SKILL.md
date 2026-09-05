---
name: to-issues
description: Slice an agreed plan into bounded work items with outcomes, acceptance criteria, and dependencies.
---

# To Issues

Turn the current agreed PRD or plan into independently deliverable work in the project's chosen source. Resolve [workflow selection](../workflow-setup/references/workflow-selection.md) and read only that mode's guide. Read-only requests produce proposed slices without publishing records.

Check the source plan and existing work before adding items. Unresolved decision work stays visibly separate from implementation; resolve material product choices through `to-prd` or `wayfinder` before declaring affected slices ready.

Each delivery item should produce an observable, independently verifiable outcome through the necessary layers. Keep technical tasks inside the item unless they have a useful independent outcome. Use a shallow plan / parent outcome / delivery item structure only where grouping helps.

Include the outcome, scope and non-goals, acceptance criteria, proof expectations, dependencies, material decisions, and any external authority required. Use the project's template or the work-item template linked by the workflow guide. A ready item should give one delivery owner enough context to begin without writing a replacement plan.

Represent parent grouping and execution dependencies separately. Create missing parent and blocker records before linking them; verify targets and dependency cycles. Mark affected work unready when a decision or dependency remains unresolved. Do not confuse a decision record with a delivery item.

Publish only within the requested or existing authority. Reuse existing items, preserve the parent PRD's meaning, and link the resulting work graph from it without maintaining duplicate status lists. Verify records and relations after writing.

Report the outcome hierarchy, dependency order, ready work, unresolved choices, and whether the result is a draft or a verified update in the selected source.
