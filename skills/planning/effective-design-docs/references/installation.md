# Installation and trigger checks

This is an instruction-based writing skill, not an artifact-template card or a
remote plugin. Adding it to this repository does not install it into an agent.

## Install from this bundle

After the change is merged, install just this skill into the current project:

```sh
npx skills add https://github.com/cill-i-am/skills --skill effective-design-docs --agent codex --full-depth --copy -y
```

The category directory requires `--full-depth`, as described in the repository
README. For a manual installation, copy the complete `effective-design-docs`
directory to `<repository>/.agents/skills/effective-design-docs/` or
`~/.agents/skills/effective-design-docs/`. Keep `SKILL.md`, `agents/`, and
`references/` together; review an existing same-name skill before replacing it.

## Check host selection

The skill description contains one-pager and design-doc trigger phrases.
`agents/openai.yaml` enables implicit invocation, allowing host selection rather
than guaranteeing a literal keyword hook. For an explicit invocation, include
`$effective-design-docs` in the prompt. See [source notes](source-notes.md) for the
skill-host reference.

Use [trigger cases](trigger-cases.yaml) after installation to exercise compact,
full-design, review-only, explicit-format, and negative requests. These are
acceptance cases, not an automated harness or evidence of successful live runs.

Repository validation checks packaging, metadata, and local references. A clean
install and host-level evaluation are separate checks; report only those that
were actually performed.
