import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, hashPassword, publicUser, sessionCookie } from '@/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || '').trim().toLowerCase();
    const name = String(body?.name || '').trim();
    const password = String(body?.password || '');

    if (!email || !name || !password) {
      return NextResponse.json({ ok: false, error: 'تحقق من البيانات المدخلة' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'بريد إلكتروني غير صالح' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'كلمة المرور 6 أحرف على الأقل' }, { status: 400 });
    }

    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ ok: false, error: 'هذا البريد مستخدم مسبقاً' }, { status: 409 });
    }

    const colors = ['#00d26a', '#e8b923', '#ff6b6b', '#4ecdc4', '#f7b731', '#a55eea'];
    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash: hashPassword(password),
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
      },
    });

    const { token, expiresAt } = await createSession(user.id);
    const res = NextResponse.json({ ok: true, data: { user: publicUser(user) } });
    res.cookies.set(sessionCookie(token, expiresAt));
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'حدث خطأ ما' }, { status: 500 });
  }
}
