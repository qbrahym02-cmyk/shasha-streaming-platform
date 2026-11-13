# SHASHA (شاشة) — Engineering Rules for AI Agents

> منصة بث تجارية متعددة المنصات. هذه القواعد إلزامية لأي وكيل برمجة يعمل على هذا المشروع.

## Product
- Build a professional multi-platform streaming platform.
- Inspired by global OTT product functionality. NEVER copy protected branding, source code, or copyrighted content.
- Playable demo content must be open-source (Blender Foundation / public test streams) or clearly fictional.

## Platforms
- Website (Next.js) — the core
- PWA (installable, offline page, cached posters)
- Android via TWA (bubblewrap) — see docs/APK-BUILD.md
- iOS via PWA "Add to Home Screen"

## Architecture
- Monorepo-lite: single Next.js app + Prisma + scripts.
- TypeScript strict. Keep business logic in `src/lib`, UI in `src/components/streaming`.
- The user-facing app is a single `/` route with hash-based client routing (`#/t/:slug`, `#/watch/:slug?e=:ep`, `#/browse`, `#/vip`...). Do NOT add page routes.
- API routes live under `src/app/api/*` and MUST stay server-side.

## Backend & Data
- Prisma + SQLite (swap to PostgreSQL for production).
- Run `bun run db:push` after schema changes, then `bun scripts/seed.ts` for demo data.
- Passwords: scrypt with per-user salt (`src/lib/auth.ts`). Sessions: HttpOnly cookies, 30 days.
- Video sources are only revealed by `/api/titles/[slug]/play` AFTER entitlement checks (free / auth / VIP).

## Video
- HLS via hls.js with MP4 fallback (`fallbackUrl`).
- Player must support: quality levels, subtitle tracks, audio tracks, speed, resume, auto-next, keyboard shortcuts, PiP.
- Never proxy video through the API; the client fetches streams/CDN directly.

## i18n & UX
- Arabic (RTL, default) + English (LTR) via `src/lib/i18n.ts` — all new user-facing strings MUST be added to BOTH dictionaries.
- Use logical CSS properties (ms-/me-/ps-/pe-/start-/end-) so layouts work in both directions.
- Dark cinematic theme only: emerald green `#00d26a` primary, gold `#e8b923` VIP. No indigo/blue.
- Mobile-first: bottom tab bar on mobile, top nav on desktop, sticky footer, 44px+ touch targets.

## Quality Gates (mandatory before declaring done)
1. `bun run lint` — zero errors
2. All API routes return `{ ok, data | error, code? }`
3. Hash routing works for: home, browse, search, details, player, list, vip
4. Verify in a real browser (agent-browser or manual): login, play free title, VIP gate for free user, subscribe (demo), watchlist, resume
5. No `TODO` / placeholder text left in code

## Security Rules
- Never expose secrets in client code or commit them (`/db`, `.env*` are gitignored)
- Validate all input (zod-style checks) in API routes
- Never trust client-side subscription status — always re-check server-side
- For production: add rate limiting, signed/expiring stream URLs, DRM (Widevine/FairPlay), HTTPS-only cookies, audit logs

## Commits
- Conventional commits in Arabic or English: `feat:`, `fix:`, `docs:`, `chore:`
- Never commit `node_modules`, `.next`, `db/*.db`, logs, or the sandbox infra (`.zscripts`, `Caddyfile`, `examples`, `mini-services`)
