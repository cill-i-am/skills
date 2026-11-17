# Select the installed API

Resolve `alchemy`, the selected `@alchemy.run/<provider>`, Effect packages, runner and framework/SQL adapter from the workspace package that imports them. Compare declared ranges with the lockfile, actual exports, workspace overrides and patches. The current release is **2.0.0-beta.87**, tagged at `33c10dd55f5559beee2ec96b155c3a6429e44a93`. The release catalogue uses Effect 4.1.4. Align provider packages with core.

For an existing project, use its resolved API. If it differs from the fixture, inspect its installed files or matching Git tag. An upgrade needs its own lifecycle and state review. The v1 signature uses async stack setup/finalize; see [migration](migration.md) when migration is requested. The current skill examples use only the current release.

Read the installed exports first, then the matching tagged source or example, then the live docs. The website can include changes made after publication. DigitalOcean appears in later source; beta.87 lacks that provider. Look for an installed package and a matching release before offering a provider-specific implementation.

[Release manifests and source](https://github.com/alchemy-run/alchemy/tree/v2.0.0-beta.87/packages) · [Changelog](https://github.com/alchemy-run/alchemy/blob/v2.0.0-beta.87/CHANGELOG.md)
