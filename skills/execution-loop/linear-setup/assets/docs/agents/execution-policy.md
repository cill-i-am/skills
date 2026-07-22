# Execution Policy

This document is the canonical owner of workflow phases, role authority, risk
selection, finding disposition, human gates, and watcher ownership.

## Policy Precedence

1. This execution policy owns authority and state transitions.
2. Role skills add role-specific behavior without changing that authority.
3. Templates render this policy without inventing gates.
4. Capability skills provide techniques inside a phase; they do not grant or
   withhold workflow authority.
5. Project instructions may narrow scope or add product-specific safety
   boundaries, but should not duplicate generic ceremony.

When instructions conflict, use the highest applicable source and report any
project-specific safety constraint that narrows it.

## Delivery Contract

The default is one Ready issue, one delivery owner, zero or one compact
execution note, one implementation, one independent exact-head review, one
focused correction pass when needed, and one orchestrator shipping decision.

The four workflow phases are:

1. **Dispatch:** reconcile live issue and repository state, confirm readiness,
   choose the risk tier, establish exact fetched-remote provenance, assign one
   delivery owner, and name genuine external or human gates.
2. **Build:** implement the smallest end-to-end outcome, use capability skills
   within the work, exercise a real seam early, simplify continuously, and open
   a draft PR once a meaningful tracer works.
3. **Verify:** review the exact implementation head, acceptance criteria,
   automated checks, and physical proof; classify findings; apply one focused
   correction pass for proven blockers.
4. **Decide:** the orchestrator chooses to merge, accept residual risk, create a
   follow-up, or ask the human for a genuine decision.

Review, CI, production-ready evidence, comments, and heartbeats inform these
transitions. They do not own them.

## Ready Issues And Planning

A Ready issue is normally the implementation plan. It must contain:

- an observable outcome and testable acceptance criteria;
- important boundaries and non-goals;
- represented dependencies;
- material product decisions;
- expected proof of outcome;
- external-effect and human-authority constraints.

If those conditions hold, the worker begins. A compact execution note may add
only volatile implementation facts such as the exact base and branch, first
tracer or failing test, likely changed surfaces, runtime proof, and discovered
divergence. It is evidence, not an approval artifact.

Use a separate planner before readiness when product meaning, acceptance
criteria, foundational contracts, or irreversible data decisions remain
unresolved. Minor technical uncertainty should be resolved with focused
investigation, code, or tests rather than a replacement plan.

## Risk Tiers

Risk tier is an orchestrator judgment, not a new form or status.

- **Tier A — routine reversible work:** one worker begins immediately; no
  pre-edit reviewer; build a tracer, gather physical proof, open a draft PR,
  obtain one exact-head review, make one focused correction if needed, then
  decide.
- **Tier B — high-risk internal work:** migrations, privacy/security boundaries,
  replay or idempotency, foundational public contracts, destructive cleanup,
  auth, or hard-to-reverse data meaning may receive one focused, timeboxed
  pre-edit review of the dangerous seam. It must allow the smallest safe tracer
  or identify a genuine human/external blocker; it must not demand whole-package
  completeness. Final review still targets the exact implementation head.
- **Tier C — external or irreversible effects:** production/provider mutation,
  real credentials or customer data, spend, publication, destructive cloud
  actions, irreversible migration execution, or legal/policy decisions require
  explicit human approval for the effect. Safe internal or provider-free proof
  may continue when the issue separates it from the external outcome.

## Role Authority

### Worker

The worker owns implementation of one Ready issue. It may make in-scope
technical decisions, use capability skills, write and revise tests, run physical
probes, fix reproducible in-scope defects, simplify, update the draft PR, and
address CI or review findings within scope without fresh authorization.

The worker stops when product meaning would change, the fix crosses issue
scope, a destructive or external action lacks authority, credentials or real
data are required, safe provenance cannot be established, or a genuine external
dependency is unavailable.

### Reviewer

The reviewer is read-only and normally begins when there is a working diff,
draft PR, immutable head, and executable evidence. It checks acceptance,
correctness, simplicity, tests, and physical proof; reports concrete findings,
recommended disposition, confidence, and residual risk.

The reviewer does not grant edit authority, control worker state, expand
acceptance criteria, require replacement plans, merge, change Linear state, or
create a governance cycle. A focused Tier B pre-edit review only assesses the
named dangerous seam.

### Orchestrator

The orchestrator selects Ready work and risk tier, assigns one owner, prevents
duplicate workers/reviewers/watchers, interprets evidence, disposes findings,
and owns the shipping decision when delegated. For each finding it chooses:
fix before merge, accept as residual risk, create a follow-up, or ask the human.

“Wait for more review” is not a decision unless a specific evidence gap is
named. The orchestrator does not implement product code by default.

### Human

The human is required for material product choices, production/provider or
credential authority, destructive or irreversible effects, meaningful spend,
legal or privacy-policy decisions, customer-data decisions, or risk acceptance
beyond delegated orchestrator authority. Ordinary implementation defects,
compiler errors, flaky local tools, and reviewer preferences are not human
gates.

## Finding Disposition

Every material finding receives exactly one disposition:

- **Fix before merge:** a concrete, reproducible acceptance failure; data loss
  or corrupted durable evidence; privacy, credential, or security leak; unsafe
  migration; duplicate paid/effectful work; uncontrolled retry or redispatch;
  broken `outcomeUnknown` behavior; incorrect public lifecycle state;
  destructive behavior; or claimed runtime behavior proven false.
- **Residual risk:** the slice remains safe and useful, acceptance still holds,
  and the limitation is understood and consciously accepted by the
  orchestrator.
- **Follow-up:** concrete generalized hardening, observability, resilience,
  performance, cleanup, or adjacent improvement that does not belong in the
  active issue.
- **Human decision required:** product meaning, external authority, destructive
  or irreversible choice, or risk beyond delegated authority is unresolved.

Reserve `Blocked` for human decision required or a genuinely unavailable
external dependency. A reproducible in-scope defect is fixed during Build or a
focused correction pass; it does not restart planning.

## Proof Of Outcome

Physical proof begins during Build. Use the lowest-cost level that exercises the
real changed seam, then broaden according to risk:

1. focused unit, schema, property, or contract test;
2. real boundary integration with disposable resources;
3. smallest complete vertical tracer;
4. actual local CLI, browser, process, server, worker, database, or artifact;
5. failure, interruption, restart, replay, or retry proof when the contract
   depends on it;
6. fresh CI, preview, build artifact, or environment-specific evidence;
7. external real-world acceptance only with required authority.

Each material acceptance criterion maps concisely to automated proof,
physical/runtime proof, or an explicit unproven external gate. Do not fake
external success, and do not let a separable external gate invalidate a proven
internal slice unless the acceptance criteria require the real effect now.

## Watchers And Durable Evidence

Only one active watcher owns a PR's next poll. It stores only the issue, owner,
PR, current exact head, pending check or comment, next action, bounded retry/fix
budget, stop condition, and last meaningful observation. It reports deltas,
refreshes stale heads, fixes in-scope failures, and stops when green, merged,
closed, or genuinely blocked.

Do not run overlapping worker, orchestrator, and project watchers for the same
event. Watchers do not replay approvals, invent authority, reopen planning, or
replace Linear and GitHub as durable evidence stores.

## Safety And Completion

Preserve exact fetched-remote provenance for new lanes, isolated mutation
ownership, non-destructive git handling, independent exact-head review,
privacy and secret-safe evidence, destructive-action controls, explicit
provider/deployment/publication authority, no duplicate paid/effectful work,
`outcomeUnknown` and no-redispatch semantics where applicable, honest external
limitations, and resource/watcher cleanup.

An issue is ready for Decide when acceptance criteria map to evidence, the exact
head and checks are current, material review findings have dispositions, and
external gates and residual risks are explicit. The orchestrator records and
makes the decision.
