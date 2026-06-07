# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server (localhost only)
npm run dev -- --hostname 0.0.0.0   # start dev server accessible from LAN (e.g. phone)
npm run build        # production build
npm run lint         # eslint
```

No test suite exists.

## Environment

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GUIDE_CODE=hamosad2026
```

For LAN access (phone testing), add the local IP to `next.config.ts`:
```ts
allowedDevOrigins: ['192.168.x.x']
```

## Architecture

**חמוסד** is a Hebrew-language youth club activity management app. RTL layout throughout (`dir="rtl"`). Mobile-first UI, designed to run in browser on phones.

### Auth model

No Supabase Auth. Identity is a UUID (`client_id`) stored in `localStorage` under the key `hamosad_client_id`. On first visit a UUID is generated and a `Profile` row is created in Supabase. Guides are identified by entering `NEXT_PUBLIC_GUIDE_CODE` at registration.

- `role: 'guide'` → approved automatically, can access `/admin`
- `role: 'youth'` → requires guide approval before accessing `/calendar`

`crypto.randomUUID()` only works in secure contexts (HTTPS/localhost). The polyfill in `src/lib/auth.ts` handles HTTP access. **`src/lib/db.ts:144` still calls `crypto.randomUUID()` directly** — this will break on HTTP (phone dev). Fix the same way as `auth.ts` if needed.

### Route structure

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | any | checks auth, redirects to `/calendar` or `/login` |
| `/login` | any | name entry + optional guide code |
| `/calendar` | approved users | main calendar (month/week/day views) |
| `/admin` | guides only | approve users, manage sharing, export PDF |
| `/public/[token]` | no auth | read-only calendar via shareable link |

### Key files

- `src/lib/auth.ts` — `getOrCreateClientId`, `getProfile`, `registerProfile`
- `src/lib/db.ts` — all Supabase queries (activities, groups, attendance, profiles, public links)
- `src/lib/supabase.ts` — Supabase client singleton
- `src/lib/constants.ts` — Hebrew strings, activity colors, `CLIENT_ID_KEY`, `GUIDE_CODE`
- `src/lib/calendarUtils.ts` — calendar grid computation, `activitiesForDay`, time formatting
- `src/types/index.ts` — shared TypeScript types: `Profile`, `Group`, `Activity`, `Attendance`, `PublicLink`

### Data model (Supabase)

All tables use permissive RLS (`using (true)`) — intentional for an internal tool. See `supabase-schema.sql` for the full schema.

- `groups` — youth groups with a display color
- `profiles` — users; `client_id` is the device identifier, `approved` gates access
- `activities` — events with `group_ids uuid[]` (multiple groups per activity)
- `attendance` — per-user RSVP (`confirmed` / `cancelled`), unique on `(profile_id, activity_id)`
- `public_links` — shareable tokens for unauthenticated calendar access

### PDF export

`/admin` → "שיתוף" tab renders `PrintCalendar` into a hidden iframe and calls `window.print()`. It fetches June–August 2026 activities. The year (`SUMMER_YEAR = 2026`) is hardcoded in `src/app/admin/page.tsx:19`.
