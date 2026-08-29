# NSBE UCF Event Tracker — Full Project Context

Use this document to understand the entire project so you can help with development, debugging, and feature work.

---

## What This Project Is

A full-stack web application for the NSBE (National Society of Black Engineers) UCF chapter. It manages chapter events and tracks member attendance via QR-code and manual check-ins. Members earn achievements based on attendance across different event categories.

**Live deployment**: Frontend on Vercel, backend on Railway, database + auth via Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11 (TypeScript), Prisma 6 ORM, PostgreSQL |
| Frontend | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS, Radix UI (30+ components), Lucide icons |
| Auth | Supabase Auth (JWT) + Google/Discord OAuth |
| Storage | Supabase Storage (profile photos) |
| Database | Supabase-hosted PostgreSQL |
| QR codes | `qrcode` npm package |
| Forms | react-hook-form |
| Charts | recharts |
| Animations | framer-motion, canvas-confetti |
| QR scanning | html5-qrcode |
| Toasts | sonner |
| Caching | node-cache (in-memory, backend) |
| Runtime | Node 20.x, npm >=9.0.0 |

---

## Repository Structure

```
nsbe-ucf-eventtracker/
├── backend/              # NestJS REST API
│   ├── src/
│   │   ├── app.module.ts         # Root module, wires everything
│   │   ├── main.ts               # Bootstrap: global prefix /api, CORS, port 4000
│   │   ├── auth/                 # JWT guard, OAuth (Google/Discord), user sync
│   │   ├── members/              # Profile CRUD, role management, photo uploads
│   │   ├── events/               # Event CRUD, QR code generation
│   │   ├── attendance/           # Check-in (QR/code/manual), history
│   │   ├── stats/                # Achievements, leaderboard
│   │   ├── friends/              # Friend requests and friendship management
│   │   ├── event-interest/       # Plan-to-attend tracking
│   │   ├── storage/              # File upload service (Supabase Storage)
│   │   ├── cache/                # Global in-memory cache (node-cache)
│   │   ├── prisma/               # PrismaService (global)
│   │   └── common/               # api-key.middleware.ts, roles.util.ts
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   └── docker-compose.yml        # PostgreSQL + backend container
├── frontend/             # Next.js App Router SPA
│   ├── app/                      # Route pages
│   ├── components/               # Shared UI components (97+ files)
│   └── lib/
│       ├── api.ts                # Centralized fetch wrapper (all API calls)
│       ├── supabase.ts           # Supabase client
│       └── utils.ts              # cn() helper (clsx + tailwind-merge)
├── Makefile                      # Dev/build shortcuts
└── package.json                  # Root: build/dev scripts for both sides
```

---

## Database Schema (Prisma)

### Models

**Member**
```
id            uuid (PK)
email         unique
firstName     String?
lastName      String?
role          String (default: "member") — values: "member", "admin", "super_admin"
emailVerified Boolean
isActive      Boolean
passwordHash  String?
bio, discordUsername, graduationYear, linkedInUrl, major, phoneNumber, photoUrl  (all optional)
createdAt, updatedAt
→ has many: Attendance, Event (created), OAuthAccount, EventInterest, Friendship
```

**Event**
```
id          uuid (PK)
name        String
description String?
category    EventCategory enum
semester    String  (e.g. "Spring 2025")
startTime   DateTime
endTime     DateTime
location    String?
qrSecret    String  (used to generate/validate QR tokens)
checkInCode String? unique  (short alphanumeric code alternative)
isActive    Boolean
createdById String? (FK → Member)
→ has many: Attendance, EventInterest
```

**Attendance**
```
id            uuid (PK)
memberId      FK → Member
eventId       FK → Event
checkedInAt   DateTime (default: now())
checkInMethod String (default: "qr") — values: "qr", "code", "manual"
@@unique([memberId, eventId])  — one check-in per member per event
```

**OAuthAccount**
```
id             uuid (PK)
userId         FK → Member (cascade delete)
provider       String ("google" | "discord")
providerUserId String
providerEmail  String?
accessToken, refreshToken, scopes  (all optional)
@@unique([provider, providerUserId])
```

**Friendship**
```
id          uuid (PK)
userId      FK → Member (cascade delete)
friendId    FK → Member (cascade delete)
requesterId String  (who sent the request)
status      FriendshipStatus enum
@@unique([userId, friendId])
```

**EventInterest**
```
id       uuid (PK)
memberId FK → Member (cascade delete)
eventId  FK → Event (cascade delete)
status   EventInterestStatus enum
@@unique([memberId, eventId])
```

### Enums

```
EventCategory:       GBM | SOCIAL | WORKSHOP | FUNDRAISER | COMMUNITY_SERVICE | COMMITTEE_PARTICIPATION
FriendshipStatus:    PENDING | ACCEPTED | DECLINED | BLOCKED
EventInterestStatus: PLANNING | CANCELLED | ATTENDED
```

---

## Backend Architecture

### API Global Setup (main.ts)
- Global prefix: `/api` (all routes are `/api/...`)
- Port: 4000 (env `PORT`)
- Global `ValidationPipe` with `whitelist: true, transform: true`
- CORS: localhost:3000/5173, *.vercel.app, *.railway.app
- Graceful Prisma disconnect on shutdown

### Modules

| Module | Controller routes | Notes |
|---|---|---|
| **AuthModule** | `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/check-duplicate`, OAuth flows | Supabase JWT verification, user sync |
| **MembersModule** | `GET/PUT/DELETE /api/members/me`, `GET /api/members`, `PUT /api/members/:id/role`, `PUT /api/members/:id/status` | Depends on AuthModule, StorageModule |
| **EventsModule** | `CRUD /api/events`, `GET /api/events/:id/qr` | QR code generation via qrSecret |
| **AttendanceModule** | `POST /api/attendance/check-in`, `POST /api/attendance/check-in-code`, `POST /api/attendance/manual`, `GET /api/attendance/my`, `GET /api/attendance/events/:id` | 3 check-in methods |
| **StatsModule** | `GET /api/stats/me`, `GET /api/stats/admin`, `GET /api/stats/leaderboard`, `/leaderboard/me`, `/leaderboard/top`, `/leaderboard/stats`, `/leaderboard/111`, `/leaderboard/333` | Achievement stats |
| **FriendsModule** | `GET /api/friends`, `POST /api/friends/request/:userId`, `POST /api/friends/accept/:userId`, `DELETE /api/friends/decline/:userId`, `DELETE /api/friends/cancel/:userId`, `DELETE /api/friends/:userId`, `/friends/requests/received`, `/friends/requests/sent`, `/friends/directory`, `/friends/status/:userId` | |
| **EventInterestModule** | `POST/DELETE /api/event-interest/:eventId`, `GET /api/event-interest/my`, `/event-interest/event/:eventId`, `/event-interest/check/:eventId` | Plan-to-attend |
| **StorageModule** | Internal service only | Supabase Storage, 5MB limit, JPEG/PNG/WebP |
| **CacheModule** | `@Global()` — no controller | node-cache, available app-wide |
| **PrismaModule** | `@Global()` — no controller | PrismaService with shutdown hooks |

### Key Middleware & Guards

**ApiKeyMiddleware** (`src/common/api-key.middleware.ts`)
- Applied to all routes
- Checks `X-API-Key` header against `API_KEY` env var
- Skips OAuth callback routes
- Returns 401 if key set and doesn't match

**JwtAuthGuard** (`src/auth/jwt/jwt.guard.ts`)
- Verifies Supabase JWT using `SUPABASE_JWT_SECRET`
- Extracts `sub` (user ID) and `email` from token
- Calls `authService.findOrCreateMember()` to sync Supabase users to the local DB
- Sets `request.user` for downstream use

**Role checks** — NOT guards, just utility functions called inline:
- `isAdmin(role)` — true for "admin" or "super_admin"
- `isSuperAdmin(role)` — true for "super_admin" only
- Located at `src/common/roles.util.ts`

### Each module follows this pattern:
```
ModuleController → ModuleService → PrismaService
```
Controllers handle HTTP, services contain business logic, PrismaService is injected for DB access.

---

## Frontend Architecture

### App Router Pages

```
/                          Home / landing
/dashboard                 Member dashboard
/events                    Events list
/events/create             Create new event (admin)
/events/[id]               Event detail
/events/[id]/edit          Edit event (admin)
/checkin                   QR code scanner check-in
/attendance                Member's attendance history
/members                   Member directory
/members/[id]              Member profile
/achievements              Achievement badges
/leaderboard               Points leaderboard
/friends                   Friends list + requests
/settings                  Profile settings
/forgot-password           Password reset request
/reset-password            Password reset confirmation
/auth/callback             OAuth redirect handler
/admin                     Admin dashboard
/admin/events              Event management
/admin/events/[id]/qr      QR code viewer/download
/admin/attendance          Attendance management
/admin/members             Member management
/admin/admins              Admin role management
/admin/checkin             Manual check-in
```

Most pages use `"use client"` directive (client-side rendering).

### Auth Flow

1. User logs in via Supabase Auth (email/password or OAuth)
2. JWT stored in `localStorage` by Supabase client
3. All API calls inject `Authorization: Bearer <JWT>` header
4. Backend `JwtAuthGuard` verifies + syncs user to local DB on every protected request
5. OAuth: frontend redirects to `GET /api/auth/oauth/{provider}` → provider → `/auth/callback` page

### lib/api.ts — The API Layer

All backend calls go through `lib/api.ts`. Key behaviors:
- Auto-injects `X-API-Key` header if `NEXT_PUBLIC_API_KEY` is set
- Resolves API URL: `NEXT_PUBLIC_API_URL` → `/api` (prod) → `http://localhost:4000/api` (dev)
- `handleResponse()` throws on non-OK, parses error messages from JSON or text
- 401 responses trigger `sessionExpiredCallback` (registered via `onSessionExpired()`)
- QR code requests have a 10-second `AbortController` timeout
- Exports `getApiUrl()`, `apiHeaders()`, `getOAuthRedirectBase()`, `onSessionExpired()`

### Frontend Key Libraries

- `@/lib/utils.ts` — `cn()` merges Tailwind classes (clsx + tailwind-merge)
- `@/*` path alias maps to `./` from frontend root
- Components use Radix UI primitives wrapped with Tailwind
- Toasts via `sonner`
- Forms via `react-hook-form`
- Charts via `recharts`
- Animations via `framer-motion`

---

## Achievements System

Events map to 3 achievement buckets:
- **Bucket 1**: WORKSHOP + SOCIAL events
- **Bucket 2**: FUNDRAISER + COMMUNITY_SERVICE events
- **Bucket 3**: GBM events

`COMMITTEE_PARTICIPATION` does **not** count toward any achievement bucket.

A member earns an achievement when they attend enough events in a bucket. The "111" and "333" leaderboards track bucket-based achievement scores.

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=                    # Supabase PostgreSQL connection string
DIRECT_URL=                      # Direct connection (for Prisma migrations)
SUPABASE_URL=                    # Supabase project URL
SUPABASE_JWT_SECRET=             # For verifying JWTs
SUPABASE_SERVICE_ROLE_KEY=       # For admin operations
PORT=4000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=
APP_BASE_URL=                    # Backend base URL
OAUTH_BASE_URL=                  # OAuth redirect base
FRONTEND_URL=                    # Frontend URL (for CORS/redirects)
API_KEY=                         # Optional shared secret with frontend
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=             # Backend URL (e.g. https://backend.railway.app/api)
NEXT_PUBLIC_APP_URL=             # Frontend URL (for OAuth redirects)
NEXT_PUBLIC_API_KEY=             # Must match backend API_KEY
```

---

## Development Commands

```bash
# Full stack via Docker
make docker-up

# Database only (Docker) + local services
make docker-dev            # starts PostgreSQL container
make dev-backend           # terminal 1: backend on port 4000
make dev-frontend          # terminal 2: frontend on port 3000

# From root
npm run dev:backend        # cd backend && npm run start:dev
npm run dev:frontend       # cd frontend && npm run dev

# Build
npm run build              # build both
npm run build:backend      # prisma generate + nest build
npm run build:frontend     # next build

# Backend tests
cd backend
npm test                   # all Jest tests
npm run test:watch
npm run test:cov
npm run test:e2e
npx jest path/to/file.spec.ts   # single file

# Lint & format
cd backend && npm run lint      # ESLint --fix
cd backend && npm run format    # Prettier (singleQuote, trailingComma: all)
cd frontend && npm run lint
cd frontend && npm run type-check

# Database
cd backend
npx prisma migrate dev     # apply migrations (dev)
npx prisma migrate deploy  # apply migrations (prod)
npx prisma generate        # regenerate client after schema changes
npx prisma studio          # visual DB browser
npx prisma db seed
```

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | Supabase (managed PostgreSQL) |
| Auth | Supabase Auth |
| File storage | Supabase Storage |

Docker Compose (`backend/docker-compose.yml`) runs a PostgreSQL container + backend container for self-hosted deployment. Backend Dockerfile uses multi-stage build with `node:20-alpine`, runs as non-root `nestjs` user.

On container start: `prisma migrate deploy && npm run start:prod`

---

## Code Conventions

- Backend: TypeScript ES2023 target, CommonJS modules
- Prettier: singleQuote, trailingComma: all
- DTOs live in each module's folder (e.g., `events/create-event.dto.ts`)
- Frontend: `@/*` path alias for all imports
- No dedicated interceptors — error handling is done per-service or in the API wrapper
- Role checks are inline utility function calls, not NestJS guards
