# NSBE UCF Event Tracker — Project Overview

## Project Purpose

NSBE UCF Event Tracker is a full-stack web application built for the UCF chapter of the National Society of Black Engineers (NSBE). Its core function is to manage chapter events and track member attendance via QR-code and short-code check-ins.

Beyond attendance, the system rewards member engagement through an achievement framework: members earn the "111" badge (one event from each of three activity categories) and the "333" badge (three events from each category) within a given semester. Public leaderboards rank members by total attendance count and by achievement completion order, creating visibility and incentive for participation.

Secondary features include:
- A social layer with friend requests and a member directory
- "Plan to attend" interest tracking for upcoming events
- An admin panel for event management, QR code generation, manual check-ins, and role assignment
- Profile management with optional profile photo uploads stored in Supabase Storage

Live deployment: frontend on Vercel, backend on Railway, database and auth via Supabase.

---

## Tech Stack & Rationale

| Layer | Technology | Version |
|---|---|---|
| Backend framework | NestJS | 11 |
| Backend language | TypeScript | 5.7 |
| ORM | Prisma | 6 |
| Database | PostgreSQL (Supabase-hosted) | — |
| Frontend framework | Next.js (App Router) | 16 |
| Frontend language | TypeScript | 5 |
| UI runtime | React | 19 |
| Styling | Tailwind CSS + Radix UI | 3.4 / 30+ components |
| Auth | Supabase Auth (JWT, Google OAuth, Discord OAuth) | — |
| File storage | Supabase Storage | — |
| QR code generation | `qrcode` npm package | 1.5 |
| QR code scanning | `html5-qrcode` | 2.3 |
| Forms | `react-hook-form` | 7 |
| Charts | `recharts` | 3 |
| Animations | `framer-motion`, `canvas-confetti` | — |
| Toasts | `sonner` | 2 |
| In-memory cache | `node-cache` | 5 |
| Node runtime | Node.js | 20.x |
| Container | Docker (multi-stage, `node:20-alpine`) | — |

**Rationale highlights:**

- **NestJS** provides the module/controller/service structure needed to organize a backend with 10+ distinct domains. Its built-in dependency injection, `ValidationPipe`, and guard abstractions reduce boilerplate considerably.
- **Prisma** generates a type-safe client directly from the schema, making relation traversal across the Member/Event/Attendance/Friendship graph safe at compile time and keeping the schema as the single source of truth.
- **Supabase** handles auth and storage to avoid building credential management and object-store infrastructure from scratch. Supabase JWTs are verified directly in the NestJS `JwtAuthGuard` using `SUPABASE_JWT_SECRET`, so there is no round-trip to Supabase on every request.
- **Next.js App Router** is used for the frontend. Most pages use `"use client"` directives because the dashboard, check-in, and leaderboard pages require browser-local state (e.g., `localStorage` for the JWT) and real-time interactions.
- **node-cache** provides an in-memory caching layer to avoid repeated expensive queries (leaderboard, member list, events list) on every authenticated request — avoiding the infrastructure overhead of an external Redis instance.

---

## Architecture Overview

### High-Level Structure

```
nsbe-ucf-eventtracker/
├── backend/                # NestJS REST API, port 4000
│   ├── src/
│   │   ├── app.module.ts           # Root module; applies ApiKeyMiddleware globally
│   │   ├── main.ts                 # Bootstrap: /api prefix, CORS, ValidationPipe
│   │   ├── auth/                   # JWT guard, OAuth (Google/Discord), user sync
│   │   ├── members/                # Profile CRUD, role management, photo uploads
│   │   ├── events/                 # Event CRUD, QR code generation
│   │   ├── attendance/             # Check-in (QR/code/manual), attendance history
│   │   ├── stats/                  # Achievements, leaderboard
│   │   ├── friends/                # Friend requests and friendship management
│   │   ├── event-interest/         # Plan-to-attend tracking
│   │   ├── storage/                # File upload service (Supabase Storage)
│   │   ├── cache/                  # Global in-memory cache (node-cache)
│   │   ├── prisma/                 # Global PrismaService with shutdown hooks
│   │   └── common/                 # ApiKeyMiddleware, roles utility functions
│   └── prisma/
│       └── schema.prisma           # Database schema (source of truth)
├── frontend/               # Next.js App Router SPA, port 3000
│   ├── app/                        # Route pages (26 routes)
│   ├── components/                 # Shared UI components (97+ files)
│   └── lib/
│       ├── api.ts                  # Centralized fetch wrapper
│       ├── supabase.ts             # Supabase browser client
│       └── utils.ts                # cn() helper (clsx + tailwind-merge)
├── Makefile                        # Dev/build/Docker shortcuts
└── package.json                    # Root: orchestrates build and dev for both sides
```

### Backend Module Pattern

Every feature module follows the same three-layer pattern:

```
[Module]Controller  →  [Module]Service  →  PrismaService
```

Controllers handle HTTP routing and input validation via DTOs and the global `ValidationPipe`. Services contain all business logic and interact with `PrismaService` and `CacheService`. Both `PrismaModule` and `CacheModule` are declared `@Global()`.

### Backend Modules

| Module | Key Routes | Notes |
|---|---|---|
| **AuthModule** | `POST /api/auth/login`, OAuth flows | Supabase JWT verification, user sync via `findOrCreateMember` |
| **MembersModule** | `GET/PUT/DELETE /api/members/me`, `GET /api/members` | Depends on AuthModule, StorageModule |
| **EventsModule** | `CRUD /api/events`, `GET /api/events/:id/qr` | QR code generation via per-event `qrSecret` UUID |
| **AttendanceModule** | `POST /api/attendance/check-in`, `/check-in-code`, `/manual` | 3 check-in methods with shared validation |
| **StatsModule** | `GET /api/stats/me`, `/leaderboard`, `/leaderboard/111`, `/leaderboard/333` | Achievement stats, bucket-based leaderboards |
| **FriendsModule** | Friend request lifecycle, directory | Bidirectional Friendship records via `$transaction` |
| **EventInterestModule** | Plan-to-attend create/delete/list | `PLANNING / CANCELLED / ATTENDED` statuses |
| **StorageModule** | Internal service only | Supabase Storage, 5 MB limit, JPEG/PNG/WebP |
| **CacheModule** | No controller, `@Global()` | `node-cache`, pattern-based invalidation |
| **PrismaModule** | No controller, `@Global()` | Graceful shutdown hooks |

### Database Schema (6 Models)

- **Member** — `id` is the Supabase Auth UUID. `role`: `"member"` | `"admin"` | `"super_admin"`. Optional profile fields including `photoUrl`.
- **Event** — has `qrSecret` (UUID, used to validate QR tokens) and `checkInCode` (unique 6-char alphanumeric, generated excluding ambiguous chars `0 O 1 I`). `isActive` controls check-in acceptance.
- **Attendance** — `@@unique([memberId, eventId])` enforces one check-in per member per event. `checkInMethod`: `"qr"` | `"code"` | `"manual"`.
- **OAuthAccount** — links Member to Google/Discord identities. `@@unique([provider, providerUserId])`.
- **Friendship** — bidirectional: two rows per friendship. `FriendshipStatus` enum: `PENDING / ACCEPTED / DECLINED / BLOCKED`. Indexed on `[userId, status]` and `[friendId, status]`.
- **EventInterest** — `EventInterestStatus` enum: `PLANNING / CANCELLED / ATTENDED`.

`EventCategory` enum: `GBM | SOCIAL | WORKSHOP | FUNDRAISER | COMMUNITY_SERVICE | COMMITTEE_PARTICIPATION`.

### Frontend Route Map (26 routes)

```
/                     Home / landing
/dashboard            Member dashboard
/events               Events list
/events/create        Create event (admin)
/events/[id]          Event detail
/checkin              QR scanner
/attendance           Member attendance history
/members              Member directory
/members/[id]         Member profile
/achievements         Achievement badge progress
/leaderboard          Points leaderboard
/friends              Friends and requests
/settings             Profile settings
/admin                Admin dashboard
/admin/events         Event management
/admin/events/[id]/qr QR code viewer
/admin/attendance     Attendance management
/admin/members        Member management
/admin/checkin        Manual check-in
... + auth/onboarding routes
```

---

## Setup & Install Steps

### Prerequisites
- Node.js 20.x, npm >= 9.0.0
- Docker and Docker Compose
- A Supabase project with Auth enabled and a Storage bucket named `profile-photos` (public)

### Option A: Docker Full Stack

```bash
git clone https://github.com/tomiwaaluko/nsbe-ucf-eventtracker.git
cd nsbe-ucf-eventtracker
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
make docker-up
```

### Option B: Docker Database + Local Services (recommended for development)

```bash
make docker-dev       # Terminal 1: start PostgreSQL container
make dev-backend      # Terminal 2: cd backend && npm run start:dev
make dev-frontend     # Terminal 3: cd frontend && npm run dev
```

### Environment Variables

**Backend (`backend/.env`):**
```
DATABASE_URL=               # Supabase PostgreSQL (pooled)
DIRECT_URL=                 # Direct connection (for migrations)
SUPABASE_URL=
SUPABASE_JWT_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
FRONTEND_URL=
API_KEY=                    # Optional pre-auth gate
```

**Frontend (`frontend/.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_API_KEY=
```

### Database Commands

```bash
cd backend
npx prisma migrate dev      # apply migrations (dev)
npx prisma migrate deploy   # apply migrations (prod)
npx prisma generate         # regenerate client after schema changes
npx prisma studio           # visual browser at localhost:5555
```

---

## Notable Implementation Decisions

### 1. JWT Verification and User Sync on Every Request
`JwtAuthGuard` verifies the Supabase JWT locally using `SUPABASE_JWT_SECRET` — no network call to Supabase per request. After verification it calls `authService.findOrCreateMember(payload.sub, ...)`, upsert-syncing the Supabase user into Prisma. The lookup is cached for 5 minutes under `user:<id>` to avoid a DB hit on every API call.

### 2. Bidirectional Friendship Records in a `$transaction`
Friendships are stored as two rows (one per direction). `sendFriendRequest()` creates both `(userId→friendId, PENDING)` and `(friendId→userId, PENDING)` inside a single `prisma.$transaction([...])`. The `requesterId` column records who initiated. This simplifies all downstream queries — filtering on `WHERE userId = currentUser` with no `OR` clause needed.

### 3. Three Check-In Methods with Shared Validation
All three paths (QR token, short code, manual admin) enforce: event must be `isActive = true`, timestamp within `startTime`–`endTime`. The `@@unique([memberId, eventId])` Prisma constraint is the final backstop. After any successful check-in, `cache.delPattern('leaderboard:')`, `cache.delPattern('members:')`, and `cache.del('user:<memberId>')` purge stale data.

### 4. Event Soft Delete
`EventsService.remove()` sets `isActive = false` rather than deleting the row. Deleting would cascade into Attendance records and invalidate previously earned achievements. Soft deletion preserves all historical data.

### 5. Achievement Bucket System
Six categories map to three buckets: `{WORKSHOP, SOCIAL}`, `{FUNDRAISER, COMMUNITY_SERVICE}`, `{GBM}`. `COMMITTEE_PARTICIPATION` is explicitly excluded. "111" = one attendance per bucket in the semester; "333" = three. Leaderboards rank by the timestamp of the attendance that completed the final bucket requirement, and are cached 5 minutes under `leaderboard:111:<semester>` / `leaderboard:333:<semester>`.

### 6. OAuth Account Linking (3-Step Resolution)
`OAuthService.linkOrCreateAccount()`: (1) If `OAuthAccount` row exists for `(provider, providerUserId)` → authenticate that Member. (2) If no OAuth row but a Member with matching email exists → create the OAuth row linked to that Member (seamless social login attachment). (3) Otherwise → create a new Supabase Auth user, use its UUID as `Member.id`, create both rows.

### 7. PKCE for Google OAuth
The Google OAuth flow generates a code verifier with `crypto.randomBytes(32).toString('base64url')` and derives the challenge via SHA-256. The verifier is stored and passed to `googleClient.getToken({ code, codeVerifier })` during the callback, preventing authorization code interception attacks.

### 8. Pattern-Based Cache Invalidation
`CacheService.delPattern(pattern)` retrieves all keys, filters by regex, and batch-deletes matches. A single `cache.delPattern('leaderboard:')` clears all leaderboard variants across all semesters. `wrap(key, fn, ttl)` implements cache-aside. TTLs: user lookups 5 min, events list 2 min, leaderboard 5 min, member list 3 min.

### 9. PWA Configuration
The root layout configures the app as an installable PWA: `manifest.json`, `themeColor: "#00843D"` (NSBE green), icons at 32×32, 192×192, and 512×512. Members can install it to their phone's home screen and open directly to the QR scanner at events.

### 10. API Key as Pre-Authentication Gate
`ApiKeyMiddleware` runs before all controllers on every route. If `API_KEY` env var is set, requests must include `X-API-Key` or `Authorization: ApiKey`. OAuth paths are exempt (browsers can't inject custom headers during OAuth redirects).
