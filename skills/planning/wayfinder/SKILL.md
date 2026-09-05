---
name: wayfinder
description: Map and resolve interdependent product decisions before work is ready for a PRD.
---

# Wayfinder

Use decision discovery when a destination is clear but the route depends on unresolved choices across sessions. Skip it when the available context already supports a trustworthy PRD.

Read the project's workflow declaration and use `workflow-setup` to locate its selection guide and chosen storage reference. Read only that mode. The canonical discovery map and decision records live in the chosen source; a read-only request can stay inline without setup or writes.

The map records the destination, resolved decision links, precise open questions, in-scope uncertainty that is not yet a question, out-of-scope boundaries, and what must be known for a PRD. Keep it as an index rather than duplicating each decision's evidence.

A decision record owns one question, evidence, options, dependencies, and resolution. Distinguish decisions requiring a person's product/risk choice from factual research that can proceed autonomously. Use `grilling` or `domain-modeling` when the destination, vocabulary, or decision itself needs clarification.

Represent dependencies in the selected source. The open, unblocked decisions form the available frontier. Resolve the requested scope; do not impose a one-decision or one-session quota. Research and prototypes need their ordinary tool and write authority.

Refresh concurrent decisions before recording a result. Add newly exposed questions and dependencies, remove uncertainty that has become precise, and preserve explicit exclusions. Record each settled decision once and link it from the map.

Keep decision records visibly separate from delivery work. Resolving a question does not implement its answer, grant execution authority, or make a decision record dispatchable as a coding task.

Discovery is complete when the PRD can describe the requested behavior without inventing intent. Hand its settled decisions and remaining non-blocking unknowns to `to-prd`; `to-issues` slices the agreed plan into delivery outcomes. Continue across those steps only when the user's request includes them.
