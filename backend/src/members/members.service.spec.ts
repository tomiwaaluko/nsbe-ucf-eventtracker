import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

describe('MembersService dues updates', () => {
  let service: MembersService;
  let prisma: {
    member: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let cache: { del: jest.Mock; delPattern: jest.Mock };

  beforeEach(async () => {
    prisma = {
      member: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    cache = { del: jest.fn(), delPattern: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: CacheService,
          useValue: cache,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('updateMe sets reportedAt when dues are marked paid', async () => {
    prisma.member.update.mockResolvedValue({ id: 'member-1' });

    await service.updateMe('member-1', {
      chapterDuesSelfReported: true,
      nationalDuesSelfReported: true,
    });

    expect(prisma.member.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'member-1' },
        data: expect.objectContaining({
          chapterDuesSelfReported: true,
          nationalDuesSelfReported: true,
          chapterDuesReportedAt: expect.any(Date),
          nationalDuesReportedAt: expect.any(Date),
        }),
        select: expect.not.objectContaining({ passwordHash: expect.anything() }),
      }),
    );
    expect(cache.del).toHaveBeenCalledWith('user:member-1');
  });

  it('updateMe clears reportedAt when dues are marked unpaid', async () => {
    prisma.member.update.mockResolvedValue({ id: 'member-1' });

    await service.updateMe('member-1', {
      chapterDuesSelfReported: false,
      nationalDuesSelfReported: false,
    });

    expect(prisma.member.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          chapterDuesSelfReported: false,
          nationalDuesSelfReported: false,
          chapterDuesReportedAt: null,
          nationalDuesReportedAt: null,
        }),
      }),
    );
  });

  it('updateMemberDues throws when member is missing', async () => {
    prisma.member.findUnique.mockResolvedValue(null);

    await expect(
      service.updateMemberDues('missing', { chapterDuesSelfReported: true }),
    ).rejects.toThrow(NotFoundException);
  });

  it('updateMemberDues rejects empty body', async () => {
    await expect(service.updateMemberDues('member-2', {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updateMemberDues invalidates member cache', async () => {
    prisma.member.findUnique.mockResolvedValue({ id: 'member-2' });
    prisma.member.update.mockResolvedValue({ id: 'member-2' });

    await service.updateMemberDues('member-2', {
      nationalDuesSelfReported: true,
    });

    expect(cache.del).toHaveBeenCalledWith('user:member-2');
    expect(cache.delPattern).toHaveBeenCalledWith('members:');
  });
});
