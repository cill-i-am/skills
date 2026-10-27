---
name: design-exploration-swarm-paper
description: Explore distinct UI directions or inspect a component's visual states in Paper. Use for requests such as show three options in Paper, rethink this component, compare layouts, or show loading, empty and error states in Paper. Offers lightweight alternatives and state previews; the retained swarm name does not require delegation. For implementing a chosen design use build-design; for application state-machine architecture use xstate-effect.
---

# Paper design exploration

Create a focused, editable comparison in Paper that helps the user choose or
refine a design. Use the existing product's components, tokens and realistic
content. The default is one focused exploration by one agent. Broader exploration
or delegation follows the user's request and the host's permissions.

The stable skill name is retained for existing invocations. This adaptation
combines the local Paper workflow with Emil Kowalski's prototype approach and
Jakub Krehel's component-state workbench; see [provenance](references/provenance.md).

## Choose the mode from the request

- **Alternatives:** explore different answers to the same brief. Read
  [alternatives](references/alternatives.md). Default to three meaningful
  directions; respect a requested count or narrower scope.
- **States:** inspect one design across its reachable states. Read
  [states](references/states.md). A state comparison does not redesign the
  component or introduce new branches.
- **Both:** explore directions first, then expand the selected or explicitly
  shortlisted direction into important states. Avoid a directions × states ×
  widths explosion. Never silently select the user's final design.

Use existing context to infer the target. Ask only when the component, file,
scope or design intent cannot be established safely. A bare invocation needs
one concise question about what to explore, not a ceremonial acknowledgement.
Requests for explanations or quoted skill names do not authorize canvas edits.

## Ground the brief

Inspect the relevant source, tokens, component library, screenshots or supplied
design. Record what the component does, where it renders, its actual container
widths, data boundary and product constraints. Read only the relevant source.

Keep established colours, typography, density and motion conventions. Any new
direction should vary a named design choice such as structure, hierarchy,
density or interaction model. Preserve required content and task completion.
Where no product exists, state the proposed design assumptions and use the
current Paper guide to establish a restrained brief.

## Connect to Paper

Prefer suitable Executor tools after inspecting their contracts; otherwise use
the connected Paper plugin. Do not invent tool paths or silently switch design
tools. Read `get_guide({topic: "paper-mcp-instructions"})` before other Paper
operations and follow its current requirements. Tool availability may differ
between hosts.

Identify the intended file, page and selection using Paper's read tools. Use
existing user context to choose; ask when multiple plausible destinations
remain. An unrelated active document is not permission to overwrite it. When
Paper is unavailable, report that limit and retain the brief/state inventory;
do not claim to have created artboards.

Before writing, present the scope and compact design brief. Reuse existing file
tokens and verify font availability. Keep work on clearly named new artboards
or within the explicitly selected target. Preserve unrelated canvas content.

## Render, inspect and refine

Read [Paper mechanics](references/paper.md) for supported authoring operations.
Use realistic surroundings and full-size components at their actual container
width. Show the useful comparison without shrinking everything to thumbnails.
Render only relevant additional viewports and states.

Build incrementally, inspect screenshots after meaningful changes, and correct
clipping, alignment, contrast, spacing and typography before handing over.
Evidence from Paper establishes visual composition only. It does not prove
React branches, keyboard behaviour, asynchronous loading, gestures or animation
performance. Name those limits alongside any visual findings.

## Handoff and implementation

Provide the artboard names, compared directions or states, concise tradeoffs,
visual checks completed and runtime checks still needed. Keep Paper work as the
design record; do not delete it automatically on selection.

When implementation is authorized, load `build-design` through Executor and
extract Paper's actual JSX, computed styles, tokens and assets. Translate into
existing project components. Use [runtime verification](references/runtime.md)
when interaction or motion matters. Selection permits the requested integration,
not unrelated refactoring, publishing, merging or deployment.
