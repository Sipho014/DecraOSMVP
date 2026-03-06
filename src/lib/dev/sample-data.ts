import { type AdSetMetrics } from '@/lib/engine/decision-engine';

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSampleAdSets(count = 6): AdSetMetrics[] {
  const angles = ['Broad Prospecting', 'Retargeting 7D', 'UGC Hook', 'Offer Stack', 'Interest Stack', 'Lookalike'];
  const products = ['Starter Kit', 'Bundle A', 'Bundle B', 'Hero SKU', 'Subscription'];

  return Array.from({ length: count }).map((_, i) => {
    const spend7d = Number(rnd(60, 900).toFixed(2));
    const purchases7d = Math.random() < 0.2 ? 0 : Math.floor(rnd(2, 30));
    const aov7d = rnd(35, 120);
    const revenue7d = Number((purchases7d * aov7d).toFixed(2));

    // 3D is a noisy subset of 7D
    const spend3d = Number((spend7d * rnd(0.25, 0.6)).toFixed(2));
    const purchases3d = purchases7d === 0 ? 0 : (Math.random() < 0.25 ? 0 : Math.floor(purchases7d * rnd(0.2, 0.6)));
    const aov3d = aov7d * rnd(0.9, 1.1);
    const revenue3d = Number((purchases3d * aov3d).toFixed(2));

    const cpa3d = purchases3d > 0 ? Number((spend3d / purchases3d).toFixed(2)) : null;
    const roas3d = spend3d > 0 ? Number((revenue3d / spend3d).toFixed(2)) : 0;
    const cpa7d = purchases7d > 0 ? Number((spend7d / purchases7d).toFixed(2)) : null;
    const roas7d = spend7d > 0 ? Number((revenue7d / spend7d).toFixed(2)) : 0;
    const ctr = Number(rnd(0.004, 0.03).toFixed(4));
    const frequency = Number(rnd(1.0, 4.2).toFixed(1));

    const ctrTrend7d = pick(['up', 'down', 'flat'] as const);
    const cpaTrend7d = pick(['up', 'down', 'flat'] as const);

    return {
      id: `adset_${i + 1}`,
      name: `${pick(angles)} • ${pick(products)}`,
      spend3d,
      purchases3d,
      revenue3d,
      spend7d,
      purchases7d,
      revenue7d,
      cpa3d,
      roas3d,
      cpa7d,
      roas7d,
      ctr,
      frequency,
      ctrTrend7d,
      cpaTrend7d,
      learning: Math.random() < 0.2,
    };
  });
}
