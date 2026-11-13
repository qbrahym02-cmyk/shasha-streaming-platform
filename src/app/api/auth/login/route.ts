import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, publicUser, sessionCookie, verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user.id);
    const res = NextResponse.json({ ok: true, data: { user: publicUser(user) } });
    res.cookies.set(sessionCookie(token, expiresAt));
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: 'حدث خطأ ما' }, { status: 500 });
  }
}
