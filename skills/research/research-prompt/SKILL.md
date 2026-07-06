---
name: research-prompt
description: Write a self-contained research brief for a human researcher or deep-research agent. Use when the user asks for a research prompt, research brief, deep research prompt, market/vendor/library investigation prompt, or wants to turn a vague research need into a precise source-backed task.
---

# Research Prompt

Turn a vague research need into one brief that a fresh researcher can execute
without follow-up questions.

## Deliverable

Return one self-contained paragraph unless the user asks for another format.
Do not run the research in this skill. Use `../deep-research/` when the user
wants the research executed.

## Process

1. Identify the single decision the research should inform.
2. Gather any known context from the conversation, repo docs, product docs,
   issues, or source files.
3. Write a short plain-English setup for a researcher with no prior context.
4. Add 3-6 numbered subquestions inline.
5. Add include and avoid constraints.
6. Specify source quality, contradiction handling, and the required output shape.
7. Compress to one paragraph and remove filler.

Ask only when the decision, audience, timeframe, or source constraints are
unclear and cannot be inferred from available context.

## Prompt Rules

- Prompt the job, not the topic.
- Lead with the decision or end use.
- Include names, dates, products, versions, geography, constraints, and known
  facts that affect the search.
- Prefer primary sources: official docs, papers, changelogs, filings,
  repositories, standards, source code, and first-party statements.
- Treat forums, social posts, and marketing pages as weak signal unless the
  task is explicitly about sentiment or positioning.
- Require confirmed facts, inferences, and unresolved uncertainty to be
  separated when sources conflict.
- Require a gap pass before finishing: list thinly sourced claims, search again
  to close them, then disclose remaining gaps.
- Require each finding to include a source link, the specific claim, and why it
  matters to the user's decision.

## Template

```md
For a researcher with no prior context: <brief setup of the project/product/topic and why this research matters>. Research <topic and identifiers> to answer one question: <decision question> - for <decision/end use>. Find: (1) <subquestion>; (2) <subquestion>; (3) <subquestion>. Include <constraints>; avoid <constraints>. Prefer primary sources; treat forums, social, and marketing as weak signal unless directly relevant. If sources conflict, separate confirmed facts, inference, and unresolved uncertainty. Do not stop at the first plausible answer: corroborate key claims with independent primary sources where available, and say where sources are scarce. Before finishing, do a gap pass for contradictions, single-source claims, and missing evidence, then search again to close those gaps. For each finding, provide the source link, the specific claim, and why it matters. Output a cited markdown report.
```

Completion criterion: the final prompt is self-contained, has one decision, has
3-6 numbered subquestions, states source standards, and defines the expected
cited output.
