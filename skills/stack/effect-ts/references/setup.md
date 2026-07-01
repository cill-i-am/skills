# Effect Source Setup

Use opensrc for Effect source lookup. Do not require a project-local `./.repos/effect` checkout.

## Required Setup

Install opensrc in the pnpm workspace root and cache the installed Effect package source:

```sh
pnpm add -Dw opensrc
pnpm exec opensrc path --cwd . effect
```

The root `package.json` should keep the Effect source available after installs:

```json
{
  "scripts": {
    "postinstall": "./scripts/ensure-effect-source.sh"
  }
}
```

The root `pnpm-workspace.yaml` should explicitly approve the `opensrc` build script because the CLI installs a platform binary:

```yaml
allowBuilds:
  opensrc: true
```

If `effect` is installed from the npm beta tag, keep using `pnpm exec opensrc path --cwd . effect`; opensrc resolves the version from the workspace lockfile. The returned package path is the single Effect source reference for the target project.

## Source Paths

Use `source-lookup.md` for path resolution. It explains how to translate older guide paths that mention `./.repos/effect`.

## Notes

- opensrc caches sources globally under the user's home directory, not in the repo.
- The `postinstall` script intentionally hard fails when `opensrc` is unavailable. Treat that as an environment setup problem.
- Worktrees and cloud environments should run `pnpm install` with dev dependencies before using the skill, then `pnpm run opensrc:effect` if the cache needs to be populated.
- Do not commit fetched Effect source into the target project.
- Run `pnpm run opensrc:effect` after Effect version updates.
