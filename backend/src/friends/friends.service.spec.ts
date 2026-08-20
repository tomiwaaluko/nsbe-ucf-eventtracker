import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipStatus } from '@prisma/client';

describe('FriendsService', () => {
  let service: FriendsService;
  let prisma: {
    friendship: { findFirst: jest.Mock };
  };

  const userId = 'user-a';
  const otherUserId = 'user-b';

  beforeEach(async () => {
    prisma = {
      friendship: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('areFriends', () => {
    it('returns true when an ACCEPTED friendship exists (userId → friendId)', async () => {
      prisma.friendship.findFirst.mockResolvedValue({
        id: 'friendship-1',
        status: FriendshipStatus.ACCEPTED,
      });

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(true);
      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId, friendId: otherUserId },
            { userId: otherUserId, friendId: userId },
          ],
          status: FriendshipStatus.ACCEPTED,
        },
      });
    });

    it('returns true when an ACCEPTED friendship exists (friendId → userId)', async () => {
      prisma.friendship.findFirst.mockResolvedValue({
        id: 'friendship-2',
        status: FriendshipStatus.ACCEPTED,
      });

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(true);
    });

    it('returns false when friendship is PENDING', async () => {
      prisma.friendship.findFirst.mockResolvedValue(null);

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(false);
    });

    it('returns false when no friendship row exists', async () => {
      prisma.friendship.findFirst.mockResolvedValue(null);

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(false);
    });

    it('returns false when friendship is DECLINED', async () => {
      prisma.friendship.findFirst.mockResolvedValue(null);

      const result = await service.areFriends(userId, otherUserId);

      expect(result).toBe(false);
    });
  });
});
