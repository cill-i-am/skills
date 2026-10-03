import { test } from 'node:test';
import assert from 'node:assert/strict';
import { behavior, selection, startupInjections, assertionSource, assessBehavior } from './scoring.mjs';

test('missing reads remain inconclusive, including explicit and negative cases', () => {
  assert.equal(selection('diataxis').status, 'inconclusive');
  assert.equal(selection(null).status, 'inconclusive');
});
test('host skill injection is evidence; catalog listings and assistant claims are not', () => {
  const events = [
    {type: 'session_meta', payload: {id: 'fresh-id'}},
    {type: 'response_item', payload: {role: 'assistant', content: [{text: '<skill>\n<name>diataxis</name>'}]}},
    {type: 'response_item', payload: {role: 'user', content: [{text: 'Available skills: diataxis'}]}},
    {type: 'response_item', payload: {role: 'user', content: [{text: '<skill>\n<name>diataxis</name>\nactual instructions'}]}},
  ];
  const evidence = startupInjections(events);
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].sessionId, 'fresh-id');
  assert.equal(evidence[0].name, 'diataxis');
});
test('generated multiline Promptfoo assertion runs and rejects missing content', () => {
  const source = assertionSource(['email', 'name']);
  assert.ok(source.includes('\n'));
  const evaluate = new Function('output', source);
  assert.equal(evaluate('EMAIL and NAME').pass, true);
  assert.equal(evaluate('email alone').pass, false);
});
test('independent startup evidence can establish use without a file read', () => {
  assert.equal(selection('diataxis', {}, ['diataxis']).status, 'pass');
});
test('unexpected Diataxis use fails a negative/sibling boundary', () => {
  const metadata = { skillCalls: [{ name: 'diataxis' }] };
  assert.equal(selection(null, metadata).status, 'fail');
  assert.equal(selection('effective-design-docs', metadata).status, 'fail');
});
test('correct content alone does not establish selection', () => {
  assert.equal(behavior('email is required', ['email']).pass, true);
  assert.equal(selection('diataxis').status, 'inconclusive');
  assert.equal(behavior('invented result', ['email']).pass, false);
});
test('provider/grader errors are inconclusive; completed answers missing required facts fail', () => {
  assert.equal(assessBehavior({error: 'quota'}, undefined, ['email']).status, 'inconclusive');
  assert.equal(assessBehavior({output: 'email'}, 'Custom function threw error: syntax', ['email']).status, 'inconclusive');
  assert.equal(assessBehavior({output: 'unrelated'}, 'Missing: email', ['email']).status, 'fail');
});
