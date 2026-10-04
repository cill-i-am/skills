# Kit's story and motion guidance

Adapted from upstream `psychopomp/STORY.md`, `explainer-motion/SKILL.md`,
`explainer-motion/TECHNIQUES.md`, and repository `AGENTS.md`. Full calibration
lives in the installed checkout's `.opencode/skills/explainer-motion/`.

## Story and visual voice

Explain behavior before code. Replay the fix with retained actors in the same
places; rewind or fade broken-only elements. The switch makes the comparison.
Introduce one idea per beat when its narration says it.

Write short, confident sentences: what happens, then why it matters. Avoid hype
and filler. Use lowercase terminal-style captions, CommitMono, one accent word
per caption, and a block caret for typing. A typical PR frame has a top-left
number/title, top-right status (`before`, rewind, `after the fix`, `the change`),
and one footer stating the point.

Use blue for requests, green for success, red for errors, yellow for warnings,
and one accent for the thing to follow. Stage films suit behavior; sequence
diagrams suit many ordered messages. Display code retains real identifiers
and the actual change's shape, condensed to about 76 columns and 14 rows. Label
it as condensed. Use a zoom from a Stage card into code, and a dip between
text-heavy segments.

## Causal motion

Name each beat's source, path, and receiver. Energy gathers, travels, lands, and
cools. Keep idle wires and frames still and matte. Let one focal action win at
thumbnail size; pause competing motion during explanation.

Light stays near the signal: packets illuminate nearby rims, arrivals spread
from the socket. Bloom belongs to active packet heads and the hero object;
borders and trails stay crisp. Avoid whole-card washes or standing neon halos.
An arrival changes local light and ink, not receiver scale or ports.

Reaction follows contact, including anticipation: replies must not prepare
before requests land. Make consequences physical where useful: a stopped server
breaks apart, a dropped error falls, a timeout ring closes. Rewind reassembles
and reconnects before the same moment resolves differently.

## Timing and movement

- Packet travel: minimum-jerk quintic (`smootherstep`) between resting poses.
- Draw-on: `cubic-bezier(.45, 0, .2, 1)`.
- Camera: critically damped springs for weight; exact glides when timing
  between resting compositions calls for them.
- Panels: small displacement and damped springs, content following roughly
  60–65 ms later; tune amplitude before bounce.
- Impacts: immediate attack, fast decay with a tail; shake only on impact.
- Entrances: stagger roughly 120 ms. Match known operation timings before
  inventing extra waits.
- Ordinary prose: sharp, quick fades (upstream uses 160 ms), rather than
  the blur treatment for changing code slots.

Preserve objects across beats. Let the camera establish, follow the active actor,
reveal consequences, and push into resolution. Keep content tracks separate
from container geometry when their motion differs. Reactions, light, blur, and
camera are deterministic functions of one event clock. Use existing helpers
and math; avoid frame integration or delayed callbacks. Retarget from current
position and velocity.

For exact materials, orb contact, destruction, packet trails, and rewind
formulas, read upstream `TECHNIQUES.md` for the beat being implemented. Compare
normal-speed studies and boundary frames, not just settled screenshots.
