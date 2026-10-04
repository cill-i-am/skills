---
name: psychopomp
description: Create deterministic Rust motion graphics and explainer videos with Psychopomp following Kit Langton's story and motion guidance. Use for PR or code-change walkthroughs, animated diffs, protocol and architecture explainers, or live code presentations; also use when the user names Psychopomp. Do not add a video to every coding task unless requested or established by the user's workflow.
---

# Psychopomp

Turn verified behavior into a readable film: broken behavior, the fix replayed in
the same space, then the actual code change. Use Kit's concrete components and
motion vocabulary rather than inventing a renderer or a generic scene graph.

## Installation and sources

- Resolve the checkout from `PSYCHOPOMP_ROOT` or an existing user installation.
  Otherwise use `${XDG_DATA_HOME:-$HOME/.local/share}/psychopomp`.
- Use the checkout's `target/release/psychopomp`, or `psychopomp` on PATH.
  Run Scene Programs and repository scripts from the checkout root.
- For a fresh machine, read [Install Psychopomp](references/install.md). It covers
  Homebrew prerequisites, a pinned source checkout, building, PATH, and a GPU
  smoke test. Skill installation and renderer installation are separate steps.
- Read `README.md`, `CONTEXT.md`, `SCENE_PLANS.md`, and `AGENTS.md` there before
  authoring. Read `ARCHITECTURE.md` when modifying the engine.
- This is an early prototype. Check the installed checkout's APIs and examples;
  do not assume an npm package, generic scene graph, or stable CLI flags.
- Read [Story and motion](references/story-motion.md) before scripting or
  choreographing a film.
- Read [Narration](references/narration.md) when adding speech.
- [Provenance](references/provenance.md) identifies the tweet and upstream skills.
  Consult current upstream files when adapting to a newer checkout.

## Choose an existing scene

Copy the closest example's structure and change its content:

| Goal | Starting point in the repository |
| --- | --- |
| Compact PR explainer | `scenes/config-migration`, reusing `psychopomp_pr_walkthrough::film` |
| Stage film that flies into code | `scenes/pr-walkthrough/src/flagship.rs` or `src/stop_stage.rs` |
| Many ordered protocol messages | `scenes/pr-walkthrough/src/lib.rs` |
| Architecture with cards, orbs, packets | `scenes/opencode-jr-architecture` |
| Live stepped code presentation | `scenes/interactive-showcase` or `scenes/effect-succeed-slides` |
| Small installation check | `scenes/agent-demo` (Cargo package `agent-demo`) |

Use `StageActor` helpers (`settle_in`, `connect`, `send`, `hit`, `twang`, `land`),
`CalloutActor` for annotations, `RollingNumberActor` for counters, and `Diff` with
`keep`/`add`/`remove` for code. Read actual signatures before using them. Preserve
stable `LineId` and `PartId` values and animate only the smallest meaningful
delta. Retained suffixes may move to make room but should not fade or reappear.

## Author and review

1. **Ground the story.** Inspect the actual PR description, diff, tests, and
   behavior with `gh pr view` and `gh pr diff` or local Git. Write one sentence
   each for the broken behavior, fixed behavior, and change. Keep unverified
   claims out of narration. For a feature, use previous behavior, new capability,
   and implementation instead of inventing a bug.
2. **Write beats.** Follow `references/story-motion.md`. Give each beat one idea
   and, when narrated, a distinct transcript anchor. Keep clips roughly under
   30 spoken seconds. Scope the film to what merits explanation.
3. **Author the Scene Program.** Create `scenes/<name>` and add it to the Cargo
   workspace. Keep choreography there; JSON Scene Plans are compiled output.
   Speech cues use `Spoken::at`, `at_any`, or `at_after` against real transcript
   words. Rebuild the plan after re-voicing.
4. **Validate and inspect.** Run the Scene Program, then `plan validate` and
   `plan inspect`. Check `plan steps` for code presentations: changed part IDs,
   line positions, and unsettled holds. Resolve phrase failures against the
   transcript rather than guessing timestamps.
5. **Review motion.** Inspect every segment's before, switch, after, and code
   beats. Render targeted shutter-sampled frames plus a short normal-speed cue
   or range. Check overlap, clipping, contrast, captions, port contact, and
   stable retained code. Inspect contact boundaries at 40 ms or less when tuning
   impacts. Endpoint images cannot establish smooth motion. For live
   presentations also exercise forward/backward, skip, and interrupted
   `A → B → A → C` navigation.
6. **Export and verify.** Select the theme explicitly (`neutral` or `opencode`
   for Kit's explainer voice). Verify dimensions, frame rate, streams, and
   duration with `ffprobe`; normal exports are 1920×1080 at 60 fps, and narrated
   exports should contain AAC audio. Compare duration with `plan inspect`,
   allowing final-frame rounding. Check narration loudness near −16 LUFS and
   peaks below −1 dBFS.
7. **Deliver.** Put the final MP4 and useful authored source in the task's output
   directory. Report which playback/frames were inspected and any limitation.
   Publishing, uploading, or editing a PR description must be in requested scope.

## Native commands

From the repository root (substitute generated plan, times, and output):

```sh
cargo run -p <scene-package>
psychopomp plan validate <plan-or-reel.json>
psychopomp plan inspect <plan-or-reel.json>
psychopomp plan steps <plan.json>
psychopomp plan frame <plan-or-reel.json> 1.25 output/frame.png --theme neutral --shutter
psychopomp plan snapshot <plan-or-reel.json> 0:4:0.5 output/frames --theme neutral --shutter
bun scripts/sheet.ts <plan-or-reel.json> 1,3,5 --theme neutral --shutter --out output/sheet.jpg
psychopomp plan render <plan-or-reel.json> output/cue.mp4 --cue <id> --theme neutral
psychopomp plan render <plan-or-reel.json> output/study.mp4 --range 0.2..1.2 --theme neutral
psychopomp plan render <plan-or-reel.json> output/film.mp4 --theme neutral
psychopomp plan present <plan-or-deck.json> --theme original
ffprobe -v error -show_streams -show_format -of json output/film.mp4
```

`scripts/sheet.ts` uses Bun and ImageMagick, rebuilds release, and replaces
`output/sheet-frames`; use a separate directory/worktree for concurrent authoring.
Range exports preserve the original scene clock. CommitMono is bundled; do not
install replacement fonts as a rendering fix.

On macOS, a sandbox may validate plans but hide Metal adapters. If rendering
reports no suitable GPU, check the actual machine and use the environment's
approved execution escalation for GPU access when appropriate.

Keep generated media/plans in ignored `output/` and `target/` unless an example
explicitly checks in its canonical plan. Keep authored source and reusable
components. Put alternate narration in a separate scene/output directory.

For engine changes preserve arbitrary-time sampling and position/velocity
continuity across retargets. Use `psychopomp::math` for interpolation, easing,
geometry, and connectors. Domain values belong in `crates/psychopomp`, strict
preflight in `plan_runtime`, and pixels in `render`. Run repository-required
workspace tests, formatting, and strict Clippy for code changes. Rendering and
choreography changes also need targeted visual evidence.

Rebuild after an intentional source update:

```sh
cargo build --release --locked -p psychopomp-render
```

Rebuilds update the checkout binary. If using a separately installed binary,
repeat the native Cargo install command from the installation reference.
