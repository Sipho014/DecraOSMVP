import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ActionType, type MorningBriefing } from '@/lib/contracts/briefing';

async function getBriefing(): Promise<MorningBriefing> {
  const res = await fetch('http://localhost:3000/api/briefing', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load briefing');
  return res.json();
}

function badgeVariant(type: ActionType) {
  switch (type) {
    case ActionType.SCALE:
      return 'default';
    case ActionType.KILL:
      return 'destructive';
    case ActionType.HOLD:
      return 'secondary';
    case ActionType.TEST:
      return 'outline';
  }
}

export default async function BriefingPage() {
  const briefing = await getBriefing();

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Morning Execution Briefing</h1>
          <p className="mt-1 text-sm text-muted-foreground">{briefing.kpis.date}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-6">
        <Card className="md:col-span-2">
          <CardHeader className="py-4">
            <CardDescription>Revenue</CardDescription>
            <CardTitle>
              {briefing.kpis.currency} {briefing.kpis.revenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="py-4">
            <CardDescription>Spend</CardDescription>
            <CardTitle>
              {briefing.kpis.currency} {briefing.kpis.spend.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="py-4">
            <CardDescription>ROAS</CardDescription>
            <CardTitle>{briefing.kpis.roas?.toFixed(2) ?? '—'}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader className="py-4">
            <CardDescription>Orders</CardDescription>
            <CardTitle>{briefing.kpis.orders ?? '—'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-lg font-semibold">Action Feed</h2>
        <div className="mt-4 grid gap-4">
          {briefing.actions
            .slice()
            .sort((a, b) => a.priority - b.priority)
            .map((a) => (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    <Badge variant={badgeVariant(a.type)}>{a.type}</Badge>
                  </div>
                  <CardDescription>
                    Priority {a.priority} • {a.entity.platform} {a.entity.kind}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">{a.rationale}</p>
                  {a.suggestedChange ? (
                    <p className="mt-3">
                      <span className="font-medium">Suggested:</span> {a.suggestedChange.metric}{' '}
                      {a.suggestedChange.from ? `(${a.suggestedChange.from} → ${a.suggestedChange.to})` : a.suggestedChange.to}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </main>
  );
}
