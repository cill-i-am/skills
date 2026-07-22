# Minimal ADR Guidance

## Placement

Use the repository's existing decision-record convention. Prefer a system-wide
ADR directory for cross-cutting decisions and the nearest context-owned ADR
directory for decisions local to one feature, package, service, or bounded
context. If no convention exists, propose `docs/adr/` for repository-wide
decisions; create it only when a qualifying ADR is authorized.

Follow the established naming scheme. If none exists, use sequential names such
as `0001-short-decision.md` after checking the highest existing number.

## Three-Part Threshold

Create an ADR only when the decision is:

1. hard to reverse;
2. surprising without context; and
3. the result of a real tradeoff.

All three are required.

## Minimal Format

```md
# <Short decision title>

<One to three sentences stating the context, decision, and why.>
```

That is the default. Add `Status`, `Considered Options`, or `Consequences` only
when lifecycle, rejected alternatives, or downstream effects are genuinely
useful to future readers.

Do not use an ADR for product intent, execution policy, easy-to-reverse choices,
obvious implementation details, or decisions with no credible alternative.
