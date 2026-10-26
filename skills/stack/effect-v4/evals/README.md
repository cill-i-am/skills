# Evaluating this skill

[scenarios.json](scenarios.json) contains positive activation, indirect activation, non-activation, implementation, review, and failure-mode cases. These are evaluation inputs and a rubric, not a record of successful agent runs.

Create small disposable repositories with the intended Effect 4 dependency set. Run the same prompts with and without the skill when comparing its contribution. Keep the model, permissions, tool budget, and fixture versions fixed for a comparison.

For each case, record activation, references loaded, APIs inspected, code changes, typecheck/test commands, actual results, and remaining uncertainty. Score the expected behaviours individually; treat an unacceptable behaviour as a failure even when the happy-path output looks correct.

Use a simple score per expected behaviour: **0** absent or wrong, **1** recognized but not implemented/verified, **2** correctly implemented and supported by the required evidence. Keep safety-critical failures separate from the average score so they cannot be hidden by easy passing cases.

Do not execute chargeable model calls, production writes, or destructive actions in these fixtures. Replace them with controllable services or a dedicated isolated integration environment. Use fresh processes and persisted test storage for durability cases.

After improving the skill, rerun affected cases and a small regression set covering version accuracy, runtime ownership, tenant isolation, retry safety, and evidence honesty. Store results separately from the scenario definitions; never change the expected result merely to match a failing run.
