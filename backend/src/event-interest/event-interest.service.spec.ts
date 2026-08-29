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

type PlannedFindManyArgs = {
  include?: unknown;
  select?: {
    event?: { select?: Record<string, boolean | object> };
  };
  where?: {
    memberId?: string;
    status?: EventInterestStatus;
    event?: { isActive?: boolean; startTime?: { gt?: Date } };
  };
};

type StatsFindManyArgs = {
  include?: unknown;
  select?: Record<string, unknown>;
  where?: { isActive?: boolean };
};

function firstCallArgs<T>(mock: jest.Mock): T {
  const calls = mock.mock.calls as [T][];
  return calls[0][0];
}

describe('EventInterestService.getMyPlannedEvents', () => {
  let service: EventInterestService;
  let findMany: jest.Mock;

  const futureStart = new Date(Date.now() + 86_400_000);
  const futureEnd = new Date(futureStart.getTime() + 3_600_000);
  const markedAt = new Date('2026-01-01T00:00:00.000Z');

  beforeEach(async () => {
    findMany = jest.fn().mockResolvedValue([
      {
        id: 'interest-1',
        createdAt: markedAt,
        event: {
          id: 'event-1',
          name: 'Spring GBM',
          description: 'Kickoff',
          category: 'GBM',
          semester: 'Spring 2026',
          startTime: futureStart,
          endTime: futureEnd,
          location: 'SU',
          isActive: true,
          _count: { eventInterests: 4 },
        },
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventInterestService,
        {
          provide: PrismaService,
          useValue: { eventInterest: { findMany } },
        },
      ],
    }).compile();

    service = module.get<EventInterestService>(EventInterestService);
  });

  it('uses an explicit event select and never requests qrSecret or checkInCode', async () => {
    await service.getMyPlannedEvents('member-1');

    const args = firstCallArgs<PlannedFindManyArgs>(findMany);
    expect(args.include).toBeUndefined();
    expect(args.select).toBeDefined();
    expect(args.select?.event?.select).toBeDefined();
    expect(args.select?.event?.select?.qrSecret).toBeUndefined();
    expect(args.select?.event?.select?.checkInCode).toBeUndefined();
    expect(args.select?.event?.select?.id).toBe(true);
    expect(args.select?.event?.select?.name).toBe(true);
  });

  it('filters to active upcoming events in the query', async () => {
    await service.getMyPlannedEvents('member-1');

    const args = firstCallArgs<PlannedFindManyArgs>(findMany);
    expect(args.where?.memberId).toBe('member-1');
    expect(args.where?.status).toBe(EventInterestStatus.PLANNING);
    expect(args.where?.event?.isActive).toBe(true);
    expect(args.where?.event?.startTime?.gt).toBeInstanceOf(Date);
  });

  it('returns planned payload without secrets or nested _count on event', async () => {
    const result = await service.getMyPlannedEvents('member-1');

    expect(result).toHaveLength(1);
    expect(result[0].interestId).toBe('interest-1');
    expect(result[0].plannedCount).toBe(4);
    expect(result[0].markedAt).toEqual(markedAt);
    expect(result[0].event).toEqual({
      id: 'event-1',
      name: 'Spring GBM',
      description: 'Kickoff',
      category: 'GBM',
      semester: 'Spring 2026',
      startTime: futureStart,
      endTime: futureEnd,
      location: 'SU',
      isActive: true,
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
  let findMany: jest.Mock;

  beforeEach(async () => {
    findMany = jest.fn().mockResolvedValue([
      {
        id: 'event-1',
        name: 'GBM',
        startTime: new Date(),
        category: 'GBM',
        _count: { eventInterests: 2, attendance: 1 },
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventInterestService,
        { provide: PrismaService, useValue: { event: { findMany } } },
      ],
    }).compile();

    service = module.get<EventInterestService>(EventInterestService);
  });

  it('selects only non-secret event fields for admin planning stats', async () => {
    await service.getAllEventPlanningStats('Spring 2026');

    const args = firstCallArgs<StatsFindManyArgs>(findMany);
    expect(args.include).toBeUndefined();
    expect(args.select).toBeDefined();
    expect(args.select?.qrSecret).toBeUndefined();
    expect(args.select?.checkInCode).toBeUndefined();
    expect(args.where?.isActive).toBe(true);
  });
});
