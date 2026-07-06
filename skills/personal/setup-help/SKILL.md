---
name: setup-help
description: Guide the user through setup one step at a time. Use when the user asks for help setting up, configuring, installing, signing in, connecting a service, or walking through a manual process where the user must take actions outside the agent.
---

# Setup Help

Guide setup with one current action at a time. This skill is for work the user
must perform manually: browser clicks, sign-ins, account setup, OS settings, app
configuration, hardware steps, or permissions.

## Response Format

Every response during the setup loop uses exactly:

```md
Current step: <one atomic action>

----

Still remaining:
1. <next step>
2. <next step>
```

When nothing remains, say setup is complete and omit the remaining list.

## Rules

- Build the full internal checklist before the first step.
- Show at most 8 remaining items. Merge distant future items into phase-level
  entries rather than dropping them.
- Give only one current step. If it has substeps, split it.
- After the user completes a step, move the next item into `Current step`.
- Add newly discovered required steps immediately in the correct order.
- Do not ask the user to do something the agent can safely do itself.
- Do not proceed past sign-in, billing, production, or permission changes until
  the user confirms the step is complete.

Completion criterion: setup is complete, or the current step and all remaining
known steps are visible without overwhelming the user.
