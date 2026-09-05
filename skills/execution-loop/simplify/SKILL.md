---
name: simplify
description: Simplify a named diff or code area by removing complexity that serves no current behaviour.
---

# Simplify

Stay within the requested scope and directly affected callers. Look for redundant wrappers, duplicate policy/state, speculative options, unused abstractions, and fallback paths that hide a broken contract. Prefer deletion or a direct implementation when it makes ownership clearer.

Preserve required behaviour, typed boundaries, and real failure handling. Do not add a generic helper merely to shorten a file. For a review-only request, report candidates; for an authorized cleanup, apply the useful changes and verify the affected behaviour.

Stop when the requested result is clear and verified. Neither a fixed number of passes nor a separate simplification report is required.
