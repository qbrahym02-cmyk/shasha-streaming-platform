import { NextRequest, NextResponse } from 'next/server';
import { STATELESS, slWhoami } from '@/lib/stateless';
import { getRequestUser, publicUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (STATELESS) return slWhoami(req);
  const user = await getRequestUser(req);
  return NextResponse.json({ ok: true, user: user ? publicUser(user) : null });
}
