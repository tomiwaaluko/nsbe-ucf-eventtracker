import { DateTime } from 'luxon';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
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
        select: expect.not.objectContaining({
          passwordHash: expect.anything(),
        }),
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
        select: expect.any(Object),
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
        select: expect.any(Object),
      });
      expect(prisma.member.update.mock.calls[0][0].select).not.toHaveProperty(
        'passwordHash',
      );
    });
  });
});
