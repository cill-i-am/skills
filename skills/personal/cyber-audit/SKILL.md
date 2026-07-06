---
name: cyber-audit
description: Run a read-only local exposure audit for a CVE, breach, malicious package, supply-chain advisory, or security notice. Use when the user asks whether their machine, repos, dependencies, tools, or projects are affected by a security advisory or wants a local vulnerability check.
---

# Cyber Audit

Run a read-only exposure audit and write a concise report. This skill is
diagnostic only.

## Hard Rules

- No `sudo`.
- No installs, upgrades, removals, restarts, service changes, firewall changes,
  or credential changes.
- No writes outside the audit report unless the user explicitly asks.
- Browse or fetch the advisory first when the issue is current or source details
  matter.
- If a check would mutate state, skip it and write "not checked - would require
  state change".

## Workflow

1. Identify the advisory: affected package, binary, version range, platform,
   attack vector, and exposure condition.
2. Verify details from primary sources where possible: vendor advisory, CVE,
   GitHub Security Advisory, npm/PyPI/crates advisory, release notes, or source
   repository.
3. Pick relevant local checks. Do not run an unrelated scan of the whole
   machine.
4. Build a table of checks and concrete results.
5. Write `~/Documents/YYYY-MM-DD-<short-slug>.md`.
6. Report the verdict and path.

## Check Menu

Use only relevant checks.

```sh
# Node
which npm pnpm yarn
npm root -g
pnpm root -g
find ~/Documents ~/Desktop ~/Downloads -maxdepth 8 \
  \( -name package.json -o -name package-lock.json -o -name pnpm-lock.yaml -o -name yarn.lock \)

# Python
which python3 pip pipx uv
pip list 2>/dev/null
find ~/Documents -maxdepth 8 \
  \( -name pyproject.toml -o -name requirements.txt -o -name poetry.lock -o -name uv.lock \)

# Homebrew and binaries
brew list --versions <formula> 2>/dev/null
which <binary>
<binary> --version 2>/dev/null

# Processes and listeners
pgrep -lf "<name>"
lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null

# Launch agents
ls ~/Library/LaunchAgents /Library/LaunchAgents /Library/LaunchDaemons 2>/dev/null
```

For other ecosystems, use the same pattern: global install locations, project
manifests, lockfiles, running processes, listeners, and configuration that
affects exposure.

## Report Template

```md
# <Subject> Audit

**Date:** YYYY-MM-DD
**Host:** <host>

## Advisory In Scope
- <source and summary>

## Audit Results
| Check | Result |
|---|---|
| <check> | <concrete result> |

## Verdict
**Not affected. | Affected. | Partially affected. | Inconclusive.**

- <rationale>

## Action Taken
None - diagnostic only.

## Follow-Ups
- <specific remediation or "None">
```

Completion criterion: the audit report exists, all checks were read-only, and
the verdict follows from advisory scope plus local evidence.
