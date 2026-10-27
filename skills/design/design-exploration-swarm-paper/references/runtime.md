# Runtime verification after visual exploration

Run this stage when the request includes implementation/verification or the
user authorizes an interaction prototype. Paper-only work ends with visual
evidence and explicit runtime limits.

Reuse the project's existing preview/Storybook and real component. Supply
fixtures through its normal props, request mocks, provider or cache. Keep
loading pending deterministically, and prevent mocks from writing live data.
If a new test seam is necessary, explain it and stay within implementation scope.

Check each selected state, relevant viewport, keyboard path, focus restoration,
reduced-motion behaviour and error recovery. For motion, use `animate` to build,
`animation-performance` to diagnose measured jank, and `mobile-native` for
device-specific web behaviour. Load the applicable skill from Executor first.

Record the actual commands/interactions and observed outcomes. Browser emulation
does not establish physical-device keyboard or gesture behaviour. A successful
screenshot does not establish focus, timing or performance. Label unperformed
checks precisely.

Keep useful regression fixtures in the project's established test setup. A
throwaway harness remains dev-only and is removed only when appropriate to the
agreed task. Preserve the Paper design record unless deletion is requested.
