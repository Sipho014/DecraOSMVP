export enum ActionType {
  SCALE = 'SCALE',
  KILL = 'KILL',
  HOLD = 'HOLD',
  TEST = 'TEST',
}

export type ActionItem = {
  id: string;
  type: ActionType;
  title: string;
  rationale: string;
  priority: 1 | 2 | 3 | 4 | 5;
  entity: {
    platform: 'meta' | 'shopify';
    kind: 'campaign' | 'adset' | 'ad' | 'product' | 'store';
    id?: string;
    name?: string;
  };
  suggestedChange?: {
    metric: 'budget' | 'bid' | 'creative' | 'targeting' | 'catalog' | 'offer' | 'other';
    from?: string;
    to?: string;
  };
};

export type BriefingKpis = {
  date: string; // YYYY-MM-DD
  shopDomain?: string;

  revenue: number;
  spend: number;
  profit?: number;

  roas?: number;
  orders?: number;

  currency: string;
};

export type MorningBriefing = {
  id: string;
  generatedAt: string; // ISO
  kpis: BriefingKpis;
  actions: ActionItem[];
};
