# Observed pilot results — 2026-10-03

Source skill: PR #9 at `0d2edd951f1b56122df28f50f29b6aab3ffe2f3c`.
Promptfoo 0.123.1, official Codex SDK/CLI 0.160.0, requested model `gpt-6-sol`,
low reasoning, existing ChatGPT login. Six distinct fresh sessions ran serially
in isolated read-only fixture workspaces. Six traces and two actual startup
skill-injection records were captured. [Compact evidence](pilot-evidence.json)
records IDs, commands, token counts, and the hash of the full local result export.

| Case | Content checks and artifact review | Invocation evidence |
| --- | --- | --- |
| Recovery implicit | Pass: role, error branches, row preservation, running-state constraint, success and support handoff | Diataxis SKILL.md read |
| Recovery explicit | Pass: grounded administrator how-to | Diataxis startup injection; how-to reference read |
| Missing fact implicit | Pass: exact fields; no invented limits/defaults/null rules; publication blockers | Diataxis SKILL.md read |
| Missing fact explicit | Pass: bounded draft reference and unresolved evidence | Diataxis startup injection; reference guide read |
| Internal design sibling | Pass: internal decision proposal, alternatives and unresolved decisions | effective-design-docs read; no Diataxis evidence |
| Release-note negative | Pass: requested headings and released changes only | Inconclusive: no reads/injections observed |

Review covered every final answer against its case rubric. All command items were
reads of the two installed skills or their references. No file-change, web-search,
or MCP-call item appeared. These are single observed samples, not statistical
reliability estimates or proof of success on the full earlier acceptance matrix.
The negative's correct answer does not establish non-invocation.

The corrected six-row run reported 163,177 input tokens, 2,167 output tokens,
135,552 cached input tokens, and 257 reasoning output tokens (the reasoning count
is included in output, not added again). Total input + output: 165,344.
Promptfoo's published package warns that Sol is unknown to its pricing table and
does not supply a monetary estimate here. Existing ChatGPT allowance was used;
no exact dollar charge or remaining allowance is claimed.

Before this corrected run, four diagnostic smoke sessions completed and consumed
123,223 total tokens (121,736 input, 1,487 output, 87,424 cached input, 177 reasoning
output). Their answers looked correct, but the run is not accepted: it exposed an
inline assertion syntax error and discovery of user-level skills. Both were fixed
before the accepted run by making the assertion multiline and isolating HOME/XDG
as well as CODEX_HOME. Total reported usage across all ten actual sessions:
288,567 input + output tokens. No inference was used for harness or install checks.

Validation passed: root packaging check (38 skills), syntax checks, seven harness
tests, offline fixture preparation, whitespace check, and a fresh `npm ci
--ignore-scripts --no-audit --no-fund` install plus offline checks. The repo has no
separate lint command. The clean-install probe initially failed with npm's prefix
form; rerunning the documented command from the actual directory passed.

After inference, small reporting changes added a case-suite hash and distinguished
provider/grader errors from completed answers failing content checks. Those were
verified by deterministic tests without spending additional model usage. Raw local
exports remain Git-ignored; expected terms/rubrics were outside all model prompts
and fixture workspaces. Original auth/settings were only read, and temporary auth
homes were removed.
