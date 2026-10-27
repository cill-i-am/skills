# Component states

Adapted from Jakub Krehel's `state-machine`; source and license are in
[provenance](provenance.md). This mode previews UI states; it does not define
application state-machine architecture.

Read the component and its data hooks before drawing. Inventory the branches
that exist: loading, empty, populated, error, refreshing, disabled, access level
or limits. Cite the code or supplied specification behind each state. Distinguish
implemented states from proposed or missing states. Without source, label the
inventory as inferred from the provided brief.

Combine conditions only when the component branches on the combination. Do not
generate a full cross product or add a production branch to make a mock possible.
Keep the component's surrounding layout, fonts, density and actual width.

Render a named Paper artboard or clearly labelled full-size instance per useful
state. Use product-shaped fixture data and representative long content. Keep
loading visually stable for inspection. A Paper loading picture is not evidence
that the runtime can remain pending or recover from an error.

Inspect every rendered state and fix visual inconsistencies introduced by the
exploration. After a design change, recheck affected states. Report missing
states without silently inventing their design. Name the state coverage and
unverified runtime behaviour at handoff.

For executable verification, use the real component with existing Storybook,
props, a mock provider, seeded query cache or request mocks. Read
[runtime verification](runtime.md). Never replace it with a lookalike or mutate
live service data to force a state.
