# Skills

Portable Codex skill bundle for bootstrapping TypeScript product projects with a
planning loop, execution loop, core engineering standards, stack guidance, and
Alchemy infrastructure guidance.

## Install

This repo stores skills under category directories, so use `--full-depth`.

List available skills:

```sh
npx skills add https://github.com/cill-i-am/skills --full-depth --list
```

Install every skill into the current project for Codex:

```sh
npx skills add https://github.com/cill-i-am/skills --skill '*' --agent codex --full-depth --copy -y
```

Then ask Codex to run `linear-setup` in the target project. It installs the
repo-local `docs/agents/*` workflow docs and root `AGENTS.md` pointers that the
execution-loop skills expect.

## Bundle

See `MANIFEST.md` for the skill groups, external skills intentionally not
vendored here, and readiness gates.

## Validate

Run the bundle checks with:

```sh
pnpm test
```
