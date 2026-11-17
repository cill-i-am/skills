# Release refresh acceptance

- Verify the npm release and dereferenced tag. Update provider packages, lockfiles, Effect and SQL peers together.
- Rebuild the versioned catalogue with [maintenance](maintenance.md). Check the release guides, examples, package exports, symbol routes, and website-only availability separately.
- Install both fixture workspaces with frozen lockfiles. Run both typechecks, the Vite build, R2 and D1 emulator tests, and unit/guard suites.
- Run the tagged offline acceptance suite for ownership, protection, rename, replay, subscription, sandbox handling and worktree isolation. Keep a failed import as a compiler negative control.
- Evaluate the ten independent user intents in [validation](../evals/validation.md). Use an isolated skill copy without answer keys when evaluating a fresh agent.
- Record target, account and authorization separately for real IAM, production-like migration, third-party execution and host-specific frontend verification. A clean emulator run supports the local claim.
