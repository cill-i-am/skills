# Workflow choice validation

Date: 2026-09-05. These are bounded behavioral checks of the workflow-source extension, alongside the repository's packaging checks. Each independent agent received the requested capability, a realistic request, raw project inputs, and an isolated workspace. They did not receive an expected answer or the author's conclusions.

## Repository setup and planning

Request: configure repository files as the planning source using `project/plans/`, `project/work/`, and shared branch `main`; prepare a PRD and ready work for a small persistent reading-list CLI. No implementation or publication was requested.

Observed: the agent created an `AGENTS.md` pointer, one workflow declaration, the needed readiness/execution guidance, a PRD, and one complete vertical delivery item at the requested custom paths. The item had a unique stable identifier, ready state, acceptance criteria, scope, and concrete persistence/error proof expectations. It created no Linear records or empty backlog scaffolding. Ten artifact links resolved. It accurately reported that the folder had no Git origin and the files were local proposals.

The agent loaded the repository guide only. Artifact inspection found a temporary request restriction persisted as a project rule. Setup guidance was narrowly corrected to keep task-specific limits out of enduring project instructions; this wording correction received static review but the setup evaluation was not repeated.

## Existing Linear declaration, unavailable connector

Request: prepare proposed delivery slices from a supplied Library PRD snapshot, preserving a declaration at `policy/linear-workflow.md`. Access was unavailable and the request was read-only.

Observed: the agent kept Linear as the source, loaded only the Linear guide, and returned two unpublished vertical slices: persistent add/list behavior followed by completion. It separated the dependency from project grouping, identified the live reconciliation needed before readiness, and invented no issue identifiers, owner, verified state, or successful mutation. It made no file edits or external calls and did not create a repository backlog or demand replacement setup.

This exercises declaration discovery, scope preservation, and honest unavailable-access behavior. It does not exercise live Linear reads, writes, or relation APIs.

## Repository completion and publication

Request: reconcile an in-review item with a tested implementation already accepted into a disposable local Git origin. The project's custom declaration named `work/` as the record location and its delivery policy defined completion as tested implementation merged into `origin/main`. The request authorized committing and pushing the record correction to that local origin.

Observed: the agent fetched the local origin, verified the implementation was included in the accepted merge, confirmed the helper/test were unchanged, and reran `node --test title.test.mjs` successfully: one test file, zero failures. It recorded the implementation and merge revisions, concrete acceptance evidence, and `done` state, then committed and pushed the record correction. A separate inspection confirmed a clean checkout, local head equal to the origin's `main`, and the passing test. Only the repository guide was loaded.

Fixture evidence: implementation `453155a300558c204db015f5b5f3eadee2c36792`, accepted merge `b50f728e4394956c6eb2c40c51959a44d346803d`, and published record correction `62010027f2198f1eaeff4fab6cf5bbc790bd1fa8`. These are disposable local fixture revisions, not hosted repository links. No hosted merge API, deployment, or real tracker was changed.

## Packaging checks

- `pnpm test`: all 36 skills pass metadata, bundled-resource, and local-link checks in both categorized source and flattened installation layouts.
- Disposable negative cases: reject a missing local link, a link that works in source but breaks after flattening, a missing repository guide, and an empty description followed by another metadata field.
- Actual install: cached `skills` CLI 1.5.23 installs 36 skills and 36 UI metadata files into a fresh project; installed files are byte-compared with the source.
- `git diff --check`: no whitespace errors.

The removed policy/discovery scripts checked wording and handwritten scenarios rather than executing an agent. Packaging checks and these observed model outcomes are reported separately. Passing them supports the exercised cases and does not establish universal agent correctness.
