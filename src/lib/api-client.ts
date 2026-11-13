'use client';

// أدوات جلب البيانات من الـ API في الواجهة
import { useCallback, useEffect, useRef, useState } from 'react';

// في وضع العرض الثابت (GitHub Pages / APK) نحاكي الخادم محلياً
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === '1';

export async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  if (DEMO_MODE) {
    const { demoApi } = await import('./demo-api');
    return demoApi(url, init) as Promise<T>;
  }
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {}
  if (!res.ok || json?.ok === false) {
    const err: any = new Error(json?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = json?.code;
    throw err;
  }
  return (json?.data ?? json) as T;
}

export function useApi<T = any>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef(url);
  urlRef.current = url;

  const load = useCallback(async () => {
    if (!urlRef.current) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const d = await api<T>(urlRef.current);
      setData(d);
    } catch (e: any) {
      setError(e?.message || 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (url === null) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await api<T>(url);
        if (!cancelled) setData(d);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error, refetch: load };
}

export function fmtTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
