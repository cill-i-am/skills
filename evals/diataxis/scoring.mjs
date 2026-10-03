// Checks are deliberately modest. Human rubric review is still required.
export function behavior(output, required) {
  const missing = required.filter((term) => !output.toLowerCase().includes(term.toLowerCase()));
  return { status: missing.length ? 'fail' : 'pass', pass: missing.length === 0, score: missing.length ? 0 : 1,
    reason: missing.length ? `Missing required evidence terms: ${missing.join(', ')}` : 'Content smoke checks pass; review rubric before acceptance.' };
}

export function selection(expectedSkill, metadata = {}, startupEvidence = []) {
  const reads = (metadata.skillCalls ?? []).map((call) => call.name);
  // Startup evidence must come from independently captured host context, never
  // from the final answer claiming it used a skill.
  const observed = new Set([...reads, ...startupEvidence]);
  if (!expectedSkill) return observed.has('diataxis')
    ? { status: 'fail', reason: 'Unexpected Diataxis invocation observed.' }
    : { status: 'inconclusive', reason: 'No Diataxis read observed; absence does not prove non-use.' };
  if (expectedSkill !== 'diataxis' && observed.has('diataxis'))
    return { status: 'fail', reason: 'Diataxis observed for the sibling workflow.' };
  if (observed.has(expectedSkill)) return { status: 'pass', reason: `Observed ${expectedSkill} invocation evidence.` };
  return { status: 'inconclusive', reason: 'Expected invocation not observed; inspect startup context and traces.' };
}

export function startupInjections(events) {
  const sessionId = events.find((e) => e.type === 'session_meta')?.payload?.id;
  return events.filter((e) => e.type === 'response_item' && e.payload?.role === 'user')
    .flatMap((e) => e.payload.content ?? [])
    .map((c) => (c.text ?? '').trimStart())
    .filter((text) => text.startsWith('<skill>\n<name>'))
    .map((text) => ({ sessionId, name: text.match(/<name>([^<]+)<\/name>/)?.[1],
      source: 'Codex host user skill injection', text }));
}

export function assertionSource(required) {
  return `const missing = ${JSON.stringify(required)}.filter(t => !output.toLowerCase().includes(t.toLowerCase()));\nreturn {pass: !missing.length, score: missing.length ? 0 : 1, reason: missing.length ? 'Missing: ' + missing.join(', ') : 'Smoke content checks pass; manual rubric review required'};`;
}

export function assessBehavior(response, rowError, required) {
  if (response.error || !response.output?.trim() || rowError?.includes('Custom function threw error'))
    return { status: 'inconclusive', reason: response.error || rowError || 'No completed answer.' };
  return behavior(response.output, required);
}
