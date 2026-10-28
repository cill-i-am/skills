# Design skills in Executor

This migration adds 15 skills to the shared catalogue: Jakub Krehel's seven
`better-*` skills, `build-design` and `interface-review`; Emil Kowalski's
`mobile-native`, `break-ui`, `animation-performance`, `animate` and
`find-animation-opportunities`; and the adapted `design-exploration-swarm-paper`.

## Sources and adaptations

- Jakub: `592aedc44d7d5b3e29740984252902f3e5402a1c`.
- Emil: `2d228630ba1446365f614a108cb8252f1feda202`.
- Each imported skill contains its complete supporting resources, MIT notice,
  pinned source URL and original file SHA-256 values in `references/provenance.md`.
- All entrypoints explain Executor sibling/reference loading and give existing
  project tokens precedence over recipe values, without weakening accessibility.
- Existing explicit-invocation policy is preserved in `agents/openai.yaml`; the unsupported legacy frontmatter key is removed. Descriptions and routing
  also recognize a user's natural-language request; Executor need not interpret
  a host-specific metadata flag to recognize intent.
- `better-interface` routes an explicitly requested diff review directly to
  `interface-review`, avoiding a redundant request to type another command.
- `interface-review` uses available rendered checks and labels unavailable ones.
- `build-design` reads Paper values through the connected tools and routes
  exploration/stress testing to the installed skills.
- Emil's ceremonial initial replies are removed. Missing-task invocations can
  ask for a target; concrete requests proceed. References to uninstalled review,
  prototype and library-picker skills are replaced with shared capabilities or
  the project's existing accessible components. React Native remains out of scope.
- `break-ui` can reuse established Storybook fixtures before adding a harness.
- `better-typography` distinguishes digit direction from the numeric column's
  intended alignment edge. Its numeric/bidi reference adds shared-column
  guidance after an RTL/enlarged-text evaluation exposed unequal value edges.
  This is a local adaptation of the pinned upstream files; original hashes and
  the MIT notice are preserved.
- `find-animation-opportunities` remains an on-demand, read-only filter, permits
  zero recommendations, records actual rejected candidates and hands accepted
  implementation work to `animate`.
- Performance guidance removes categorical scale/padding equivalence and
  unconditional compositor claims. Browser/library version and measured evidence
  decide acceleration. See [Motion performance](https://motion.dev/docs/performance)
  and [MDN will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change).
- The Paper skill keeps its stable name, replaces compulsory broad swarms and
  old project-specific assumptions with a small default, and offers separately
  loaded alternatives/state-preview modes. Runtime verification remains a
  distinct step; Paper artboards are not execution evidence. It includes MIT
  notices for Emil's `prototype` and Jakub's `state-machine` source approaches.

The source bundles contain Markdown/YAML guidance and examples, with no
executable helper files. Supporting references are retained. Local backups and
host-specific evaluation traces remain outside this repository.

## Verification and removal gate

1. Run `pnpm test` (metadata, dependency files and links in source/flat layouts).
2. Perform a clean local installation of this checkout and inspect all 55 entries.
3. Publish through a reviewed PR. Executor's existing Personal Skills app reads
   `skills/` from `main`; no extra deployment or connection is required.
4. Refresh Executor's catalogue, read each of the 15 new entrypoints and every
   returned supporting file, and compare them with the published bytes.
5. Exercise natural-language routing in fresh Codex processes using Executor,
   including Paper alternatives/states and a read-only review. Keep fixture,
   tool trace and actual outcomes; this is invocation evidence, not a statistical
   quality benchmark or a physical-device/browser test of an application.
6. Only after those checks, archive and remove the matching local skill folders.
   Verify the removed paths are absent and a fresh invocation still reads Executor.

The migration's final verification record lives in the task output; pending
steps must not be reported as completed merely because packaging checks pass.
