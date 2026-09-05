---
name: build-intent-layer
description: Create or simplify AGENTS.md files and their instruction routing.
---

# Repository Instructions

Inventory the instruction files and actual consumers in the requested scope. Use `rg --files --hidden -g AGENTS.md -g SKILL.md` with dependency/generated directories excluded as appropriate.

Keep root instructions limited to decisions needed across the repository. Place a local rule at the nearest scope that actually needs it. A directory alone does not justify another AGENTS.md. Avoid duplicate tool-specific files unless a real consumer requires them.

Keep non-obvious context, canonical source locations, and concrete correctness or authority boundaries. Explain the mechanism or reason when it helps future decisions. Remove generic coaching, mandatory reading lists, repeated policy, fixed iteration counts, and instructions that stop work already authorized by the user.

Point to documentation conditionally. Skills should have short, discriminating descriptions and load substantial task-specific detail only when needed. Do not add a router for a simple self-contained task.

Before deleting or moving instructions, inspect callers and preserve unique project intent in its proper owner. Prefer repairing existing structure to generating an elaborate instruction tree. [Placement reference](references/intent-layer.md) has examples when scope ownership is unclear.

Check links, scope, and contradictions after editing. Report the meaningful changes and any limitations; a wording-only change does not need an application test suite.
