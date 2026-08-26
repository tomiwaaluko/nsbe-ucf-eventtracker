# NSBE UCF Event Tracker

Full-stack web app for the UCF chapter of the [National Society of Black Engineers](https://nsbe.org/). It manages chapter events, tracks attendance with QR codes and short check-in codes, and rewards participation with semester achievements and a points system.

**Live stack:** frontend on Vercel, backend on Railway, database and auth on Supabase.

---

## Contents

- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database](#database)
- [How the product works](#how-the-product-works)
- [Frontend routes](#frontend-routes)
- [API reference](#api-reference)
- [Security](#security)
- [Development commands](#development-commands)
- [Testing](#testing)
- [CI](#ci)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## What it does

| Area | What members and officers can do |
|---|---|
| **Events** | Create, edit, and list chapter events by category and semester |
| **Check-in** | Scan a QR code, enter a 6-character code, or have an admin check someone in manually |
| **Achievements** | Earn the **111** badge (one event in each of three buckets) and the **333** badge (three in each) per semester |
| **Points** | Automatic points from attendance, plus admin-awarded manual points (committees, conferences, dues, and similar) |
| **Leaderboards** | Rank by attendance, by who completed 111/333 first, and by total points |
| **Social** | Member directory, friend requests, and “plan to attend” interest on upcoming events |
| **Admin** | Event QR codes, attendance management, role assignment, and bulk point awards |
| **Profiles** | Bio, major, graduation year, LinkedIn, Discord, and an optional photo in Supabase Storage |

The frontend is also an installable PWA (`manifest.json`, NSBE green `#00843D`) so members can add it to a phone home screen at events.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript 5.7, Prisma 6, PostgreSQL |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5 |
| UI | Tailwind CSS 3.4, Radix UI, Lucide icons |
| Auth | Supabase Auth (JWT) + Google / Discord OAuth |
| Storage | Supabase Storage (`profile-photos` bucket) |
| Caching | `node-cache` (in-process, backend) |
| QR | `qrcode` (generate), `html5-qrcode` (scan) |
| Runtime | Node.js 20.x, npm >= 9.0.0 |

**Why this split:** NestJS organizes the API into feature modules (events, attendance, friends, points, and so on). Prisma keeps the schema as the source of truth. Supabase handles credentials and object storage so the API only has to verify JWTs and persist chapter data.

---

## Repository layout

```
nsbe-ucf-eventtracker/
├── backend/                      # NestJS REST API (port 4000, prefix /api)
│   ├── src/
│   │   ├── main.ts               # Helmet, CORS allowlist, ValidationPipe
│   │   ├── app.module.ts         # Root module, throttler, API-key middleware
│   │   ├── auth/                 # JWT guard, Google/Discord OAuth, user sync
│   │   ├── members/              # Profiles, roles, photo uploads
│   │   ├── events/               # Event CRUD, QR generation
│   │   ├── attendance/           # QR / code / manual check-in
│   │   ├── stats/                # 111 / 333 achievements, attendance leaderboards
│   │   ├── points/               # Manual awards + computed attendance points
│   │   ├── friends/              # Friend requests and directory
│   │   ├── event-interest/       # Plan-to-attend
│   │   ├── storage/              # Supabase Storage helper
│   │   ├── cache/                # Global in-memory cache
│   │   ├── prisma/               # PrismaService
│   │   └── common/               # API key, roles, throttler-behind-proxy
│   ├── prisma/schema.prisma      # Database schema
│   ├── prisma/seed.ts            # Optional sample members
│   ├── Dockerfile                # Multi-stage node:20-alpine, non-root user
│   └── docker-compose.yml        # Local Postgres + API
├── frontend/                     # Next.js App Router (port 3000)
│   ├── app/                      # Route pages
│   ├── components/               # Shared UI (Radix + Tailwind)
│   ├── lib/api.ts                # All backend calls (Bearer + X-API-Key)
│   ├── lib/supabase.ts           # Browser Supabase client
│   └── public/                   # Icons, PWA manifest
├── docs/                         # Extra design notes
├── .github/workflows/ci.yml      # Backend, frontend, and audit jobs
└── Makefile                      # Dev / Docker / Prisma shortcuts
```

Every backend feature follows **controller → service → Prisma**. `PrismaModule` and `CacheModule` are global.

---

## Prerequisites

- Node.js **20.x** (see `.node-version`; currently `20.11.1`) and npm **>= 9.0.0**
- Docker Desktop (for local PostgreSQL, optional for the API itself)
- A [Supabase](https://supabase.com/) project with:
  - Auth enabled (email/password; Google and Discord providers if you want social login)
  - A **public** Storage bucket named `profile-photos`

---

## Quick start

Recommended for development: Docker for Postgres, Nest and Next running on the host.

```bash
git clone https://github.com/tomiwaaluko/nsbe-ucf-eventtracker.git
cd nsbe-ucf-eventtracker

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Fill in the files (see Environment variables below)

make install
make docker-db-up          # Postgres on localhost:5432
make prisma-generate
cd backend && npx prisma db push && cd ..
make dev                   # API :4000 and app :3000
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api |
| Postgres | `postgresql://nsbe_user:nsbe_password@localhost:5432/nsbe_eventtracker` |
| Prisma Studio | `make prisma-studio` → http://localhost:5555 |

**API only in Docker** (Postgres + Nest; frontend still local):

```bash
# backend/.env must include JWT_SECRET and SUPABASE_JWT_SECRET
# (compose refuses to start without them — no fallback signing keys)
make docker-up
```

`JWT_SECRET` is required by Compose even though the API verifies **Supabase** JWTs with `SUPABASE_JWT_SECRET`. Generate a throwaway value with `openssl rand -base64 48`. Set `CORS_ORIGINS=http://localhost:3000` (Compose already defaults to that).

---

## Environment variables

Do not commit real secrets. Templates live at `backend/.env.example` and `frontend/.env.example`.

### Backend (`backend/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled Postgres URL (Supabase pooler in prod, local Docker in dev) |
| `DIRECT_URL` | Yes | Direct Postgres URL (Prisma migrations / `db push`) |
| `SUPABASE_JWT_SECRET` | Yes | Verifies the JWT from Supabase Auth (JWT Secret in project settings) |
| `SUPABASE_URL` | For photos / admin Auth | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | For photos / admin Auth | Server-side Supabase client — never expose to the browser |
| `PORT` | No | Defaults to `4000` |
| `FRONTEND_URL` | Recommended | Password-reset redirects |
| `APP_BASE_URL` | Recommended | App origin (often the frontend) |
| `OAUTH_BASE_URL` | For OAuth | Backend origin, e.g. `http://localhost:4000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Google login | Google Cloud OAuth client |
| `GOOGLE_REDIRECT_URI` | For Google login | `http://localhost:4000/api/auth/oauth/google/callback` |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | For Discord login | Discord application |
| `DISCORD_REDIRECT_URI` | For Discord login | `http://localhost:4000/api/auth/oauth/discord/callback` |
| `API_KEY` | Recommended | Shared secret; if set, every request except OAuth redirects must send it |
| `CORS_ORIGINS` | **Required in production** | Comma-separated frontend origins, e.g. `https://nsbeucf.org,https://www.nsbeucf.org` |
| `JWT_SECRET` | Docker Compose only | Compose will not start without it |

Local CORS fallback (only when `NODE_ENV` is not `production` and `CORS_ORIGINS` is empty): `http://localhost:3000` and `http://localhost:5173`. Production **refuses to boot** without `CORS_ORIGINS`.

### Frontend (`frontend/.env.local`)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Same project URL as the backend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon (publishable) key — safe for the browser |
| `NEXT_PUBLIC_API_URL` | Local yes | `http://localhost:4000/api`. In production, omit to use relative `/api` (Vercel rewrite) or set the Railway URL |
| `NEXT_PUBLIC_APP_URL` | For OAuth | Frontend origin used in OAuth redirects |
| `NEXT_PUBLIC_API_KEY` | If backend `API_KEY` is set | Must match `API_KEY` |

`lib/supabase.ts` calls `createClient()` at module load, so a production `next build` needs the two `NEXT_PUBLIC_SUPABASE_*` values set (CI uses placeholders).

---

## Database

Schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

This repo does not currently ship a `prisma/migrations` history. For local development, push the schema directly:

```bash
cd backend
npx prisma db push          # apply schema to the empty local database
npx prisma generate         # after any schema.prisma change
npx prisma studio
```

To start a real migration history (needed for `prisma migrate deploy` in Docker/production):

```bash
cd backend
npx prisma migrate dev --name init
```

### Models

| Model | Role |
|---|---|
| **Member** | Chapter user. `id` is the Supabase Auth UUID. `role`: `member` \| `admin` \| `super_admin` |
| **Event** | Chapter event. `qrSecret` (UUID) signs QR tokens; `checkInCode` is a unique 6-character code (alphabet excludes `0`, `O`, `1`, `I`). Soft-delete via `isActive = false` |
| **Attendance** | One row per member per event (`@@unique([memberId, eventId])`). `checkInMethod`: `qr` \| `code` \| `manual` |
| **OAuthAccount** | Google / Discord identities linked to a Member |
| **Friendship** | Two rows per friendship (one each direction). Status: `PENDING` \| `ACCEPTED` \| `DECLINED` \| `BLOCKED` |
| **EventInterest** | Plan-to-attend. Status: `PLANNING` \| `CANCELLED` \| `ATTENDED` |
| **PointEntry** | **Manual** point awards only. Auto points are computed from Attendance at read time |

**EventCategory:** `GBM` · `SOCIAL` · `WORKSHOP` · `FUNDRAISER` · `COMMUNITY_SERVICE` · `COMMITTEE_PARTICIPATION`

Local Docker credentials (from `backend/docker-compose.yml`):

```
postgresql://nsbe_user:nsbe_password@localhost:5432/nsbe_eventtracker
```

Put that in both `DATABASE_URL` and `DIRECT_URL` when using `make docker-db-up`.

---

## How the product works

### Auth

1. The browser signs in with **Supabase Auth** (email/password or OAuth).
2. The Supabase client stores the JWT (localStorage).
3. `frontend/lib/api.ts` sends `Authorization: Bearer <jwt>` and, if configured, `X-API-Key`.
4. `JwtAuthGuard` verifies the token locally with `SUPABASE_JWT_SECRET` (no round-trip to Supabase per request), then `findOrCreateMember` upserts the user into Postgres. That lookup is cached ~5 minutes as `user:<id>`.

There is **no** `POST /api/auth/login`. Login lives in Supabase; the API only has `check-duplicate`, `forgot-password`, and OAuth redirect handlers.

OAuth: frontend → `GET /api/auth/oauth/{google|discord}` → provider → backend callback → frontend `/auth/callback`. Google uses PKCE. Linking is:

1. Existing `(provider, providerUserId)` → that member  
2. Else matching email → attach the OAuth row  
3. Else create a Supabase user and a Member with that UUID  

OAuth redirect routes skip the API-key middleware because browsers cannot attach custom headers on a full-page redirect.

### Roles

Checks are inline helpers in `backend/src/common/roles.util.ts`, not Nest guards:

- `isAdmin` — `admin` or `super_admin`
- `isSuperAdmin` — `super_admin` only (role assignment)

### Check-in

All three methods (`POST /api/attendance/check-in`, `/check-in-code`, `/manual`) require:

- Event `isActive = true`
- Current time between `startTime` and `endTime`
- No existing attendance for that member + event (enforced in code and by the unique constraint)

Successful check-in invalidates cache keys for leaderboards, member lists, and that user. Code check-in is rate-limited (10 attempts / minute) because the code is only 6 characters.

Deleting an event is a **soft delete** (`isActive = false`) so historical attendance and achievements stay valid.

### Achievements (111 / 333)

Event categories map to three buckets:

| Bucket | Categories |
|---|---|
| Workshops & socials | `WORKSHOP`, `SOCIAL` |
| Fundraising & service | `FUNDRAISER`, `COMMUNITY_SERVICE` |
| General body | `GBM` |

`COMMITTEE_PARTICIPATION` does **not** count toward 111/333.

- **111** — at least one attendance in each bucket this semester  
- **333** — at least three in each bucket  

111/333 leaderboards rank by the timestamp of the attendance that finished the last bucket.

### Points

Defined in `backend/src/points/point-types.constant.ts`, grouped into zones: general, communication, program, parliamentarian.

- **Auto points** are **not stored**. They are derived from Attendance (for example GBM, socials, workshops, community service, committee meetings).
- **Manual awards** are stored on `PointEntry` (dues, conferences, tutoring, graphics, and similar). Admins bulk-award from `/admin/points`.
- Dedup: `@@unique([memberId, pointTypeKey, label, semester])`.

### Caching

`CacheService` (`node-cache`) uses cache-aside `wrap()` and `delPattern()`. Typical TTLs: user 5 min, events list 2 min, leaderboard 5 min, member list 3 min. There is no Redis; cache is per process and resets on deploy.

---

## Frontend routes

Most pages are client components (`"use client"`) because they need the JWT in the browser and interactive UI.

| Path | Who | Purpose |
|---|---|---|
| `/` | Public | Landing / sign-in |
| `/onboarding` | Signed-in | First-time profile |
| `/dashboard` | Member | Home |
| `/events` | Member | Event list |
| `/events/create` | Admin | Create event |
| `/events/[id]` | Member | Event detail + plan to attend |
| `/events/[id]/edit` | Admin | Edit event |
| `/checkin` | Member | Camera QR scanner |
| `/attendance` | Member | Personal history |
| `/members` | Member | Redirects to `/friends` |
| `/members/[id]` | Member | Public profile |
| `/achievements` | Member | 111 / 333 progress |
| `/leaderboard` | Member | Attendance / achievement ranks |
| `/friends` | Member | Friends and requests |
| `/changelog` | Member | What's new / patch notes |
| `/settings` | Member | Profile and photo |
| `/forgot-password` · `/reset-password` | Public | Reset flow |
| `/auth/callback` | Public | OAuth return |
| `/admin` | Admin | Admin home |
| `/admin/events` | Admin | Event management |
| `/admin/events/[id]/qr` | Admin | QR image / download |
| `/admin/attendance` | Admin | Attendance admin |
| `/admin/members` | Admin | Member list / status |
| `/admin/admins` | Super admin | Role management |
| `/admin/checkin` | Admin | Manual check-in |
| `/admin/points` | Admin | Leaderboard, bulk award, history |

Path alias: `@/*` → frontend root (`import { cn } from "@/lib/utils"`).

**Changelog:** Signed-in members open **What's new** in the sidebar or top bar (`/changelog`). Entries live in `frontend/content/changelog.json` (newest first). Add an object with `version` (unique id, e.g. `2025-08-19`), `date` (ISO `YYYY-MM-DD`), and a one-sentence `summary`. The sidebar shows an unread dot until a member opens the page; clearing uses `localStorage` keyed by `version`.

---

## API reference

Global prefix: **`/api`**. JSON bodies are validated with `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).

Unless noted, routes expect a valid Supabase JWT. Admin-only routes also require `admin` or `super_admin`.

### Auth — `/api/auth`

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/auth/check-duplicate` | None | Existence check; 10 req / min |
| `POST` | `/auth/forgot-password` | None | Sends email; 5 req / 5 min |
| `GET` | `/auth/oauth/google` | None | Start Google OAuth |
| `GET` | `/auth/oauth/google/callback` | None | Google return |
| `GET` | `/auth/oauth/discord` | None | Start Discord OAuth |
| `GET` | `/auth/oauth/discord/callback` | None | Discord return |
| `POST` | `/auth/oauth/link` | JWT | Link another provider |

### Members — `/api/members`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/members/me` | Current profile |
| `PUT` | `/members/me` | Update profile |
| `DELETE` | `/members/me` | Delete account |
| `GET` | `/members/me/oauth-accounts` | Linked providers |
| `POST` | `/members/me/photo` | Upload (JPEG/PNG/WebP, 5 MB) |
| `DELETE` | `/members/me/photo` | Remove photo |
| `GET` | `/members` | Directory |
| `GET` | `/members/:id/profile` | Public profile |
| `GET` | `/members/admins` | Admin list |
| `PUT` | `/members/:id/role` | Super admin |
| `PUT` | `/members/:id/status` | Activate / deactivate |
| `PUT` | `/members/:id/membership` | Mark chapter dues paid / unpaid (admin) |

Chapter membership uses a check-on-read reset: if a member is marked paid but `chapterMembershipMarkedAt` is before the most recently elapsed **July 31 23:59 America/New_York** boundary, status is treated as unpaid until an admin re-marks it (Aug 1–July 31 membership year).

### Events — `/api/events`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/events` | List (filters via query) |
| `GET` | `/events/:id` | Detail |
| `POST` | `/events` | Admin create |
| `PUT` | `/events/:id` | Admin update |
| `DELETE` | `/events/:id` | Admin soft-delete |
| `GET` | `/events/:id/qr` | Admin QR image |

### Attendance — `/api/attendance`

| Method | Path | Notes |
|---|---|---|
| `POST` | `/attendance/check-in` | QR token |
| `POST` | `/attendance/check-in-code` | 6-char code; 10 req / min |
| `POST` | `/attendance/manual` | Admin |
| `GET` | `/attendance/my` | Current member |
| `GET` | `/attendance/events/:id` | Event roster (admin) |
| `GET` | `/attendance` | Admin list |

### Stats — `/api/stats`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/stats/me` | Achievement progress |
| `GET` | `/stats/admin` | Admin aggregates |
| `GET` | `/stats/leaderboard` | Attendance leaderboard |
| `GET` | `/stats/leaderboard/me` | Current member rank |
| `GET` | `/stats/leaderboard/top` | Top N |
| `GET` | `/stats/leaderboard/stats` | Summary |
| `GET` | `/stats/leaderboard/111` | 111 completion order |
| `GET` | `/stats/leaderboard/333` | 333 completion order |
| `GET` | `/stats/leaderboard/:memberId` | Member stats |

### Points — `/api/points`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/points/types` | Catalog (any signed-in user) |
| `GET` | `/points/semesters` | Admin |
| `GET` | `/points/leaderboard` | Admin; `?semester=` |
| `GET` | `/points/member/:id` | Admin |
| `GET` | `/points/manual` | Admin history |
| `POST` | `/points/bulk` | Admin bulk award |
| `POST` | `/points/resolve-members` | Admin name matching |
| `DELETE` | `/points/manual/:id` | Admin revoke |

### Friends — `/api/friends`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/friends` | Accepted |
| `GET` | `/friends/requests/received` | Incoming |
| `GET` | `/friends/requests/sent` | Outgoing |
| `GET` | `/friends/directory` | Searchable members |
| `GET` | `/friends/status/:userId` | Relationship to one user |
| `POST` | `/friends/request/:userId` | Send |
| `POST` | `/friends/accept/:userId` | Accept |
| `DELETE` | `/friends/decline/:userId` | Decline |
| `DELETE` | `/friends/cancel/:userId` | Cancel outgoing |
| `DELETE` | `/friends/:userId` | Unfriend |

### Event interest — `/api/event-interest`

| Method | Path | Notes |
|---|---|---|
| `POST` | `/event-interest/:eventId` | Plan to attend |
| `DELETE` | `/event-interest/:eventId` | Cancel |
| `GET` | `/event-interest/my` | Current member |
| `GET` | `/event-interest/event/:eventId` | Who is going |
| `GET` | `/event-interest/event/:eventId/with-friends` | Friends going |
| `GET` | `/event-interest/check/:eventId` | Own status |
| `GET` | `/event-interest/stats` | Aggregates |

`GET /api` returns a simple health string from `AppService`.

---

## Security

| Control | Behavior |
|---|---|
| **CORS** | Explicit origin allowlist (`CORS_ORIGINS`). No wildcard `*.vercel.app` / `*.railway.app` |
| **Helmet** | Baseline headers; CSP `defaultSrc 'none'` on the JSON API |
| **Validation** | Unknown DTO fields are rejected (`forbidNonWhitelisted`) |
| **Rate limits** | Global 300 req / min per client (`ThrottlerBehindProxyGuard` uses `X-Forwarded-For` behind a proxy). Tighter caps on forgot-password, duplicate-check, and check-in-code |
| **API key** | Optional pre-auth gate; compared with `timingSafeEqual`. Disabled (with a warning) if `API_KEY` is unset |
| **JWT** | Verified with the Supabase JWT secret — not a repo default string |
| **Docker secrets** | Compose uses `${VAR:?message}` so missing `JWT_SECRET` / `SUPABASE_JWT_SECRET` fail startup instead of using a public default |
| **Uploads** | Profile photos only: JPEG/PNG/WebP, 5 MB, stored under the member id |
| **Soft delete** | Events stay in the database so attendance history cannot be wiped by a delete |

CI also runs a **dependency audit gate** (`.github/scripts/audit-gate.mjs`) that fails only on high/critical advisories that have a non-breaking fix. Advisories that need a major bump are printed, not blocked.

---

## Development commands

From the repo root, `make help` lists everything. Common ones:

```bash
make install              # backend + frontend npm install
make dev                  # both servers (needs a running database)
make dev-backend          # Nest watch — :4000
make dev-frontend         # Next — :3000
make build                # production builds
make test                 # backend Jest
make lint                 # both packages
make format               # Prettier (backend)

make docker-db-up         # Postgres only
make docker-up            # Postgres + API
make docker-down
make docker-logs

make prisma-generate
make prisma-migrate       # prisma migrate dev
make prisma-studio
make prisma-seed          # prisma db seed (needs a prisma.seed script in package.json)
```

Equivalent npm scripts:

```bash
npm run dev:backend
npm run dev:frontend
npm run build             # both
```

Backend style: Prettier with single quotes and trailing commas. Nest files follow `*.module.ts`, `*.controller.ts`, `*.service.ts`, DTOs next to the feature, tests as `*.spec.ts`.

Frontend: PascalCase components (`EventCard.tsx`), lowercase route folders.

---

## Testing

Backend only (Jest). Unit tests sit beside source as `*.spec.ts`; e2e lives in `backend/test`.

```bash
cd backend
npm test
npm run test:watch
npm run test:cov
npm run test:e2e
npx jest path/to/file.spec.ts
```

Cover controllers, services, Prisma usage, auth, attendance, points, and stats when you change those areas.

The frontend has no test runner. Check UI with:

```bash
cd frontend
npm run type-check
npm run lint
```

and a local browser pass.

---

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on pushes and pull requests to `main` (`contents: read` only):

| Job | What it runs |
|---|---|
| **backend** | `npm ci`, `prisma generate`, ESLint **ratchet** (fails if error count exceeds `MAX_ERRORS` in the workflow), `npm test`, `npm run build` |
| **frontend** | `npm ci`, `type-check`, `next build` (placeholder Supabase env so prerender succeeds) |
| **audit** | Actionable high/critical `npm audit` findings for `/`, `/backend`, and `/frontend` |

Dependabot (`.github/dependabot.yml`) groups weekly npm minor/patch updates per workspace and monthly GitHub Actions updates.

If you reduce ESLint errors, lower `MAX_ERRORS` in the same PR so the improvement sticks.

---

## Deployment

| Piece | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway (or any host that can run the Docker image) |
| Database + Auth + Storage | Supabase |

**Frontend (Vercel)**

- Root / app directory: `frontend`
- Node 20
- Set the `NEXT_PUBLIC_*` variables
- Point `NEXT_PUBLIC_API_URL` at the Railway API (`https://<host>/api`) **or** rewrite `/api` to the backend and leave the variable unset

**Backend (Railway / Docker)**

- Bind to `0.0.0.0:$PORT` (Nest uses `process.env.PORT`, which Railway/Render inject)
- Image: `backend/Dockerfile` (multi-stage, `node:20-alpine`, user `nestjs`)
- On Compose start: `prisma migrate deploy && npm run start:prod` — you need a migration history for that path
- Production env must include `CORS_ORIGINS`, `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_JWT_SECRET`, and (if used) OAuth + `API_KEY`
- Filesystem is ephemeral; do not write uploads to disk — photos go to Supabase Storage

**Supabase**

- Copy the JWT secret into `SUPABASE_JWT_SECRET`
- Create public bucket `profile-photos`
- Configure Google/Discord redirect URLs to the **backend** callback URLs, not only the frontend

---

## Contributing

1. Branch from `main`; keep feature code next to its module (`backend/src/events/*` and `frontend/app/events/*`).
2. Match existing commit style: short imperative, often Conventional Commits (`feat:`, `fix:`, `style:`).
3. In the PR: what changed, how you tested, env/schema notes, and screenshots for UI.
4. Never commit `.env` files or real keys.
5. After `schema.prisma` edits: `npx prisma generate`, and record how to migrate/push.

Agent-oriented notes (architecture dump, coding agent rules) live in [`docs/OVERVIEW.md`](docs/OVERVIEW.md), [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md), and [`AGENTS.md`](AGENTS.md). Point-system design tickets: [`docs/pointsystem-tickets/README.md`](docs/pointsystem-tickets/README.md).
