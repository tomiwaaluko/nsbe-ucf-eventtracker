# Database: Supabase primary + Railway backup (NSB-51)

## Policy

| Role | System | Env vars |
|---|---|---|
| **Primary (source of truth)** | Supabase Postgres | `DATABASE_URL`, `DIRECT_URL` |
| **Backup only** | Railway Postgres service | `BACKUP_DATABASE_URL` |
| **Auth** | Supabase Auth | `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` |

- All normal reads and writes go to **Supabase**.
- Railway Postgres must **not** be deleted; it is the disaster-recovery / mirror target.
- Auth UIDs and the Prisma `Member.id` values must come from the **same** Supabase project as `DATABASE_URL`.
- Do **not** point primary at Railway except documented failover (`ALLOW_RAILWAY_PRIMARY=true`).

## How backup sync works

1. **Boot guard** — If `DATABASE_URL` hostname looks like Railway (`*.railway.internal`, `*.rlwy.net`, …) and `ALLOW_RAILWAY_PRIMARY` is not truthy, the API **refuses to start**. This prevents silently serving stale Railway seed data while Auth is on Supabase.
2. **Periodic mirror** — When `BACKUP_DATABASE_URL` is set (and its host differs from primary), `DatabaseMirrorService` upserts all Prisma app tables from primary → backup on an interval (`BACKUP_SYNC_INTERVAL_MS`, default 5 minutes; first run ~20s after boot). Failures are logged and never affect user requests. This stays compatible with Prisma 6 (no `$use` middleware) without a fragile second write path.
3. **Baseline sync** — After cutover, also run a one-shot full copy so the backup is warm before the first interval:

```bash
cd backend
DATABASE_URL="<supabase-pooled-or-direct>" \
BACKUP_DATABASE_URL="<railway-postgres-url>" \
npm run db:sync-backup
```

Order: Member → Event → OAuthAccount → Friendship → EventInterest → Attendance → PointEntry.

## Env pairing checklist

Same Supabase project for all of:

- `DATABASE_URL` / `DIRECT_URL` (Postgres)
- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- Frontend `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Railway staging backend service should also have:

- `BACKUP_DATABASE_URL` = Railway Postgres URL (or Railway reference `${{Postgres.DATABASE_URL}}` / service id reference)
- `ALLOW_RAILWAY_PRIMARY` **unset** after cutover

Verify (hostnames only):

```bash
curl -s -H "X-API-Key: $API_KEY" https://<backend>/api/health/db
```

Expect `primary.kind === "supabase"` and `backup.configured === true` with `backup.kind === "railway"`.

## Staging cutover (NSBE-UCF Railway)

Project `NSBE-UCF` · Backend `NSBE App Backend` · Staging env · Postgres service kept as backup.

1. In Supabase (project that matches Auth): copy **Session pooler** URL → `DATABASE_URL`, **Direct** URL → `DIRECT_URL`.
2. On Railway staging backend:
   - Set `DATABASE_URL` / `DIRECT_URL` to those Supabase values (replace the Railway Postgres references).
   - Set `BACKUP_DATABASE_URL` to the Railway Postgres URL (keep the Postgres service).
   - Remove `ALLOW_RAILWAY_PRIMARY` if it was set for the transition.
   - Confirm `SUPABASE_*` vars match the same project.
3. Apply schema to Supabase if needed: `npx prisma db push` using `DIRECT_URL` (from a trusted machine; do not commit secrets).
4. Redeploy backend; confirm boot logs show `Primary database host=… kind=supabase`.
5. Run `npm run db:sync-backup` once so Railway has a full mirror.
6. Spot-check Friends / Events / Leaderboard against real chapter data (not ~4 seed members).
7. `GET /api/health/db` should show supabase primary + railway backup.

## Disaster recovery (failover to Railway)

Only if Supabase Postgres is unavailable:

1. Set `DATABASE_URL` / `DIRECT_URL` to Railway Postgres.
2. Set `ALLOW_RAILWAY_PRIMARY=true`.
3. Redeploy. Expect warn logs that Railway is primary.
4. After Supabase recovery: reverse the cutover, run `db:sync-backup` if Railway accumulated writes you need to reconcile, clear `ALLOW_RAILWAY_PRIMARY`.

**Caution:** Auth remains on Supabase. Failover covers Prisma app data only. If Railway lagged behind, you may serve slightly stale friends/events/points until re-synced.

## Out of scope

- Deleting Railway Postgres
- Copying Railway seed data *into* Supabase (real chapter data already lives in Supabase)
- Changing Auth provider
