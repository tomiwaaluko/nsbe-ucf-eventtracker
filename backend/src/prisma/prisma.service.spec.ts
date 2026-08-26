import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  const originalUrl = process.env.DATABASE_URL;
  const originalAllow = process.env.ALLOW_RAILWAY_PRIMARY;

  beforeEach(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL || 'postgresql://ci:ci@localhost:5432/ci';
    delete process.env.ALLOW_RAILWAY_PRIMARY;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalUrl;
    }
    if (originalAllow === undefined) {
      delete process.env.ALLOW_RAILWAY_PRIMARY;
    } else {
      process.env.ALLOW_RAILWAY_PRIMARY = originalAllow;
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
