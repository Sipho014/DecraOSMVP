import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ActionType, type MorningBriefing } from '@/lib/contracts/briefing';

type BriefingResponse = MorningBriefing & {
  _debug?: {
    breakEvenCpa?: number;
    adsets?: unknown;
  };
};

async function getBriefing(): Promise<BriefingResponse> {
  // Local-only fetch for now (MVP). In prod, use relative URL + headers.
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

function money(currency: string, n?: number) {
  if (n === undefined || Number.isNaN(n)) return '—';
  return `${currency} ${n.toFixed(2)}`;
}

export default async function BriefingPage() {
  const briefing = await getBriefing();
  const beCpa = briefing._debug?.breakEvenCpa ?? 0;

  const mer = briefing.kpis.spend > 0 ? briefing.kpis.revenue / briefing.kpis.spend : undefined;

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Morning Execution Briefing</h1>
          <p className="mt-1 text-sm text-muted-foreground">{briefing.kpis.date}</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-8">
        <Card className="md:col-span-2">
          <CardHeader className="py-4">
            <CardDescription>Revenue</CardDescription>
            <CardTitle>{money(briefing.kpis.currency, briefing.kpis.revenue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="py-4">
            <CardDescription>Spend</CardDescription>
            <CardTitle>{money(briefing.kpis.currency, briefing.kpis.spend)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="py-4">
            <CardDescription>MER</CardDescription>
            <CardTitle>{mer ? mer.toFixed(2) : '—'}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="py-4">
            <CardDescription>Break-even CPA</CardDescription>
            <CardTitle>{beCpa ? money(briefing.kpis.currency, beCpa) : '—'}</CardTitle>
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

                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>{a.type}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Target</TableCell>
                          <TableCell>{a.entity.name ?? a.entity.id ?? '—'}</TableCell>
                        </TableRow>
                        {a.suggestedChange ? (
                          <>
                            <TableRow>
                              <TableCell>Suggested change</TableCell>
                              <TableCell>{a.suggestedChange.metric}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>From</TableCell>
                              <TableCell>{a.suggestedChange.from ?? '—'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>To</TableCell>
                              <TableCell>{a.suggestedChange.to ?? '—'}</TableCell>
                            </TableRow>
                          </>
                        ) : null}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </main>
  );
}
