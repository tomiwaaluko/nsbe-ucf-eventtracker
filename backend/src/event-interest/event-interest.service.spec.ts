import { Test, TestingModule } from '@nestjs/testing';
import { EventInterestStatus } from '@prisma/client';
import { EventInterestService } from './event-interest.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Regression tests for GET /event-interest/my secret leak (NSB-49 / NSB-37).
 *
 * `getMyPlannedEvents` used `include: { event: { include: { _count } } }` with
 * no `select`. Prisma returns every Event scalar column in that case, so
 * `qrSecret` and `checkInCode` were serialised to any authenticated member.
 * Soft-deleted events were also returned until filtered here.
 */
describe('EventInterestService.getMyPlannedEvents', () => {
  let service: EventInterestService;
  let eventInterest: { findMany: jest.Mock };

  const futureStart = new Date(Date.now() + 86_400_000);

  beforeEach(async () => {
    eventInterest = {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'interest-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          event: {
            id: 'event-1',
            name: 'Spring GBM',
            description: 'Kickoff',
            category: 'GBM',
            semester: 'Spring 2026',
            startTime: futureStart,
            endTime: new Date(futureStart.getTime() + 3_600_000),
            location: 'SU',
            isActive: true,
            _count: { eventInterests: 4 },
          },
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventInterestService,
        {
          provide: PrismaService,
          useValue: { eventInterest },
        },
      ],
    }).compile();

    service = module.get<EventInterestService>(EventInterestService);
  });

  it('uses an explicit event select and never requests qrSecret or checkInCode', async () => {
    await service.getMyPlannedEvents('member-1');

    const args = eventInterest.findMany.mock.calls[0][0];
    expect(args.include).toBeUndefined();
    expect(args.select).toBeDefined();
    expect(args.select.event.select).toBeDefined();
    expect(args.select.event.select.qrSecret).toBeUndefined();
    expect(args.select.event.select.checkInCode).toBeUndefined();
    expect(args.select.event.select.id).toBe(true);
    expect(args.select.event.select.name).toBe(true);
  });

  it('filters to active upcoming events in the query', async () => {
    await service.getMyPlannedEvents('member-1');

    const args = eventInterest.findMany.mock.calls[0][0];
    expect(args.where).toEqual({
      memberId: 'member-1',
      status: EventInterestStatus.PLANNING,
      event: {
        isActive: true,
        startTime: { gt: expect.any(Date) },
      },
    });
  });

  it('returns planned payload without secrets or nested _count on event', async () => {
    const result = await service.getMyPlannedEvents('member-1');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      interestId: 'interest-1',
      event: {
        id: 'event-1',
        name: 'Spring GBM',
        description: 'Kickoff',
        category: 'GBM',
        semester: 'Spring 2026',
        startTime: futureStart,
        endTime: expect.any(Date),
        location: 'SU',
        isActive: true,
      },
      plannedCount: 4,
      markedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(result[0].event).not.toHaveProperty('_count');
    expect(result[0].event).not.toHaveProperty('qrSecret');
    expect(result[0].event).not.toHaveProperty('checkInCode');

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('qrSecret');
    expect(serialized).not.toContain('checkInCode');
  });
});

describe('EventInterestService.getAllEventPlanningStats', () => {
  let service: EventInterestService;
  let event: { findMany: jest.Mock };

  beforeEach(async () => {
    event = {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'event-1',
          name: 'GBM',
          startTime: new Date(),
          category: 'GBM',
          _count: { eventInterests: 2, attendance: 1 },
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventInterestService,
        { provide: PrismaService, useValue: { event } },
      ],
    }).compile();

    service = module.get<EventInterestService>(EventInterestService);
  });

  it('selects only non-secret event fields for admin planning stats', async () => {
    await service.getAllEventPlanningStats('Spring 2026');

    const args = event.findMany.mock.calls[0][0];
    expect(args.include).toBeUndefined();
    expect(args.select).toBeDefined();
    expect(args.select.qrSecret).toBeUndefined();
    expect(args.select.checkInCode).toBeUndefined();
    expect(args.where.isActive).toBe(true);
  });
});
