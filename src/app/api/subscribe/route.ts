import { NextRequest, NextResponse } from 'next/server';
import { STATELESS, slSubscribePost, slSubscribeDelete } from '@/lib/stateless';
import { db } from '@/lib/db';
import { getRequestUser, publicUser } from '@/lib/auth';

// POST /api/subscribe {planCode} — تفعيل VIP تجريبي (بدون دفع حقيقي)
// DELETE /api/subscribe — إلغاء العضوية
export async function POST(req: NextRequest) {
  if (STATELESS) return slSubscribePost(req);
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً', code: 'auth_required' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const planCode = String(body?.planCode || '');
  const plan = await db.plan.findUnique({ where: { code: planCode } });
  if (!plan) return NextResponse.json({ ok: false, error: 'الباقة غير موجودة' }, { status: 404 });

  const base = user.vipUntil && user.vipUntil.getTime() > Date.now() ? user.vipUntil : new Date();
  const expiresAt = new Date(base.getTime() + plan.months * 30 * 86400000);

  const [updated] = await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { vipUntil: expiresAt } }),
    db.subscription.create({
      data: { userId: user.id, planCode: plan.code, expiresAt, method: 'demo', status: 'active' },
    }),
  ]);

  return NextResponse.json({ ok: true, data: { user: publicUser(updated), expiresAt: expiresAt.toISOString() } });
}

export async function DELETE(req: NextRequest) {
  if (STATELESS) return slSubscribeDelete(req);
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'سجّل الدخول أولاً' }, { status: 401 });

  await db.subscription.updateMany({ where: { userId: user.id, status: 'active' }, data: { status: 'cancelled' } });
  const updated = await db.user.update({ where: { id: user.id }, data: { vipUntil: new Date() } });
  return NextResponse.json({ ok: true, data: { user: publicUser(updated) } });
}
