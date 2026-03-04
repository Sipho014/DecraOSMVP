import { ActionType, type ActionItem } from '@/lib/contracts/briefing';

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

export type DecisionEngineConfig = {
  currency: string;
  spendKillThreshold: number;
  breakEvenCpa: number;
  minConversionsToScale: number;

  ctrDeclineTriggersTestBelow: number; // e.g. 0.012 (1.2%)
  frequencyFatigueThreshold: number; // e.g. 2.5
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
  config: DecisionEngineConfig;
}): ActionItem[] {
  const { adsets, config } = input;

  const actions: ActionItem[] = [];

  for (const a of adsets) {
    // KILL
    if (a.spend > config.spendKillThreshold && a.purchases === 0) {
      actions.push(
        action({
          type: ActionType.KILL,
          title: `Kill Ad Set: ${a.name}`,
          rationale: `Spent ${config.currency} ${a.spend.toFixed(2)} with 0 purchases.`,
          priority: 1,
          entity: { platform: 'meta', kind: 'adset', id: a.id, name: a.name },
        }),
      );
      continue;
    }

    // SCALE
    if (
      a.purchases >= config.minConversionsToScale &&
      a.cpa !== null &&
      a.cpa < config.breakEvenCpa
    ) {
      actions.push(
        action({
          type: ActionType.SCALE,
          title: `Scale Ad Set: ${a.name}`,
          rationale: `CPA ${config.currency} ${a.cpa.toFixed(2)} is below break-even (${config.currency} ${config.breakEvenCpa.toFixed(2)}), with ${a.purchases} purchases.`,
          priority: 2,
          entity: { platform: 'meta', kind: 'adset', id: a.id, name: a.name },
          suggestedChange: { metric: 'budget', to: 'Increase budget by 20%' },
        }),
      );
      continue;
    }

    // TEST (creative fatigue / declining CTR / rising CPA)
    const ctrBad = a.ctr < config.ctrDeclineTriggersTestBelow || a.ctrTrend7d === 'down';
    const cpaBad = a.cpaTrend7d === 'up';
    const fatigue = a.frequency >= config.frequencyFatigueThreshold;

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
