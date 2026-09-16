# Final review checks

These checks govern the output, not the agent's private reasoning. Do not attach
this checklist to every document.

## Purpose and recommendation

Can a reader state the problem, proposed change, and decision required without
reading the conversation? Does each substantial recommendation serve a stated
need? Is the most consequential objection addressed rather than sidestepped?

## Evidence and uncertainty

Are project-specific claims supported by inspected sources? Are measurements
separate from targets? Are estimates labeled with assumptions? Are all linked
files real? Are source statements distinguishable from the author's proposal?
Have any unknown reviewers, dates, approvals, costs, or capabilities been filled
in without evidence? Replace unsupported certainty with an explicit open item.

## Consistency across sections

Check scope against scenarios, access rules against data delivery, promises
against failure behavior, and rollback against irreversible changes. Check that
the prose and diagram describe the same architecture. Check that discarded
options have not survived elsewhere as implementation instructions. A declared
non-goal does not excuse a safety requirement created by the proposed design.

## Review usefulness

Do the main open questions include an action that could resolve them? Are
blocking questions distinguished from deferrable details? Does each milestone
have observable evidence of completion? Would the document let another engineer
challenge the design without first reconstructing the entire discussion?

## Proportion and presentation

Is this the requested mode and length? Does each section add decision-relevant
information? Could a dense table become clearer prose? Are code samples limited
to consequential contracts? Is supporting material separate from the main
argument? For a one-page artifact, was the actual rendered page inspected at a
readable size? Do not claim a page count based only on Markdown length.

## Delivery integrity

Have only the requested files or external objects been changed? Does the final
message accurately distinguish drafted, saved, published, and approved? Do not
claim tests, rendering, or other validation that was not run.
