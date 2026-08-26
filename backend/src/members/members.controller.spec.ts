import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../storage/storage.service';
import { MembersExportService } from './members-export.service';
import { FriendsService } from '../friends/friends.service';

describe('MembersController', () => {
  let controller: MembersController;
  let membersService: {
    findMe: jest.Mock;
    getMemberProfile: jest.Mock;
  };
  let friendsService: {
    areFriends: jest.Mock;
  };

  beforeEach(async () => {
    membersService = {
      findMe: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
