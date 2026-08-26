import { Prisma, PrismaClient } from '@prisma/client';

type Row = Record<string, unknown>;

type SyncStep = {
  name: string;
  fetch: (db: PrismaClient) => Promise<Row[]>;
  upsert: (db: PrismaClient, row: Row) => Promise<unknown>;
};

/**
 * Railway seed rows often share emails / check-in codes with real Supabase
 * rows but use different UUIDs. Delete the conflicting backup row so the
 * primary (Supabase) identity can upsert by id.
 */
async function upsertMember(db: PrismaClient, row: Row): Promise<unknown> {
  const id = row.id as string;
  const email = row.email as string;
  const conflict = await db.member.findUnique({ where: { email } });
  if (conflict && conflict.id !== id) {
    await db.member.delete({ where: { id: conflict.id } });
  }
  return db.member.upsert({
    where: { id },
    create: row as never,
    update: row as never,
  });
}

async function upsertEvent(db: PrismaClient, row: Row): Promise<unknown> {
  const id = row.id as string;
  const checkInCode = row.checkInCode as string | null | undefined;
  if (checkInCode) {
    const conflict = await db.event.findUnique({ where: { checkInCode } });
    if (conflict && conflict.id !== id) {
      await db.event.delete({ where: { id: conflict.id } });
    }
  }
  return db.event.upsert({
    where: { id },
    create: row as never,
    update: row as never,
  });
}

async function upsertOAuthAccount(
  db: PrismaClient,
  row: Row,
): Promise<unknown> {
  const id = row.id as string;
  const provider = row.provider as string;
  const providerUserId = row.providerUserId as string;
  const conflict = await db.oAuthAccount.findUnique({
    where: { provider_providerUserId: { provider, providerUserId } },
  });
  if (conflict && conflict.id !== id) {
    await db.oAuthAccount.delete({ where: { id: conflict.id } });
  }
  return db.oAuthAccount.upsert({
    where: { id },
    create: row as never,
    update: row as never,
  });
}

async function upsertFriendship(db: PrismaClient, row: Row): Promise<unknown> {
  const id = row.id as string;
  const userId = row.userId as string;
  const friendId = row.friendId as string;
  const conflict = await db.friendship.findUnique({
    where: { userId_friendId: { userId, friendId } },
  });
  if (conflict && conflict.id !== id) {
    await db.friendship.delete({ where: { id: conflict.id } });
  }
  return db.friendship.upsert({
    where: { id },
    create: row as never,
    update: row as never,
  });
}

async function upsertEventInterest(
  db: PrismaClient,
  row: Row,
): Promise<unknown> {
  const id = row.id as string;
  const memberId = row.memberId as string;
  const eventId = row.eventId as string;
  const conflict = await db.eventInterest.findUnique({
    where: { memberId_eventId: { memberId, eventId } },
  });
  if (conflict && conflict.id !== id) {
    await db.eventInterest.delete({ where: { id: conflict.id } });
  }
  return db.eventInterest.upsert({
    where: { id },
    create: row as never,
    update: row as never,
  });
}

async function upsertAttendance(db: PrismaClient, row: Row): Promise<unknown> {
  const id = row.id as string;
  const memberId = row.memberId as string;
  const eventId = row.eventId as string;
  const conflict = await db.attendance.findUnique({
    where: { memberId_eventId: { memberId, eventId } },
  });
  if (conflict && conflict.id !== id) {
    await db.attendance.delete({ where: { id: conflict.id } });
  }
  return db.attendance.upsert({
    where: { id },
    create: row as never,
    update: row as never,
  });
}

async function upsertPointEntry(db: PrismaClient, row: Row): Promise<unknown> {
  const id = row.id as string;
  const memberId = row.memberId as string;
  const pointTypeKey = row.pointTypeKey as string;
  const label = (row.label as string | null | undefined) ?? null;
  const semester = row.semester as string;
  const conflict = await db.pointEntry.findFirst({
    where: { memberId, pointTypeKey, label, semester },
  });
  if (conflict && conflict.id !== id) {
    await db.pointEntry.delete({ where: { id: conflict.id } });
  }
  return db.pointEntry.upsert({
    where: { id },
    create: row as never,
    update: row as never,
  });
}

/** FK-safe order for copying Prisma app data primary → backup. */
export const BACKUP_SYNC_ORDER: SyncStep[] = [
  {
    name: 'Member',
    fetch: (db) => db.member.findMany(),
    upsert: upsertMember,
  },
  {
    name: 'Event',
    fetch: (db) => db.event.findMany(),
    upsert: upsertEvent,
  },
  {
    name: 'OAuthAccount',
    fetch: (db) => db.oAuthAccount.findMany(),
    upsert: upsertOAuthAccount,
  },
  {
    name: 'Friendship',
    fetch: (db) => db.friendship.findMany(),
    upsert: upsertFriendship,
  },
  {
    name: 'EventInterest',
    fetch: (db) => db.eventInterest.findMany(),
    upsert: upsertEventInterest,
  },
  {
    name: 'Attendance',
    fetch: (db) => db.attendance.findMany(),
    upsert: upsertAttendance,
  },
  {
    name: 'PointEntry',
    fetch: (db) => db.pointEntry.findMany(),
    upsert: upsertPointEntry,
  },
];

export type BackupSyncResult = {
  tables: Record<string, number>;
};

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

/**
 * Upsert all app tables from primary into backup.
 * Does not delete backup-only rows (safe additive mirror), except when a
 * unique key on the backup collides with a different primary id (stale seed).
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
      try {
        await step.upsert(backup, row);
      } catch (error: unknown) {
        // Race / unexpected unique shape — surface clearly for ops logs.
        if (isUniqueViolation(error)) {
          throw new Error(
            `Backup sync unique conflict on ${step.name} id=${String(row.id)}: ${error.message}`,
          );
        }
        throw error;
      }
      written += 1;
    }
    tables[step.name] = written;
  }

  return { tables };
}
