// src/app/(admin)/admin/page.tsx — Admin dashboard placeholder (LOCK-11).

import Link from 'next/link';
import { ShieldCheck, Wrench, Activity, Settings } from 'lucide-react';
import { PageContainer } from '@/shared/components/page-container';
import { SectionHeading } from '@/shared/components/section-heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Admin Console',
  description: 'Operational control center for the Toolbox platform.',
};

export default function AdminPage() {
  return (
    <main className="flex-1">
      <PageContainer className="py-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden />
            <Badge variant="outline">Admin</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Platform Admin Console
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Operational control center for managing tools, content, feature flags, audit logs, and
            analytics. (LOCK-11)
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminCard
            icon={<Wrench className="h-5 w-5" aria-hidden />}
            title="Tool Inventory"
            description="View, publish, deprecate, and archive tools across categories."
            href="/admin"
          />
          <AdminCard
            icon={<Activity className="h-5 w-5" aria-hidden />}
            title="Analytics"
            description="Funnel metrics, tool popularity, conversion, and completion rates."
            href="/admin"
          />
          <AdminCard
            icon={<Settings className="h-5 w-5" aria-hidden />}
            title="Feature Flags"
            description="Toggle, roll out, and audit feature flag changes."
            href="/admin"
          />
          <AdminCard
            icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
            title="Audit Log"
            description="Immutable record of admin actions across the platform."
            href="/admin"
          />
        </div>

        <div className="mt-10">
          <SectionHeading
            eyebrow="Status"
            title="Coming soon"
            description="This console is scaffolded. Tool inventory, analytics, and RBAC enforcement will be wired up in subsequent sprints."
          />
        </div>
      </PageContainer>
    </main>
  );
}

function AdminCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
            {icon}
          </div>
          <CardTitle className="mt-2 text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
