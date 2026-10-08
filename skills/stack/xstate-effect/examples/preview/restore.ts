/**
 * SOURCE PREVIEW ONLY.
 * Inspected source: @xstate/effect alpha.7 at
 * 7bb5f0c5e331e0e216c55a7b5f1b4c351bd0abcf.
 * Excluded from the alpha.6 example build: alpha.6 has no snapshot option.
 * Verify publication, installed declarations, and recovery tests before using.
 * Running Effect tasks/streams restart; remote side effects need idempotency.
 */
import { createEffectActor, type EffectActor } from '@xstate/effect';
import { publishMachine } from '../src/approval.js';

type Saved = ReturnType<EffectActor<typeof publishMachine>['getPersistedSnapshot']>;

export const restorePublishing = (snapshot: Saved) =>
  createEffectActor(publishMachine, { snapshot });
