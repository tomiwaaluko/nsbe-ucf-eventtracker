import { PrismaClient } from '@prisma/client';
import { BACKUP_SYNC_ORDER, syncPrimaryToBackup } from './backup-sync.util';

describe('backup-sync.util', () => {
  it('syncs models in FK-safe order starting with Member', () => {
    expect(BACKUP_SYNC_ORDER.map((s) => s.name)).toEqual([
      'Member',
      'Event',
      'OAuthAccount',
      'Friendship',
      'EventInterest',
      'Attendance',
      'PointEntry',
    ]);
  });

  it('replaces backup seed members that share email but not id', async () => {
    const seedId = 'seed-member-1';
    const primaryId = 'supabase-member-1';
    const email = 'shared@example.com';

    const backupMember = {
      findUnique: jest.fn().mockResolvedValue({ id: seedId, email }),
      delete: jest.fn().mockResolvedValue({ id: seedId }),
      upsert: jest.fn().mockResolvedValue({ id: primaryId, email }),
      findMany: jest.fn(),
    };

    const primary = {
      member: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: primaryId,
            email,
            role: 'member',
            createdAt: new Date(),
            updatedAt: new Date(),
            emailVerified: true,
            isActive: true,
            chapterMembershipActive: false,
            chapterDuesSelfReported: false,
            nationalDuesSelfReported: false,
          },
        ]),
      },
      event: { findMany: jest.fn().mockResolvedValue([]) },
      oAuthAccount: { findMany: jest.fn().mockResolvedValue([]) },
      friendship: { findMany: jest.fn().mockResolvedValue([]) },
      eventInterest: { findMany: jest.fn().mockResolvedValue([]) },
      attendance: { findMany: jest.fn().mockResolvedValue([]) },
      pointEntry: { findMany: jest.fn().mockResolvedValue([]) },
    } as unknown as PrismaClient;

    const backup = {
      member: backupMember,
      event: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      oAuthAccount: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      friendship: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      eventInterest: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      attendance: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      pointEntry: {
        findFirst: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
    } as unknown as PrismaClient;

    const result = await syncPrimaryToBackup(primary, backup);

    expect(backupMember.delete).toHaveBeenCalledWith({ where: { id: seedId } });
    expect(backupMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: primaryId } }),
    );
    expect(result.tables.Member).toBe(1);
  });
});
