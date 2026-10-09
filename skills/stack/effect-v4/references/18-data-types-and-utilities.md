# Data types, equality, matching, and utilities

## Use the standard library selectively

Effect includes pure utilities as well as the runtime. You can use these modules without turning every operation into an Effect. Prefer them when they express a real distinction or remove a fragile custom implementation; keep a normal array method or `if` when it is clearer.

| Family | Typical use | Important caution |
| --- | --- | --- |
| `Option`, `UndefinedOr` | Intentional absence | Do not convert absence to a defect by default |
| `Result`, `Exit`, `Cause` | Different levels of completion/failure | A Result is not a full runtime Exit |
| `Data`, `Brand`, `Newtype` | Value models and nominal distinctions | A type distinction is not input validation |
| `Array`, `Chunk`, `Iterable`, `Record`, `Struct`, `Tuple` | Collection transformations | Lazy and strict collections have different consumption costs |
| `HashMap`, `HashSet`, `Trie`, `Graph`, `HashRing` | Indexed, set, prefix, graph, or partitioning operations | Choose key equality and ordering deliberately |
| `Equal`, `Hash`, `Equivalence`, `Order`, `Ordering` | Comparing and organizing values | Equality and hash must agree |
| `Predicate`, `Filter`, `Match` | Narrowing and exhaustive branching | A runtime guard is not a full boundary codec |
| `Optic`, `Differ`, `JsonPatch`, `JsonPointer` | Focused updates and change descriptions | Paths and patches still need authorization |
| Mutable collections and `MutableRef` | Owned low-level mutable state | They are not automatically safe across async interleavings |

## Absence and exhaustiveness

```ts
import { Option } from "effect"

export const displayName = (name: Option.Option<string>): string =>
  Option.getOrElse(name, () => "Anonymous")
```

Choose whether absence is valid before choosing a helper. Do not scatter unsafe extraction through code because every current test contains a value. For tagged unions, use TypeScript exhaustive checks or `Match` so new variants produce useful compiler feedback.

## Equality is a domain decision

Two objects with the same fields are not automatically the same key under every collection. Structural data types and explicit Equal/Hash support can make value keys behave as intended. If two values compare equal, their hashes must be consistent. Do not change a value's equality-relevant fields while it is being used as a key.

An ID's equality may be case-sensitive even if a display name is not. A monetary amount needs currency as well as magnitude. A timestamp string may have multiple spellings for the same instant. Define normalization and equality together rather than fixing cache misses with ad hoc string conversion.

## Guards versus schemas

Use published Predicate helpers for common runtime narrowing instead of reinventing `isRecord`, `isString`, and similar helpers. Use Schema when validating an external shape, transforming representations, or needing structured issues. A check that a value is an object says nothing about the nested fields a domain operation expects.

Use refinements that are sound. An incorrectly declared TypeScript type predicate can convince the compiler of a fact the implementation never checked.

## Lazy data and size

An Iterable may be infinite, single-use, or expensive to traverse. Do not call a counting operation and then assume the same source can be traversed again. `runCollect` and collection conversion should have a known bound. Decide when you need a stable snapshot rather than a view of changing state.

Use Graph and Trie when the data structure matches the problem, not because a dependency tree or route table sounds sophisticated. Test cycles, disconnected nodes, empty structures, and duplicate keys as appropriate.

## Internal and advanced modules

Effectable, Pipeable, HKT, Types, Unify, Scheduler, and related machinery can support library authors. They are rarely the first tool for application code. Prefer supported extension points; do not import `internal` modules or mutate runtime internals to work around an unverified assumption.

## Official sources

- [Complete module index](https://effect.website/docs/v4/api/effect)
- [Option](https://effect.website/docs/v4/api/effect/Option)
- [Equal](https://effect.website/docs/v4/api/effect/Equal)
- [Hash](https://effect.website/docs/v4/api/effect/Hash)
- [Predicate](https://effect.website/docs/v4/api/effect/Predicate)
- [Match](https://effect.website/docs/v4/api/effect/Match)
