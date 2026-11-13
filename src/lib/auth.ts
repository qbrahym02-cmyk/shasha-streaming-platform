// أدوات المصادقة (الخادم فقط) — scrypt + جلسات كوكيز
import type { NextRequest } from 'next/server';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { db } from './db';

export const SESSION_COOKIE = 'shasha_session';
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    const candidate = scryptSync(password, salt, 64);
    return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

export function isVip(user: { vipUntil: Date | null }): boolean {
  return !!user.vipUntil && user.vipUntil.getTime() > Date.now();
}

export function publicUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarColor: user.avatarColor,
    isVip: isVip(user),
    vipUntil: user.vipUntil ? user.vipUntil.toISOString() : null,
  };
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.session.create({ data: { id: token, userId, expiresAt } });
  return { token, expiresAt };
}

export async function getRequestUser(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: token } }).catch(() => {});
    return null;
  }
  return session.user;
}

export function sessionCookie(token: string, expiresAt: Date) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
}
