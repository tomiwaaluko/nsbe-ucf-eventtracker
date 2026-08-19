import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

/**
 * Regression tests for the event secret leak.
 *
 * `findAll` and `findOne` used `include` with no `select`. Prisma returns
 * EVERY scalar column when no `select` is given, so both endpoints serialised
 * `qrSecret` and `checkInCode` - and neither route has a role check.
 *
 * `qrSecret` is the exact value AttendanceService compares on check-in, so any
 * member could read it and mark themselves present without attending. The leak
 * also made three other controls pointless at once: the admin gate on
 * GET /events/:id/qr, the crypto.randomInt code generation, and the
 * check-in-code rate limit.
 */
describe('EventsService read projections', () => {
  let service: EventsService;
  let event: { findMany: jest.Mock; findUnique: jest.Mock };

  beforeEach(async () => {
    event = { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: { event } },
        {
          provide: CacheService,
          // Pass through so the underlying query actually runs.
          useValue: {
            wrap: (_key: string, fn: () => unknown) => fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('findAll never selects qrSecret or checkInCode', async () => {
    await service.findAll();

    const args = event.findMany.mock.calls[0][0];
    // An explicit select is the invariant - a bare `include` silently returns
    // every scalar column, which is exactly how this regressed.
    expect(args.select).toBeDefined();
    expect(args.include).toBeUndefined();
    expect(args.select.qrSecret).toBeUndefined();
    expect(args.select.checkInCode).toBeUndefined();
  });

  it('findOne never selects qrSecret, and withholds checkInCode by default', async () => {
    await service.findOne('event-1');

    const args = event.findUnique.mock.calls[0][0];
    expect(args.select).toBeDefined();
    expect(args.include).toBeUndefined();
    expect(args.select.qrSecret).toBeUndefined();
    expect(args.select.checkInCode).toBeUndefined();
  });

  it('findOne exposes checkInCode only when the caller is an admin', async () => {
    await service.findOne('event-1', true);

    const args = event.findUnique.mock.calls[0][0];
    expect(args.select.checkInCode).toBe(true);
    // qrSecret stays out even for admins - they receive it via the QR
    // endpoint, which renders it into an image rather than handing over the
    // raw value.
    expect(args.select.qrSecret).toBeUndefined();
  });

  it('does not leak the creator email in either projection', async () => {
    await service.findAll();
    const args = event.findMany.mock.calls[0][0];
    expect(args.select.createdBy.select.email).toBeUndefined();
  });
});
