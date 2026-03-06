export type DecisionThresholds = {
  spendKillThreshold: number;
  minConversionsToScale: number;
  ctrDeclineTriggersTestBelow: number;
  frequencyFatigueThreshold: number;
};

export type ShopSettings = {
  // Versioned so we can migrate settings shapes later.
  version: 1;

  breakEvenCpa: number;
  thresholds: DecisionThresholds;
};

export const DEFAULT_SETTINGS: ShopSettings = {
  version: 1,
  breakEvenCpa: 28,
  thresholds: {
    spendKillThreshold: 120,
    minConversionsToScale: 4,
    ctrDeclineTriggersTestBelow: 0.012,
    frequencyFatigueThreshold: 2.6,
  },
};

export function parseShopSettings(input: unknown): ShopSettings {
  const obj = (input ?? {}) as Record<string, unknown>;
  const th = (obj.thresholds ?? {}) as Record<string, unknown>;

  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? v : fallback;

  return {
    version: 1,
    breakEvenCpa: num(obj.breakEvenCpa, DEFAULT_SETTINGS.breakEvenCpa),
    thresholds: {
      spendKillThreshold: num(th.spendKillThreshold, DEFAULT_SETTINGS.thresholds.spendKillThreshold),
      minConversionsToScale: num(th.minConversionsToScale, DEFAULT_SETTINGS.thresholds.minConversionsToScale),
      ctrDeclineTriggersTestBelow: num(
        th.ctrDeclineTriggersTestBelow,
        DEFAULT_SETTINGS.thresholds.ctrDeclineTriggersTestBelow,
      ),
      frequencyFatigueThreshold: num(
        th.frequencyFatigueThreshold,
        DEFAULT_SETTINGS.thresholds.frequencyFatigueThreshold,
      ),
    },
  };
}

export function parseShopSettingsFromForm(form: FormData): ShopSettings {
  const getNum = (key: string, fallback: number) => {
    const raw = form.get(key);
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  return {
    version: 1,
    breakEvenCpa: getNum('breakEvenCpa', DEFAULT_SETTINGS.breakEvenCpa),
    thresholds: {
      spendKillThreshold: getNum(
        'spendKillThreshold',
        DEFAULT_SETTINGS.thresholds.spendKillThreshold,
      ),
      minConversionsToScale: getNum(
        'minConversionsToScale',
        DEFAULT_SETTINGS.thresholds.minConversionsToScale,
      ),
      ctrDeclineTriggersTestBelow: getNum(
        'ctrDeclineTriggersTestBelow',
        DEFAULT_SETTINGS.thresholds.ctrDeclineTriggersTestBelow,
      ),
      frequencyFatigueThreshold: getNum(
        'frequencyFatigueThreshold',
        DEFAULT_SETTINGS.thresholds.frequencyFatigueThreshold,
      ),
    },
  };
}
