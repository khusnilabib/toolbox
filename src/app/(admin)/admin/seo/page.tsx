// src/app/(admin)/admin/seo/page.tsx — SEO management (Phase 8).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { allManifests } from '@/generated/registry';
import { getSeoMeta } from '@/generated/seo-meta';

export const metadata = {
  title: 'SEO — Admin',
  description: 'SEO metadata management.',
  robots: { index: false, follow: false },
};

export default function AdminSeoPage() {
  const totalTools = allManifests.length;
  const withFaq = allManifests.filter((m) => m.seo.faq.length > 0).length;
  const withBreadcrumb = allManifests.filter((m) => m.seo.breadcrumb.length > 0).length;
  const withKeywords = allManifests.filter((m) => m.seo.keywords.length > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SEO Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit and manage SEO metadata across all {totalTools} tools.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalTools}</div>
            <p className="mt-1 text-xs text-muted-foreground">Tools with SEO metadata</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{withFaq}</div>
            <p className="mt-1 text-xs text-muted-foreground">Tools with FAQ schema</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{withBreadcrumb}</div>
            <p className="mt-1 text-xs text-muted-foreground">Tools with breadcrumbs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{withKeywords}</div>
            <p className="mt-1 text-xs text-muted-foreground">Tools with keywords</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per-Tool SEO Audit</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Tool</th>
                  <th className="px-4 py-2 text-left font-medium">Canonical</th>
                  <th className="px-4 py-2 text-left font-medium">Keywords</th>
                  <th className="px-4 py-2 text-left font-medium">FAQ</th>
                  <th className="px-4 py-2 text-left font-medium">Breadcrumb</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allManifests.map((m) => {
                  const seo = getSeoMeta(m.category, m.slug);
                  return (
                    <tr key={`${m.category}-${m.slug}`} className="hover:bg-muted/30">
                      <td className="px-4 py-2">
                        <div className="font-medium">{m.title}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {m.category}/{m.slug}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-mono text-xs">{seo?.canonicalUrl ? 'OK' : '—'}</span>
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant="secondary">{seo?.keywords.length ?? 0}</Badge>
                      </td>
                      <td className="px-4 py-2">
                        {seo?.faq.length ? (
                          <Badge variant="default">{seo.faq.length}</Badge>
                        ) : (
                          <Badge variant="outline">none</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {seo?.breadcrumb.length ? (
                          <Badge variant="default">{seo.breadcrumb.length}</Badge>
                        ) : (
                          <Badge variant="outline">none</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
