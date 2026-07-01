---
name: simplify
description: Use before wrapping up implementation or reviewing a PR to reduce unnecessary abstraction, fallback logic, duplication, broad scope, and complexity while preserving behavior.
---

# Simplify

Run this before calling changed code done. The goal is not polish for its own
sake; it is making sure the implementation is the simplest version that still
satisfies the spec.

## Scope

Review the current diff, staged changes, or explicitly named files. Stay close
to the changed behavior and directly adjacent helpers.

## Passes

1. **Reuse:** replace duplicated logic with existing helpers or conventions when
   that makes the local code easier to understand.
2. **Type safety:** remove casual casts, weak primitives, broad DTOs, and
   unchecked boundary values when a local schema, domain type, or parser should
   own the invariant.
3. **Shape:** remove one-off abstractions, speculative options, redundant state,
   fallback branches, and defensive code that does not serve a real failure mode.
4. **Runtime:** look for avoidable work on hot paths, repeated I/O, leaks,
   missing cleanup, or serial work that should be parallel.
5. **Tests:** check whether the tests prove the important behavior without
   overfitting to implementation details.

## Fixing Rules

- Preserve behavior unless the spec requires a behavior change.
- Prefer deleting complexity over moving it elsewhere.
- Keep fixes in scope; create a concrete follow-up only for separate work found
  during the pass.
- Run the smallest relevant validation after changes.

## Finish

Summarize what was simplified or say the diff was already appropriately simple.
