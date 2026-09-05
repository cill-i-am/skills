---
name: tdd
description: Develop behaviour test-first when the user or work item calls for red-green-refactor.
---

# Test-first Development

Choose an observable behaviour from the accepted request. Write a focused test that fails for the intended reason, implement the behaviour, then improve the design while preserving passing tests. Small vertical increments usually expose assumptions earlier than a large batch of speculative tests.

Exercise public contracts or real production seams. Persistence inspection is appropriate when stored state, replay, or durability is itself the contract. Substitute dependencies through their existing service/layer or adapter seam; follow [testing standards](../coding-standards/TESTING_AND_VERIFICATION.md).

Let the behaviour determine test granularity and sequencing. Do not require a new plan, interview, or one-test-at-a-time ceremony for a clear request. TDD is a technique for meaningful behaviour, not a requirement for copy, formatting, or every reversible edit.

[Examples](tests.md) illustrate behavioural tests. Use them as examples, not additional workflow gates. Finish once the requested behaviour and relevant failure paths are verified; rerun broader checks only as required by the change.
