import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { etLocalToUtc } from './chapter-membership.util';

describe('MembersService chapter membership', () => {
  let service: MembersService;
  let prisma: {
    member: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
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
        include: jest.fn(),
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
      });
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
      });
    });

    it('throws when member is missing', async () => {
      prisma.member.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMemberMembership('missing', true),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
