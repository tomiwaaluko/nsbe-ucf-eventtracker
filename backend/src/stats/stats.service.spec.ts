import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: PrismaService,
          useValue: {
            attendance: {
              findMany: jest.fn(),
            },
            member: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            event: {
              count: jest.fn(),
            },
          },
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
