# Source foundation and adaptation boundary

Read on 2026-09-16. These pages are the conceptual references, not bundled copies
of the article or its worked example.

## Michael Lynch: How to Write an Effective Software Design Document

Source: https://refactoringenglish.com/excerpts/write-an-effective-design-doc/

Focus design effort on choices whose failure would be costly. Give unfamiliar
readers enough context to understand the project. State outcomes and scope
boundaries, explain consequential choices, and select sections according to
risk rather than mechanically filling a template. Use concrete scenarios and
editable diagrams where useful. Cover operational and data-protection concerns
when relevant. Record credible alternatives, actionable unresolved questions,
and the rationale for resolutions. Organize delivery around useful increments.

## Little Moments Design Doc

Source: https://refactoringenglish.com/excerpts/write-an-effective-design-doc/little-moments-design-doc/

The example connects user behavior and permissions to architecture, service
expectations, privacy, security, staged delivery, and decision records. Its
organizational pattern is useful; its particular technology choices and risk
acceptances are not a reusable blueprint or current product guidance.

## Original adaptations in this package

The two-mode routing, 400–600-word editorial default, evidence labels,
source-inspection rules, write-action boundaries, contradiction checks,
migration/rollback prompts, AI-specific prompts, acceptance checks, and trigger
examples are additions for an agent-based writing workflow. They should not be
represented as quotations or requirements from Michael Lynch.

## Skill-host reference

OpenAI, Build skills: https://learn.chatgpt.com/docs/build-skills

The package uses a SKILL.md entry point with name and description, optional
references, and agents/openai.yaml with implicit invocation enabled. Host
selection is description-based, not a guaranteed literal keyword hook. Local
user-scope discovery is documented at ~/.agents/skills; repository scope uses
.agents/skills. Installation and discovery must happen on the agent's host.
