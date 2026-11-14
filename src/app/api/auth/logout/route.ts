import { NextRequest, NextResponse } from 'next/server';
import { STATELESS, slLogout } from '@/lib/stateless';
import { db } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (STATELESS) return slLogout();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.delete({ where: { id: token } }).catch(() => {});
  }
  const res = NextResponse.json({ ok: true, data: {} });
  res.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  return res;
}
