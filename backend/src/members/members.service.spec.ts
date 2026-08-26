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
import { EventCategory, EventInterestStatus, Prisma } from '@prisma/client';

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
    eventInterest: { findMany: jest.Mock };
  };

  let cache: {
    wrap: jest.Mock;
    del: jest.Mock;
    delPattern: jest.Mock;
  };

  const memberId = 'member-1';
  const futureDate = new Date('2026-12-01T18:00:00.000Z');
  const checkedInAt = new Date('2026-01-15T19:00:00.000Z');
  const eventStart = new Date('2026-01-15T18:00:00.000Z');

  const baseMember = {
    id: memberId,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    photoUrl: null,
    major: 'Computer Science',
    graduationYear: 2027,
    phoneNumber: '555-0100',
    linkedInUrl: null,
    bio: 'Hello',
    discordUsername: null,
    role: 'member',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    attendance: [],
  };


  beforeEach(async () => {
    prisma = {
      member: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      eventInterest: { findMany: jest.fn() },
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

  describe('getMemberProfile plannedEvents', () => {
    beforeEach(() => {
      prisma.member.findUnique.mockResolvedValue(baseMember);
    });

    it('omits plannedEvents when includePlannedEvents is false', async () => {
      const profile = await service.getMemberProfile(memberId, false, false);

      expect(profile.plannedEvents).toBeUndefined();
      expect(prisma.eventInterest.findMany).not.toHaveBeenCalled();
    });

    it('returns upcoming active planned events with allowed fields only', async () => {
      prisma.eventInterest.findMany.mockResolvedValue([
        {
          event: {
            id: 'event-1',
            name: 'Spring GBM',
            startTime: futureDate,
            endTime: new Date('2026-12-01T20:00:00.000Z'),
            location: 'Student Union',
            category: EventCategory.GBM,
          },
        },
      ]);

      const profile = await service.getMemberProfile(memberId, false, true);

      expect(prisma.eventInterest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            memberId,
            status: EventInterestStatus.PLANNING,
            event: {
              isActive: true,
              startTime: { gt: expect.any(Date) as Date },
            },
          },
          select: {
            event: {
              select: {
                id: true,
                name: true,
                startTime: true,
                endTime: true,
                location: true,
                category: true,
              },
            },
          },
          orderBy: {
            event: {
              startTime: 'asc',
            },
          },
        }),
      );

      expect(profile.plannedEvents).toEqual([
        {
          id: 'event-1',
          name: 'Spring GBM',
          startTime: futureDate,
          endTime: new Date('2026-12-01T20:00:00.000Z'),
          location: 'Student Union',
          category: EventCategory.GBM,
        },
      ]);

      const serialized = JSON.stringify(profile.plannedEvents);
      expect(serialized).not.toContain('qrSecret');
      expect(serialized).not.toContain('checkInCode');
    });

    it('returns empty array when member has no upcoming planned events', async () => {
      prisma.eventInterest.findMany.mockResolvedValue([]);

      const profile = await service.getMemberProfile(memberId, false, true);

      expect(profile.plannedEvents).toEqual([]);
    });

    it('filters inactive and past events via query constraints', async () => {
      prisma.eventInterest.findMany.mockResolvedValue([]);

      await service.getMemberProfile(memberId, false, true);

      const [firstCall] = prisma.eventInterest.findMany.mock.calls as Array<
        [Prisma.EventInterestFindManyArgs]
      >;
      const call = firstCall[0];
      expect(call.where?.event?.isActive).toBe(true);
      expect(call.where?.event?.startTime).toEqual(
        expect.objectContaining({ gt: expect.any(Date) as Date }),
      );
      expect(call.where?.status).toBe(EventInterestStatus.PLANNING);
    });

    it('throws NotFoundException when member does not exist', async () => {
      prisma.member.findUnique.mockResolvedValue(null);

      await expect(
        service.getMemberProfile('missing', false, true),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMemberProfile attendance select', () => {
    it('maps recentAttendance and achievements from selected attendance fields', async () => {
      prisma.member.findUnique.mockResolvedValue({
        ...baseMember,
        attendance: [
          {
            checkedInAt,
            event: {
              id: 'attended-1',
              name: 'Tech Workshop',
              startTime: eventStart,
              category: EventCategory.WORKSHOP,
            },
          },
        ],
      });

      const profile = await service.getMemberProfile(memberId, false, false);

      expect(prisma.member.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            attendance: {
              select: {
                checkedInAt: true,
                event: {
                  select: {
                    id: true,
                    name: true,
                    startTime: true,
                    category: true,
                  },
                },
              },
              orderBy: {
                checkedInAt: 'desc',
              },
              take: 10,
            },
          },
        }),
      );

      expect(profile.totalEventsAttended).toBe(1);
      expect(profile.recentAttendance).toEqual([
        {
          eventId: 'attended-1',
          eventTitle: 'Tech Workshop',
          eventDate: eventStart,
          category: EventCategory.WORKSHOP,
          checkedInAt,
        },
      ]);
      expect(profile.achievements.oneOneOne.progress.bucket1).toBe(1);
      expect(profile.achievements.oneOneOne.progress.bucket2).toBe(0);
      expect(profile.achievements.oneOneOne.progress.bucket3).toBe(0);
    });
  });

});
