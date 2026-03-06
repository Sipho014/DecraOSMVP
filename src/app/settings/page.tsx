import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { parseShopSettings, type ShopSettings } from '@/lib/settings';

async function getSettings(shop: string): Promise<ShopSettings> {
  const url = new URL('http://localhost:3000/api/settings');
  url.searchParams.set('shop', shop);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load settings');
  const json = (await res.json()) as { settings: unknown };
  return parseShopSettings(json.settings);
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { shop?: string; saved?: string };
}) {
  const shop = searchParams?.shop;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure economics + decision thresholds.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" type="button">
            <a href="/briefing">Back to briefing</a>
          </Button>
        </div>
      </div>

      <Separator className="my-8" />

      {!shop ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missing shop</CardTitle>
            <CardDescription>
              Open <code>/settings?shop=example.myshopify.com</code>
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <SettingsForm shop={shop} saved={searchParams?.saved === '1'} />
      )}
    </main>
  );
}

async function SettingsForm({
  shop,
  saved,
}: {
  shop: string;
  saved: boolean;
}) {
  const settings = await getSettings(shop);

  async function save(formData: FormData) {
    'use server';

    const next: ShopSettings = {
      breakEvenCpa: Number(formData.get('breakEvenCpa')),
      thresholds: {
        spendKillThreshold: Number(formData.get('spendKillThreshold')),
        minConversionsToScale: Number(formData.get('minConversionsToScale')),
        ctrDeclineTriggersTestBelow: Number(formData.get('ctrDeclineTriggersTestBelow')),
        frequencyFatigueThreshold: Number(formData.get('frequencyFatigueThreshold')),
      },
    };

    const res = await fetch(`http://localhost:3000/api/settings?shop=${encodeURIComponent(shop)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(next),
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      throw new Error('Failed to save settings');
    }

    // Redirect by returning a new URL via Link-style param.
    // (In MVP we keep it simple: user refreshes or navigates back.)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Shop settings</CardTitle>
        <CardDescription>
          <span className="font-mono">{shop}</span>
          {saved ? <span className="ml-2 text-green-700">Saved</span> : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={save} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="breakEvenCpa">Break-even CPA</Label>
            <Input
              id="breakEvenCpa"
              name="breakEvenCpa"
              type="number"
              step="0.01"
              defaultValue={settings.breakEvenCpa}
            />
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="spendKillThreshold">Spend kill threshold</Label>
              <Input
                id="spendKillThreshold"
                name="spendKillThreshold"
                type="number"
                step="1"
                defaultValue={settings.thresholds.spendKillThreshold}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minConversionsToScale">Min conversions to scale</Label>
              <Input
                id="minConversionsToScale"
                name="minConversionsToScale"
                type="number"
                step="1"
                defaultValue={settings.thresholds.minConversionsToScale}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ctrDeclineTriggersTestBelow">CTR test below</Label>
              <Input
                id="ctrDeclineTriggersTestBelow"
                name="ctrDeclineTriggersTestBelow"
                type="number"
                step="0.0001"
                defaultValue={settings.thresholds.ctrDeclineTriggersTestBelow}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequencyFatigueThreshold">Frequency fatigue threshold</Label>
              <Input
                id="frequencyFatigueThreshold"
                name="frequencyFatigueThreshold"
                type="number"
                step="0.01"
                defaultValue={settings.thresholds.frequencyFatigueThreshold}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
