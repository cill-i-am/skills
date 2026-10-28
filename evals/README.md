# Reusable skill evaluations

Run a frozen scenario in a fresh Codex process, inspect the returned skill content
and resulting artifacts, and record an evidence-based verdict. A process exiting
successfully is **not** a passing evaluation.

The bundled suite has 49 cases for 15 design skills: 15 tasks, 15 boundary cases,
15 quoted-name negative controls, one explicit writing boundary, two Paper
follow-ups, and one 15-intent routing matrix. The matrix is one run with 15
requests, not 15 independent trials. Selecting a Paper follow-up automatically
includes its creation dependency.

## Requirements

- Python 3.9+ and Git; no Python packages to install.
- macOS or Linux for live runs (process-group cleanup is POSIX-specific).
- An authenticated `codex` CLI with `exec`, `--json`, `--ephemeral`, `--sandbox`
  and `--skip-git-repo-check`. `--auto-review` additionally needs `--approve-for-me`.
  Inspect `codex exec --help` on your installation; flags can change.
- Executor visible to **the CLI session**, with the intended skill app connected.
  A connection visible only in the desktop chat is insufficient.
- Browser cases need the agent's browser tools. Independent captures additionally
  require `agent-browser` with Chromium and its `a11y` command. Paper cases need
  the Paper connection and explicitly use `--paper`.

The runner inherits your configured model, tools and account. It does not install
skills, change global instructions, create connections or bypass approval checks.
Live runs consume your model usage. Run selected cases before the full suite.

## Quick start

From the repository root:

```sh
# Offline tests: fake Codex processes, temporary files and loopback servers only.
python3 -m unittest discover -s evals/tests -v
node scripts/validate-skills.mjs

python3 evals/harness.py list
python3 evals/harness.py run \
  --case better-writing--task --case animate--negative \
  --out .eval-runs/smoke-01

# All boundary cases, or the entire suite (Paper cases are reported as skipped).
python3 evals/harness.py run --kind boundary --out .eval-runs/boundaries-01
python3 evals/harness.py run --out .eval-runs/design-01
```

Output directories must be new; rerunning never silently reuses a modified
fixture or an old result. Cases run sequentially to keep shared service state
and usage understandable. Interruptions stop the current process group and
fixture server, preserve evidence and leave remaining cases `not-run`.

`--executor-app` selects the shared skill source. `--revision` asks for and
checks an exact Executor skill revision; omit it to record whichever revision
is actually returned. It is an Executor content revision, not a Git commit.
This runner evaluates deployed Executor skills; it does not install a candidate
checkout or secretly redirect the deployed app to a PR branch.

```sh
python3 evals/harness.py run --case better-writing--task \
  --executor-app your-skills-app --revision YOUR_EXECUTOR_REVISION \
  --out .eval-runs/candidate-01
```

Use `--model`, `--codex /path/to/codex`, and repeatable `--codex-config key=value`
only when needed. For example, a host with a broken duplicate legacy connector
can pass `--codex-config mcp_servers.executor_v2.enabled=false`. This is an
optional, per-run setting, not a required connection name or a global edit.
Config overrides are saved verbatim: **do not put credentials in them**.

`--auto-review` routes non-negative cases through Codex's automatic approval
review in a writable workspace. Otherwise the runner requests `workspace-write`.
Negative controls always request `read-only`; the runner never combines
`--approve-for-me` with `--sandbox`. Approval denial is evidence of a blocked
operation, not permission to retry through another account or bypass checks.

## Evidence and grading

Each run stores:

- `run.json`: frozen case definitions/rubrics, fixture and harness hashes, CLI
  version and explicit settings. Unspecified model settings are inherited,
  not guessed; record the effective model separately when comparing runs.
- `cases/<id>/trace.jsonl`, `stderr.txt` and `result.json`: raw execution,
  time/usage, successful Executor skill reads with revision/content hashes,
  tool errors, final response, before/after file hashes and changed paths.
- `cases/<id>/before/`: the pristine subject files, without Git internals.
- `workspaces/subject-<random>/`: the actual resulting fixture. Expected skill
  names, scoring rules and case IDs are kept outside the subject workspace.
- `summary.json` / `summary.md`: execution/assertion/review status.

The runner verifies completed traces, required successful skill entrypoint reads,
requested revisions, protected files, read-only changes, JSON keys where declared,
review-fixture Git refs, and no tool attempts in negative controls. Tool failures
are retained even if the agent later recovers. A reference-file read does not
count as reading a skill entrypoint. Invalid/truncated traces do not pass.

An otherwise successful run is `unreviewed`. Inspect **every rubric item**, the
actual output, trace and independent evidence before recording a decision:

```sh
python3 evals/harness.py review .eval-runs/smoke-01 \
  --case better-writing--task --reviewer reviewer-name --verdict passed \
  --evidence 'Checked each rubric item against the output copy.json and trace; describe the findings here.'
python3 evals/harness.py report .eval-runs/smoke-01
```

Review notes must describe what was checked and point to evidence. They are
human/agent judgments, not automatic quality scores. A review is bound to the
result file's hash; altered results invalidate it. Reviews and browser captures
also verify the workspace against its recorded file hashes. Changed or missing
outputs become `stale-artifacts`, including after a review passed; rerun the case
instead of grading an edited outcome. Execution/assertion failures
cannot be overridden to pass. `skipped`, `blocked`, `not-run`, `failed`,
`unreviewed`, `stale-review`, `stale-artifacts` and reviewed `passed` remain distinct. A run exit
code of zero means no execution/assertion failures among executed cases, **not**
that all cases ran or quality review passed. Exit 1 means a failed/blocked case,
2 a setup error, and 130 an interrupted run. `report` is informational.

## Independent browser evidence

Capture the frozen baseline and agent result with a separate browser session:

```sh
python3 evals/capture.py .eval-runs/design-01 \
  --case better-layout--task --phase before --rtl-enlarged
python3 evals/capture.py .eval-runs/design-01 \
  --case better-layout--task --phase after --rtl-enlarged
```

The capture tool starts/stops its own loopback server on an available port,
saves screenshots and DOM measurements at 320/640/1280px, runs accessibility
checks, and closes its uniquely named browser session. The optional RTL/text
probe captures all original computed font sizes before doubling them, avoiding
cascading amplification. This is **not browser zoom**. Capture errors and cleanup
failures are explicit; a screenshot is not itself a passing score.

Metrics include computed direction/alignment and text-node range rectangles, so
reviewers can compare rendered amount edges rather than assuming equal boxes or
`tabular-nums` imply alignment. Wrapped text has multiple rectangles; generated
CSS content is not included, so also inspect the markup and screenshot. The typography
case requires LTR and RTL at normal and doubled text sizes; the capture tool's
single 320px RTL/enlarged probe supplements, rather than replaces, that matrix.

Keyboard/focus interactions, interruption/reduced motion, contrast calculations,
animation profiling, image comparisons and physical-device behavior still need
case-specific review. The one-off, case-hardcoded interaction/profiling scripts
are not disguised as general-purpose graders. Do not infer real screen-reader,
GPU, mobile-device or backend proof from a browser screenshot.

## Paper integration

```sh
python3 evals/harness.py run --paper \
  --case design-exploration-swarm-paper--states --case build-design--paper \
  --out .eval-runs/paper-01
```

This explicitly authorizes a new Paper file, its two alternatives and subsequent
state artboards. Each run creates its own file; no personal file ID is embedded
in the suite. The first case exports `file_id` and ordered `artboard_ids`; the
runner requires a successful `create_file` result and verifies that exported
artboards were created in that file by the configured native Paper server.
State copies must derive from known artboards in the dependency file. Merely
reading an existing file, matching a string, or seeing an ID in another provider's
response does not authorize a handoff. The runner writes only
that handoff as `input.json` for dependent cases. A missing/invalid export blocks
consumers. The first option is the declared test selection, not an inferred user
choice. The build case reads that same original option and must not mutate Paper.

Exports prove handoff identity, not design quality or preservation. Review the
Paper traces, screenshots, tokens, state reachability and original artboards.
If a provider's result format cannot corroborate IDs, the case fails explicitly;
update the adapter and its tests before claiming success. Paper files are retained
for review, never automatically deleted. Close/clean up those artifacts yourself
after deciding they are no longer needed.

The native Paper server defaults to `-aper`, as observed in Codex traces. If your
connection uses another name, pass its exact trace name as `--paper-server NAME`.
This adapter reads Paper's structured file/artboard creation results; it does
not infer creation from generic Executor wrapper calls.

## Add or compare cases

Use `--suite path/to/suite.json`. Paths are relative to that manifest's adjacent
`fixtures/` directory; fixtures may not include symlinks or `.git`. The manifest
has `schema_version: 1` and a nonempty `cases` array. Required case fields are
`id` (unique lowercase letters/digits/hyphens), `kind`, `prompt`, and `rubric`
(the review criteria). The bundled manifest is the working example.

Optional fields:

| Field | Meaning |
| --- | --- |
| `skill` | Reporting label; never inserted into the subject prompt |
| `fixture` | Relative frozen fixture directory; null for empty workspace |
| `expected_skills` | Entrypoint reads required from the selected Executor app |
| `protected` | Files whose bytes must remain unchanged |
| `unchanged` | Require the entire workspace's file set/content to remain unchanged |
| `serve` | Start a loopback HTTP server and append its URL to the prompt |
| `json_keys` | Require the named JSON object's original keys |
| `paper` | Skip unless the operator supplies `--paper` |
| `depends_on` | Earlier case whose validated Paper export becomes `input.json` |
| `export` | JSON file with `file_id` and unique `artboard_ids` |
| `git_history` | Build this suite's two-commit interface-regression fixture |

Keep expected answers and rubrics out of fixtures. A literal skill request is
appropriate for explicit-invocation tests; use ordinary language for routing
tests. Boundary tasks may reasonably need no skill read, so they assert scope
and evidence quality without forcing activation. The explicit writing follow-up
tests invocation separately. Negative controls test quoted names, not task intent.

To compare revisions, use separate output directories, the same frozen cases,
explicitly matched models/tool configuration, repeated trials and independent
review. The runner provides evidence, not a statistical claim of improvement,
a no-skill control environment or a blinded judge. The workspace instructions
ask agents not to inspect rubrics/siblings; this is not an OS read-isolation
boundary. Installed skills/global instructions remain part of the recorded host
environment and may influence results.

## Provenance and publication

These synthetic fixtures and rubric scenarios were authored for the design-skill
migration evaluation and frozen before agent edits. The two reference PNGs were
generated from our synthetic Members fixture; they are not third-party design
assets. Skill authorship/licenses remain in each skill's `UPSTREAM.md` and license
files. This harness changes no skill source, registration or provenance.

The suite preserves the original 49-case coverage while replacing machine paths,
fixed ports, pre-existing Paper IDs and manually hardcoded passing results.
It does not publish the earlier run's results as new proof. The evaluation approach
also follows [OpenAI's skill-evaluation guidance](https://developers.openai.com/blog/eval-skills):
use repeatable fixtures and examine activation, execution and outcomes separately.

`.eval-runs/` is ignored. Raw traces can contain account IDs, local paths, tool
responses and private source text. Keep them local; publish a deliberately
reviewed evidence summary instead of uploading the whole output directory.
CI runs only the offline harness tests and skill packaging validation, with no
Codex account, model inference, external-service calls or Paper mutations.
