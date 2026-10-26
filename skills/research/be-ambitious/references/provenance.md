# Provenance

Imported on 2026-10-26 from
[DannyMac180/skills](https://github.com/DannyMac180/skills/tree/7dc63b7a748b8bd14bf213c15ecddd4536409407/be-ambitious).

- Reviewed upstream commit: `7dc63b7a748b8bd14bf213c15ecddd4536409407`.
- Author: Dan McAteer (`DannyMac180`).
- Upstream credits the original prompt to Felix Rieseberg (Anthropic).
- License: MIT; the upstream copyright and complete license are preserved in
  [LICENSE.txt](LICENSE.txt).

## Imported files

| Upstream path | Bundled path | Git blob SHA |
| --- | --- | --- |
| `be-ambitious/SKILL.md` | `SKILL.md` | `5241e96d6184c9c89b5336ace06a7535e1bfe4cb` |
| `be-ambitious/README.md` | `references/upstream-readme.md` | `49d5ba8cbf4ccb8dd27965f9c66e58b05a9233cf` |
| `LICENSE` | `references/LICENSE.txt` | `dd2f6a514845e3e79381279478907c154bb623bb` |

All three imported files retain their upstream contents. Local additions are
`agents/openai.yaml`, this provenance record, and repository catalogue entries.
The upstream README is retained as [upstream-readme.md](upstream-readme.md).

The reviewed skill folder contains only Markdown guidance: no executable scripts,
hooks, dependencies, network calls, or filesystem operations. Its workflow ends
after rewriting the prompt and requires a separate user request to run the task.

## Executor discovery

The existing `personal-skills` app reads `cill-i-am/skills`, path `skills`, ref
`main`, using `githubSkills` with `freshFor: "1 minute"`. Once this addition is
on `main`, it is discovered through that existing source; no separate app or
tool permission is required.

Invoke it by asking: "Use be-ambitious from Personal Skills via Executor on this
task: ...". Clients can load it with
`skills({app: "personal-skills", name: "be-ambitious"})`.

## Updates

Review a specific upstream commit and every file in its skill folder before
updating. Preserve the MIT notice, refresh the recorded commit and blob hashes,
and record any local instruction changes explicitly.
