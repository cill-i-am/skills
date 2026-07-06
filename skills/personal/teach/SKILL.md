---
name: teach
description: Build a stateful learning workspace for a topic. Use when the user wants to learn a skill or concept over multiple sessions, asks to be taught, wants lessons, practice, learning records, a study path, or durable reference material for a learning goal.
---

# Teach

Teach through durable learning artifacts, not long chat explanations. Treat the
current directory as the learning workspace unless the user provides another
path.

## Workspace Files

- `MISSION.md` - why the user is learning the topic and what success means.
- `RESOURCES.md` - trusted sources and communities.
- `NOTES.md` - user preferences, constraints, and teaching notes.
- `learning-records/NNNN-slug.md` - evidence of durable understanding,
  misconceptions corrected, or mission changes.
- `lessons/NNNN-slug.md` or `.html` - one focused lesson.
- `reference/` - compressed references such as glossaries, cheat sheets,
  algorithms, or routines.

Create files lazily. Do not generate a large course upfront.

## First Move

If `MISSION.md` is absent or vague, ask one question about the real-world goal
before teaching. A good mission is concrete:

- "ship a Rust CLI for my team"
- "run a half marathon by October"
- "understand Effect well enough to review services"

Avoid abstract missions like "learn X" unless the user confirms that is enough.

## Lesson Rules

- Teach one narrow concept or skill per lesson.
- Tie every lesson to the mission.
- Use trusted sources. Browse when source freshness matters.
- Prefer short explanations plus practice over long exposition.
- Include retrieval practice or a task with immediate feedback when possible.
- Keep chat replies concise; put detailed teaching material in lesson files.
- Update `learning-records/` only when the user demonstrates understanding,
  states prior knowledge, corrects a misconception, or changes the mission.

## Resources

`RESOURCES.md` should separate:

- **Knowledge** - books, papers, docs, courses, primary references.
- **Wisdom** - communities, forums, classes, mentors, or places where the user
  can test skill in the real world.

Annotate each resource with when to use it. Prefer fewer high-trust resources
over long lists.

## Learning Records

Write a record when it changes what should be taught next:

```md
# <What was learned>

<1-3 sentences: what the user demonstrated or disclosed, why it matters, and
what it unlocks or rules out for future lessons.>
```

Do not create session logs. Coverage is not learning.

## Reference Material

Create `reference/` files for compressed material the user will reuse:
glossaries, syntax references, flowcharts, checklists, routines, or worked
examples. Update them as understanding improves.

Completion criterion: each teaching session either clarifies the mission,
creates one focused lesson, updates a reference, or records demonstrated
learning with evidence.
