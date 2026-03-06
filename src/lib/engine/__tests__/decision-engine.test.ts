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
          spend: 120,
          purchases: 0,
          revenue: 0,
          cpa: null,
          roas: 0,
          ctr: 0.02,
          frequency: 1.2,
        },
      ],
    });

    expect(actions[0]?.type).toBe('KILL');
    expect(actions[0]?.priority).toBe(1);
  });
});
