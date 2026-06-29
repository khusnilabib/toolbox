// src/app/(auth)/dashboard/dashboard-view.tsx — Dashboard UI (client).
//
// Phase 1 + Phase 2 combined: welcome, stats grid, recent tools, favorites,
// history placeholder, account profile, security settings, and logout.

'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  Clock,
  Download,
  Heart,
  History,
  KeyRound,
  LogOut,
  Star,
  User as UserIcon,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/shared/components/empty-state';
import { useRecentTools } from '@/shared/hooks/use-recent-tools';
import { useFavorites } from '@/shared/hooks/use-favorites';
import { signOut } from '@/identity/actions/auth-actions';
import { routes } from '@/shared/config/routes';
import { notificationService } from '@/shared/lib/notification-service';

interface DashboardUser {
  id: string;
  email: string;
  role: string;
}

export interface DashboardViewProps {
  user: DashboardUser;
  /** True when running without Supabase configured (sandbox preview). */
  demo: boolean;
  memberSince: string;
}

export function DashboardView({ user, demo, memberSince }: DashboardViewProps) {
  const router = useRouter();
  const { recentTools, hydrated: recentHydrated } = useRecentTools();
  const { favorites, hydrated: favHydrated } = useFavorites();
  const [signingOut, startSignOut] = useTransition();
  const [downloads] = useState(0);
  const [history] = useState(0);

  const stats = useMemo(
    () => [
      {
        label: 'Tools Used',
        value: recentHydrated ? recentTools.length : 0,
        icon: <Wrench className="h-4 w-4" aria-hidden />,
        hint: 'Recent sessions',
      },
      {
        label: 'Downloads',
        value: downloads,
        icon: <Download className="h-4 w-4" aria-hidden />,
        hint: 'This month',
      },
      {
        label: 'Favorites',
        value: favHydrated ? favorites.length : 0,
        icon: <Heart className="h-4 w-4" aria-hidden />,
        hint: 'Saved tools',
      },
      {
        label: 'History',
        value: history,
        icon: <History className="h-4 w-4" aria-hidden />,
        hint: 'Processing runs',
      },
    ],
    [recentTools.length, favorites.length, downloads, history, recentHydrated, favHydrated],
  );

  const onSignOut = () => {
    startSignOut(async () => {
      const result = await signOut();
      if (!result.success && demo) {
        // Preview mode — just go to login.
      } else if (!result.success) {
        notificationService.error(result.error ?? 'Could not sign out.');
        return;
      }
      notificationService.success('Signed out');
      router.push(routes.login);
      router.refresh();
    });
  };

  const memberSinceLabel = useMemo(() => formatMemberSince(memberSince), [memberSince]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome, {displayName(user.email)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your recent tools, favorites, and processing history in one place.
          </p>
        </div>
        <Button variant="outline" onClick={onSignOut} disabled={signingOut}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>

      {demo ? (
        <Alert>
          <AlertTitle>Preview mode</AlertTitle>
          <AlertDescription>
            Authentication is not configured on this deployment, so this dashboard shows a preview
            with a mock account. Configure Supabase credentials to enable real sign-in.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Stats grid */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Stats
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <li key={s.label}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {s.label}
                    </CardTitle>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
                      {s.icon}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent tools + Favorites */}
      <section aria-labelledby="activity-heading" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                Recent tools
              </CardTitle>
              <Link
                href={routes.tools}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Browse all
              </Link>
            </div>
            <CardDescription>The last tools you used.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentHydrated && recentTools.length === 0 ? (
              <EmptyState
                title="No tools used yet"
                description="Browse the catalogue and run your first tool to see it here."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href={routes.tools}>Browse tools</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="max-h-96 space-y-2 overflow-y-auto scroll-area-custom pr-1">
                {recentTools.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={routes.tool(t.category, t.slug)}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 transition-colors hover:bg-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {t.title}
                        </span>
                        <span className="block text-xs capitalize text-muted-foreground">
                          {t.category}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelative(t.timestamp)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4 text-muted-foreground" aria-hidden />
              Favorites
            </CardTitle>
            <CardDescription>Tools you&apos;ve starred for quick access.</CardDescription>
          </CardHeader>
          <CardContent>
            {favHydrated && favorites.length === 0 ? (
              <EmptyState
                title="No favorites yet"
                description="Click the star icon on any tool to add it to your favorites."
              />
            ) : (
              <ul className="max-h-96 space-y-2 overflow-y-auto scroll-area-custom pr-1">
                {favorites.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={routes.tool(t.category, t.slug)}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 transition-colors hover:bg-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {t.title}
                        </span>
                        <span className="block text-xs capitalize text-muted-foreground">
                          {t.category}
                        </span>
                      </span>
                      <Star className="h-4 w-4 shrink-0 fill-current text-foreground" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Processing history */}
      <section aria-labelledby="history-heading">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
              Processing history
            </CardTitle>
            <CardDescription>
              A record of every tool run, with inputs and outputs, for re-use or audit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="History will appear here after you use tools"
              description="Your processing runs are stored locally in your browser by default."
            />
          </CardContent>
        </Card>
      </section>

      {/* Account + Security */}
      <section aria-labelledby="account-heading" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
              Account profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Member since</p>
              <p className="text-sm font-medium text-foreground">{memberSinceLabel}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Role</p>
              <p className="text-sm font-medium capitalize text-foreground">{user.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden />
              Security settings
            </CardTitle>
            <CardDescription>Manage how you sign in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Change your account password.</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={routes.login}>Change</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Sign out</p>
                <p className="text-xs text-muted-foreground">End your current session.</p>
              </div>
              <Button size="sm" variant="outline" onClick={onSignOut} disabled={signingOut}>
                <LogOut className="mr-2 h-4 w-4" aria-hidden />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function displayName(email: string): string {
  if (!email) return 'guest';
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

function formatMemberSince(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
