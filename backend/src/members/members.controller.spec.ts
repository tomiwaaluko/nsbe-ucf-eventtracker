import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../storage/storage.service';

describe('MembersController dues endpoints', () => {
  let controller: MembersController;
  let membersService: {
    findMe: jest.Mock;
    updateMe: jest.Mock;
    updateMemberDues: jest.Mock;
  };

  beforeEach(async () => {
    membersService = {
      findMe: jest.fn(),
      updateMe: jest.fn(),
      updateMemberDues: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: membersService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: StorageService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MembersController>(MembersController);
  });

  it('updateMe updates only the authenticated member', async () => {
    const req = { user: { id: 'member-1' } };
    const dto = { chapterDuesSelfReported: true };
    membersService.updateMe.mockResolvedValue({ id: 'member-1', ...dto });

    await controller.updateMe(req, dto);

    expect(membersService.updateMe).toHaveBeenCalledWith('member-1', dto);
  });

  it('updateMemberDues requires admin access', async () => {
    membersService.findMe.mockResolvedValue({ id: 'member-1', role: 'member' });

    await expect(
      controller.updateMemberDues(
        { user: { id: 'member-1' } },
        'member-2',
        { chapterDuesSelfReported: true },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('updateMemberDues allows admins to update another member', async () => {
    membersService.findMe.mockResolvedValue({ id: 'admin-1', role: 'admin' });
    membersService.updateMemberDues.mockResolvedValue({
      id: 'member-2',
      chapterDuesSelfReported: true,
    });

    await controller.updateMemberDues(
      { user: { id: 'admin-1' } },
      'member-2',
      { chapterDuesSelfReported: true },
    );

    expect(membersService.updateMemberDues).toHaveBeenCalledWith('member-2', {
      chapterDuesSelfReported: true,
    });
  });
});
