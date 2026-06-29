// src/app/api/health/route.ts — Health check endpoint (Phase 6).
// Returns a comprehensive health report for the platform.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  details?: Record<string, unknown>;
}

async function checkSupabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
      return { name: 'supabase', status: 'degraded', details: { reason: 'Not configured' } };
    }
    // Simple reachability check
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${url}/rest/v1/`, {
      signal: controller.signal,
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
    });
    clearTimeout(timeout);
    return {
      name: 'supabase',
      status: res.ok ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      details: { statusCode: res.status },
    };
  } catch (err) {
    return {
      name: 'supabase',
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      details: { error: err instanceof Error ? err.message : 'Unknown' },
    };
  }
}

function checkEnv(): HealthCheck {
  const required = ['NEXT_PUBLIC_SITE_URL'];
  const missing = required.filter((k) => !process.env[k]);
  return {
    name: 'environment',
    status: missing.length === 0 ? 'healthy' : 'degraded',
    details: { missing },
  };
}

function checkMemory(): HealthCheck {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const ratio = heapUsedMB / heapTotalMB;
  return {
    name: 'memory',
    status: ratio < 0.85 ? 'healthy' : ratio < 0.95 ? 'degraded' : 'unhealthy',
    details: {
      heapUsedMB,
      heapTotalMB,
      rssMB: Math.round(usage.rss / 1024 / 1024),
      ratio: Math.round(ratio * 100) / 100,
    },
  };
}

export async function GET(): Promise<Response> {
  const start = Date.now();

  const [supabase, env, memory] = await Promise.all([
    checkSupabase(),
    checkEnv(),
    checkMemory(),
  ]);

  const checks: HealthCheck[] = [supabase, env, memory];
  const anyUnhealthy = checks.some((c) => c.status === 'unhealthy');
  const anyDegraded = checks.some((c) => c.status === 'degraded');
  const overallStatus = anyUnhealthy ? 'unhealthy' : anyDegraded ? 'degraded' : 'healthy';

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    environment: process.env.NODE_ENV,
    checks,
    totalLatencyMs: Date.now() - start,
  };

  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Status': overallStatus,
    },
  });
}
