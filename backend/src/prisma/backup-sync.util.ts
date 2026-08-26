import { PrismaClient } from '@prisma/client';

type Row = Record<string, unknown>;

type SyncStep = {
  name: string;
  fetch: (db: PrismaClient) => Promise<Row[]>;
  upsert: (db: PrismaClient, row: Row) => Promise<unknown>;
};

/** FK-safe order for copying Prisma app data primary → backup. */
export const BACKUP_SYNC_ORDER: SyncStep[] = [
  {
    name: 'Member',
    fetch: (db) => db.member.findMany(),
    upsert: (db, row) =>
      db.member.upsert({
        where: { id: row.id as string },
        create: row as never,
        update: row as never,
      }),
  },
  {
    name: 'Event',
    fetch: (db) => db.event.findMany(),
    upsert: (db, row) =>
      db.event.upsert({
        where: { id: row.id as string },
        create: row as never,
        update: row as never,
      }),
  },
  {
    name: 'OAuthAccount',
    fetch: (db) => db.oAuthAccount.findMany(),
    upsert: (db, row) =>
      db.oAuthAccount.upsert({
        where: { id: row.id as string },
        create: row as never,
        update: row as never,
      }),
  },
  {
    name: 'Friendship',
    fetch: (db) => db.friendship.findMany(),
    upsert: (db, row) =>
      db.friendship.upsert({
        where: { id: row.id as string },
        create: row as never,
        update: row as never,
      }),
  },
  {
    name: 'EventInterest',
    fetch: (db) => db.eventInterest.findMany(),
    upsert: (db, row) =>
      db.eventInterest.upsert({
        where: { id: row.id as string },
        create: row as never,
        update: row as never,
      }),
  },
  {
    name: 'Attendance',
    fetch: (db) => db.attendance.findMany(),
    upsert: (db, row) =>
      db.attendance.upsert({
        where: { id: row.id as string },
        create: row as never,
        update: row as never,
      }),
  },
  {
    name: 'PointEntry',
    fetch: (db) => db.pointEntry.findMany(),
    upsert: (db, row) =>
      db.pointEntry.upsert({
        where: { id: row.id as string },
        create: row as never,
        update: row as never,
      }),
  },
];

export type BackupSyncResult = {
  tables: Record<string, number>;
};

/**
 * Upsert all app tables from primary into backup.
 * Does not delete backup-only rows (safe additive mirror).
 */
export async function syncPrimaryToBackup(
  primary: PrismaClient,
  backup: PrismaClient,
): Promise<BackupSyncResult> {
  const tables: Record<string, number> = {};

  for (const step of BACKUP_SYNC_ORDER) {
    const rows = await step.fetch(primary);
    let written = 0;
    for (const row of rows) {
      await step.upsert(backup, row);
      written += 1;
    }
    tables[step.name] = written;
  }

  return { tables };
}
