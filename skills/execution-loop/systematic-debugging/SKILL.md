---
name: systematic-debugging
description: Investigate a bug whose cause is unclear using a focused reproduction and causal evidence.
---

# Debugging

Find the narrowest useful signal for the reported symptom: a failing test, real runtime call, browser interaction, saved trace, or small disposable harness. Confirm it exercises the failure when practical. When reproduction is unavailable, say what evidence supports the diagnosis and what remains unproven.

Inspect the failing path and test plausible causes with targeted probes. The number of hypotheses and probes depends on the evidence. An obvious causal defect does not need a debugging ceremony.

Fix the cause within scope, then rerun the affected reproduction and relevant checks. Keep a regression test when it protects meaningful behaviour; do not create a shallow test merely to make the loop look complete. Remove temporary diagnostics.

Continue through in-scope fixes. If the cause points to a separate product decision or unauthorized external effect, stop that dependent action and finish useful independent work. Report cause, correction, observed verification, and any remaining uncertainty.
