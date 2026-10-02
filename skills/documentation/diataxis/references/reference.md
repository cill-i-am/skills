# Reference: look up exact facts

Describe the public product surface neutrally and consistently. Organize around
its entities and relationships, not a lesson sequence or private code layout.
Use the authoritative schema or generator where the project already has one;
edit its source rather than hand-maintaining a competing generated output.

## Writing shape

Declare the scope and applicable version. Use a predictable entry structure,
including fields relevant to that surface:

| Surface | Facts to verify |
| --- | --- |
| API, SDK, or command | Names, signatures, authentication, inputs, outputs, errors, side effects |
| Setting or field | Type, units, allowed values, requiredness, default, limits |
| Roles or capabilities | Permitted actions, restrictions, availability conditions |
| Status or error | Exact identifier, meaning, conditions, related task guide |

Be complete within the declared scope, not encyclopedic about the whole product.
Distinguish omitted, empty, and null values where the contract distinguishes them.
Include concise examples when they clarify a fact; keep tutorials and discussions
in linked pages. An unknown default remains unknown, not a plausible guess.

## Review test

Can the reader find a precise answer without reading a narrative or inferring
missing behavior? Cross-check generated output against the supported release.

Illustrative title: **Import file schema**.

Basis: [Diátaxis reference](https://diataxis.fr/reference/).
