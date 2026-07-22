# Triage States

Use triage to turn vague work into Ready vertical slices.

## Intake Buckets

- `Needs Grooming`: unclear outcome, missing acceptance criteria, or missing
  owner.
- `Needs Decision`: product meaning or a material irreversible choice is open.
- `Ready`: one delivery owner can begin without inventing product meaning.
- `Blocked`: a genuine human decision or unavailable external dependency
  prevents progress.
- `Duplicate`: another issue owns the work.
- `Won't Do`: intentionally closed with rationale.

## Ready Bar

Before marking an issue `Ready`, verify:

- observable outcome and testable acceptance criteria;
- explicit scope boundaries and non-goals;
- dependencies represented as Linear blockers;
- material product decisions already made;
- a first vertical tracer can be identified;
- proof-of-outcome expectations name the real seam;
- external, destructive, credential, provider, customer-data, or human gates
  are explicit;
- scope fits one delivery owner and normally one PR.

A Ready issue is normally the worker's plan. Do not require a second planning
phase or default pre-edit reviewer. Record the orchestrator's Tier A, B, or C
judgment in an existing natural field or comment when useful; do not create a
new form or status.

## Recommendations

Agents should recommend a concrete next state with tradeoffs. Escalate only when
the decision materially changes product meaning, cost, security, privacy, data
safety, or external authority. Resolve ordinary technical uncertainty during
Build.
