// src/app/api/health/route.ts — Health check endpoint (EC-05 Progressive Enhancement).

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: typeof process !== 'undefined' ? process.uptime() : null,
      service: 'toolbox',
    },
    { status: 200 },
  );
}
