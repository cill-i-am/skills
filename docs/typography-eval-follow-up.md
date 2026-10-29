# Typography and data-only evaluation follow-up

Verified on 2026-10-28 against the harness merged in PR #17, based on
`49dfc52fafdda80d3487f50c0d2d2dcbf6ece740`. Five focused cases passed execution,
assertions and independent rubric review. The suite still contains 49 cases;
this follow-up did not rerun the entire suite or Paper cases.

## Contracts corrected

The original `break-ui--boundary` prompt prohibited production changes but did
not explicitly prohibit a fixture-data file. Its unchanged-files assertion was
stricter than that wording. The prompt now requires inline data and explanations
and prohibits creating, editing or deleting any files, including fixture data.
The assertion remains unchanged. The earlier failed result is preserved.

The earlier typography output used individually sized flex rows and logical
alignment, which lost the common amount edge in RTL. The skill now separates
value direction from the intended alignment edge, recommends shared columns or
equally wide value containers, and requires checking rendered value edges.
Physical-right alignment is an explicit requirement of this invoice case; it is
not imposed on every product. The original upstream hashes and MIT notice remain
intact, with the adaptation recorded in the skill's provenance.

The typography case now explicitly requires 320/640/1280px × LTR/RTL × normal/
doubled text. Browser captures include computed direction, alignment and
text-node range rectangles so a reviewer can measure actual text edges.

## Focused results

| Case | Verdict | Evidence reviewed |
| --- | --- | --- |
| `better-typography--task` | Passed | Candidate guidance read; shared grid and inner value isolation; preserved tokens and invoice text; independent 12-scenario browser matrix and screenshots. |
| `better-typography--boundary` | Passed | Source-only review, no file changes or speculative defects. Preserved logical `end` alignment because no physical-right requirement was supplied. |
| `break-ui--boundary` | Passed | Inline data only; no file changes or rendering claims. Independently checked 80-code-point name, 40-character role, 254-character email, and collections up to 100 rows. |
| `better-typography--negative` | Passed | French translation only; zero tool calls and zero file changes. |
| `break-ui--negative` | Passed | French translation only; zero tool calls and zero file changes. |

Each verdict is bound to the recorded result and unchanged output hashes through
`harness.py review`; successful execution alone was not treated as a pass.

## Independent rendered alignment

An isolated Chromium session measured the previous output and the candidate
output using the same probe. Spread is the difference between the largest and
smallest rendered right edge across the three amount strings, in CSS pixels.

| Direction | Width | Text size | Previous spread | Candidate spread |
| --- | --- | --- | ---: | ---: |
| LTR | 320, 640, 1280 | Normal and doubled | 0 | 0 |
| RTL | 320 | Normal | 37.328125 | 0 |
| RTL | 320 | Doubled | 86.046875 | 0 |
| RTL | 640 | Normal | 37.328125 | 0 |
| RTL | 640 | Doubled | 71.671875 | 0 |
| RTL | 1280 | Normal | 37.328125 | 0 |
| RTL | 1280 | Doubled | 71.671875 | 0 |

All 12 candidate scenarios had no horizontal overflow; customer-name, reference
and amount text rectangles fit their containers. The complete identifier and
all three values remained intact. Inspected narrow RTL/doubled and regular LTR
screenshots confirm visible multilingual text and the currency/separator order.
The separate capture's axe check reported zero violations.

## Provenance and limits

Executor serves `main`, so the two typography cases first read the deployed skill
and then explicitly read a frozen copy of the PR candidate. The custom suite
added only that disclosed candidate-read instruction to those two prompts. The
other three cases used the normal prompts. No connection or deployed source was
redirected. This verifies candidate execution, not automatic discovery of an
unmerged skill. The catalogue description is unchanged.

- Executor revision: `791a8d74ca3b2c1ed904ba0cc2a5a8e98446323616d20e32d8c757c3eac5a669`.
- Candidate `SKILL.md` SHA-256: `69aeb028c7204e6bce32ac587b52191d40d4796cc2a28b265ccd8a7b27ba4c72`.
- Candidate `wrapping-and-punctuation.md` SHA-256: `6c716a101d0e6d74157ff2b49c0d29bec272003922acfdc2e5cfd7d0cd650a8e`.
- Both candidate reads were checked byte-for-byte in the traces. All ten
  candidate files still matched the checkout after execution.
- Local run: `rtl-contract-rerun-20261028`; frozen inputs:
  `rtl-contract-inputs-20261028`, under the ignored `.eval-runs/` directory.
  Raw traces, original failures, source hashes, screenshots, measurements and
  review records remain local; this is the sanitized verification record.

This is one focused regression run, not a statistical reliability estimate.
Independent enlarged-text checks doubled computed font sizes; the subject also
tested temporary size-token overrides. Neither is native browser zoom. Safari,
Firefox, physical devices and screen-reader pronunciation were not verified.
Recovered tooling errors remain in the raw traces.

Packaging and harness checks also passed: 25 offline tests, validation of all
55 skills, the skill-creator validator, and an isolated installation containing
55 skills and 55 metadata files. Offline tests required permission to bind their
temporary loopback servers; they did not contact external services.

The first PR CI run exposed a pre-existing race in the interruption test on
macOS/Python 3.9: log-file creation was treated as proof that the fake subject
had started, allowing termination during process startup. The test now waits
for an explicit ready event from the fake subject and also verifies that its
descendant cannot write after interruption. This changes only the offline test;
the runtime harness and the five evaluated skill cases remain unchanged.
All 25 offline tests passed again, and the corrected interruption test passed
20 consecutive runs, including its descendant-cleanup assertion.

Before merge on 2026-10-29, review identified a portability assumption in the
rectangle probe. Chromium exposes an iterable `DOMRectList`, so the earlier
captures were valid; the probe now uses `Array.from` to support array-like lists
without requiring an iterator. A fresh browser comparison with the iterator
temporarily disabled produced identical metrics. Independent captures at
320/640/1280px and 320px RTL/doubled text again showed 0px amount-edge spread and
no horizontal overflow. All 25 offline tests and validation of 55 skills passed.
