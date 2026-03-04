import { NextResponse } from 'next/server';

import { ActionType, type MorningBriefing } from '@/lib/contracts/briefing';

export async function GET() {
  const today = new Date();
  const date = today.toISOString().slice(0, 10);

  const briefing: MorningBriefing = {
    id: `briefing_${date}`,
    generatedAt: new Date().toISOString(),
    kpis: {
      date,
      revenue: 5421.33,
      spend: 1320.12,
      profit: 1850.55,
      roas: 4.11,
      orders: 73,
      currency: 'EUR',
    },
    actions: [
      {
        id: 'a1',
        type: ActionType.SCALE,
        title: 'Scale Campaign: Broad Prospecting',
        rationale: 'ROAS is stable above target and CPA decreased vs last 7 days.',
        priority: 1,
        entity: { platform: 'meta', kind: 'campaign', id: '123', name: 'Broad Prospecting' },
        suggestedChange: { metric: 'budget', from: '€200/day', to: '€260/day' },
      },
      {
        id: 'a2',
        type: ActionType.KILL,
        title: 'Kill Ad Set: Interest Stack #3',
        rationale: 'Spent €180 with 0 purchases in last 3 days.',
        priority: 2,
        entity: { platform: 'meta', kind: 'adset', id: '456', name: 'Interest Stack #3' },
      },
      {
        id: 'a3',
        type: ActionType.TEST,
        title: 'Test new creative angle: UGC hook',
        rationale: 'CTR is dropping on current winners; refresh creatives to avoid fatigue.',
        priority: 3,
        entity: { platform: 'meta', kind: 'ad', name: 'New UGC concept' },
        suggestedChange: { metric: 'creative', to: 'UGC hook: problem → demo → proof' },
      },
    ],
  };

  return NextResponse.json(briefing);
}
