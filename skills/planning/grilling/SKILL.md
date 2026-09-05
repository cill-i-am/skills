---
name: grilling
description: Challenge a proposed product or architecture decision with evidence and focused questions.
---

# Challenge the Plan

Inspect the references and code needed to understand the proposed choice. Do not ask the user to repeat facts already available. Focus on decisions that could change the outcome, scope, ownership, authority, or failure behaviour.

Expose hidden assumptions and tradeoffs, recommend a direction, and ask concise questions only where the answer matters. Group independent questions when it reduces back-and-forth. Accept settled decisions; stop questioning when further answers would not change the next useful step.

A challenge-only request produces findings and decisions. When the user also asks to document or implement the result, continue that authorized work once the needed decisions are settled. Record durable choices in the repository's product decisions or ADRs when appropriate; do not create a second decision ledger. Preserve user-authored meaning and leave unresolved choices explicit.

Use [domain modeling](../domain-modeling/SKILL.md) when canonical language, ownership boundaries, or the need for an ADR is the open question. Use [wayfinder](../wayfinder/SKILL.md) when a named destination still needs a decision route across sessions. These are conditional aids, not prerequisites for an already clear specification or implementation request.
