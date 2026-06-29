// src/app/(admin)/admin/flags/page.tsx — Feature flags management (Phase 8).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFeatureFlagService } from '@/shared/lib/feature-flags';

export const metadata = {
  title: 'Feature Flags — Admin',
  description: 'Toggle and roll out features.',
  robots: { index: false, follow: false },
};

export default function AdminFeatureFlagsPage() {
  const svc = getFeatureFlagService();
  const flags = svc.all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feature Flags</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle features, control rollouts, and audit changes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Flags ({flags.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {flags.map((flag) => (
              <div key={flag.key} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{flag.key}</span>
                    <Badge variant={flag.enabled ? 'default' : 'outline'}>
                      {flag.enabled ? 'enabled' : 'disabled'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{flag.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Rollout: {flag.rolloutPercentage ?? 100}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
