# Alternatives

Adapted from Emil Kowalski's `prototype`; source and license are in
[provenance](provenance.md).

1. State the component's purpose and the decision this exploration should settle.
2. Propose three directions by default. Name each by its idea, such as compact
   rows, editorial grouping or progressive disclosure. Explain the axis and
   tradeoff. Colour swaps alone do not create distinct directions.
3. Use the same realistic content, product tokens and surrounding context so
   the comparison is fair. Keep critical actions and accessible information.
4. Render full-size directions as named Paper artboards. Inspect the actual
   container width; add a narrow version where it changes the decision.
5. Review screenshots and fix execution defects before judging the concept.
   If two variants converge, replace or remove one rather than padding the set.
6. Present each direction's strengths and costs, and let the user choose.
   Give a recommendation when asked. A request to riff on one direction retains
   that direction's useful constraints and explores a new meaningful axis.

Paper replaces the upstream browser picker for visual exploration. Static
states or a labelled sequence may explain intended motion, but do not describe
them as working interactions. If the decision depends on gesture feel or timing,
identify the small browser/Storybook experiment needed after design selection.

Do not modify production code during a design-only exploration. Honour a
combined design-and-implement request within its stated selection authority.
