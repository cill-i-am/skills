# Transition and outcome test matrix

Workflow: <name> | Owner: <scope/runtime> | Versions: <exact pins> | Durability: <in-memory / verified design>

| Initial state/data | Event or external outcome | Next state/result | Allowed effects and counts | Cleanup | Evidence/test |
| --- | --- | --- | --- | --- | --- |
| Awaiting approval | Authorized current-revision approve | Executing | Exactly one operation attempt | None yet | <test> |
| Awaiting approval | Deadline | Expired | No execution | Timer removed | <test> |
| Executing | Success | Completed | Receipt recorded | Task resources closed | <test> |
| Executing | Definite failure | Recoverable failure | No silent retry | Task resources closed | <test> |
| Executing | Ambiguous remote timeout | Reconciliation | Query by stable operation ID | Local request closed | <test> |
| Executing | Cancel | Local cancel / remote cancel requested | No false rollback claim | Finalizer acknowledged | <test> |
| Recoverable failure | Authorized retry | Executing | Stable operation ID as policy requires | Prior attempt closed | <test> |
| Any | Duplicate/stale command | Defined rejection/dedup result | No unintended duplicate write | No leak | <test> |
| Any | Invalid/unauthorized input | Boundary error | No actor command | No resource acquired | <test> |
| Any active state | Owner shutdown | Stopped/recoverable record | Stop ingress as designed | All owned resources close | <test> |

Add boundaries at deadline-minus-one and deadline; cancel-versus-complete races; stream EOF/error; action failure after a later transition; notification subscriber startup; atom readiness/unmount; two competing owners; restart after provider acceptance. Mark irrelevant cases explicitly rather than inventing unsupported tests.

For every test record the synchronization mechanism, service fake, expected public outcome, side-effect count, and finalizer evidence. A state assertion alone is insufficient for external side-effect correctness.
