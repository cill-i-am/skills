# Layouts

These are adaptable working templates, not a requirement to fill every heading.
Replace bracketed text. Remove drafting instructions from the final output.
User-specified structure takes priority.

## One-pager

Use this order by default. Merge adjacent sections when doing so improves the
reading flow. Give most space to the proposal and the reasoning behind it.

```markdown
# [Short, descriptive project title]
[Owner, if known] · [Date] · Draft

## Objective
[One sentence: the outcome and who benefits.]

## Background
[Current problem, why it matters now, and the most relevant evidence.]

## Goals and non-goals
[The outcome to achieve and the plausible scope extensions excluded.]

## Proposed approach
[What changes, what stays, the key boundary or flow, and why this approach.]

## Trade-offs and alternatives
[The main cost accepted; strongest credible alternative and why not now.]

## Risks and validation
[Most important failure or uncertainty; how success and safety will be checked.]

## Delivery
[First demonstrable increment and the critical rollout or migration condition.]

## Open questions and decision needed
[What remains unresolved, next evidence/action, and the review decision needed.]
```

Keep essential references close to their claims. Add a brief reference line only
when useful. A tiny diagram can replace a dense paragraph; it cannot substitute
for a recommendation. Do not append a full-length design under a "one-pager."

## Full design doc

Keep the opening concise. Select the later sections according to the project.
Do not generate boilerplate for concerns the change genuinely does not affect.

```markdown
# [Project title]
[Author/owner, date, status, canonical location and reviewers when known]

## Objective and decision summary
[Outcome, recommendation, and what this review should decide.]

## Background and current state
[Evidence, motivation, existing behavior, and relevant earlier work.]

## Goals and non-goals
[Success conditions and scope boundaries.]

## Constraints and assumptions
[Separate fixed requirements from hypotheses still needing validation.]

## Proposed design
[System responsibilities, data flow, state ownership, and major decisions.]
[Include only the subsections below that carry design consequences.]

### Scenarios and interfaces
[Representative behavior, permissions, and important boundary contracts.]

### Architecture and dependencies
[Important components and dependencies; reasons and trade-offs.]

### Data lifecycle
[Persistence, compatibility, retention, and deletion implications.]

## Operational expectations
[Relevant performance/availability objectives and how to observe failures.]
[Include consequential monitoring, alerting, and logging decisions.]

## Security, privacy, and compliance
[Relevant threats, sensitive information, mitigations, and review needs.]
[Split these into separate sections when each warrants substantive treatment.]

## Validation and delivery
[How to disprove risky assumptions, useful milestones, rollout, and recovery.]

## Alternatives and trade-offs
[Credible alternatives, consistent criteria, and reasons for the recommendation.]

## Open questions
[Issue, impact, options, next step, and owner when known.]

## Decision history
[Resolved questions, decision and reason, date/authority when known.]

## References and appendices
[Relevant sources, existing discussions, large contracts, and supporting detail.]
```

A table of contents is useful only when the document is long enough to need it.
Move lengthy review discussions to an appendix or linked record, preserving the
link and final decision. Do not erase the reason behind a changed decision.
