import { ActionType, type ActionItem } from '@/lib/contracts/briefing';
import { type DecisionPolicy } from '@/lib/engine/decision-policy';

export type AdSetMetrics = {
  id: string;
  name: string;
  spend: number;
  purchases: number;
  revenue: number;
  cpa: number | null; // spend / purchases
  roas: number; // revenue / spend
  ctr: number; // 0-1
  frequency: number;
  ctrTrend7d?: 'up' | 'down' | 'flat';
  cpaTrend7d?: 'up' | 'down' | 'flat';
  learning?: boolean;
};

function action(
  partial: Omit<ActionItem, 'id'> & { id?: string },
): ActionItem {
  return {
    id: partial.id ?? crypto.randomUUID(),
    ...partial,
  };
}

export function evaluateAdSets(input: {
  adsets: AdSetMetrics[];
  policy: DecisionPolicy;
}): ActionItem[] {
  const { adsets, policy } = input;

  const actions: ActionItem[] = [];

  for (const a of adsets) {
    // KILL
    if (a.spend > policy.spendKillThreshold && a.purchases === 0) {
      actions.push(
        action({
          type: ActionType.KILL,
          title: `Kill Ad Set: ${a.name}`,
          rationale: `Spent ${policy.currency} ${a.spend.toFixed(2)} with 0 purchases.`,
          priority: 1,
          entity: { platform: 'meta', kind: 'adset', id: a.id, name: a.name },
        }),
      );
      continue;
    }

    // SCALE
    if (
      a.purchases >= policy.minConversionsToScale &&
      a.cpa !== null &&
      a.cpa < policy.breakEvenCpa
    ) {
      actions.push(
        action({
          type: ActionType.SCALE,
          title: `Scale Ad Set: ${a.name}`,
          rationale: `CPA ${policy.currency} ${a.cpa.toFixed(2)} is below break-even (${policy.currency} ${policy.breakEvenCpa.toFixed(2)}), with ${a.purchases} purchases.`,
          priority: 2,
          entity: { platform: 'meta', kind: 'adset', id: a.id, name: a.name },
          suggestedChange: { metric: 'budget', to: 'Increase budget by 20%' },
        }),
      );
      continue;
    }

    // TEST (creative fatigue / declining CTR / rising CPA)
    const ctrBad = a.ctr < policy.ctrDeclineTriggersTestBelow || a.ctrTrend7d === 'down';
    const cpaBad = a.cpaTrend7d === 'up';
    const fatigue = a.frequency >= policy.frequencyFatigueThreshold;

    if (ctrBad || cpaBad || fatigue) {
      actions.push(
        action({
          type: ActionType.TEST,
          title: `Test refresh: ${a.name}`,
          rationale: `Signals suggest fatigue or decline (CTR ${(a.ctr * 100).toFixed(2)}%, freq ${a.frequency.toFixed(1)}).`,
          priority: 3,
          entity: { platform: 'meta', kind: 'adset', id: a.id, name: a.name },
          suggestedChange: { metric: 'creative', to: 'Add 2-3 new creatives (UGC hooks) and rotate' },
        }),
      );
      continue;
    }

    // HOLD
    actions.push(
      action({
        type: ActionType.HOLD,
        title: `Hold: ${a.name}`,
        rationale: a.learning
          ? 'Learning phase / insufficient signal. Let it run longer before changes.'
          : 'Mixed signals; no clear action recommended today.',
        priority: 4,
        entity: { platform: 'meta', kind: 'adset', id: a.id, name: a.name },
      }),
    );
  }

  // Sort by priority (1 highest)
  return actions.sort((x, y) => x.priority - y.priority);
}
