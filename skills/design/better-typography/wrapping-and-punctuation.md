# Wrapping and punctuation

Line length, typographic characters and mixed-direction text.

## Measure (line length)

Any unit works. `65ch` measures characters directly, one `ch` being the width of the `0` in the current font, and a pixel or rem cap is just as good. At a `16px` body size the 60–75 character range lands roughly between `560px` and `680px` depending on the font. Tailwind's `max-w-xl` (`576px`), `max-w-2xl` (`672px`) and `max-w-prose` (`65ch`) all fit. Recheck the cap if the body font size changes.

## Smart punctuation

| Instead of | Use |
| --- | --- |
| Straight quotes `"..."` | Curly quotes that curve around the text (keep straight quotes in code) |
| Hyphen in ranges | En dash: `2010–2020` |
| Two hyphens for an aside | Em dash character |
| Three periods `...` | The single ellipsis character `…` |
| Regular space in `10 km` | `&nbsp;` so the value never breaks apart |
| Uncontrolled word breaks | `&shy;` to mark where a word may break, or `hyphens: auto` with the correct `lang` |

## Internationalization

- **Long paragraphs align by their own language.** A one- or two-line snippet follows the surrounding UI's direction. A paragraph of three or more lines aligns to its own script instead, so an English paragraph stays start-aligned LTR even inside an RTL interface. `text-align: start` with the correct `lang` and `dir` on the paragraph element handles this.
- **Digits keep their order.** A phone number or "541" reads identically in RTL, because the Unicode bidi algorithm keeps digit runs left to right. `<bdi>` repairs a value whose order adjacent RTL text disturbs.

### Numeric columns and bidi

Treat value direction and column alignment separately. `<bdi>` isolates a value;
it does not align values with each other. `tabular-nums` makes digits equally
wide, but `222.22` and `1,333.32` still have different total widths.

First establish whether the product needs a physical right edge, a logical end
edge, or another convention such as decimal alignment. `text-align: end` follows
the alignment container's direction; it is not a synonym for `right`. Changing
`dir` on that container can therefore change the edge. Put any value-specific
direction on an inner element instead.

Use shared table/grid tracks or equally wide value containers. Independently
sized flex rows with auto margins can lose their common edge when a value wraps
onto its own row or the page direction changes. For example, a physical-right
invoice column can use a shared grid while isolating its known LTR values:

```html
<dl class="charges">
  <dt>Services</dt><dd class="amount"><bdi dir="ltr">€1,111.10</bdi></dd>
  <dt>Tax</dt><dd class="amount"><bdi dir="ltr">€222.22</bdi></dd>
</dl>
```

```css
.charges { display: grid; grid-template-columns: minmax(0, 1fr) max-content; }
.charges dt { min-inline-size: 0; overflow-wrap: anywhere; }
.amount { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
```

Use project spacing and adapt the shared track or stack the label above its
full-width value if the content no longer fits. Preserve localized values and
their complete text; do not reorder digits, clip amounts, or shrink text to hide
overflow. This example does not require every locale's numeric format to be LTR
or every product to use physical-right alignment.

At supported widths, check both document directions and enlarged text. Compare
the actual rendered value edges, not just the CSS declaration or equal cell
boxes, and confirm currency signs, separators and digits retain their order.
