import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser, publicUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  return NextResponse.json({ ok: true, user: user ? publicUser(user) : null });
}
