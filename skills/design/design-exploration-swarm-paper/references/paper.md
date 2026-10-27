# Paper mechanics

The live Paper guide and tool contracts govern current capabilities. Read them
before authoring; these are workflow reminders, not substitute schemas.

- Identify the file/page, read its tokens and inspect existing artboards first.
- Verify font family and weight before styling. Use px for font size, em for
  letter spacing, and the current guide's line-height conventions.
- Create named artboards with enough separation for full-size inspection.
- Use HTML with inline styles and existing CSS-variable tokens. Paper parses
  this into design nodes; it does not import the project's executable component.
- Use flex, padding and gap for layout. Avoid unsupported grid/table/margin
  assumptions. Check the current guide when a layout needs another primitive.
- Add one visual group at a time. Clone known nodes and update styles/text
  where possible; avoid replacing an entire design for a small correction.
- Use fixed-width, nonshrinking icon/action slots in repeated rows.
- Inspect screenshots after meaningful changes. Fix clipping with the supported
  fit-content operation where appropriate, not guessed repeated height changes.
- Finish working on the affected nodes when done.
- Export exact JSX/styles/tokens/assets for implementation. Screenshots support
  visual comparison; they are not a substitute for available design values.

Do not expose raw node IDs in the final handoff. Report artboard names and a
verified link when the tool provides one.
