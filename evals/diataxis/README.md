# Diataxis skill-eval pilot

This is a small Promptfoo harness, separate from the installable skills. It reuses
four acceptance prompts from the PR #9 validation at `0d2edd9`; it does not replace
the full 32-session review. This branch depends on PR #9. It adds no product or
skill changes.

## Run it

Use Node 22.22 or newer and an existing Codex ChatGPT login. From this directory:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm test
node run.mjs --prepare --smoke # fixture setup only; no inference or login required
npm run smoke                # four serial fresh sessions
npm run eval                 # all six serial fresh sessions
node run.mjs --recovery      # just the recovery pair for a targeted rerun
```

The pilot pins Promptfoo, the official Codex SDK/CLI, model `gpt-6-sol`, and low
reasoning. It uses the package-local CLI, rather than the globally installed CLI.
Official provider guidance currently recommends Codex 0.156.1+ for Sol; this pilot
pins 0.160.0. Check account/model availability before running. A model-name pin
does not freeze the service's underlying model weights.

The runner temporarily copies only existing `auth.json` into a private home. It
does not change the original login/settings, create credentials, or install global
skills. The child HOME and XDG config location also point to temporary directories
so the user's `~/.agents/skills` catalog is not discovered. Temporary auth and
workspaces are deleted in `finally`, including failed
runs. A hard process kill can leave a `skill-eval-*` temporary directory; remove
that directory before sharing machine diagnostics. API-key variables are removed
from the child environment; no paid API grader or model judge is configured.
Inference consumes the existing account's Codex allowance. There is no dollar
budget enforcement; the suite is bounded to four/six rows, serial execution, zero
provider retries, and a ten-minute process timeout. Stop on authentication/quota
errors instead of adding credentials or repeatedly rerunning.

## What each row measures

| Rows | Question |
| --- | --- |
| Recovery implicit / explicit | Does an unadorned customer task select Diataxis, and does explicit use produce a grounded recovery guide? |
| Missing-fact implicit / explicit | Does a reference request select it, and does the answer avoid inventing unknown limits/defaults? |
| Internal-design sibling | Does the installed effective-design-docs sibling handle an internal proposal? |
| Release-note negative | Does the answer retain the release-note workflow without observed Diataxis use? |

Each row gets a new temporary workspace and a fresh SDK thread; no cache or thread
persistence is used. Only Diataxis and effective-design-docs are installed in the
project catalog. This deliberately tests one overlap, not the entire user's skill
catalog. Sources stay in the request. Expected terms and human rubrics stay in the
harness/config outside the workspace and are never rendered into the prompt.
This is evaluation hygiene, not an adversarial filesystem secrecy boundary: the
read-only sandbox permits reads elsewhere on the host.

## Read the evidence

`results/<timestamp>/` contains the manifest, full Promptfoo export with traces,
startup-injection evidence, and summary.
Streaming and tracing are enabled. The export preserves provider metadata and
session IDs; inspect the local Promptfoo traces for commands, reference reads and
file/network activity. Results are ignored by Git because traces can contain local
paths and model text. Do not upload raw logs or auth files automatically.

Behavior and selection are separate. Content assertions are cheap term checks,
not semantic acceptance. Review each final answer against its rubric in
`summary.json`, especially factual invention, release scope, missing evidence,
and unauthorized actions. A content pass alone does not establish skill use.

Selection is **pass** when a successful skill read is observed, **fail** when
Diataxis use is observed in the sibling/negative boundary, and **inconclusive**
when expected evidence is missing. Promptfoo's `skillCalls` detects direct
`SKILL.md` command reads heuristically. Real startup injection may establish use
without a separate read; the runner captures actual `<skill>` host injection
records from the temporary Codex sessions and scores them alongside reads. It
ignores assistant claims and ordinary catalog listings. If a future CLI changes
that record format, review the traces and treat absent evidence as inconclusive.
An error/incomplete response is inconclusive rather than a skill failure. Absent
reads cannot prove the negative case passed. CLI exit status reflects automated
content checks; inspect summary and human review before claiming an eval passed.

Token counts are reported when the provider supplies them. `estimatedApiCost` is
Promptfoo's API pricing estimate, not a bill for a ChatGPT-authenticated session.
No exact monetary cost or remaining account allowance is inferred.

To reuse this pilot, add bounded cases to `cases.json`, their required content
terms and human rubric, and the relevant catalog copy in `run.mjs`. Start with
an implicit/explicit pair plus a negative and nearby sibling. Keep new expected
answers out of request vars. Run deterministic harness tests without inference in
CI; authenticated behavior runs remain manual.

Sources checked on 2026-10-03: [Codex SDK provider](https://www.promptfoo.dev/docs/providers/openai-codex-sdk/)
and [testing agent skills](https://www.promptfoo.dev/docs/guides/test-agent-skills/).
