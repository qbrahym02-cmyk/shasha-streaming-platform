import { NextResponse } from 'next/server';
import { STATELESS } from '@/lib/stateless';

// GET /api — فحص صحة الخدمة
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'SHASHA API',
    mode: STATELESS ? 'serverless' : 'database',
    time: new Date().toISOString(),
  });
}
