// src/app/(admin)/admin/content/page.tsx — Content management (Phase 8).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { navigation } from '@/generated/navigation';

export const metadata = {
  title: 'Content — Admin',
  description: 'Content management.',
  robots: { index: false, follow: false },
};

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage categories, descriptions, and content bundles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {navigation.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium capitalize">{cat.category}</div>
                  <div className="text-xs text-muted-foreground">{cat.tools.length} tools</div>
                </div>
                <Badge variant="outline">{cat.category}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentation Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Documentation content is auto-generated from tool manifests. Each tool page
            includes FAQ, related tools, and structured documentation based on its manifest.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
