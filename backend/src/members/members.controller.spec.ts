import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../storage/storage.service';
import { MembersExportService } from './members-export.service';
import { FriendsService } from '../friends/friends.service';

describe('MembersController dues endpoints', () => {
  let controller: MembersController;
  let membersService: {
    findMe: jest.Mock;
    updateMe: jest.Mock;
    updateMemberDues: jest.Mock;
    getMemberProfile: jest.Mock;
  };
  let friendsService: {
    areFriends: jest.Mock;
  };

  beforeEach(async () => {
    membersService = {
      findMe: jest.fn(),
      updateMe: jest.fn(),
      updateMemberDues: jest.fn(),
      getMemberProfile: jest.fn(),
    };
    friendsService = {
      areFriends: jest.fn(),
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
          provide: MembersExportService,
          useValue: {},
        },
        {
          provide: StorageService,
          useValue: {},
        },
        {
          provide: FriendsService,
          useValue: friendsService,
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

  describe('getMemberProfile planned events privacy', () => {
    const memberId = 'target-member';
    const req = { user: { id: 'viewer-id' } };

    beforeEach(() => {
      membersService.getMemberProfile.mockResolvedValue({ id: memberId });
    });

    it('includes planned events for the profile owner', async () => {
      membersService.findMe.mockResolvedValue({ role: 'member' });

      await controller.getMemberProfile({ user: { id: memberId } }, memberId);

      expect(membersService.getMemberProfile).toHaveBeenCalledWith(
        memberId,
        true,
        true,
      );
      expect(friendsService.areFriends).not.toHaveBeenCalled();
    });

    it('includes planned events for admins without a friendship check', async () => {
      membersService.findMe.mockResolvedValue({ role: 'admin' });

      await controller.getMemberProfile(req, memberId);

      expect(membersService.getMemberProfile).toHaveBeenCalledWith(
        memberId,
        true,
        true,
      );
      expect(friendsService.areFriends).not.toHaveBeenCalled();
    });

    it('includes planned events for confirmed friends', async () => {
      membersService.findMe.mockResolvedValue({ role: 'member' });
      friendsService.areFriends.mockResolvedValue(true);

      await controller.getMemberProfile(req, memberId);

      expect(friendsService.areFriends).toHaveBeenCalledWith(
        'viewer-id',
        memberId,
      );
      expect(membersService.getMemberProfile).toHaveBeenCalledWith(
        memberId,
        false,
        true,
      );
    });

    it('omits planned events for non-friends', async () => {
      membersService.findMe.mockResolvedValue({ role: 'member' });
      friendsService.areFriends.mockResolvedValue(false);

      await controller.getMemberProfile(req, memberId);

      expect(membersService.getMemberProfile).toHaveBeenCalledWith(
        memberId,
        false,
        false,
      );
    });
  });
});
