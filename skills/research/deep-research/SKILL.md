---
name: deep-research
description: Run source-backed research and produce a cited report. Use when the user asks for deep research, current research, source-backed investigation, market/vendor/library comparison, standards or regulatory research, or a cited markdown report.
---

# Deep Research

Execute a rigorous research workflow using the best available web, browser, and
repository tools in the current environment. Do not assume remembered facts are
current when the topic can change.

## Workflow

1. **Frame the decision.** Use `../research-prompt/` when the question is vague
   or multi-part.
2. **Plan searches.** Write 3-6 search angles that differ by source type,
   terminology, timeframe, and likely owner.
3. **Collect primary sources first.** Prefer official docs, source repos,
   changelogs, papers, standards, filings, vendor docs, and first-party posts.
4. **Collect secondary sources only for context.** Use forums, social posts,
   blogs, and comparison sites to find leads or sentiment, not as proof.
5. **Read the sources.** Open the pages that matter. Do not cite snippets from
   search result summaries when the page itself is reachable.
6. **Resolve contradictions.** Separate confirmed facts, inference, and
   unresolved uncertainty.
7. **Run a gap pass.** Identify single-source claims, stale dates, missing
   primary sources, and unanswered subquestions. Search again to close gaps.
8. **Write the report.** Save a markdown file when the research is substantial
   or the user asks for an artifact.

## Search Depth

- Quick research: at least 2 materially different searches.
- Deep research: at least 5 materially different searches across at least 2
  source classes.
- High-stakes legal, financial, medical, security, or regulatory topics:
  browse primary sources and say what is not legal, financial, medical, or
  security advice.

## Report Shape

```md
# <Research Title>

## Question
<The decision or question being answered.>

## Short Answer
<Direct answer with confidence level and date-sensitive caveats.>

## Findings
- <Claim>. Source: <link>. Why it matters: <decision relevance>.

## Conflicts And Uncertainty
- <Contradiction, stale source, or single-source claim>.

## Sources
- <link> - <what it was used for>
```

## Rules

- Include absolute dates for time-sensitive facts.
- Cite only sources that were opened or fetched.
- Keep quotes short and use paraphrase by default.
- Do not pad with low-quality sources.
- Do not bury uncertainty to make the answer feel complete.
- For software/API research, prefer official docs and source code over blog
  posts. Inspect package versions or repo files when the answer depends on
  implementation details.

Completion criterion: every material claim is backed by an opened source or is
clearly marked as inference, and the report names remaining uncertainty instead
of hiding it.
