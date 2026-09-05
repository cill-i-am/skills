# Behavioural tests

Exercise the public contract with realistic inputs and observable outcomes. Choose assertions that survive an internal refactor while detecting a broken result. Multiple assertions are useful when they describe one coherent outcome.

Use the real local runtime or database when persistence, serialization, isolation, or transactions are the claim. Inspecting stored rows is appropriate when the storage contract itself matters; a private helper call is usually weaker evidence than the caller-facing operation.

Use deterministic substitutes at external capability seams when live execution is unavailable or unauthorized. They should model the failure or response contract without replacing the internal behaviour under test.

Call counts or ordering are useful assertions for retry limits, duplicate-effect prevention, transaction ordering, and delivery contracts. Avoid them when they merely freeze internal orchestration. Never make a failing test pass by weakening the intended assertion.
