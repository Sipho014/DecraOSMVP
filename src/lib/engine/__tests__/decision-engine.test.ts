import { describe, expect, test } from 'vitest';

import { evaluateAdSets } from '@/lib/engine/decision-engine';

describe('decision-engine', () => {
  test('KILL when spend above threshold and 0 purchases', () => {
    const actions = evaluateAdSets({
      policy: {
        currency: 'EUR',
        spendKillThreshold: 100,
        breakEvenCpa: 25,
        minConversionsToScale: 4,
        ctrDeclineTriggersTestBelow: 0.01,
        frequencyFatigueThreshold: 2.5,
      },
      adsets: [
        {
          id: 'a1',
          name: 'Test',
          spend3d: 120,
          purchases3d: 0,
          revenue3d: 0,
          spend7d: 200,
          purchases7d: 1,
          revenue7d: 50,
          cpa3d: null,
          roas3d: 0,
          cpa7d: 200,
          roas7d: 0.25,
          ctr: 0.02,
          frequency: 1.2,
        },
      ],
    });

    expect(actions[0]?.type).toBe('KILL');
    expect(actions[0]?.priority).toBe(1);
  });
});
