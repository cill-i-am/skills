---
name: build-intent-layer
description: Build or repair repository AI instruction topology around semantic scopes. Use when adding or reorganizing AGENTS.md, codifying durable agent rules, placing nested instructions, or handling Codex/Cursor/Copilot-specific instruction files.
---

# Build Intent Layer

## Overview

Build the repo's instruction topology around the code it governs. Treat
`AGENTS.md` as the canonical intent node for each semantic scope. Keep every
other consumer thinner than the canonical source, and do not generate
tool-specific mirrors unless the user explicitly asks or repo tooling requires
them.

When the user asks to codify an architectural decision, do not merely add a
rule. Capture the intent contract: what owns the behavior, how values or control
cross boundaries, why that shape exists, and which failure modes future agents
must avoid.

## Preflight

Before editing anything:

1. Inventory instruction consumers and related config.
2. Identify which paths each instruction file actually governs.
3. Decide whether the request is repo-wide, app-specific, package-specific, or
   feature-specific.
4. If the request is about a pattern, principle, or architecture decision,
   identify the source of truth, consumer boundary, validation point, failure
   behavior, and reason the rule exists.

Start with:

```bash
find . -name AGENTS.md -o -name copilot-instructions.md -o -path '*/.cursor/rules/*'
```

If the repo shape or placement logic is unclear, read
`references/intent-layer.md` before making changes.

## Canonical Rules

- `AGENTS.md` is the source of truth for shared intent at a given scope.
- Place intent at the nearest common ancestor of the code and directories it
  governs.
- Infer missing child nodes when a subtree has distinct local semantics, even if
  no instruction file exists there yet.
- Move narrower intent downward instead of restating it at the root.
- Prefer local refinement over duplicated restatement.
- Do not create tool-specific mirror files by default.
- Keep legacy agent-specific instruction files only when a tool still requires
  them, and keep them thin and derivative.
- If GitHub Copilot or Cursor already read `AGENTS.md`, do not maintain extra
  mirror files just for them.
- Encode stable architectural intent with enough "what and why" that a future
  agent can apply the rule in a new file without rediscovering the original
  conversation.

## Encoding Architectural Intent

Use this when the user says things like "codify this", "teach future agents",
"make sure agents follow this", or "add this to AGENTS".

Good intent guidance names:

- the semantic owner of the pattern
- the boundary being crossed
- the canonical source of truth
- the allowed consumer-facing shape
- the validation, typing, or parsing step
- the runtime and build-time implications
- the desired failure mode
- the reason this prevents bugs or operational pain

Avoid vague rules like "use typed config" when the important behavior is a
boundary contract. Prefer concrete intent like:

- stack-created resource values belong to the runtime owner that receives them,
  not to arbitrary import sites
- mutable deployment values should cross from infrastructure to an app server as
  runtime config, not be baked into browser bundles when they may need to change
  without a rebuild
- private server config should have one schema source of truth, with
  client-visible config derived from an explicit allowlist
- values crossing from server to client should remain plain and serializable,
  then be parsed and branded at the boundary before use
- missing required config should fail loudly at the loader/server boundary, not
  become a UI fallback that hides broken wiring
- cache policy belongs to the boundary that owns freshness: server-side caches
  for source reads, client query caches for UI refresh behavior

Place these rules at the nearest semantic scope that owns the boundary. For
example, rules for all deployable web apps often belong in `apps/AGENTS.md`;
rules for one TanStack Start app belong in that app; rules for shared schemas or
client packages belong under `packages/`.

## Workflow

### 1. Inventory the instruction graph

Inspect:

- root and nested `AGENTS.md`
- legacy agent-specific files such as `.github/copilot-instructions.md`
- config files that point to instruction files

Note which files are canonical, which are legacy consumers, and which contain
unique instructions that still need a home.

### 2. Map each node to governed paths

For each instruction file, answer:

- which directories or files does it apply to?
- which agents or tools read it?
- does it govern a semantic unit or only reflect a technical folder boundary?

If a node cannot be tied to a clear scope, treat that as a placement smell and
fix the topology before adding more prose.

Do not limit yourself to normalizing existing files. If the repo clearly has a
deployable app, shared package, feature slice, or stable collection like
`apps/` or `packages/`, infer the missing canonical nodes and create them.

### 3. Choose canonical nodes with nearest-common-ancestor reasoning

Use the lowest directory that still covers every consumer that needs the same
intent.

Examples:

- repo-wide tooling and monorepo rules belong at the repository root
- collection-level rules for deployable applications can belong under `apps/`
- collection-level rules for reusable packages can belong under `packages/`
- app-specific deployment rules belong under that app
- package-specific build or export rules belong under that package
- feature-specific guardrails belong inside the feature subtree

If two sibling areas share a rule, move it up to their nearest common ancestor.
If only one area needs a rule, move it down.

A collection node is justified when the directory represents a stable semantic
category, not just when it already has multiple children. For example, `apps/`
can own "deployable app" guidance and `packages/` can own "reusable shared
package" guidance even if each currently has one child.

### 4. Apply the topology

Edit in this order:

1. Rewrite or create the canonical `AGENTS.md` nodes.
2. Re-home unique intent from legacy agent-specific files into the right
   canonical node.
3. Remove legacy files when their tools already read `AGENTS.md` directly.
4. Keep only thin derivative files when a real tool still requires a separate
   instruction path.

Keep local `AGENTS.md` files additive and scoped. They should refine their
parent node, not copy it verbatim.

When you create inferred nodes, write only the local semantic delta:

- collection nodes explain the role of the subtree
- leaf app nodes explain runtime, deploy, and framework constraints
- leaf package nodes explain build, export, and reuse constraints

When adding architectural guidance, include the mechanism and reason, not only a
command. A future agent should be able to answer "where is the source of truth?",
"where is validation performed?", and "what breaks if I do this differently?"
from the instruction node alone.

### 5. Re-home unique intent before deleting legacy files

When a non-canonical file contains unique instructions:

1. move those instructions into the correct canonical `AGENTS.md`
2. keep only the minimal agent-specific wrapper that is still required
3. delete the duplicate prose only after it has a canonical home

Never destroy unique intent just because the file layout is messy.

### 6. Verify the result

Before claiming success, verify:

- every intended canonical node exists
- legacy agent-specific files were removed only when safe, or kept thin when
  still required
- moved instructions appear exactly once in the final topology
- the resulting tree is easier to explain than the one you started with
- new architectural guidance explains both the preferred path and the failure
  mode it is designed to prevent

Useful checks:

```bash
find . -name AGENTS.md -o -name copilot-instructions.md -o -path '*/.cursor/rules/*'
```

## Safeguards

- If scope is ambiguous, choose the narrowest node that still covers every known
  consumer and explain the tradeoff.
- If the repo already has a reasonable topology, repair it incrementally instead
  of flattening it.
- If a legacy file still has a real consumer, keep it thin and derivative.
- If a tool reads `AGENTS.md` directly, do not invent extra mirrors.

## Reference Routing

Read `references/intent-layer.md` when you need:

- the semantic model behind placement decisions
- nearest-common-ancestor examples
- guidance on downlinks and parent/child refinement
- help deciding whether a boundary is semantic or merely technical
- guidance for encoding boundary-crossing architecture decisions with their
  rationale

## Response Format

Return:

1. the instruction nodes you found
2. the canonical nodes you chose and why
3. the files you created, rewrote, linked, or removed
4. any exceptions or unresolved judgment calls
