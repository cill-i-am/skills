# Domain Document Placement

## Find The Existing Owner First

Inspect the repository's documentation and semantic scopes before choosing a
path. Prefer, in order:

1. an existing glossary or domain-language section for the relevant context;
2. a domain document beside the feature, bounded context, package, or service
   that owns the concept;
3. an established repository-wide domain-doc directory;
4. only when no convention exists, a proposed `docs/domain/glossary.md` for
   cross-repository language or a glossary beside the nearest semantic owner.

`CONTEXT.md` and `CONTEXT-MAP.md` are supported when the repository already uses
them. They are not mandatory names and should not be introduced merely because
another project uses that convention.

## Canonical Glossary Shape

Keep entries compact and opinionated:

```md
## <Area, when useful>

**Canonical term:** One or two sentences defining what the concept is and the
boundary that distinguishes it.

Avoid: <overloaded or rejected synonyms, when useful>
```

Include only product- or domain-specific concepts. General programming terms,
implementation tasks, issue status, and workflow authority do not belong in the
glossary.

## One Durable Owner

- Product goals and accepted behavior live in the Project/PRD or repository
  vision source.
- Canonical language lives in the nearest domain glossary.
- Operating authority lives in agent/execution instructions.
- A qualifying architectural tradeoff lives in one ADR.
- Other artifacts link to the owner instead of restating the decision.

Create or update files only when the user requests durable files or the active
workflow explicitly authorizes the write.
