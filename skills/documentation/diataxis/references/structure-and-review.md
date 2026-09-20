# Structure and review

## Improve the smallest useful unit

For a single-page request, inspect that page and the sources needed to verify it.
For an explicit collection audit, inventory the requested scope and identify
coverage gaps against actual reader tasks. Report inaccessible or uninspected
areas instead of presenting a sample as a complete audit.

Classify passages by the need they serve. Keep useful content, split substantial
competing purposes where warranted, and link the resulting pages. Preserve
prerequisites and safety information during moves. Prefer the next useful change
over a wholesale rewrite or a taxonomy-only rename.

Diátaxis is a guide to improving content, not a requirement to populate a grid.
Grow structure from useful pages. Reader-friendly labels such as **Get started**,
**Tasks**, **Reference**, and **Concepts** are possible, not mandatory directories.

## Resolve boundary cases

| Existing material | Treatment |
| --- | --- |
| README, landing page, or overview | Keep concise orientation and route readers to useful destinations; classify substantive sections rather than forcing the whole page into one mode. |
| Quickstart or onboarding | A guided practice experience is a tutorial; completing real setup is a how-to. Classify by purpose, not the title. |
| FAQ | Classify each answer. Keep a useful discovery index, and link substantial answers to their canonical pages. |
| Troubleshooting | Diagnostic and recovery actions are how-to; error identifiers and meanings are reference. |
| Public architecture guide | Explain customer-relevant concepts and verified constraints; keep internal decisions in their owning records. |
| Changelog, policy, marketing copy, internal plan | Keep its own document purpose and workflow. These need not fit the four modes. |

## Preserve navigation and canonical ownership

Find the existing docs root, routing, sidebar, versioning, and generated sources
before proposing moves. Keep one canonical owner for a fact and link to it rather
than duplicating tables across guides. Standalone task prerequisites may be
repeated when necessary for safe use.

For changed paths, account for incoming links, anchors, sidebar entries, and
applicable version/translation counterparts. Preserve public URLs where possible;
use the site's existing redirect mechanism when a move is necessary. Without a
known mechanism, flag the redirect requirement instead of inventing configuration.
A docs cleanup does not authorize a new site generator or a publishing migration.

## Produce actionable findings

For each material issue, give **location → reader need → evidence/problem →
smallest useful correction**. Distinguish unsupported or unsafe claims from
mode-mixing, discoverability, and cosmetic issues; prioritize accordingly.

Review both factual correctness and whether the page actually fits the reader's
activity. A correctly classified but inaccurate page is still defective. Avoid
claiming numerical quality scores or measured user outcomes without a method and
evidence.

Bases: [Diátaxis workflow](https://diataxis.fr/how-to-use-diataxis/),
[compass](https://diataxis.fr/compass/), and
[quality](https://diataxis.fr/quality/). URL preservation, publication controls,
and the finding format are local operational conventions.
