# Linear Records

Use this guide only when the project declares `linear`. Read the declared Project/PRD and current issues through available Linear tools. Resolve actual teams, statuses, labels, and relation types from the live workspace; do not invent identifiers or keep a local status mapping.

| Record | Authoritative home |
| --- | --- |
| Product brief or PRD | Existing Linear Project document, description, or explicitly designated PRD issue |
| Discovery map | Project document linking distinct decision issues |
| Delivery work | Issues with acceptance criteria, scope, evidence, and owner |
| Grouping | Project and parent/sub-issue relations where useful |
| Dependencies | Native blocker relations, separate from grouping |
| Delivery state and decisions | Current issue state and concise decision/evidence updates |

Reuse the declared container. Ask for a missing team or Project choice only when it prevents the requested write. Prefer a linked Project document for a substantial PRD when supported; preserve an existing canonical PRD location. Create parent records and blockers before linking children, then read back the records and relations to verify the result.

Keep decision issues distinct from implementation work. A research answer or resolved decision may unblock a PRD without completing a delivery outcome. Refresh blockers before readiness or dispatch; apply the live state matching the project's readiness rules rather than assuming a status spelling.

The delivery owner updates the issue's implementation head, PR link, acceptance proof, and material blockers within delegated authority. Use links to detailed PR/check evidence. Change completion state only after the claimed outcome and authorized shipping decision are established; a green check alone is insufficient.

Use existing authorization for the requested Linear changes. A read-only request produces recommendations without comments, status changes, or new issues. Record a material decision once rather than posting a comment for every poll. Keep unrelated GitHub, deployment, task-creation, and external-message authority separate.

If Linear is unavailable, identify which read or write could not be verified. Continue independent source work or supply an explicitly unpublished draft when useful. Never claim a mutation succeeded without confirming it, and do not create repository work items as a substitute.
