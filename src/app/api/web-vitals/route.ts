// src/app/api/web-vitals/route.ts — Web Vitals collector endpoint (Phase 6).
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { event } = body ?? {};

    if (!event || !event.name || typeof event.value !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const validMetrics = ['CLS', 'LCP', 'FCP', 'TTFB', 'INP'];
    if (!validMetrics.includes(event.name)) {
      return NextResponse.json({ error: 'Invalid metric name' }, { status: 400 });
    }

    // In production, write to your observability backend.
    // For now, we log to stdout for collection by the platform's log drain.
    console.info(JSON.stringify({
      type: 'web-vital',
      metric: event.name,
      value: event.value,
      rating: event.rating,
      page: event.page,
      sessionId: event.sessionId,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[web-vitals] Failed to process payload:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
