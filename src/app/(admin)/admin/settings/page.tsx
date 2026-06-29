// src/app/(admin)/admin/settings/page.tsx — Settings (Phase 8).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/shared/config/site-config';

export const metadata = {
  title: 'Settings — Admin',
  description: 'Platform settings.',
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd className="text-sm font-medium">{siteConfig.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">URL</dt>
              <dd className="text-sm font-mono">{siteConfig.url}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Locale</dt>
              <dd className="text-sm">{siteConfig.locale}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Twitter</dt>
              <dd className="text-sm">{siteConfig.twitterHandle}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Node ENV</dt>
              <dd>
                <Badge variant="outline">{process.env.NODE_ENV}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Supabase</dt>
              <dd>
                <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'default' : 'outline'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not configured'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Sentry</dt>
              <dd>
                <Badge variant={process.env.NEXT_PUBLIC_SENTRY_DSN ? 'default' : 'outline'}>
                  {process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'not configured'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Vercel Analytics</dt>
              <dd>
                <Badge variant={process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID ? 'default' : 'outline'}>
                  {process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID ? 'configured' : 'not configured'}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
