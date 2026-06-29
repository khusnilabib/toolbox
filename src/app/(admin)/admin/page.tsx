// src/app/(admin)/admin/page.tsx — Admin Dashboard (Phase 8).
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { allManifests } from '@/generated/registry';
import { adminInventory } from '@/generated/admin-inventory';
import { navigation } from '@/generated/navigation';

export const metadata = {
  title: 'Admin Dashboard — Toolbox',
  description: 'Operational control center for the Toolbox platform.',
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  const toolCount = allManifests.length;
  const categoryCount = navigation.length;
  const stableCount = adminInventory.filter((t) => t.lifecycle === 'stable').length;
  const betaCount = adminInventory.filter((t) => t.lifecycle === 'beta').length;
  const devCount = adminInventory.filter((t) => t.lifecycle === 'development').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Operational overview of the Toolbox platform.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toolCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">across {categoryCount} categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Stable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stableCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">production-ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Beta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{betaCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">in beta testing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{devCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">in development</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-sm font-medium">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/tools" className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm font-medium">Manage Tools</div>
                <p className="mt-1 text-xs text-muted-foreground">View, publish, deprecate, archive</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/users" className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm font-medium">Manage Users</div>
                <p className="mt-1 text-xs text-muted-foreground">View profiles, sessions, history</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/flags" className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm font-medium">Feature Flags</div>
                <p className="mt-1 text-xs text-muted-foreground">Toggle and roll out features</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/audit" className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm font-medium">Audit Trail</div>
                <p className="mt-1 text-xs text-muted-foreground">Immutable action log</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/health" className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm font-medium">System Health</div>
                <p className="mt-1 text-xs text-muted-foreground">Live health checks</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/monitoring" className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm font-medium">Monitoring</div>
                <p className="mt-1 text-xs text-muted-foreground">Sentry, Web Vitals, errors</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Tool inventory snapshot */}
      <div>
        <h2 className="mb-3 text-sm font-medium">Tool Inventory Snapshot</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {navigation.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium capitalize">{cat.category}</div>
                    <div className="text-xs text-muted-foreground">{cat.tools.length} tools</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cat.tools.slice(0, 5).map((t) => (
                      <Badge key={t.slug} variant="secondary" className="text-xs">
                        {t.slug}
                      </Badge>
                    ))}
                    {cat.tools.length > 5 && (
                      <Badge variant="outline" className="text-xs">+{cat.tools.length - 5}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
