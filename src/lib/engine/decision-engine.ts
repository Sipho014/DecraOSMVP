import { ActionType, type ActionItem } from '@/lib/contracts/briefing';
import { type DecisionPolicy } from '@/lib/engine/decision-policy';

export type AdSetMetrics = {
  id: string;
  name: string;
  
  // “3-day” window (momentum)
  spend3d: number;
  purchases3d: number;
  revenue3d: number;

  // “7-day” window (stability)
  spend7d: number;
  purchases7d: number;
  revenue7d: number;

  // convenience (derived; optional so the caller can omit)
  cpa3d?: number | null; // spend3d / purchases3d
  roas3d?: number | null; // revenue3d / spend3d
  cpa7d?: number | null; // spend7d / purchases7d
  roas7d?: number | null; // revenue7d / spend7d
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
    const cpa3d = a.cpa3d ?? (a.purchases3d > 0 ? a.spend3d / a.purchases3d : null);
    const roas7d = a.roas7d ?? (a.spend7d > 0 ? a.revenue7d / a.spend7d : null);

    // KILL (3D momentum)
    if (a.spend3d > policy.spendKillThreshold && a.purchases3d === 0) {
      actions.push(
        action({
          type: ActionType.KILL,
          title: `Kill Ad Set: ${a.name}`,
          rationale: `3D: spent ${policy.currency} ${a.spend3d.toFixed(2)} with 0 purchases.`,
          priority: 1,
          entity: { platform: 'meta', kind: 'adset', id: a.id, name: a.name },
        }),
      );
      continue;
    }

    // SCALE (3D momentum)
    if (
      a.purchases3d >= policy.minConversionsToScale &&
      cpa3d !== null &&
      cpa3d < policy.breakEvenCpa
    ) {
      actions.push(
        action({
          type: ActionType.SCALE,
          title: `Scale Ad Set: ${a.name}`,
          rationale: `3D: CPA ${policy.currency} ${cpa3d.toFixed(2)} is below break-even (${policy.currency} ${policy.breakEvenCpa.toFixed(2)}), with ${a.purchases3d} purchases.`,
          priority: 2,
          entity: { platform: 'meta', kind: 'adset', id: a.id, name: a.name },
          suggestedChange: { metric: 'budget', to: 'Increase budget by 20%' },
        }),
      );
      continue;
    }

    // TEST (7D stability underperformance proxy)
    const hasVolume7d = a.purchases7d >= Math.max(2, Math.floor(policy.minConversionsToScale / 2));
    const aov7d = a.purchases7d > 0 ? a.revenue7d / a.purchases7d : null;
    const targetRoasProxy = aov7d !== null && policy.breakEvenCpa > 0 ? aov7d / policy.breakEvenCpa : null;

    if (hasVolume7d && roas7d !== null && targetRoasProxy !== null && roas7d < targetRoasProxy) {
      actions.push(
        action({
          type: ActionType.TEST,
          title: `Fix performance: ${a.name}`,
          rationale: `7D: ROAS ${roas7d.toFixed(2)} is below target proxy (${targetRoasProxy.toFixed(2)}).`,
          priority: 3,
          entity: { platform: 'meta', kind: 'adset', id: a.id, name: a.name },
          suggestedChange: {
            metric: 'creative',
            to: 'Test new creatives and angles; review offer + landing page match',
          },
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
