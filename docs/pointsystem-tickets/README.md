# Point System — Implementation Tickets

**Design doc:** `docs/POINT_SYSTEM_FINAL.md`
**Branch:** `point-system`

---

## Ticket Overview & Dependency Order

| Ticket | Title | Depends On | Agent Focus |
|--------|-------|-----------|-------------|
| [TICKET-01](./TICKET-01-prisma-schema.md) | Prisma Schema: PointEntry Model | Nothing | Backend / DB |
| [TICKET-02](./TICKET-02-backend-points-module.md) | Backend: Full Points Module | TICKET-01 | Backend |
| [TICKET-03](./TICKET-03-frontend-api-client.md) | Frontend: API Client Extensions | TICKET-02 (can be written in parallel) | Frontend |
| [TICKET-04](./TICKET-04-frontend-navigation-and-page-shell.md) | Frontend: Navigation + Page Shell | TICKET-03 | Frontend |
| [TICKET-05](./TICKET-05-frontend-tab1-leaderboard.md) | Frontend: Tab 1 — Leaderboard | TICKET-04 | Frontend |
| [TICKET-06](./TICKET-06-frontend-tab2-bulk-award.md) | Frontend: Tab 2 — Bulk Award | TICKET-05 | Frontend |
| [TICKET-07](./TICKET-07-frontend-tab3-entry-history.md) | Frontend: Tab 3 — Entry History | TICKET-05 | Frontend |

---

## Execution Order

```
TICKET-01  →  TICKET-02  →  TICKET-03  →  TICKET-04  →  TICKET-05  →  TICKET-06
                                                                    ↘  TICKET-07
```

TICKET-06 and TICKET-07 can be worked on in parallel once TICKET-05 is done.

---

## Key Design Decisions (Quick Reference)

- **Auto points are NOT stored** — computed live from `Attendance` records on each summary/leaderboard request
- **Only manual awards are stored** in the `PointEntry` table
- **Deduplication** via `@@unique([memberId, pointTypeKey, label, semester])` — no separate dedupe key field
- **Semester filtering only** — no cohort support
- **Bulk member entry** supports both paste+fuzzy-match AND debounced search+checkbox select
- **Unresolved names** during paste (no account, typo) are skipped gracefully with a count warning — not a hard error
- **Bulk award response** returns `{ awarded, skipped, notFound }` counts only — no list of bad IDs

---

## Post-Implementation Review

Once all tickets are marked complete (each ticket file has an "Implementation Result" section appended at the bottom), the solution architect will review all tickets for:

1. Correctness of the Prisma unique constraint behavior with null labels
2. Whether auto-point computation is correctly merging with manual entries in the leaderboard
3. Whether the upsert dedupe key name in the service matches what Prisma actually generates
4. Whether the paste+resolve UX correctly handles the case where a member doesn't have an account
5. Whether the debounce search in Tab 2 is firing on input change (not submit)
6. Whether all admin-only routes are properly guarded on the backend
7. Any TypeScript type mismatches between backend response shapes and frontend type definitions
