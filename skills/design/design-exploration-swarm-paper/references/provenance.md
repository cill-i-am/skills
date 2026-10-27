# Provenance

- Adapted from the user-owned local `design-exploration-swarm-paper` skill.
- Local source SHA-256: `ce00b73b979411cae3ff5238c1e24625df29fc5a64102d0242deaeb5b6695e43`.
- Alternatives: [Emil Kowalski prototype](https://github.com/emilkowalski/skills/tree/2d228630ba1446365f614a108cb8252f1feda202/skills/prototype), commit `2d228630ba1446365f614a108cb8252f1feda202`.
- States: [Jakub Krehel state-machine](https://github.com/jakubkrehel/skills/tree/592aedc44d7d5b3e29740984252902f3e5402a1c/skills/state-machine), commit `592aedc44d7d5b3e29740984252902f3e5402a1c`.
- Upstream sources are MIT; both complete notices are in [LICENSE](../LICENSE).
- Source versions and Paper tool guide inspected 2026-10-27.

## Adaptation

Retains the existing invocation name. Replaces compulsory multi-agent rounds,
fixed palette and project-specific framework assumptions with a small default
exploration, project-derived tokens, and separately loaded alternatives/states
references. Replaces browser pickers with editable Paper comparisons. Preserves
runtime verification as a distinct authorized stage using the actual component.
Paper designs remain available after selection. No claim of executable React,
gesture, focus or performance verification is made from an artboard.
