// src/app/(admin)/admin/health/page.tsx — System health dashboard (Phase 8).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export const metadata = {
  title: 'System Health — Admin',
  description: 'Live system health checks.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  details?: Record<string, unknown>;
}

interface HealthResponse {
  status: string;
  uptime?: number;
  version?: string;
  totalLatencyMs?: number;
  checks?: HealthCheck[];
  error?: string;
}

async function fetchHealth(): Promise<HealthResponse> {
  try {
    const url = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/health`
      : 'http://localhost:3000/api/health';
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { status: 'unhealthy', error: `HTTP ${res.status}` };
    return (await res.json()) as HealthResponse;
  } catch (err) {
    return {
      status: 'unhealthy',
      error: err instanceof Error ? err.message : 'Failed to fetch',
    };
  }
}

export default async function AdminHealthPage() {
  const health = await fetchHealth();
  const checks = health.checks ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Health</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time health status of platform subsystems.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Overall Status:
            <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
              {health.status ?? 'unknown'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Uptime</dt>
              <dd className="text-sm font-mono">
                {health.uptime ? `${Math.floor(health.uptime / 60)} min` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Version</dt>
              <dd className="text-sm font-mono">{health.version ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total Latency</dt>
              <dd className="text-sm font-mono">{health.totalLatencyMs ?? '—'}ms</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {checks.map((check) => (
          <Card key={check.name}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{check.name}</span>
                {check.status === 'healthy' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />
                ) : check.status === 'degraded' ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600" aria-hidden />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" aria-hidden />
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={check.status === 'healthy' ? 'default' : 'outline'}>
                  {check.status}
                </Badge>
                {check.latencyMs !== undefined && (
                  <span className="text-xs text-muted-foreground">{check.latencyMs}ms</span>
                )}
              </div>
              {check.details && (
                <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(check.details, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
