# Source map, provenance, and retrieval

## Source order

Read the target project's installed package, lockfile, patches, and relevant scripts first. Then use documentation/source matching that version. The public website is moving; this package records the upstream baseline `fbe6ece368c6898234592e897d852bb47b88ebb1`, where Alchemy reports `2.0.0-beta.81` and the dependency catalogue uses Effect `^4.0.0`.

The setup website can lag source: RC install tags, stage defaults, state-backend descriptions, and simplified tutorial policies must be checked against the dedicated guide and installed implementation. Do not silently turn an old snippet into the supposed current API.

## Find a guide

The [machine-readable index](source-index.json) links sources to local chapters and labels whether content was reviewed or is linked for task-specific retrieval. It is not a claim that every generated provider page was read or mirrored offline. The curated references provide the working guidance; exact resource schemas still belong to the matching official API/source.

```sh
python3 scripts/find-reference.py cloudflare d1
python3 scripts/find-reference.py workflows
python3 scripts/find-reference.py state recovery
```

Use [llms.txt](https://alchemy.run/llms.txt) to discover current guide paths. The [full corpus](https://alchemy.run/llms-full.txt) includes a much larger generated API surface; avoid loading it wholesale when one resource page or source file answers the task. A dead/moved link is a reason to search the current index, not invent a prop.

## Pinned source locations

- [Package exports and version](https://github.com/alchemy-run/alchemy/blob/fbe6ece368c6898234592e897d852bb47b88ebb1/packages/alchemy/package.json)
- [Dependency catalogue](https://github.com/alchemy-run/alchemy/blob/fbe6ece368c6898234592e897d852bb47b88ebb1/pnpm-workspace.yaml)
- [Guide source](https://github.com/alchemy-run/alchemy/tree/fbe6ece368c6898234592e897d852bb47b88ebb1/website/src/content/docs)
- [Worked applications](https://github.com/alchemy-run/alchemy/tree/fbe6ece368c6898234592e897d852bb47b88ebb1/examples)
- [Core/provider implementation](https://github.com/alchemy-run/alchemy/tree/fbe6ece368c6898234592e897d852bb47b88ebb1/packages/alchemy/src)
- [Provider and engine tests](https://github.com/alchemy-run/alchemy/tree/fbe6ece368c6898234592e897d852bb47b88ebb1/packages/alchemy/test)
- [Test harness implementation](https://github.com/alchemy-run/alchemy/tree/fbe6ece368c6898234592e897d852bb47b88ebb1/packages/alchemy/src/Test)

Guide slugs usually map to `.mdx` under the guide source; hubs often use `index.mdx`. Check the actual tree instead of assuming every page follows that convention. For a resource, inspect its exported type, provider reconciliation/diff, runtime binding implementation, and relevant test together when semantics matter.

## Coverage boundaries

The package covers the main core, operational, provider, framework, and integration use cases through task playbooks, selected complete apps, composition snippets, CI templates, and checklists. It intentionally does not reproduce every generated prop of every resource. Broader provider/advanced sections are selection and implementation playbooks; selected Cloudflare/AWS examples receive deeper concrete code coverage.

General hardening recommendations—least privilege, immutable build inputs, idempotency, reviewed migrations, bounded cleanup, and separate trust boundaries—are recommendations in this skill, not claims that every upstream tutorial already implements them.

## Attribution and updating

Alchemy source/documentation is licensed under Apache-2.0. This package contains original synthesis and modified illustrative examples with source links; see [NOTICE](../NOTICE) and [LICENSE](../LICENSE). Dependency packages themselves are not redistributed. External action/documentation links are primary-source references, not bundled action source.

Record the new revision and actual validation evidence when refreshing the package. Do not preserve the old validation date while silently changing example APIs.
