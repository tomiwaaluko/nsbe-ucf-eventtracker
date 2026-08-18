# Repository Guidelines

NSBE UCF Event Tracker is a NestJS REST API plus a Next.js App Router frontend for the UCF NSBE chapter: event management, QR/code/manual attendance, 111/333 achievements, and a points system. Auth and storage are Supabase; the API verifies Supabase JWTs locally.

Human-oriented documentation (setup, env tables, routes, API, deployment) is in [`README.md`](README.md). Use this file for how to work in the repo.

## Project Structure & Module Organization

Keep code next to its feature, for example `backend/src/events/*` and `frontend/app/events/*`.

- `frontend/app`: App Router pages (most are `"use client"` because the JWT lives in the browser).
- `frontend/components`: reusable React components, including `ui/` primitives.
- `frontend/lib`: `api.ts` (all backend calls), `supabase.ts`, `utils.ts` (`cn()`).
- `frontend/public`: icons, PWA `manifest.json`.
- `backend/src`: Nest modules — `auth`, `members`, `events`, `attendance`, `stats`, `points`, `friends`, `event-interest`, `storage`, `cache`, `prisma`, `common`.
- `backend/prisma`: `schema.prisma` and `seed.ts`.
- `backend/test`: e2e Jest tests.
- `docs`: design notes (not a substitute for `README.md`).

Backend pattern: **controller → service → Prisma**. `PrismaModule` and `CacheModule` are `@Global()`. Path alias on the frontend: `@/*` → frontend root.

## Architecture Notes

- API prefix `/api`, port `4000` (`PORT`). Global `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform`.
- **JwtAuthGuard**: verifies with `SUPABASE_JWT_SECRET`, then `findOrCreateMember` (cached as `user:<id>`). There is no `POST /api/auth/login`.
- **ApiKeyMiddleware**: if `API_KEY` is set, require `X-API-Key` (or `Authorization: ApiKey …`). OAuth redirect paths are exempt.
- **Roles**: `isAdmin()` / `isSuperAdmin()` in `backend/src/common/roles.util.ts` — inline checks, not Nest guards. Values: `member` | `admin` | `super_admin`.
- **Throttler**: global 300 req/min; tighter `@Throttle` on `check-duplicate`, `forgot-password`, and `check-in-code`. Use the unnamed `default` throttler when overriding.
- Event reads must use explicit `select` lists. Never return `qrSecret` on member-facing routes; `checkInCode` is admin-only.
- Event delete is a **soft delete** (`isActive = false`) so attendance and achievements stay valid.
- Achievements: buckets `{WORKSHOP, SOCIAL}`, `{FUNDRAISER, COMMUNITY_SERVICE}`, `{GBM}`. `COMMITTEE_PARTICIPATION` does not count toward 111/333.
- Points: auto points are computed from `Attendance`; only manual awards are stored on `PointEntry`. Types live in `backend/src/points/point-types.constant.ts`.
- Models: Member, Event, Attendance, OAuthAccount, Friendship, EventInterest, PointEntry. Schema: `backend/prisma/schema.prisma`.

## Build, Test, and Development Commands

Node `20.x` (see `.node-version`), npm `>=9.0.0`.

- `make install`: install backend and frontend dependencies.
- `make docker-db-up`: local PostgreSQL (`nsbe_user` / `nsbe_password` / `nsbe_eventtracker` on `:5432`).
- `make prisma-generate`: regenerate the Prisma client after schema changes.
- Local schema apply: `cd backend && npx prisma db push` (this repo does not currently ship a `prisma/migrations` history). Create one with `npx prisma migrate dev` before relying on `migrate deploy`.
- `make dev`: backend `:4000` and frontend `:3000`. Or `make docker-dev` then `make dev-backend` / `make dev-frontend`.
- `npm run dev:backend` / `npm run dev:frontend`: same servers from the repo root.
- `make build` or `npm run build`: production builds.
- `make test`: backend Jest. Coverage: `cd backend && npm run test:cov`. Single file: `npx jest path/to/file.spec.ts`.
- Lint/format: `cd backend && npm run lint` (ESLint `--fix`) and `npm run format`. Frontend: `cd frontend && npm run lint` and `npm run type-check`.
- Compose API: `make docker-up` requires `JWT_SECRET` and `SUPABASE_JWT_SECRET` in `backend/.env` (no default signing keys). Production also requires `CORS_ORIGINS`.

## Coding Style & Naming Conventions

TypeScript throughout. Backend Prettier: single quotes, trailing commas (`cd backend && npm run format`). Nest files: `*.module.ts`, `*.controller.ts`, `*.service.ts`, DTOs next to the feature, tests as `*.spec.ts`. React components PascalCase (`EventCard.tsx`); route folders lowercase.

## Testing Guidelines

Backend unit tests live beside source as `*.spec.ts`; e2e tests live in `backend/test`. Add or update tests when changing controllers, services, Prisma, auth, attendance, points, or stats. The frontend has no test runner; verify UI with `cd frontend && npm run type-check` and a local browser pass.

CI (`.github/workflows/ci.yml`) runs backend lint as a **ratchet** (`MAX_ERRORS` in the workflow), not a zero-error gate. CI must run eslint without `--fix`. If you lower the error count, lower `MAX_ERRORS` in the same change. Frontend CI needs placeholder `NEXT_PUBLIC_SUPABASE_*` values because `lib/supabase.ts` calls `createClient()` at module scope.

## Commit & Pull Request Guidelines

Short imperative messages, often Conventional Commits (`feat:`, `fix:`, `style:`). Prefer `type: concise summary`.

PRs should include a description, linked issue or context, test commands run, database or environment changes, and screenshots for visible UI. Call out Prisma schema changes and required `.env` keys.

## Security & Configuration Tips

Do not commit real secrets. Templates: `backend/.env.example`, `frontend/.env.example` (copy frontend to `.env.local`).

- Backend must have `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_JWT_SECRET`. Production must set `CORS_ORIGINS` (comma-separated exact origins — no `*.vercel.app` wildcards). Pair `API_KEY` with frontend `NEXT_PUBLIC_API_KEY` when the gate is on.
- After editing `backend/prisma/schema.prisma`, run Prisma generate and document how to migrate or `db push`.
- Do not add default JWT/signing secrets in Docker or source. Do not weaken `forbidNonWhitelisted`, Helmet, or the named throttle on check-in-code.
- Profile photos: JPEG/PNG/WebP, 5 MB, Supabase bucket `profile-photos`.
