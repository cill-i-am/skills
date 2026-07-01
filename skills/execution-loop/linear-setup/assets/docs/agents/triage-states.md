# Triage States

Use triage to turn vague work into executable slices.

## Intake Buckets

- `Needs Grooming`: unclear goal, missing acceptance criteria, or missing owner.
- `Needs Decision`: blocked on a product, technical, or sequencing choice.
- `Ready`: enough context exists for a worker and reviewer.
- `Blocked`: external dependency prevents progress.
- `Duplicate`: another issue owns the work.
- `Won't Do`: intentionally closed with rationale.

## Grooming Checklist

Before marking an issue `Ready`, verify:

- the desired user or system behavior is clear
- acceptance criteria are testable
- dependencies are represented as Linear blockers
- scope is small enough for one PR
- required skills, docs, or repo constraints are named
- risky provider mutations or destructive actions are explicit

## Recommendations

Agents should make recommendations with tradeoffs instead of leaving vague open questions. Escalate only when the decision materially changes product behavior, architecture, cost, security, or data safety.
