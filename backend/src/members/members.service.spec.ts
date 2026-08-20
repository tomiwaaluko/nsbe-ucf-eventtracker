import { DateTime } from 'luxon';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  ADMIN_MEMBER_UPDATE_SELECT,
  MembersService,
} from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CHAPTER_MEMBERSHIP_TZ } from './chapter-membership.util';

function etLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ms: number,
): Date {
  return DateTime.fromObject(
    { year, month, day, hour, minute, second, millisecond: ms },
    { zone: CHAPTER_MEMBERSHIP_TZ },
  ).toJSDate();
}

describe('MembersService chapter membership', () => {
  let service: MembersService;
  let prisma: {
    member: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let cache: {
    wrap: jest.Mock;
    del: jest.Mock;
    delPattern: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      member: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    cache = {
      wrap: jest.fn((_key, fn) => fn()),
      del: jest.fn(),
      delPattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: prisma },
        { provide: CacheService, useValue: cache },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  describe('applyChapterMembershipReset', () => {
    it('persists inactive when membership expired after July 31 ET', async () => {
      const markedAt = etLocalToUtc(2025, 8, 15, 10, 0, 0, 0);
      const now = etLocalToUtc(2026, 8, 1, 0, 0, 0, 0);

      prisma.member.update.mockResolvedValue({
        id: 'member-1',
        chapterMembershipActive: false,
        chapterMembershipMarkedAt: markedAt,
      });

      const result = await service.applyChapterMembershipReset(
        {
          id: 'member-1',
          chapterMembershipActive: true,
          chapterMembershipMarkedAt: markedAt,
        },
        now,
      );

      expect(result.chapterMembershipActive).toBe(false);
      expect(result.chapterMembershipMarkedAt).toEqual(markedAt);
      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { chapterMembershipActive: false },
      });
      expect(cache.del).toHaveBeenCalledWith('user:member-1');
      expect(cache.delPattern).toHaveBeenCalledWith('members:');
    });

    it('does not write when membership is still active', async () => {
      const markedAt = etLocalToUtc(2025, 8, 15, 10, 0, 0, 0);
      const now = etLocalToUtc(2026, 6, 1, 12, 0, 0, 0);

      const result = await service.applyChapterMembershipReset(
        {
          id: 'member-1',
          chapterMembershipActive: true,
          chapterMembershipMarkedAt: markedAt,
        },
        now,
      );

      expect(result.chapterMembershipActive).toBe(true);
      expect(prisma.member.update).not.toHaveBeenCalled();
    });
  });

  describe('batchResetExpiredChapterMemberships', () => {
    it('expires active memberships marked before the July 31 ET deadline', async () => {
      prisma.member.updateMany.mockResolvedValue({ count: 2 });

      const count = await service.batchResetExpiredChapterMemberships(
        etLocalToUtc(2026, 8, 1, 0, 0, 0, 0),
      );

      expect(count).toBe(2);
      expect(prisma.member.updateMany).toHaveBeenCalledWith({
        where: {
          chapterMembershipActive: true,
          OR: [
            { chapterMembershipMarkedAt: null },
            { chapterMembershipMarkedAt: { lt: expect.any(Date) } },
          ],
        },
        data: { chapterMembershipActive: false },
      });
      expect(cache.delPattern).toHaveBeenCalledWith('members:');
    });

    it('does not invalidate members cache when no rows are reset', async () => {
      prisma.member.updateMany.mockResolvedValue({ count: 0 });

      await service.batchResetExpiredChapterMemberships(
        etLocalToUtc(2026, 8, 1, 0, 0, 0, 0),
      );

      expect(cache.delPattern).not.toHaveBeenCalled();
    });
  });

  describe('search cache invalidation after batch reset', () => {
    it('invalidates members: cache when search triggers a reset', async () => {
      prisma.member.updateMany.mockResolvedValue({ count: 3 });
      prisma.member.findMany.mockResolvedValue([]);

      await service.search('alice');

      expect(prisma.member.updateMany).toHaveBeenCalled();
      expect(cache.delPattern).toHaveBeenCalledWith('members:');
    });

    it('ensures getAllMembers does not serve stale Paid=true after search reset', async () => {
      // Simulate: search already consumed the reset (updateMany returns 0 now),
      // so getAllMembers must not depend on its own resetCount for invalidation.
      // The prior search path is what must have called delPattern.
      prisma.member.updateMany.mockResolvedValueOnce({ count: 2 });
      prisma.member.findMany.mockResolvedValue([]);

      await service.search('bob');
      expect(cache.delPattern).toHaveBeenCalledWith('members:');

      cache.delPattern.mockClear();
      prisma.member.updateMany.mockResolvedValueOnce({ count: 0 });

      // wrap returns cached value if present — after invalidation it should recompute
      const staleCached = [
        {
          id: 'member-1',
          chapterMembershipActive: true,
          chapterMembershipMarkedAt: etLocalToUtc(2025, 8, 15, 10, 0, 0, 0),
          attendance: [],
        },
      ];
      let wrapCalls = 0;
      cache.wrap.mockImplementation(async (_key: string, fn: () => Promise<unknown>) => {
        wrapCalls += 1;
        if (wrapCalls === 1) {
          // First getAllMembers after search: cache was invalidated, so factory runs
          return fn();
        }
        return staleCached;
      });
      prisma.member.findMany.mockResolvedValue([
        {
          id: 'member-1',
          email: 'a@b.com',
          firstName: 'A',
          lastName: 'B',
          role: 'member',
          isActive: true,
          chapterMembershipActive: false,
          chapterMembershipMarkedAt: etLocalToUtc(2025, 8, 15, 10, 0, 0, 0),
          attendance: [],
        },
      ]);

      const members = await service.getAllMembers();

      expect(cache.delPattern).not.toHaveBeenCalled(); // reset already done
      expect(members[0].chapterMembershipActive).toBe(false);
      expect(wrapCalls).toBe(1);
    });
  });

  describe('updateMemberMembership', () => {
    it('marks paid with timestamp and invalidates cache', async () => {
      prisma.member.findUnique.mockResolvedValue({ id: 'member-1' });
      prisma.member.update.mockResolvedValue({
        id: 'member-1',
        chapterMembershipActive: true,
      });

      await service.updateMemberMembership('member-1', true);

      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: expect.objectContaining({
          chapterMembershipActive: true,
          chapterMembershipMarkedAt: expect.any(Date),
        }),
        select: ADMIN_MEMBER_UPDATE_SELECT,
      });
      expect(prisma.member.update.mock.calls[0][0].select).not.toHaveProperty(
        'passwordHash',
      );
      expect(cache.del).toHaveBeenCalledWith('user:member-1');
      expect(cache.delPattern).toHaveBeenCalledWith('members:');
    });

    it('marks unpaid without changing isActive', async () => {
      prisma.member.findUnique.mockResolvedValue({
        id: 'member-1',
        isActive: true,
      });
      prisma.member.update.mockResolvedValue({
        id: 'member-1',
        chapterMembershipActive: false,
        isActive: true,
      });

      await service.updateMemberMembership('member-1', false);

      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { chapterMembershipActive: false },
        select: ADMIN_MEMBER_UPDATE_SELECT,
      });
    });

    it('throws when member is missing', async () => {
      prisma.member.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMemberMembership('missing', true),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMemberStatus', () => {
    it('updates status without returning passwordHash', async () => {
      prisma.member.findUnique.mockResolvedValue({ id: 'member-1' });
      prisma.member.update.mockResolvedValue({
        id: 'member-1',
        isActive: false,
      });

      await service.updateMemberStatus('member-1', false);

      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { isActive: false },
        select: ADMIN_MEMBER_UPDATE_SELECT,
      });
      expect(prisma.member.update.mock.calls[0][0].select).not.toHaveProperty(
        'passwordHash',
      );
    });
  });
});
