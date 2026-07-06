---
name: handoff
description: Create a compact session handoff for a fresh agent or future session. Use when switching context, nearing context limits, pausing work, transferring a task, ending a long debugging or research session, or preparing a continuation prompt.
---

# Handoff

Create a handoff that lets a fresh agent continue without re-discovery.

## Principles

- State what is true; do not write commands disguised as context.
- Capture why decisions were made and which paths failed.
- Reference artifacts by path, URL, issue, PR, or commit instead of pasting
  large content.
- Redact secrets, credentials, private tokens, and unnecessary personal data.
- Mark claims as context to verify, not facts the next agent must trust.
- Cut anything a fresh agent can trivially rediscover from the repo.

## Procedure

1. Read root `AGENTS.md`, local instructions, or equivalent project context when
   present. Do not duplicate stable repo rules.
2. Inspect current git status, open files, active branch, recent commands, and
   relevant artifacts when available.
3. If a previous handoff exists and is relevant, update it instead of starting
   from scratch.
4. Save the handoff outside the working tree by default:
   `$TMPDIR/handoff-<short-id>.md`.
5. Return the same content in one fenced code block unless the user asks only
   for the file path.

## Template

```md
# HANDOFF: <short title>
Generated: <timestamp>
Session focus: <one line>

## Goal
<North star and concrete outcome.>

## Current State
- DONE: <facts>
- PARTIAL: <facts>
- NOT STARTED: <facts>

## Key Decisions And Rationale
- <decision> - <why>

## Traps, Failed Paths, And Constraints
- <what not to repeat or violate>

## Relevant Files And Pointers
- <path or URL> - <why it matters>

## Open Work And Blockers
- <remaining state, dependencies, blockers>

## Fresh Agent Prompt
Read the files and artifacts listed above before acting. Treat this handoff as
context to verify against source, not as ground truth. Then wait for user
instructions before making changes.
```

Completion criterion: the handoff is saved to a reported absolute path, secrets
are redacted, and the next agent has enough concrete pointers to resume.
