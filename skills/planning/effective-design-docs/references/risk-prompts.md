# Optional risk prompts

This is an original review aid for the skill, not an additional source excerpt.
Read only the areas implicated by the proposed change. These questions help find
missing decisions; they are not headings that every document must contain.

## State and asynchronous work

For a design involving writes, replication, background jobs, or client sync:
Where is the authoritative state? What is the acknowledgement boundary? What
happens if the same operation arrives twice, arrives late, or succeeds after its
caller times out? What behavior is promised during disconnection or partial
failure? Who resolves a conflict? Do not promise exactly-once processing or
instant consistency without a mechanism and evidence.

## Compatibility and transition

For a migration: Can old and new clients coexist? Which direction does data flow
while both systems run? What proves a backfill is complete? What happens to
writes accepted after cutover if the team rolls back? Identify irreversible
steps; distinguish reverting code from recovering data. Include a stop/go check
rather than treating deployment as proof of success.

## Access and sensitive information

Which actor can read or change which resource? Where is that permission enforced?
What prevents crossing a tenant or user boundary? Which third parties receive
data, credentials, or content? Could diagnostics expose private information?
Does deletion cover derived data, replicas, and backups? Flag specialist review
needs without claiming legal compliance or inventing legal conclusions.

## Capacity and reliability

What user-visible behavior is affected by dependency failure? Are queues bounded?
What overload behavior is acceptable? What workload supports a proposed capacity
or latency target? Specify percentile and observation window where relevant.
Distinguish a test result from a production commitment. Identify who acts on an
alert and what action would be useful; avoid alerts with no operational purpose.

## Cost and dependency choice

What workload drives cost, and which assumptions dominate the estimate? Is the
budget a constraint or a proposed goal? Compare options on the same workload.
Where does a dependency create migration cost, operational burden, or a contract
that must remain stable? Do not frame personal familiarity as objective market
superiority or mistake a trial tier for a sustainable operating cost.

## User-facing changes

What can the user observe before, during, and after an operation? What happens on
failure or retry? Are permissions and empty/error states part of the design?
Does accessibility or an existing interaction contract constrain the change?
Specify behavior that affects product correctness, not arbitrary visual polish.

## AI or agent features

Only when the project actually includes them: Which actions may the model take,
and which require user authorization? What inputs are untrusted? What can be
replayed or audited? How are tool failures and unsupported model output handled?
Which data is sent externally? Separate deterministic application invariants
from behavior that still requires evaluation.

## Small, reversible changes

Do not inflate a minor change with all the above analysis. State the bounded
impact and the relevant check. Small scope is not, by itself, evidence that an
authorization or data-loss risk is absent.
