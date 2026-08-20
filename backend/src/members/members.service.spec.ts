import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { EventCategory, EventInterestStatus } from '@prisma/client';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: {
    member: { findUnique: jest.Mock };
    eventInterest: { findMany: jest.Mock };
  };

  const memberId = 'member-1';
  const futureDate = new Date('2026-12-01T18:00:00.000Z');

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
      member: { findUnique: jest.fn() },
      eventInterest: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
              startTime: { gt: expect.any(Date) },
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

      const call = prisma.eventInterest.findMany.mock.calls[0][0];
      expect(call.where.event.isActive).toBe(true);
      expect(call.where.event.startTime.gt).toBeInstanceOf(Date);
      expect(call.where.status).toBe(EventInterestStatus.PLANNING);
    });

    it('throws NotFoundException when member does not exist', async () => {
      prisma.member.findUnique.mockResolvedValue(null);

      await expect(
        service.getMemberProfile('missing', false, true),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
